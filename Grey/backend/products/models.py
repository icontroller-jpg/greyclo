from django.db import models


CATEGORY_CHOICES = [
    ("shirts", "Shirts"),
    ("jackets", "Jackets"),
    ("bottoms", "Bottoms"),
]


class Product(models.Model):

    title = models.CharField(max_length=200)

    description = models.TextField()

    price = models.DecimalField(max_digits=8, decimal_places=2)

    # Cover / thumbnail image — kept for backward compatibility with
    # existing frontend code (ProductCard, etc.) that reads product.image.
    image = models.URLField()
    condition = models.CharField(max_length=50)

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="shirts",
    )

    status = models.CharField(
        choices=[("available", "Available"), ("sold", "Sold")],
        default="available",
        max_length=20
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    """Additional gallery images for a product, beyond the cover image."""
    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    image = models.URLField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.title} image {self.order}"


class SiteImage(models.Model):
    slot = models.CharField(max_length=50, unique=True)
    image = models.URLField()
    updated_at = models.DateTimeField(auto_now=True)