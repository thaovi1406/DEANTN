import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MealPlanAvailableDish } from "@/src/api/mealPlanApi";

type DishCardProps = {
  styles: any;
  item: MealPlanAvailableDish;
  assigning: boolean;
  added: boolean;
  onAssign: () => void;
};

function DishPickerCard({
  styles,
  item,
  assigning,
  added,
  onAssign,
}: DishCardProps) {
  const disabled = assigning || added;

  return (
    <View style={styles.dishCard}>
      <View style={styles.dishImageWrapper}>
        <Image
          source={
            item.image ? { uri: item.image } : require("@/assets/images/icon.png")
          }
          style={styles.dishImage}
        />

        <View style={styles.favoriteBadgeOnImage}>
          <Ionicons
            name={item.is_favorite ? "heart" : "heart-outline"}
            size={14}
            color={item.is_favorite ? "#5D9625" : "#A0A0A0"}
          />
        </View>
      </View>

      <View style={styles.dishContent}>
        <View style={styles.dishTitleRow}>
          <Text style={styles.dishName}>{item.dish_name}</Text>
        </View>

        <View style={styles.dishMetaRow}>
          <Ionicons name="time-outline" size={16} color="#4D4D4D" />
          <Text style={styles.dishMetaText}>{item.cooking_time} phút</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addDishButton,
          disabled ? styles.addDishButtonDisabled : null,
        ]}
        onPress={onAssign}
        disabled={disabled}
      >
        {assigning ? (
          <ActivityIndicator size="small" color="#5D9625" />
        ) : (
          <Text
            style={[
              styles.addDishButtonText,
              added ? styles.addDishButtonTextDisabled : null,
            ]}
          >
            {added ? "Đã thêm" : "+ Thêm"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

type Props = {
  styles: any;
  visible: boolean;
  search: string;
  dishes: MealPlanAvailableDish[];
  loading: boolean;
  error: string;
  assigningDishId: number | null;
  addedDishIdSet: Set<number>;
  onChangeSearch: (value: string) => void;
  onSubmitSearch: () => void;
  onClose: () => void;
  onAssignDish: (dish: MealPlanAvailableDish) => void | Promise<void>;
};

export default function DishPickerModal({
  styles,
  visible,
  search,
  dishes,
  loading,
  error,
  assigningDishId,
  addedDishIdSet,
  onChangeSearch,
  onSubmitSearch,
  onClose,
  onAssignDish,
}: Props) {
  const handleAssignDish = async (dish: MealPlanAvailableDish) => {
    if (addedDishIdSet.has(dish.dish_id) || assigningDishId === dish.dish_id) {
      return;
    }

    await Promise.resolve(onAssignDish(dish));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalCardLarge}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn món cho thực đơn</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={30} color="#5D9625" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={22} color="#A6A6A6" />
            <TextInput
              value={search}
              onChangeText={onChangeSearch}
              placeholder="Tìm kiếm"
              placeholderTextColor="#9B9B9B"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={onSubmitSearch}
            />
          </View>

          {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}

          {loading ? (
            <View style={styles.modalLoadingBox}>
              <ActivityIndicator size="large" color="#5D9625" />
            </View>
          ) : (
            <FlatList
              data={dishes}
              keyExtractor={(item) => String(item.dish_id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalListContent}
              renderItem={({ item }) => {
                const isAdded = addedDishIdSet.has(item.dish_id);
                const isAssigning = assigningDishId === item.dish_id;

                return (
                  <DishPickerCard
                    styles={styles}
                    item={item}
                    assigning={isAssigning}
                    added={isAdded}
                    onAssign={() => handleAssignDish(item)}
                  />
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Không tìm thấy món ăn phù hợp</Text>
              }
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}