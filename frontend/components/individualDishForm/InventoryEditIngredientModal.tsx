import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import FormNumberField from "./FormNumberField";
import FormTextField from "./FormTextField";

type OptionItem = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  draft: {
    ingredient_name: string;
    quantity: string;
    unit: string;
    group_name: string;
    category: string;
  };
  errors: {
    ingredient_name?: string;
    quantity?: string;
    unit?: string;
    group_name?: string;
    category?: string;
  };
  unitOptions: OptionItem[];
  groupOptions: OptionItem[];
  categoryOptions: OptionItem[];
  onChangeDraft: (
    field:
      | "ingredient_name"
      | "quantity"
      | "unit"
      | "group_name"
      | "category",
    value: string
  ) => void;
  onClose: () => void;
  onSave: () => void;
};

function SelectField({
  label,
  required = false,
  value,
  options,
  error,
  disabled = false,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: OptionItem[];
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>

      <View
        style={[
          styles.pickerContainer,
          disabled ? styles.disabledField : null,
        ]}
      >
        <Picker
          enabled={!disabled}
          selectedValue={value}
          onValueChange={(itemValue) => onChange(String(itemValue))}
          style={styles.picker}
          itemStyle={{ fontSize: 14, height: 100 }}
        >
          {options.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              style={styles.pickerItem}
            />
          ))}
        </Picker>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function InventoryEditIngredientModal({
  visible,
  draft,
  errors,
  unitOptions,
  groupOptions,
  categoryOptions,
  onChangeDraft,
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
            <View style={styles.disabledField}>
              <FormTextField
                label="Tên nguyên liệu"
                required
                value={draft.ingredient_name}
                onChangeText={(value) => onChangeDraft("ingredient_name", value)}
                error={errors.ingredient_name}
                editable={false}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <FormNumberField
                  label="Số lượng"
                  required
                  value={draft.quantity}
                  onChangeText={(value) => onChangeDraft("quantity", value)}
                  error={errors.quantity}
                />
              </View>

              <View style={styles.half}>
                <SelectField
                  label="Đơn vị"
                  required
                  value={draft.unit}
                  options={unitOptions}
                  error={errors.unit}
                  onChange={(value) => onChangeDraft("unit", value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <View style={styles.disabledField}>
                  <FormTextField
                    label="Nhóm nguyên liệu"
                    required
                    value={draft.group_name}
                    onChangeText={(value) => onChangeDraft("group_name", value)}
                    error={errors.group_name}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.half}>
                <View style={styles.disabledField}>
                  <FormTextField
                    label="Loại nguyên liệu"
                    required
                    value={draft.category}
                    onChangeText={(value) => onChangeDraft("category", value)}
                    error={errors.category}
                    editable={false}
                  />
                </View>
              </View>
            </View>

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
  row: {
    flexDirection: "row",
    gap: 14,
  },
  half: {
    flex: 1,
  },
  fieldWrapper: {
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
  pickerContainer: {
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: "#DDE5DE",
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    color: "#2F2F2F",
  },
  pickerItem: {
    fontSize: 14,
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
    marginTop: 8,
  },
  actionButton: {
    minWidth: 90,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  saveButton: {
    backgroundColor: "#5D9722",
  },
  cancelText: {
    color: "#2F2F2F",
    fontSize: 15,
    fontWeight: "600",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledField: {
    opacity: 0.65,
  },
});