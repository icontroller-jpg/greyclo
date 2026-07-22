from rest_framework import serializers
from products.models import Product
from products.serializers import ProductSerializer
from .models import CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source="product", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "product_id", "product_detail", "quantity", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "title", "price", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "full_name", "phone", "email", "address", "notes",
            "total_amount", "status", "is_paid", "created_at", "items",
        ]