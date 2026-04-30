import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { MealPlanMeal } from "@/src/api/mealPlanApi";
import AssignedDishChip from "./AssignedDishChip";

type Props = {
  styles: any;
  meal: MealPlanMeal;
  onAdd: () => void;
  onPressDish: (dishId: number) => void;
  onDeleteDish: (planDetailId: number) => void;
};

type EmptyMealSlotProps = {
  styles: any;
  onPress: () => void;
};

function EmptyMealSlot({ styles, onPress }: EmptyMealSlotProps) {
  return (
    <TouchableOpacity
      style={styles.emptySlotButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.emptySlotPlus}>+</Text>
    </TouchableOpacity>
  );
}

export default function MealPlanMealCell({
  styles,
  meal,
  onAdd,
  onPressDish,
  onDeleteDish,
}: Props) {
  return (
    <View style={styles.mealCellList}>
      {/* 1. Luôn duyệt và hiển thị danh sách món ăn hiện có */}
      {meal.dishes.map((dish) => (
        <AssignedDishChip
          key={dish.plan_detail_id}
          styles={styles}
          dish={dish}
          onPress={() => onPressDish(dish.dish_id)}
          onDelete={() => onDeleteDish(dish.plan_detail_id)}
        />
      ))}

      {/* 2. Luôn hiển thị nút Thêm mới (+) ở cuối cùng */}
      <EmptyMealSlot styles={styles} onPress={onAdd} />
    </View>
  );
}