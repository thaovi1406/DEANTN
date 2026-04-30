import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthLanding } from "@/src/hooks/useAuthLanding";
import AppButton from "@/components/ui/AppButton";
import Logo from "@/assets/logo_green.svg";
import Background from "@/assets/background.svg";

const { width, height } = Dimensions.get("window");

export default function AuthLandingScreen() {
  const { onLoginPress, onRegisterPress } = useAuthLanding();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

       {/* Background SVG inline */}
      <Background
        width={width * 2.3}
        height={height * 1}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          bottom: -width * 1.1,
          left: -width * 0.6,
        }}
      />

      {/* Logo + Title */}
      <View style={styles.logoWrapper}>
        <Logo width={200} height={200} />
      </View>

      {/* Buttons */}
      <View style={styles.buttonWrapper}>
        <AppButton title="Đăng Nhập" onPress={onLoginPress} />
        <AppButton
          title="Đăng Ký"
          onPress={onRegisterPress}
          variant="secondary"
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E2EDE5",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoWrapper: {
    marginTop: 150,
    alignItems: "center",
  },

  buttonWrapper: {
    marginBottom: 250,
    gap: 16,
  },
});