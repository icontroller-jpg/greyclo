from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView
from users.views import imagekit_auth
from users.views import signup

urlpatterns = [

    path("admin/", admin.site.urls),

    path("api/products/", include("products.urls")),
    path("api/", include("orders.urls")),
    path("api/signup/", signup),
    path("api/login/", TokenObtainPairView.as_view()),
    path("api/imagekit-auth/", imagekit_auth),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)