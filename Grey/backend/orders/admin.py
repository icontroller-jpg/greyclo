from django.contrib import admin
from .models import CartItem, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "title", "price", "quantity"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "full_name", "phone", "total_amount", "status", "is_paid", "created_at"]
    list_filter = ["status", "is_paid"]
    search_fields = ["full_name", "phone", "email", "razorpay_order_id", "razorpay_payment_id"]
    readonly_fields = ["razorpay_order_id", "razorpay_payment_id", "razorpay_signature", "created_at"]
    inlines = [OrderItemInline]


admin.site.register(CartItem)