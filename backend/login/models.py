from datetime import timedelta
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class EmailOTP(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_otps",
    )
    otp_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return (
            not self.is_used
            and timezone.now() <= self.created_at + timedelta(minutes=5)
        )

    def __str__(self):
        return f"EmailOTP(user_id={self.user_id}, is_used={self.is_used})"


class PasswordResetSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_sessions",
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return (
            not self.is_used
            and timezone.now() <= self.created_at + timedelta(minutes=10)
        )

    def __str__(self):
        return f"PasswordResetSession(user_id={self.user_id}, is_used={self.is_used})"

    