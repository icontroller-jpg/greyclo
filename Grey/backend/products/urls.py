from django.urls import path
from .views import ProductViewSet, SiteImageViewSet

product_list = ProductViewSet.as_view({
    "get": "list",
    "post": "create"
})

product_detail = ProductViewSet.as_view({
    "get": "retrieve",
    "delete": "destroy",
    "put": "update"
})


urlpatterns = [
    path("", product_list),
    path("<int:pk>/", product_detail),
    path("site-images/", SiteImageViewSet.as_view({
        "get": "list",
        "post": "create"
    })),
]