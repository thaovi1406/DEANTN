import React from "react";
import { Text, View } from "react-native";
import type { MealPlanDay, MealPlanMeal } from "@/src/api/mealPlanApi";
import MealPlanDayRow from "./MealPlanDayRow";

type Props = {
  styles: any;
  days: MealPlanDay[];
  onOpenDishPicker: (day: MealPlanDay, meal: MealPlanMeal) => void;
  onPressDish: (dishId: number) => void;
  onDeleteDish: (planDetailId: number) => void;
  onCopyDay: (date: string) => void;
  onClearDay: (date: string) => void;
  onCreateShoppingDay: (date: string) => void;
  creatingDayShoppingDate?: string | null;
};

export default function MealPlanWeekTable({
  styles,
  days,
  onOpenDishPicker,
  onPressDish,
  onDeleteDish,
  onCopyDay,
  onClearDay,
  onCreateShoppingDay,
  creatingDayShoppingDate
}: Props) {
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCellText, styles.dayColumn]}>NGÀY</Text>
        <Text style={[styles.headerCellText, styles.mealColumn]}>Sáng</Text>
        <Text style={[styles.headerCellText, styles.mealColumn]}>Trưa</Text>
        <Text style={[styles.headerCellText, styles.mealColumn]}>Tối</Text>
        <View style={styles.actionColumnSpacer} />
      </View>

      {days.map((day) => (
        <MealPlanDayRow
          key={day.date}
          styles={styles}
          day={day}
          onOpenDishPicker={onOpenDishPicker}
          onPressDish={onPressDish}
          onDeleteDish={onDeleteDish}
          onCopyDay={onCopyDay}
          onClearDay={onClearDay}
          onCreateShoppingDay={onCreateShoppingDay}
          creatingDayShoppingDate={creatingDayShoppingDate}
        />
      ))}
    </View>
  );
}