import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import BotIcon from "@/assets/hugeicons_bot";

type Props = {
  styles: any;
  weekTitle: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCopyWeek: () => void;
  onClearWeek: () => void;
  onCreateShoppingWeek: () => void;
  creatingWeekShopping?: boolean;
};

export default function MealPlanHeader({
  styles,
  weekTitle,
  onPreviousWeek,
  onNextWeek,
  onCopyWeek,
  onClearWeek,
  onCreateShoppingWeek,
  creatingWeekShopping = false,
}: Props) {
  return (
    <View>
      <View style={styles.weekSwitcher}>
        <TouchableOpacity style={styles.circleButton} onPress={onPreviousWeek}>
          <Ionicons name="chevron-back" size={18} color="#3E9300" />
        </TouchableOpacity>

        <Text style={styles.weekTitle}>{weekTitle}</Text>

        <TouchableOpacity style={styles.circleButton} onPress={onNextWeek}>
          <Ionicons name="chevron-forward" size={18} color="#3E9300" />
        </TouchableOpacity>
      </View>

      <View style={styles.topActionRow}>
        <TouchableOpacity style={styles.smallGreenButton} onPress={onCopyWeek}>
          <Feather name="copy" size={14} color="#FFFFFF" />
          <Text style={styles.smallButtonText}>Bản sao tuần</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.smallGreenButton}
          onPress={onCreateShoppingWeek}
          disabled={creatingWeekShopping}
        >
          <MaterialCommunityIcons name="cart-outline" size={14} color="#FFFFFF" />
          <Text style={styles.smallButtonText}>Mua sắm tuần</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallRedButton} onPress={onClearWeek}>
          <Feather name="trash-2" size={14} color="#FFFFFF" />
          <Text style={styles.smallButtonText}>Xóa thực đơn tuần</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}