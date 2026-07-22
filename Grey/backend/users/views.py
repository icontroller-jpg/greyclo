from django.contrib.auth.models import User
from rest_framework.decorators import api_view
import resend
import os

resend.api_key = os.environ.get("RESEND_API_KEY")

@api_view(["POST"])
def signup(request):
    email = request.data.get("email")
    password = request.data.get("password")

    print(f"[SIGNUP] Attempt for: {email}")

    if not email or not password:
        print("[SIGNUP] Missing email or password")
        return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=email).exists():
        print(f"[SIGNUP] User already exists: {email}")
        return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )
        print(f"[SIGNUP] User created successfully: {email}")
    except Exception as e:
        print(f"[SIGNUP] User creation failed: {e}")
        return Response({"error": "User creation failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    api_key = os.environ.get("RESEND_API_KEY")
    print(f"[SIGNUP] Resend API key present: {bool(api_key)}")

    try:
        response = resend.Emails.send({
            "from": "Pridepzw <onboarding@resend.dev>",
            "to": email,
            "subject": "Welcome to Pridepzw",
            "html": f"""
                <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #0e0d0b;">
                    <h1 style="font-size: 32px; font-weight: 400; margin-bottom: 4px;">Welcome</h1>
                    <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(14,13,11,0.4); margin-bottom: 32px;">to Pridepzw</p>
                    <p style="font-size: 14px; line-height: 1.8; color: rgba(14,13,11,0.7);">
                        Thank you for joining. You're now part of a curated community of conscious fashion lovers.
                        New pieces drop weekly — we'll keep you in the loop.
                    </p>
                    <a href="https://thriftstore-t4od.onrender.com/#/" style="display: inline-block; margin-top: 32px; padding: 12px 28px; border: 1px solid #0e0d0b; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #0e0d0b; text-decoration: none;">
                        Shop Now
                    </a>
                    <p style="margin-top: 48px; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(14,13,11,0.3);">
                        © 2026 Pridepzw — Slow fashion, conscious living
                    </p>
                </div>
            """
        })
        print(f"[SIGNUP] Email sent successfully: {response}")
    except Exception as e:
        print(f"[SIGNUP] Email failed: {e}")
        # Don't return 500 — user is already created, email is non-critical

    return Response({"message": "User created successfully"})


from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.authtoken.models import Token

@api_view(["POST"])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    user = authenticate(username=email, password=password)

    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "email": user.email
    })

from imagekitio import ImageKit
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os

imagekit = ImageKit(
    private_key=os.environ.get("IMAGEKIT_PRIVATE_KEY"),
    public_key=os.environ.get("IMAGEKIT_PUBLIC_KEY"),
    url_endpoint=os.environ.get("IMAGEKIT_URL_ENDPOINT")
)

@api_view(["GET"])
def imagekit_auth(request):
    auth_params = imagekit.get_authentication_parameters()
    return Response(auth_params)