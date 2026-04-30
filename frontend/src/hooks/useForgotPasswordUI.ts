import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type ForgotPasswordErrors = {
  email?: string;
  otp?: string;
  new_password?: string;
  confirm_password?: string;
  reset_token?: string;
  non_field_errors?: string;
};

type ApiErrorResponse = {
  errors?: Record<string, string[] | string>;
  message?: string;
};

type ApiSuccessResponse = {
  message?: string;
  reset_token?: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

const SEND_OTP_URL = `${API_BASE_URL}/auth/send-otp/`;
const VERIFY_OTP_URL = `${API_BASE_URL}/auth/verify-otp/`;
const RESET_PASSWORD_URL = `${API_BASE_URL}/auth/reset-password/`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Đồng bộ với backend ForgotPasswordService.RESEND_OTP_COOLDOWN_SECONDS = 60
const OTP_RESEND_SECONDS = 60;

export function useForgotPasswordFlow() {
  const params = useLocalSearchParams<{
    email?: string;
    resetToken?: string;
  }>();

  const initialEmail =
    typeof params.email === "string" ? params.email.trim().toLowerCase() : "";

  const initialResetToken =
    typeof params.resetToken === "string" ? params.resetToken : "";

  const [loading, setLoading] = useState(false);

  const [email, setEmailState] = useState(initialEmail);
  const [otp, setOtpState] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken);

  const [newPassword, setNewPasswordState] = useState("");
  const [confirmPassword, setConfirmPasswordState] = useState("");

  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [countdown, setCountdown] = useState(
    initialEmail ? OTP_RESEND_SECONDS : 0
  );

  const canResend = countdown === 0;

  useEffect(() => {
    if (initialEmail && initialEmail !== email) {
      setEmailState(initialEmail);
    }
  }, [initialEmail, email]);

  useEffect(() => {
    if (initialResetToken && initialResetToken !== resetToken) {
      setResetToken(initialResetToken);
    }
  }, [initialResetToken, resetToken]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formattedCountdown = useMemo(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [countdown]);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  const clearFieldError = (field: keyof ForgotPasswordErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      non_field_errors: undefined,
    }));
  };

  const getFirstErrorMessage = (value?: string[] | string) => {
    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;
    return undefined;
  };

  const mapApiErrors = (payload: ApiErrorResponse) => {
    const raw = payload?.errors || {};

    setErrors({
      email: getFirstErrorMessage(raw.email),
      otp: getFirstErrorMessage(raw.otp),
      new_password: getFirstErrorMessage(raw.new_password),
      confirm_password: getFirstErrorMessage(raw.confirm_password),
      reset_token: getFirstErrorMessage(raw.reset_token),
      non_field_errors:
        getFirstErrorMessage(raw.non_field_errors) || payload?.message,
    });
  };

  const postJson = async <TResponse,>(
    url: string,
    body: Record<string, unknown>
  ): Promise<{ ok: boolean; data: TResponse }> => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data: TResponse;
    try {
      data = await response.json();
    } catch {
      data = {} as TResponse;
    }

    return { ok: response.ok, data };
  };

  const startOtpCountdown = () => {
    setCountdown(OTP_RESEND_SECONDS);
  };

  const setEmail = (value: string) => {
    setEmailState(value);
    clearFieldError("email");
  };

  const setOtp = (value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(0, 6);
    setOtpState(sanitized);
    clearFieldError("otp");
  };

  const setNewPassword = (value: string) => {
    setNewPasswordState(value);
    clearFieldError("new_password");
    clearFieldError("confirm_password");
  };

  const setConfirmPassword = (value: string) => {
    setConfirmPasswordState(value);
    clearFieldError("confirm_password");
  };

  const toggleNewPassword = () => {
    setSecureNewPassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setSecureConfirmPassword((prev) => !prev);
  };

  const validateEmailStep = () => {
    const nextErrors: ForgotPasswordErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      nextErrors.email = "Vui lòng nhập đúng định dạng email";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateOtpStep = () => {
    const nextErrors: ForgotPasswordErrors = {};

    if (!otp.trim()) {
      nextErrors.otp = "Vui lòng nhập mã OTP";
    } else if (!/^\d{6}$/.test(otp.trim())) {
      nextErrors.otp = "Mã nhập không hợp lệ";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateResetPasswordStep = () => {
    const nextErrors: ForgotPasswordErrors = {};

    if (!newPassword) {
      nextErrors.new_password = "Vui lòng nhập mật khẩu mới";
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      nextErrors.new_password =
        "Vui lòng nhập đúng định dạng bao gồm: >=8 ký tự, chứa chữ cái và số";
    }

    if (!confirmPassword) {
      nextErrors.confirm_password = "Vui lòng xác nhận lại mật khẩu";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirm_password = "Mật khẩu không khớp";
    }

    if (!resetToken) {
      nextErrors.reset_token =
        "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendOtp = async () => {
    if (loading) return;
    if (!validateEmailStep()) return;

    try {
      setLoading(true);
      setErrors({});

      const { ok, data } = await postJson<ApiSuccessResponse | ApiErrorResponse>(
        SEND_OTP_URL,
        { email: normalizedEmail }
      );

      if (!ok) {
        mapApiErrors(data as ApiErrorResponse);
        return;
      }

      setOtpState("");
      startOtpCountdown();

      router.push({
        pathname: "/auth/verify-otp",
        params: {
          email: normalizedEmail,
        },
      });
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (loading) return;
    if (!validateOtpStep()) return;

    try {
      setLoading(true);
      setErrors({});

      const { ok, data } = await postJson<ApiSuccessResponse | ApiErrorResponse>(
        VERIFY_OTP_URL,
        {
          email: normalizedEmail,
          otp: otp.trim(),
        }
      );

      if (!ok) {
        mapApiErrors(data as ApiErrorResponse);
        return;
      }

      const successData = data as ApiSuccessResponse;
      const token = successData.reset_token || "";

      setResetToken(token);

      router.push({
        pathname: "/auth/set-new-password",
        params: {
          email: normalizedEmail,
          resetToken: token,
        },
      });
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (loading || !canResend) return;
    if (!normalizedEmail) return;

    try {
      setLoading(true);
      setErrors((prev) => ({
        ...prev,
        email: undefined,
        otp: undefined,
        non_field_errors: undefined,
      }));

      const { ok, data } = await postJson<ApiSuccessResponse | ApiErrorResponse>(
        SEND_OTP_URL,
        { email: normalizedEmail }
      );

      if (!ok) {
        mapApiErrors(data as ApiErrorResponse);
        return;
      }

      setOtpState("");
      startOtpCountdown();
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (loading) return;
    if (!validateResetPasswordStep()) return;

    try {
      setLoading(true);
      setErrors({});

      const { ok, data } = await postJson<ApiSuccessResponse | ApiErrorResponse>(
        RESET_PASSWORD_URL,
        {
          email: normalizedEmail,
          reset_token: resetToken,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      if (!ok) {
        mapApiErrors(data as ApiErrorResponse);
        return;
      }

      Alert.alert(
        "Thông báo",
        (data as ApiSuccessResponse)?.message || "Đặt lại mật khẩu thành công",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/auth/login");
            },
          },
        ]
      );
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    router.replace("/auth/login");
  };

  const backToForgotPassword = () => {
    router.replace({
      pathname: "/auth/forgot-password",
      params: {
        email: normalizedEmail,
      },
    });
  };

  const backToVerifyOtp = () => {
    router.replace({
      pathname: "/auth/verify-otp",
      params: {
        email: normalizedEmail,
      },
    });
  };

  return {
    loading,
    errors,

    email,
    otp,
    resetToken,
    newPassword,
    confirmPassword,

    secureNewPassword,
    secureConfirmPassword,

    countdown,
    formattedCountdown,
    canResend,

    setEmail,
    setOtp,
    setNewPassword,
    setConfirmPassword,

    toggleNewPassword,
    toggleConfirmPassword,

    sendOtp,
    verifyOtp,
    resendOtp,
    resetPassword,

    backToLogin,
    backToForgotPassword,
    backToVerifyOtp,
  };
}