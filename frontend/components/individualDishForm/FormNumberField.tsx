import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export default function FormNumberField({
  label,
  required = false,
  value,
  onChangeText,
  error,
  placeholder,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>

      <View style={styles.input}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#93A08F"
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
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
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  textInput: {
    fontSize: 16,
    color: "#2F2F2F",
  },
  errorText: {
    color: "#D93A3A",
    fontSize: 12,
    marginTop: 6,
  },
});