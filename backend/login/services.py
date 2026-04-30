import random
import hashlib
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dataclasses import dataclass
from datetime import timedelta
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

User = get_user_model()

@dataclass
class FieldError(Exception):
    """
    Dùng để trả lỗi theo từng field cho UI.
    """
    field: str
    message: str


def register_user(*, username: str, email: str, password: str):
    """
    Business rules:
    - Username đã tồn tại -> 'Tài khoản người dùng đã tồn tại' dưới ô tài khoản
    - Email: serializer đã check format hợp lệ
    - Password policy: serializer đã check
    - Create user theo Django auth
    """
    # Case-insensitive check để tránh Demo/demo
    if User.objects.filter(username__iexact=username).exists():
        raise FieldError(field="username", message="Tài khoản người dùng đã tồn tại")

    # (Optional) nếu bạn muốn email không trùng:
    if User.objects.filter(email__iexact=email).exists():
         raise FieldError(field="email", message="Email đã tồn tại")

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            return user
    except IntegrityError:
        # phòng trường hợp race condition (2 request cùng lúc)
        raise FieldError(field="username", message="Tài khoản người dùng đã tồn tại")
    

@dataclass(frozen=True)
class LoginResult:
    token: str
    user_id: int
    username: str


class AuthService:
    @staticmethod
    def login(*, user) -> LoginResult:
        token_obj, _ = Token.objects.get_or_create(user=user)
        return LoginResult(
            token=token_obj.key,
            user_id=user.id,
            username=user.get_username(),
        )
    @staticmethod
    def logout(*, user):
        """
        Business Logic: Xóa token hiện tại của user để đăng xuất.
        """
        try:
            # Xóa token của user trong database
            Token.objects.filter(user=user).delete()
            return True
        except Exception:
            return False


from .models import EmailOTP, PasswordResetSession

User = get_user_model()


def generate_otp():
    return str(random.randint(100000, 999999))


def hash_otp(otp: str):
    return hashlib.sha256(otp.encode()).hexdigest()


def send_otp_email(receiver_email: str, otp: str):
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=receiver_email,
        subject="Your OTP Code",
        html_content=f"""
        <h2>Your OTP:</h2>
        <h1 style="color:blue;">{otp}</h1>
        <p>Valid for 5 minutes.</p>
        """
    )

    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    sg.send(message)


@dataclass
class FieldError(Exception):
    field: str
    message: str


@dataclass(frozen=True)
class LoginResult:
    token: str
    user_id: int
    username: str


def register_user(*, username: str, email: str, password: str):
    if User.objects.filter(username__iexact=username).exists():
        raise FieldError(field="username", message="Tài khoản người dùng đã tồn tại")

    if User.objects.filter(email__iexact=email).exists():
        raise FieldError(field="email", message="Email đã tồn tại trong hệ thống")

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
            )
            return user
    except IntegrityError:
        raise FieldError(field="username", message="Tài khoản người dùng đã tồn tại")


class AuthService:
    @staticmethod
    def login(*, user) -> LoginResult:
        token_obj, _ = Token.objects.get_or_create(user=user)
        return LoginResult(
            token=token_obj.key,
            user_id=user.id,
            username=user.get_username(),
        )


class ForgotPasswordService:
    OTP_EXPIRE_MINUTES = 5
    RESET_SESSION_EXPIRE_MINUTES = 10
    RESEND_OTP_COOLDOWN_SECONDS = 60

    @staticmethod
    def _get_user_by_email(email: str):
        return User.objects.filter(email__iexact=email).first()

    @staticmethod
    @transaction.atomic
    def send_otp(*, email: str) -> None:
        user = ForgotPasswordService._get_user_by_email(email)
        if not user:
            raise FieldError(
                field="email",
                message="Tài khoản người dùng không tồn tại"
            )

        recent_otp_exists = EmailOTP.objects.filter(
            user=user,
            created_at__gte=timezone.now() - timedelta(
                seconds=ForgotPasswordService.RESEND_OTP_COOLDOWN_SECONDS
            )
        ).exists()

        if recent_otp_exists:
            raise FieldError(
                field="email",
                message="Vui lòng chờ trước khi yêu cầu gửi lại mã"
            )

        otp = generate_otp()

        EmailOTP.objects.create(
            user=user,
            otp_hash=hash_otp(otp),
        )

        send_otp_email(user.email, otp)

    @staticmethod
    @transaction.atomic
    def verify_otp(*, email: str, otp: str) -> str:
        user = ForgotPasswordService._get_user_by_email(email)
        if not user:
            raise FieldError(
                field="email",
                message="Tài khoản người dùng không tồn tại"
            )

        otp_record = (
            EmailOTP.objects
            .filter(user=user, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_record:
            raise FieldError(field="otp", message="Mã nhập không hợp lệ")

        if not otp_record.is_valid():
            raise FieldError(field="otp", message="Mã nhập không hợp lệ")

        if otp_record.otp_hash != hash_otp(otp):
            raise FieldError(field="otp", message="Mã nhập không hợp lệ")

        otp_record.is_used = True
        otp_record.save(update_fields=["is_used"])

        reset_session = PasswordResetSession.objects.create(user=user)
        return str(reset_session.token)

    @staticmethod
    @transaction.atomic
    def reset_password(*, email: str, reset_token: str, new_password: str) -> None:
        user = ForgotPasswordService._get_user_by_email(email)
        if not user:
            raise FieldError(
                field="email",
                message="Tài khoản người dùng không tồn tại"
            )

        reset_session = PasswordResetSession.objects.filter(
            user=user,
            token=reset_token,
            is_used=False,
        ).first()

        if not reset_session or not reset_session.is_valid():
            raise FieldError(
                field="reset_token",
                message="Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])

        reset_session.is_used = True
        reset_session.save(update_fields=["is_used"])


class UserService:
    @staticmethod
    @transaction.atomic
    def change_password(*, user, old_password: str, new_password: str):
        # 1. Kiểm tra mật khẩu cũ (So sánh với hash trong DB)
        if not user.check_password(old_password):
            raise FieldError(
                field="old_password", 
                message="Mật khẩu cũ không chính xác"
            )

        # 2. Kiểm tra nghiệp vụ: Mật khẩu mới không được giống mật khẩu cũ
        if old_password == new_password:
            raise FieldError(
                field="new_password", 
                message="Mật khẩu mới phải khác mật khẩu hiện tại"
            )

        # 3. Apply thay đổi vào Database
        user.set_password(new_password)
        user.save(update_fields=["password"])
        
        return user