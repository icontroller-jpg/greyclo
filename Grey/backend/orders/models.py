from django.conf import settings
from django.db import models


class CartItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.user} — {self.product.title} x {self.quantity}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),      # created, payment not yet completed
        ("paid", "Paid"),            # Razorpay signature verified
        ("failed", "Failed"),        # payment attempted but failed/verification failed
        ("fulfilled", "Fulfilled"),  # shipped/handed over
        ("cancelled", "Cancelled"),
    ]

    # Optional — set if the customer happened to be logged in, but checkout
    # never requires an account. Guest checkout just leaves this null.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    address = models.TextField()
    notes = models.TextField(blank=True)

    # Total is computed server-side from real product prices at order time —
    # never trusted from the client — so this is the source of truth for
    # what Razorpay is actually asked to charge.
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)

    is_paid = models.BooleanField(default=False)
    status = models.CharField(choices=STATUS_CHOICES, default="pending", max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} — {self.full_name} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    # Nullable so deleting a Product later never breaks historical orders.
    product = models.ForeignKey("products.Product", on_delete=models.SET_NULL, null=True)
    # Snapshotted at order time so price changes or renamed/deleted products
    # never rewrite what a past order actually charged.
    title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.title} x {self.quantity}"