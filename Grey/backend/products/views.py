from rest_framework import viewsets
from .models import Product, SiteImage
from rest_framework.response import Response
from .serializers import ProductSerializer, SiteImageSerializer

class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all().order_by("-created_at")

    serializer_class = ProductSerializer


class SiteImageViewSet(viewsets.ModelViewSet):
    queryset = SiteImage.objects.all()
    serializer_class = SiteImageSerializer

    def create(self, request, *args, **kwargs):
        # upsert by slot instead of erroring on duplicate
        obj, _ = SiteImage.objects.update_or_create(
            slot=request.data.get("slot"),
            defaults={"image": request.data.get("image")},
        )
        return Response(SiteImageSerializer(obj).data)