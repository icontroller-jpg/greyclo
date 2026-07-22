import os
from decimal import Decimal

import razorpay
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from products.models import Product
from .models import CartItem, Order, OrderItem
from .serializers import CartItemSerializer, OrderSerializer


class CartViewSet(viewsets.ModelViewSet):
    """
    /api/cart/           GET    -> list the logged-in user's cart items
    /api/cart/           POST   -> {"product_id": 3, "quantity": 1} add/increment
    /api/cart/<id>/      PATCH  -> {"quantity": 2} update quantity
    /api/cart/<id>/      DELETE -> remove that line item
    Requires a valid JWT — guest carts never touch this endpoint at all,
    they live entirely in the browser's localStorage.
    """
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            product_id=product_id,
            defaults={"quantity": quantity},
        )
        if not created:
            item.quantity += quantity
            item.save()

        return Response(CartItemSerializer(item).data)


def get_razorpay_client():
    # Built lazily inside each view (not at module import time) so a missing
    # key can't crash the entire URLconf on server startup — it'll just
    # fail the specific request that needs it, with a clear error.
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise RuntimeError(
            "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in the environment."
        )
    return razorpay.Client(auth=(key_id, key_secret))


class CreateOrderView(APIView):
    """
    POST /api/orders/create/
    body: {
      full_name, phone, email, address, notes,
      items: [{product_id, quantity}, ...]
    }
    Open to guests (AllowAny) — checkout never requires an account.
    Computes the total server-side from real Product prices (never trusts
    a client-sent total) and creates a matching Razorpay order.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        items_data = data.get("items", [])
        if not items_data:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        if not data.get("full_name") or not data.get("phone") or not data.get("address"):
            return Response(
                {"detail": "Full name, phone, and address are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user if request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            full_name=data.get("full_name", ""),
            phone=data.get("phone", ""),
            email=data.get("email", ""),
            address=data.get("address", ""),
            notes=data.get("notes", ""),
        )

        total = Decimal("0")
        for item in items_data:
            try:
                product = Product.objects.get(id=item.get("product_id"))
            except Product.DoesNotExist:
                continue
            quantity = max(1, int(item.get("quantity", 1)))
            OrderItem.objects.create(
                order=order,
                product=product,
                title=product.title,
                price=product.price,
                quantity=quantity,
            )
            total += product.price * quantity

        if total <= 0:
            order.delete()
            return Response({"detail": "No valid items in cart."}, status=status.HTTP_400_BAD_REQUEST)

        order.total_amount = total
        order.save()

        try:
            client = get_razorpay_client()
            # Razorpay expects the amount in the smallest currency unit
            # (paise for INR) — see the currency note about $ vs ₹ display.
            amount_subunits = int(total * 100)
            razorpay_order = client.order.create({
                "amount": amount_subunits,
                "currency": "INR",
                "receipt": f"order_{order.id}",
                "payment_capture": 1,
            })
        except Exception as exc:
            order.status = "failed"
            order.save()
            return Response(
                {"detail": f"Could not initiate payment: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        order.razorpay_order_id = razorpay_order["id"]
        order.save()

        return Response({
            "order_id": order.id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount_subunits,
            "currency": "INR",
            "key_id": os.getenv("RAZORPAY_KEY_ID"),
        })


class VerifyPaymentView(APIView):
    """
    POST /api/orders/verify/
    body: { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
    This is the step that actually confirms payment happened — verifying
    the HMAC signature server-side using the key secret. A client claiming
    "payment succeeded" without this check would be trivially fakeable.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        try:
            order = Order.objects.get(id=data.get("order_id"))
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            client = get_razorpay_client()
        except RuntimeError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        params = {
            "razorpay_order_id": data.get("razorpay_order_id"),
            "razorpay_payment_id": data.get("razorpay_payment_id"),
            "razorpay_signature": data.get("razorpay_signature"),
        }

        try:
            client.utility.verify_payment_signature(params)
        except razorpay.errors.SignatureVerificationError:
            order.status = "failed"
            order.save()
            return Response({"detail": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        order.is_paid = True
        order.status = "paid"
        order.razorpay_payment_id = params["razorpay_payment_id"]
        order.razorpay_signature = params["razorpay_signature"]
        order.save()

        return Response(OrderSerializer(order).data)