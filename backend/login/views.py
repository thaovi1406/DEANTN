from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework.permissions import AllowAny
from rest_framework import status

from .serializers import RegisterSerializer
from .services import register_user, FieldError

from .serializers import LoginSerializer, SendOTPSerializer, VerifyOTPSerializer, ResetPasswordSerializer, ChangePasswordSerializer
from .services import AuthService, FieldError, ForgotPasswordService, UserService



@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register/
    Response:
      - 201: { "message": "Đăng ký tài khoản thành công" }
      - 400: { "errors": { "field": ["message"] } }
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        # Trả lỗi chuẩn UI: show dưới từng input
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    try:
        register_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
        )
    except FieldError as e:
        return Response(
            {"errors": {e.field: [e.message]}},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {"message": "Đăng ký tài khoản thành công"},
        status=status.HTTP_201_CREATED,
    )


def success(message: str, data=None, status_code=status.HTTP_200_OK):
    payload = {"message": message}
    if data is not None:
        payload["data"] = data
    return Response(payload, status=status_code)


def error(errors: dict, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"errors": errors}, status=status_code)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return error(serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    user = serializer.validated_data["user"]
    result = AuthService.login(user=user)

    return success(
        "Đăng nhập thành công",
        data={
            "token": result.token,
            "user": {
                "id": result.user_id,
                "username": result.username,
            },
        },
        status_code=status.HTTP_200_OK,
    )

def error_response(errors, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(
        {"errors": errors},
        status=status_code
    )

#Forgot Password
@api_view(["POST"])
def send_otp_view(request):
    serializer = SendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors)

    try:
        ForgotPasswordService.send_otp(
            email=serializer.validated_data["email"]
        )
    except FieldError as exc:
        return error_response({
            exc.field: [exc.message]
        })

    return Response(
        {"message": "Mã OTP đã được gửi về email"},
        status=status.HTTP_200_OK
    )


@api_view(["POST"])
def verify_otp_view(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors)

    try:
        reset_token = ForgotPasswordService.verify_otp(
            email=serializer.validated_data["email"],
            otp=serializer.validated_data["otp"],
        )
    except FieldError as exc:
        return error_response({
            exc.field: [exc.message]
        })

    return Response(
        {
            "message": "Xác thực OTP thành công",
            "reset_token": reset_token,
        },
        status=status.HTTP_200_OK
    )


@api_view(["POST"])
def reset_password_view(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response(serializer.errors)

    try:
        ForgotPasswordService.reset_password(
            email=serializer.validated_data["email"],
            reset_token=str(serializer.validated_data["reset_token"]),
            new_password=serializer.validated_data["new_password"],
        )
    except FieldError as exc:
        return error_response({
            exc.field: [exc.message]
        })

    return Response(
        {"message": "Đặt lại mật khẩu thành công"},
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    # View sử dụng chuẩn success/error bạn đã định nghĩa ở các file trước
    serializer = ChangePasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        UserService.change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"]
        )
    except FieldError as e:
        return Response(
            {"errors": {e.field: [e.message]}}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {"message": "Mật khẩu đã được cập nhật thành công"}, 
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated]) # Precondition: Phải có token hợp lệ để gọi
def logout_view(request):
    """
    POST /api/auth/logout/
    """
    # Gọi service để xử lý xóa token
    success = AuthService.logout(user=request.user)
    
    if success:
        return Response(
            {"message": "Đăng xuất thành công"}, 
            status=status.HTTP_200_OK
        )
    
    return Response(
        {"errors": {"non_field_errors": ["Không thể thực hiện đăng xuất lúc này"]}}, 
        status=status.HTTP_400_BAD_REQUEST
    )