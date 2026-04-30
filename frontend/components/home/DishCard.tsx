import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HomeDish } from "@/src/api/homeApi";
import type { IndividualDish } from "@/src/api/individualApi";

type DishCardItem = HomeDish | IndividualDish;

type Props = {
  item: DishCardItem;
  onPress?: (dishId: number) => void;
  onPressFavorite?: (dishId: number) => void;

  showFavoriteButton?: boolean;
  showManageActions?: boolean;
  onPressEdit?: (dishId: number) => void;
  onPressDelete?: (dishId: number) => void;
};

export default function DishCard({
  item,
  onPress,
  onPressFavorite,
  showFavoriteButton = true,
  showManageActions = false,
  onPressEdit,
  onPressDelete,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => onPress?.(item.dish_id)}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{
            uri:
              item.image ||
              "https://via.placeholder.com/400x300.png?text=Dish",
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {showFavoriteButton && (
          <TouchableOpacity
            style={styles.favoriteButton}
            activeOpacity={0.8}
            onPress={() => onPressFavorite?.(item.dish_id)}
          >
            <Ionicons
              name={item.is_favorite ? "heart" : "heart-outline"}
              size={20}
              color="#6B9A30"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {item.dish_name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.timeText}>{item.cooking_time} phút</Text>
          </View>

          {showManageActions && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                hitSlop={8}
                activeOpacity={0.7}
                onPress={() => onPressEdit?.(item.dish_id)}
              >
                <Ionicons name="create-outline" size={18} color="#6B9A30" />
              </TouchableOpacity>

              <TouchableOpacity
                hitSlop={8}
                activeOpacity={0.7}
                onPress={() => onPressDelete?.(item.dish_id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color="#FF4D4F" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    flex: 1,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 140,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2F2F2F",
    minHeight: 42,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666666",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 10,
  },
});