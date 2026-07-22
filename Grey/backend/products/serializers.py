from rest_framework import serializers
from .models import Product, ProductImage, SiteImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "order"]


class ProductSerializer(serializers.ModelSerializer):
    # Read: full gallery, ordered.
    images = ProductImageSerializer(many=True, read_only=True)
    # Write: list of image URLs already uploaded to ImageKit, e.g.
    # ["https://...1.jpg", "https://...2.jpg"]. First one becomes the cover
    # image; all of them (including the first) are stored as gallery images.
    image_urls = serializers.ListField(
        child=serializers.URLField(), write_only=True, required=False
    )

    class Meta:
        model = Product
        fields = [
            "id", "title", "description", "price", "image", "condition",
            "status", "category", "created_at", "images", "image_urls",
        ]

    def create(self, validated_data):
        image_urls = validated_data.pop("image_urls", [])
        if not image_urls and validated_data.get("image"):
            image_urls = [validated_data["image"]]
        if image_urls:
            validated_data["image"] = image_urls[0]

        product = Product.objects.create(**validated_data)

        for i, url in enumerate(image_urls):
            ProductImage.objects.create(product=product, image=url, order=i)

        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop("image_urls", None)
        instance = super().update(instance, validated_data)

        if image_urls:
            instance.images.all().delete()
            for i, url in enumerate(image_urls):
                ProductImage.objects.create(product=instance, image=url, order=i)
            instance.image = image_urls[0]
            instance.save()

        return instance


class SiteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteImage
        fields = ["slot", "image", "updated_at"]