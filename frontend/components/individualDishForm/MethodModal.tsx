import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  stepNumber: number;
  instruction: string;
  error?: string;
  onChangeInstruction: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function MethodModal({
  visible,
  stepNumber,
  instruction,
  error,
  onChangeInstruction,
  onClose,
  onSave,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centerBox}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.label}>STT bước</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{stepNumber}</Text>
            </View>

            <Text style={styles.label}>
              Mô tả bước <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={instruction}
              onChangeText={onChangeInstruction}
              multiline
              placeholder="Nhập mô tả bước chế biến"
              placeholderTextColor="#93A08F"
              style={styles.textArea}
              textAlignVertical="top"
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={onSave}
              >
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.24)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  centerBox: {
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
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
  readonlyBox: {
    minHeight: 54,
    backgroundColor: "#DDE5DE",
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  readonlyText: {
    fontSize: 16,
    color: "#2F2F2F",
  },
  textArea: {
    minHeight: 120,
    backgroundColor: "#DDE5DE",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2F2F2F",
  },
  errorText: {
    color: "#D93A3A",
    fontSize: 12,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 18,
  },
  actionButton: {
    minWidth: 90,
    height: 42,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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