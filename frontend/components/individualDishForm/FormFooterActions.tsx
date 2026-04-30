import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  submitting?: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function FormFooterActions({
  submitting = false,
  onCancel,
  onSave,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={onCancel}
        disabled={submitting}
      >
        <Text style={styles.cancelText}>Hủy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={onSave}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.saveText}>Lưu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E4",
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#EDCACA",
  },
  saveButton: {
    backgroundColor: "#DDE5DE",
  },
  cancelText: {
    color: "#D93A3A",
    fontWeight: "700",
    fontSize: 16,
  },
  saveText: {
    color: "#5D9722",
    fontWeight: "700",
    fontSize: 16,
  },
});