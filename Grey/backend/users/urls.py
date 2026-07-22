from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import signup, imagekit_auth

urlpatterns = [
    path("api/signup/", signup),
    path("api/login/", TokenObtainPairView.as_view()),
    path("api/imagekit-auth/", imagekit_auth),
]