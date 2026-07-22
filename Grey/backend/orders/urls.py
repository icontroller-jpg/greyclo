from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CreateOrderView, VerifyPaymentView

router = DefaultRouter()
router.register("cart", CartViewSet, basename="cart")

urlpatterns = router.urls + [
    path("orders/create/", CreateOrderView.as_view(), name="create-order"),
    path("orders/verify/", VerifyPaymentView.as_view(), name="verify-order"),
]