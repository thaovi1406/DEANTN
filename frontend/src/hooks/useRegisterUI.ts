import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { API_BASE_URL } from "@/src/config/api";

type RegisterErrors = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
};

const EMPTY_ERRORS: RegisterErrors = {
  username: "",
  email: "",
  password: "",
  password_confirm: "",
};

export const useRegisterUI = () => {
  const router = useRouter();

  // ===== input states =====
  const [username, setUsernameState] = useState("");
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [confirmPassword, setConfirmPasswordState] = useState("");

  // ===== UI states =====
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  // ===== error state =====
  const [errors, setErrors] = useState<RegisterErrors>(EMPTY_ERRORS);

  // ===== helper =====
  const clearFieldError = (field: keyof RegisterErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return {
        ...prev,
        [field]: "",
      };
    });
  };

  const mapApiErrorMessage = (
    field: keyof RegisterErrors,
    message: string
  ): string => {
    const normalized = message?.trim();

    if (
      normalized === "This field is required." ||
      normalized === "This field may not be blank."
    ) {
      const requiredMessages: RegisterErrors = {
        username: "Vui lòng nhập Tên đăng nhập",
        email: "Vui lòng nhập Email",
        password: "Vui lòng nhập Mật khẩu",
        password_confirm: "Vui lòng nhập Xác nhận mật khẩu",
      };

      return requiredMessages[field];
    }

    if (field === "email" && normalized === "Enter a valid email address.") {
      return "Email không đúng định dạng";
    }

    return normalized || "";
  };

  // ===== input handlers: vừa set state vừa clear lỗi field đó =====
  const setUsername = (value: string) => {
    setUsernameState(value);
    clearFieldError("username");
  };

  const setEmail = (value: string) => {
    setEmailState(value);
    clearFieldError("email");
  };

  const setPassword = (value: string) => {
    setPasswordState(value);
    clearFieldError("password");
  };

  const setConfirmPassword = (value: string) => {
    setConfirmPasswordState(value);
    clearFieldError("password_confirm");
  };

  // ===== toggle password =====
  const togglePassword = () => {
    setSecurePassword((prev) => !prev);
  };

  const toggleConfirmPassword = () => {
    setSecureConfirm((prev) => !prev);
  };

  // ===== validate client-side =====
  const validateInputs = (): boolean => {
    const nextErrors: RegisterErrors = {
      username: "",
      email: "",
      password: "",
      password_confirm: "",
    };

    let hasError = false;

    if (!username.trim()) {
      nextErrors.username = "Vui lòng nhập Tên đăng nhập";
      hasError = true;
    }

    if (!email.trim()) {
      nextErrors.email = "Vui lòng nhập Email";
      hasError = true;
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập Mật khẩu";
      hasError = true;
    }

    if (!confirmPassword) {
      nextErrors.password_confirm = "Vui lòng nhập Xác nhận mật khẩu";
      hasError = true;
    }

    setErrors(nextErrors);
    return !hasError;
  };

  // ===== gọi API register =====
  const onRegister = async () => {
    if (loading) return;

    const isValid = validateInputs();
    if (!isValid) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          password_confirm: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiErrors = data.errors || {};

        setErrors({
          username: mapApiErrorMessage(
            "username",
            apiErrors.username?.[0] || ""
          ),
          email: mapApiErrorMessage("email", apiErrors.email?.[0] || ""),
          password: mapApiErrorMessage(
            "password",
            apiErrors.password?.[0] || ""
          ),
          password_confirm: mapApiErrorMessage(
            "password_confirm",
            apiErrors.password_confirm?.[0] || ""
          ),
        });

        return;
      }

      Alert.alert("Thành công", data.message || "Đăng ký thành công");
      router.replace("/auth/login");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // ===== chuyển sang login =====
  const onLogin = () => {
    router.push("/auth/login");
  };

  return {
    // input
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,

    // ui
    securePassword,
    secureConfirm,
    togglePassword,
    toggleConfirmPassword,
    loading,

    // errors
    errors,

    // actions
    onRegister,
    onLogin,
  };
};