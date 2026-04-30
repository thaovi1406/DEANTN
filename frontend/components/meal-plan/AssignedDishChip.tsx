import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AssignedDishItem } from "@/src/api/mealPlanApi";

type Props = {
  styles: any;
  dish: AssignedDishItem;
  onPress: () => void;
  onDelete: () => void;
};

export default function AssignedDishChip({
  styles,
  dish,
  onPress,
  onDelete,
}: Props) {
  return (
    <View style={styles.assignedDishWrapper}>
      <TouchableOpacity
        style={styles.assignedDishPill}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={[styles.assignedDishText, { marginRight: 12 }]}>
          {dish.dish_name}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.assignedDishDelete} onPress={onDelete}>
        <Ionicons name="close-circle" size={18} color="#D75C5C" />
      </TouchableOpacity>
    </View>
  );
}