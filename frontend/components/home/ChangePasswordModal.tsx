import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;

  oldPassword: string;
  newPassword: string;
  confirmPassword: string;

  showOldPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;

  errors: {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  };

  submitting: boolean;

  setOldPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;

  setShowOldPassword: (value: boolean) => void;
  setShowNewPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;

  onSubmit: () => void;
  onCancel: () => void;
};

function PasswordInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  onToggleSecure,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry: boolean;
  onToggleSecure: () => void;
  error?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>

      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          placeholderTextColor="#9AA19B"
        />

        <TouchableOpacity onPress={onToggleSecure} style={styles.eyeButton}>
          <Ionicons
            name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#2F2F2F"
          />
        </TouchableOpacity>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function ChangePasswordModal({
  visible,
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
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <KeyboardAvoidingView
          style={styles.keyboardWrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.centered} onPress={() => {}}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.title}>ĐỔI MẬT KHẨU</Text>

                {!!errors.general && (
                  <Text style={[styles.errorText, styles.generalError]}>
                    {errors.general}
                  </Text>
                )}

                <PasswordInput
                  label="Mật khẩu hiện tại"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  onToggleSecure={() => setShowOldPassword(!showOldPassword)}
                  error={errors.oldPassword}
                />

                <PasswordInput
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  onToggleSecure={() => setShowNewPassword(!showNewPassword)}
                  error={errors.newPassword}
                />

                <PasswordInput
                  label="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onToggleSecure={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  error={errors.confirmPassword}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                    disabled={submitting}
                  >
                    <Text style={styles.cancelText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
                    onPress={onSubmit}
                    disabled={submitting}
                    >
                    {submitting ? (
                        <ActivityIndicator size="small" color="#5D8E2E" />
                    ) : (
                        <Text style={styles.submitText}>Lưu</Text>
                    )}
                    </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  keyboardWrapper: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#5D8E2E",
    marginBottom: 18,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2F2F2F",
    marginBottom: 10,
  },
  required: {
    color: "#DF4A4A",
  },
  inputWrapper: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#E9EFE9",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputWrapperError: {
    borderColor: "#E17D7D",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222222",
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  eyeButton: {
    marginLeft: 10,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#E14545",
    lineHeight: 18,
  },
  generalError: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 18,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3D5D5",
  },
  submitButton: {
    backgroundColor: "#E4ECE4",
  },
  
  cancelText: {
    color: "#D84A4A",
    fontSize: 16,
    fontWeight: "700",
  },
  submitText: {
    color: "#5D8E2E",
    fontSize: 16,
    fontWeight: "700",
  },
});