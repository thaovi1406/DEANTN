import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import type { ShoppingItem } from "@/src/api/shoppingListApi";

type Props = {
  item: ShoppingItem;
  styles: any;
  checked: boolean;
  toggling?: boolean;
  deleting?: boolean;
  onToggle: () => void;
  onDelete?: () => void;
};

export default function ShoppingItemCard({
  item,
  styles,
  checked,
  toggling = false,
  deleting = false,
  onToggle,
  onDelete,
}: Props) {
  return (
    <View style={styles.itemCard}>
      <TouchableOpacity
        style={styles.checkButton}
        activeOpacity={0.8}
        onPress={onToggle}
        disabled={toggling}
      >
        {checked ? (
          <Ionicons name="checkmark-circle" size={24} color="#6B9D2E" />
        ) : (
          <View style={styles.uncheckedCircle} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.itemContent}
        activeOpacity={0.8}
        onPress={onToggle}
        disabled={toggling}
      >
        <Text style={checked ? styles.itemTitleBought : styles.itemTitle}>
          {item.ingredient_name}
        </Text>

        <View style={styles.itemMetaRow}>
          <Text style={styles.itemMeta}>
            Cần có: {item.quantity} {item.unit}
          </Text>
          <Text style={styles.itemMeta}>
            Đã có: {item.inventory_quantity} {item.unit}
          </Text>
        </View>
      </TouchableOpacity>

      {!checked && onDelete ? (
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={10}
          disabled={deleting}
        >
          <Feather name="trash-2" size={22} color="#E25A5A" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}