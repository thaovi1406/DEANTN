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
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  options: OptionItem[];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
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

export default function IngredientModal({
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
            <FormTextField
              label="Tên nguyên liệu"
              required
              value={draft.ingredient_name}
              onChangeText={(value) => onChangeDraft("ingredient_name", value)}
              error={errors.ingredient_name}
            />

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
                <SelectField
                  label="Nhóm nguyên liệu"
                  required
                  value={draft.group_name}
                  options={groupOptions}
                  error={errors.group_name}
                  onChange={(value) => onChangeDraft("group_name", value)}
                />
              </View>

              <View style={styles.half}>
                <SelectField
                  label="Loại nguyên liệu"
                  required
                  value={draft.category}
                  options={categoryOptions}
                  error={errors.category}
                  onChange={(value) => onChangeDraft("category", value)}
                />
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