import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { MealPlanDay, MealPlanMeal } from "@/src/api/mealPlanApi";
import MealPlanMealCell from "./MealPlanMealCell";

type Props = {
  styles: any;
  day: MealPlanDay;
  onOpenDishPicker: (day: MealPlanDay, meal: MealPlanMeal) => void;
  onPressDish: (dishId: number) => void;
  onDeleteDish: (planDetailId: number) => void;
  onCopyDay: (date: string) => void;
  onClearDay: (date: string) => void;
  onCreateShoppingDay: (date: string) => void;
  creatingDayShoppingDate?: string | null;
};

export default function MealPlanDayRow({
  styles,
  day,
  onOpenDishPicker,
  onPressDish,
  onDeleteDish,
  onCopyDay,
  onClearDay,
  onCreateShoppingDay,
  creatingDayShoppingDate,
}: Props) {
  const hasAssignedDishes = day.meals.some(
    (meal) => meal.dishes && meal.dishes.length > 0
  );
const isCreatingShoppingDay = creatingDayShoppingDate === day.date;
  return (
    <View style={styles.rowBox}>
      <View style={styles.dayCell}>
        <Text style={styles.monthText}>THÁNG {day.month}</Text>
        <Text style={styles.dayNumber}>{day.day}</Text>
        <Text style={styles.weekdayText}>{day.weekday_label}</Text>
      </View>

      {day.meals.map((meal) => (
        <View key={`${day.date}-${meal.meal_type}`} style={styles.mealCell}>
          <MealPlanMealCell
            styles={styles}
            meal={meal}
            onAdd={() => onOpenDishPicker(day, meal)}
            onPressDish={onPressDish}
            onDeleteDish={onDeleteDish}
          />
        </View>
      ))}

      <View style={styles.actionColumn}>
        <TouchableOpacity style={styles.iconBox}
        onPress={() => onCreateShoppingDay(day.date)} >
          <MaterialCommunityIcons
            name="cart-outline"
            size={18}
            color="#5D9625"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBox}
          onPress={() => onCopyDay(day.date)}
        >
          <Feather name="copy" size={16} color="#5D9625" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconBox,
            !hasAssignedDishes && { opacity: 0.4 },
          ]}
          onPress={() => onClearDay(day.date)}
          disabled={!hasAssignedDishes}
        >
          <Feather
            name="trash-2"
            size={16}
            color={hasAssignedDishes ? "#5D9625" : "#C8C8C8"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}