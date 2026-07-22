from django.contrib import admin
from .models import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = ("title", "price", "condition", "status", "created_at")

    list_filter = ("status", "condition")

    search_fields = ("title",)