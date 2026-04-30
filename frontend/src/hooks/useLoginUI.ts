import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { setAuthToken } from "@/src/utils/authStorage";
import { API_BASE_URL } from "@/src/config/api";

type LoginSuccess = {
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
    };
  };
};

type LoginError = {
  errors?: Record<string, string[]>;
};

export const useLoginUI = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    non_field_errors: "",
  });

  const togglePassword = () => setSecure((prev) => !prev);

  const onForgotPress = () => {
    router.push("/auth/forgot-password");
  };

  const onRegisterPress = () => {
    router.push("/auth/register");
  };

  const onChangeUsername = (value: string) => {
    setUsername(value);
    if (errors.username || errors.non_field_errors) {
      setErrors((prev) => ({
        ...prev,
        username: "",
        non_field_errors: "",
      }));
    }
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
    if (errors.password || errors.non_field_errors) {
      setErrors((prev) => ({
        ...prev,
        password: "",
        non_field_errors: "",
      }));
    }
  };

  const onLogin = async () => {
    setErrors({ username: "", password: "", non_field_errors: "" });

    let hasError = false;
    const nextErrors = { username: "", password: "", non_field_errors: "" };

    if (!username.trim()) {
      nextErrors.username = "Vui lòng nhập tên đăng nhập";
      hasError = true;
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
      hasError = true;
    }

    if (hasError) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as
        | LoginSuccess
        | LoginError
        | any;

      if (!response.ok) {
        const apiErrors = (data as LoginError)?.errors || {};

        setErrors({
          username: apiErrors.username?.[0] || "",
          password: apiErrors.password?.[0] || "",
          non_field_errors:
            apiErrors.non_field_errors?.[0] ||
            "Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại",
        });
        return;
      }

      const okData = data as LoginSuccess;
      await setAuthToken(okData.data.token);

      router.replace({
      pathname: "/home",
    });
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername: onChangeUsername,
    password,
    setPassword: onChangePassword,

    secure,
    togglePassword,
    loading,

    errors,

    onLogin,
    onForgotPress,
    onRegisterPress,
  };
};