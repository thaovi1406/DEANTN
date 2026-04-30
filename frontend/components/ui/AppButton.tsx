import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
}

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#FFFFFF" : "#3E9300"}
            style={{ marginRight: 8 }}
          />
        )}

        <Text
          style={[
            styles.text,
            variant === "primary" ? styles.primaryText : styles.secondaryText,
          ]}
        >
          {loading ? "Đang xử lý..." : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 260,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
  },

  primary: {
    backgroundColor: "#3E9300",
  },

  secondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3E9300",
  },

  disabled: {
    opacity: 0.6,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
  },

  primaryText: {
    color: "#FFFFFF",
  },

  secondaryText: {
    color: "#3E9300",
  },
});