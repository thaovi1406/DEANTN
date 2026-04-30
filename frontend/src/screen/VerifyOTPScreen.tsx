import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Logo from "@/assets/logo_green.svg";
import AppButton from "@/components/ui/AppButton";
import { useForgotPasswordFlow } from "@/src/hooks/useForgotPasswordUI";
import { SafeAreaView } from "react-native-safe-area-context";
export default function VerifyOTPScreen() {
  const {
    email,
    otp,
    setOtp,
    loading,
    errors,
    verifyOtp,
    resendOtp,
    backToLogin,
    formattedCountdown,
    canResend,
  } = useForgotPasswordFlow();

  const inputRef = useRef<TextInput>(null);

  const otpArray = useMemo(() => {
    const chars = otp.split("");
    return Array.from({ length: 6 }, (_, index) => chars[index] || "");
  }, [otp]);

  const activeIndex = useMemo(() => {
    const firstEmpty = otpArray.findIndex((item) => !item);
    return firstEmpty === -1 ? 5 : firstEmpty;
  }, [otpArray]);

  const focusHiddenInput = () => {
    inputRef.current?.focus();
  };

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
          extraScrollHeight={120}
          extraHeight={120}
          keyboardOpeningTime={0}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrapper}>
            <Logo width={150} height={150} />
          </View>

          <Text style={styles.title}>XÁC MINH OTP</Text>

          <Text style={styles.subtitle}>
            Nhập mã OTP của bạn được gửi qua{"\n"}email
          </Text>

          {!!email && <Text style={styles.emailText}>{email}</Text>}

          <Pressable style={styles.otpWrapper} onPress={focusHiddenInput}>
            {otpArray.map((digit, index) => {
              const isFilled = !!digit;
              const isActive = index === activeIndex && otp.length < 6;
              const hasError = !!errors.otp;

              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isFilled && styles.otpBoxFilled,
                    isActive && styles.otpBoxActive,
                    hasError && styles.otpBoxError,
                  ]}
                >
                  <Text
                    style={[
                      styles.otpText,
                      !digit && styles.otpPlaceholder,
                    ]}
                  >
                    {digit || "-"}
                  </Text>
                </View>
              );
            })}

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              textContentType="oneTimeCode"
              maxLength={6}
              style={styles.hiddenInput}
              autoFocus
              onSubmitEditing={verifyOtp}
            />
          </Pressable>

          {!!errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
            <View style={styles.resendSection}>
        
        <Text style={styles.resendLabel}>Không nhận được mã</Text>

        <View style={styles.resendRow}>
            {!canResend && (
            <Text style={styles.countdownText}>{formattedCountdown}</Text>
            )}

            <TouchableOpacity
            onPress={resendOtp}
            disabled={!canResend || loading}
            activeOpacity={0.8}
            >
            <Text
                style={[
                styles.resendText,
                !canResend && styles.resendTextDisabled,
                ]}
            >
                Gửi lại
            </Text>
            </TouchableOpacity>
        </View>
                <AppButton
                title="XÁC NHẬN"
                onPress={verifyOtp}
                loading={loading}
                disabled={loading || otp.length < 6}
            />
          </View>

          

          <TouchableOpacity onPress={backToLogin} disabled={loading}>
            <Text style={styles.backText}>Quay về Đăng nhập</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const BOX_SIZE = 46;
const BOX_GAP = 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
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
  emailText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 15,
    color: "#5C8F2F",
    fontWeight: "600",
  },
  otpWrapper: {
    marginTop: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: BOX_GAP,
    position: "relative",
  },
  otpBox: {
    width: BOX_SIZE,
    height: 62,
    borderRadius: 14,
    backgroundColor: "#F8F8F8",
    borderWidth: 1.2,
    borderColor: "#D7D7D7",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    backgroundColor: "#FFFFFF",
    borderColor: "#6A9E2E",
  },
  otpBoxActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#5C8F2F",
    borderWidth: 1.6,
  },
  otpBoxError: {
    borderColor: "#D93025",
  },
  otpText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#1E1E1E",
  },
  otpPlaceholder: {
    color: "#BFBFBF",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
    color: "#D93025",
    fontSize: 12,
  },
  resendSection: {
    marginTop: 28,
    alignItems: "center",
  },
  resendLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },
  countdownText: {
    fontSize: 16,
    color: "#5C8F2F",
    fontWeight: "600",
  },
  resendText: {
    fontSize: 16,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  resendTextDisabled: {
    color: "#7A7A7A",
  },
  backText: {
    marginTop: 24,
    color: "#5C8F2F",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});