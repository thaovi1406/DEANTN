import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Logo from "@/assets/logo_green.svg";
import AppButton from "@/components/ui/AppButton";
import { useRegisterUI } from "@/src/hooks/useRegisterUI";

export default function RegisterScreen() {

  const { height } = useWindowDimensions();
  const logoTop = Math.max(16, Math.min(50, height * 0.06));
  const logoBottom = Math.max(12, Math.min(30, height * 0.03));

  
  const {
    // inputs
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

    // errors from BE (errors.<field>)
    errors,

    // actions
    onRegister,
    onLogin,
  } = useRegisterUI();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAwareScrollView
          style={{ flex: 1, width: "100%" }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={120}
          extraHeight={120}
          keyboardOpeningTime={0}
          showsVerticalScrollIndicator={false}
        >
              {/* Logo */}
              <View style={styles.logoWrapper}>
                <Logo width={100} height={100} />
              </View>

              {/* Title */}
              <Text style={styles.title}>TẠO TÀI KHOẢN</Text>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.formInner}>
                  {/* Username */}
                  <Text style={styles.label}>
                    Nhập tên tài khoản <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.username ? styles.inputError : null]}
                    value={username}
                    onChangeText={text => {
                      setUsername(text);
                    }}
                    autoCapitalize="none"
                    placeholder="vd: nguyenvana"
                  />
                  {!!errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}

                  {/* Email */}
                  <Text style={styles.label}>
                    Nhập email <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.email ? styles.inputError : null]}
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="vd: abc@gmail.com"
                  />
                  {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

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
                      onChangeText={text => {
                        setPassword(text);
                      }}
                      secureTextEntry={securePassword}
                      autoCapitalize="none"
                      placeholder="Tối thiểu 8 ký tự"
                    />
                    <TouchableOpacity onPress={togglePassword} hitSlop={10}>
                      <Ionicons
                        name={securePassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  {/* Confirm Password */}
                  <Text style={styles.label}>
                    Xác nhận mật khẩu <Text style={styles.required}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.passwordWrapper,
                      errors.password_confirm ? styles.inputError : null,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={text => {
                        setConfirmPassword(text);
                      }}
                      secureTextEntry={secureConfirm}
                      autoCapitalize="none"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <TouchableOpacity onPress={toggleConfirmPassword} hitSlop={10}>
                      <Ionicons
                        name={secureConfirm ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!errors.password_confirm && (
                    <Text style={styles.errorText}>{errors.password_confirm}</Text>
                  )}

                  
                </View>
                {/* Button */}
                  <View style={{ marginTop: 30 }}>
                    {/* Nếu AppButton có prop loading/disabled thì dùng luôn.
                        Nếu không có, ta tự disable + thay title */}
                    <AppButton
                      title={loading ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ"}
                      onPress={onRegister}
                      disabled={loading}
                      rightIcon={loading ? <ActivityIndicator /> : undefined}
                    />
                  </View>
              </View>

              {/* Divider */}
              <View style={styles.dividerWrapper}>
                <View style={styles.line} />
                <Text style={styles.or}>hoặc</Text>
                <View style={styles.line} />
              </View>

              {/* Login */}
              <Text style={styles.loginText}>
                Bạn đã có tài khoản?{" "}
                <Text style={styles.loginLink} onPress={onLogin}>
                  Đăng nhập
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
    // FIX: thiếu dấu # → màu không ăn, màn có thể thành trong suốt/đen tuỳ platform
    backgroundColor: "#F2F2F2",
    alignItems: "center",
  },

  logoWrapper: {
    alignItems: "center",
    marginVertical: 50,
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
  },

  form: {
    width: "100%",
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
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#fff", // mặc định giống layout cũ
  },

  passwordWrapper: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#fff",
  },

  passwordInput: {
    flex: 1,
  },

  // NEW: style lỗi để khớp UC “hiển thị dưới ô input”
  errorText: {
    marginTop: 6,
    color: "red",
    fontSize: 12,
  },

  // NEW: highlight ô đang lỗi (UX tốt cho mobile)
  inputError: {
    borderColor: "red",
  },

  dividerWrapper: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#CCC",
  },

  or: {
    marginHorizontal: 10,
    color: "#666",
  },

  loginText: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },

  loginLink: {
    color: "#5C8F2F",
    fontFamily: "Inter_600SemiBold",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingBottom: 24,
  },
});