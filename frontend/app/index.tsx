import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouter } from "expo-router";

import Logo from "../assets/logo_white.svg";
import Background from "../assets/background.svg";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.logoWrapper}>
        <View style={styles.row}>
          <Logo width={300} height={300} />
        </View>
      </View>

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
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3E9300",
  },
  logoWrapper: {
    position: "absolute",
    top: "24%",
    left: 0,
    right: 0,
    alignItems: "center",
    
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    letterSpacing: 2,
    color: "white",
    marginTop: 4,
  },
  background: {
    position: "absolute",
    bottom: 0,
  },
});