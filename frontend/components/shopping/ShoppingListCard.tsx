import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ShoppingListSummary } from "@/src/api/shoppingListApi";

type Props = {
  item: ShoppingListSummary;
  styles: any;
  onPress: () => void;
  onDelete: () => void;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("vi-VN");
}

export default function ShoppingListCard({
  item,
  styles,
  onPress,
  onDelete,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{item.list_name}</Text>
          <Text style={styles.cardDate}>Ngày tạo: {formatDate(item.created_date)}</Text>
          <Text style={styles.cardMeta}>{item.item_count} nguyên liệu</Text>
        </View>

        <TouchableOpacity onPress={onDelete} hitSlop={10}>
          <Feather name="trash-2" size={22} color="#E25A5A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}