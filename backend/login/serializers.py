import re
from rest_framework import serializers
from django.contrib.auth import get_user_model

from django.contrib.auth import authenticate

USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


def is_password_valid(pw: str) -> bool:
    if not pw or len(pw) < 8:
        return False
    has_letter = any(c.isalpha() for c in pw)
    has_digit = any(c.isdigit() for c in pw)
    return has_letter and has_digit


class RegisterSerializer(serializers.Serializer):
    """
    UC 1.2 - Đăng ký
    Input: username, email, password, password_confirm
    Output: validated_data cho service xử lý
    """
    username = serializers.CharField(max_length=30, trim_whitespace=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password_confirm = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_username(self, value: str) -> str:
        value = value.strip()
        if not USERNAME_REGEX.match(value):
            # "Không đúng định khẩu Tài khoản"
            raise serializers.ValidationError("Tài khoản không hợp lệ.")
        return value

    def validate_password(self, value: str) -> str:
        if not is_password_valid(value):
            # Business rule
            raise serializers.ValidationError(
                "Vui lòng nhập đúng định dạng bao gồm: >=8 ký tự, chứa chữ cái và số."
            )
        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password_confirm"):
            # Lỗi dưới ô xác nhận
            raise serializers.ValidationError({"password_confirm": "Mật khẩu không khớp"})
        return attrs
    


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, allow_blank=False)
    password = serializers.CharField(required=True, allow_blank=False, write_only=True)

    def validate_username(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("Vui lòng nhập tên đăng nhập")
        return value.strip()

    def validate_password(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("Vui lòng nhập mật khẩu")
        return value

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError(
                {"non_field_errors": ["Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại"]}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"non_field_errors": ["Tài khoản đang bị vô hiệu hóa"]}
            )

        attrs["user"] = user
        return attrs
    


User = get_user_model()


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        value = value.strip().lower()

        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Tài khoản người dùng không tồn tại")

        return value


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)

    def validate_email(self, value):
        value = value.strip().lower()

        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Tài khoản người dùng không tồn tại")

        return value

    def validate_otp(self, value):
        value = value.strip()

        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Mã nhập không hợp lệ")

        return value


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    reset_token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=8, max_length=128)
    confirm_password = serializers.CharField(min_length=8, max_length=128)

    def validate_email(self, value):
        value = value.strip().lower()

        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Tài khoản người dùng không tồn tại")

        return value

    def validate_new_password(self, value):
        has_letter = bool(re.search(r"[A-Za-z]", value))
        has_digit = bool(re.search(r"\d", value))

        if len(value) < 8 or not has_letter or not has_digit:
            raise serializers.ValidationError(
                "Vui lòng nhập đúng định dạng bao gồm: >=8 ký tự, chứa chữ cái và số"
            )

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": ["Mật khẩu không khớp"]
            })

        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    """
    UC 1.5 - Đổi mật khẩu (Backend tinh gọn)
    Chỉ nhận password cũ và mới. Xác nhận khớp password sẽ làm ở Hook.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        # Vẫn giữ một bước check độ dài tối thiểu để đảm bảo an toàn hệ thống (layer 2)
        if len(value) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
        return value