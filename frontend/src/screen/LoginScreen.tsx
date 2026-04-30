import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import Logo from "@/assets/logo_green.svg";
import AppButton from "@/components/ui/AppButton";
import { useLoginUI } from "@/src/hooks/useLoginUI";

export default function LoginScreen() {
  const {
    // input
    username,
    setUsername,
    password,
    setPassword,

    // ui
    secure,
    togglePassword,
    loading,

    // errors
    errors,

    // actions
    onLogin,
    onForgotPress,
    onRegisterPress,
  } = useLoginUI();

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
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Logo width={130} height={130} />
          </View>

          <Text style={styles.title}>ĐĂNG NHẬP</Text>
          <Text style={styles.subtitle}>
            Nhập tài khoản và mật khẩu để tiếp tục
          </Text>

          <View style={styles.form}>
            <View style={styles.formInner}>
              {/* Username */}
              <Text style={styles.label}>
                Tài khoản <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.username ? styles.inputError : null]}
                value={username}
                onChangeText={(t) => setUsername(t)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
              />
              {!!errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

              {/* Password */}
              <Text style={styles.label}>
                Mật khẩu <Text style={styles.required}>*</Text>
              </Text>

              <View
                style={[
                  styles.passwordWrapper,
                  errors.password ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(t) => setPassword(t)}
                  secureTextEntry={secure}
                  editable={!loading}
                  returnKeyType="done"
                />

                <TouchableOpacity onPress={togglePassword} disabled={loading}>
                  <Ionicons
                    name={secure ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {!!errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Error chung (sai tài khoản/mật khẩu) */}
              {!!errors.non_field_errors && (
                <Text style={[styles.errorText, { marginTop: 10 }]}>
                  {errors.non_field_errors}
                </Text>
              )}
            </View>

            <View style={styles.forgotWrapper}>
              <TouchableOpacity onPress={onForgotPress} disabled={loading}>
                <Text style={styles.forgot}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <AppButton title="ĐĂNG NHẬP" onPress={onLogin} loading={loading} />
            {/* Nếu AppButton của bạn chưa support loading prop thì giữ onPress={onLogin} thôi */}
          </View>

          <View style={styles.dividerWrapper}>
            <View style={styles.line} />
            <Text style={styles.or}>hoặc</Text>
            <View style={styles.line} />
          </View>

          <Text style={styles.registerText}>
            Bạn chưa có tài khoản?{" "}
            <Text style={styles.registerLink} onPress={onRegisterPress}>
              Đăng ký
            </Text>
          </Text>
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

  // ✅ quan trọng: giúp scroll view vẫn canh giữa + có padding đáy để scroll vượt keyboard
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 160, // tăng nếu muốn “lên cao hơn nữa”
  },

  logoWrapper: {
    alignItems: "center",
    marginVertical: 50,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginVertical: 8,
  },

  form: {
    marginTop: 15,
    alignItems: "center",
  },
  formInner: {
    width: "85%",
    maxWidth: 420,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 16,
  },

  required: {
    color: "red",
  },

  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,          // ✅ thêm
    borderColor: "#fff", 
  },

  passwordWrapper: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,          // ✅ thêm
    borderColor: "#fff",  
  },

  passwordInput: {
    flex: 1,
    alignItems: "center",
  },

  forgotWrapper: {
    width: "85%",
    alignItems: "flex-end",
    marginTop: 8,
  },

  forgot: {
    color: "#5C8F2F",
    fontSize: 14,
  },

  dividerWrapper: {
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },

  or: {
    marginHorizontal: 10,
    color: "#666",
  },

  registerText: {
    textAlign: "center",
  },

  registerLink: {
    color: "#5C8F2F",
    fontWeight: "600",
  },
    errorText: {
    marginTop: 6,
    color: "red",
    fontSize: 12,
  },

  inputError: {
    borderColor: "red",
  },
});