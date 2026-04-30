from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import login_view, register, send_otp_view, verify_otp_view, reset_password_view, change_password_view, logout_view

urlpatterns = [
    path("login/", login_view),
    path("register/", register, name="register"),
    path("send-otp/", send_otp_view, name="password-reset-send-otp"),
    path("verify-otp/", verify_otp_view, name="password-reset-verify-otp"),
    path("reset-password/", reset_password_view, name="password-reset-reset"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("change-password/", change_password_view, name="auth-change-password"),
    path("logout/", logout_view, name="auth-logout"),
]
