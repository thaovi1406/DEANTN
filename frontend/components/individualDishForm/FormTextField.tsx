import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type Props = TextInputProps & {
  label: string;
  required?: boolean;
  error?: string;
};

export default function FormTextField({
  label,
  required = false,
  error,
  style,
  ...props
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>

      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor="#93A08F"
      />

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    color: "#2F2F2F",
    marginBottom: 8,
    fontWeight: "500",
  },
  required: {
    color: "#D93A3A",
  },
  input: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#DDE5DE",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#2F2F2F",
  },
  errorText: {
    color: "#D93A3A",
    fontSize: 12,
    marginTop: 6,
  },
});