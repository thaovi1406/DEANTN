import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { changePasswordApi } from "@/src/api/changePasswordApi";
import { logoutApi } from "@/src/api/logoutApi";
import { clearAuthToken } from "@/src/utils/authStorage";

type FieldErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

type Params = {
  onClose: () => void;
};

function isPasswordValid(value: string) {
  if (!value || value.length < 8) return false;

  const hasLetter = /[A-Za-z]/.test(value);
  const hasDigit = /\d/.test(value);

  return hasLetter && hasDigit;
}

function normalizeErrorMessage(value?: string[] | string) {
  if (!value) return "";
  if (Array.isArray(value)) return value[0] || "";
  return value;
}

export function useChangePasswordUI({ onClose }: Params) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const onCancel = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!oldPassword.trim()) {
      nextErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (!isPasswordValid(newPassword)) {
      nextErrors.newPassword =
        "Vui lòng nhập đúng định dạng bao gồm: tối thiểu 8 ký tự, chứa chữ in hoa, chữ thường, ký tự đặc biệt và số";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;

    const isValid = validate();
    if (!isValid) return;

    try {
      setSubmitting(true);
      setErrors({});

      const result = await changePasswordApi({
        old_password: oldPassword,
        new_password: newPassword,
      });

      // đổi mật khẩu thành công -> logout server
      try {
        await logoutApi();
      } catch {
        // server logout lỗi thì vẫn clear token local để ép đăng nhập lại
      }

      await clearAuthToken();

      resetForm();
      onClose();

      Alert.alert(
        "Thông báo",
        result.message || "Mật khẩu đã được cập nhật thành công",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/");
            },
          },
        ]
      );
    } catch (err: any) {
      if (err?.message === "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại") {
        await clearAuthToken();
        Alert.alert("Thông báo", err.message, [
          {
            text: "OK",
            onPress: () => {
              router.replace("/");
            },
          },
        ]);
        return;
      }

      const data = err?.data;
      const apiErrors = data?.errors || {};

      setErrors({
        oldPassword: normalizeErrorMessage(apiErrors.old_password),
        newPassword: normalizeErrorMessage(apiErrors.new_password),
        general:
          normalizeErrorMessage(apiErrors.non_field_errors) ||
          data?.message ||
          "Không thể đổi mật khẩu lúc này",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    oldPassword,
    newPassword,
    confirmPassword,

    showOldPassword,
    showNewPassword,
    showConfirmPassword,

    errors,
    submitting,

    setOldPassword,
    setNewPassword,
    setConfirmPassword,

    setShowOldPassword,
    setShowNewPassword,
    setShowConfirmPassword,

    onSubmit,
    onCancel,
    resetForm,
  };
}