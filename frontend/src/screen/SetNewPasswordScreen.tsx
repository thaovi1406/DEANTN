import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import Logo from "@/assets/logo_green.svg";
import AppButton from "@/components/ui/AppButton";
import { useForgotPasswordFlow } from "@/src/hooks/useForgotPasswordUI";

export default function SetNewPasswordScreen() {
  const {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    secureNewPassword,
    secureConfirmPassword,
    toggleNewPassword,
    toggleConfirmPassword,
    resetPassword,
    loading,
    errors,
    backToLogin,
  } = useForgotPasswordFlow();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={140}
          extraHeight={140}
          keyboardOpeningTime={0}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrapper}>
            <Logo width={150} height={150} />
          </View>

          <Text style={styles.title}>MẬT KHẨU MỚI</Text>
          <Text style={styles.subtitle}>Nhập mật khẩu mới của bạn</Text>

          <View style={styles.form}>
            <View style={styles.formInner}>
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  errors.new_password ? styles.inputWrapperError : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={secureNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                />

                <TouchableOpacity
                  onPress={toggleNewPassword}
                  disabled={loading}
                  style={styles.eyeButton}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={secureNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={28}
                    color="#2F2F2F"
                  />
                </TouchableOpacity>
              </View>

              {!!errors.new_password && (
                <Text style={styles.errorText}>{errors.new_password}</Text>
              )}

              <Text style={[styles.label, styles.secondLabel]}>
                Xác nhận mật khẩu <Text style={styles.required}>*</Text>
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  errors.confirm_password ? styles.inputWrapperError : null,
                ]}
              >
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={resetPassword}
                />

                <TouchableOpacity
                  onPress={toggleConfirmPassword}
                  disabled={loading}
                  style={styles.eyeButton}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      secureConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={28}
                    color="#2F2F2F"
                  />
                </TouchableOpacity>
              </View>

              {!!errors.confirm_password && (
                <Text style={styles.errorText}>{errors.confirm_password}</Text>
              )}

              {!!errors.reset_token && (
                <Text style={styles.errorTextCenter}>{errors.reset_token}</Text>
              )}
            </View>

            
            <View style={{ marginTop: 20 }}>
                <AppButton
                title="ĐẶT MẬT KHẨU MỚI"
                onPress={resetPassword}
                loading={loading}
                disabled={loading}
                />
            </View>

            <TouchableOpacity onPress={backToLogin} disabled={loading}>
              <Text style={styles.backText}>Quay về đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 42,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E1E1E",
    marginTop: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginTop: 18,
    fontSize: 16,
    lineHeight: 28,
  },
  form: {
    marginTop: 52,
    alignItems: "center",
  },
  formInner: {
    width: "88%",
    maxWidth: 420,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  secondLabel: {
    marginTop: 22,
  },
  required: {
    color: "#E53935",
  },
  inputWrapper: {
    height: 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFCFCF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 14,
  },
  inputWrapperError: {
    borderColor: "#D93025",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1E1E1E",
  },
  eyeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  errorText: {
    marginTop: 6,
    color: "#D93025",
    fontSize: 12,
    lineHeight: 18,
  },
  errorTextCenter: {
    marginTop: 10,
    color: "#D93025",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  backText: {
    marginTop: 28,
    color: "#5C8F2F",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});