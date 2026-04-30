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
import Logo from "@/assets/logo_green.svg";
import AppButton from "@/components/ui/AppButton";
import { useForgotPasswordFlow } from "@/src/hooks/useForgotPasswordUI";

export default function ForgotPasswordScreen() {
  const { email, setEmail, loading, errors, sendOtp, backToLogin } =
    useForgotPasswordFlow();

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

          <Text style={styles.title}>QUÊN MẬT KHẨU</Text>
          <Text style={styles.subtitle}>
            Nhập email của bạn, chúng tôi sẽ{"\n"}gửi mã OTP để đặt lại mật khẩu
          </Text>

          <View style={styles.form}>
            <View style={styles.formInner}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>

              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={sendOtp}
              />

              {!!errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={{ marginTop: 20 }}>
                <AppButton 
                    title="GỬI MÃ"
                    onPress={sendOtp}
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
    marginTop: 56,
    alignItems: "center",
  },
  formInner: {
    width: "88%",
    maxWidth: 420,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
  },
  required: {
    color: "red",
  },
  input: {
    height: 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#CFCFCF",
    fontSize: 16,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    marginTop: 6,
    color: "red",
    fontSize: 12,
  },
  backText: {
    marginTop: 28,
    color: "#5C8F2F",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});