import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IngredientItem = {
  ingredient_id: number;
  display_text: string;
};

type IngredientGroup = {
  group_name: string;
  items: IngredientItem[];
};

type MethodStep = {
  step_number: number;
  instruction: string;
};

export type DishDetailData = {
  dish_id: number;
  dish_name: string;
  image: string | null;
  cooking_time: number;
  ration: number;
  calories: number | null;
  is_favorite: boolean;
  ingredients: IngredientGroup[];
  methods: MethodStep[];
};

type Props = {
  dish: DishDetailData | null;
  loading: boolean;
  generalError?: string;
  onBack: () => void;
  onToggleFavorite: () => void;
  onRetry: () => void;
  isModal?: boolean;
};

export default function DishDetailContent({
  dish,
  loading,
  generalError,
  onBack,
  onToggleFavorite,
  onRetry,
  isModal = false,
}: Props) {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        {!isModal && <StatusBar barStyle="dark-content" />}
        <ActivityIndicator size="large" color="#6C9A2B" />
        <Text style={styles.loadingText}>Đang tải món ăn...</Text>
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={styles.centerContainer}>
        {!isModal && <StatusBar barStyle="dark-content" />}
        <Text style={styles.errorText}>
          {generalError || "Không tìm thấy món ăn"}
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isModal && <StatusBar barStyle="dark-content" />}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          isModal && styles.modalContentContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageWrapper}>
          {dish.image ? (
            <Image source={{ uri: dish.image }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>Không có ảnh</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.iconButtonLeft,
              isModal && styles.iconButtonModalTop,
            ]}
            onPress={onBack}
          >
            <Ionicons
              name={isModal ? "close" : "chevron-back"}
              size={22}
              color="#5F8F1F"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconButtonRight,
              isModal && styles.iconButtonModalTop,
            ]}
            onPress={onToggleFavorite}
          >
            <Ionicons
              name={dish.is_favorite ? "heart" : "heart-outline"}
              size={22}
              color="#5F8F1F"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{dish.dish_name.toUpperCase()}</Text>

          {!!generalError && (
            <Text style={styles.errorTextInline}>{generalError}</Text>
          )}

          <View style={styles.infoRow}>
            <InfoCard
              icon="time-outline"
              title="Thời gian"
              value={`${dish.cooking_time} phút`}
            />
            <InfoCard
              icon="people-outline"
              title="Khẩu phần"
              value={`${dish.ration}`}
            />
            <InfoCard
              icon="flame-outline"
              title="Giá trị dinh dưỡng"
              value={dish.calories ? `${dish.calories} calo` : "--"}
            />
          </View>

          <Text style={styles.sectionTitle}>Thành phần nguyên liệu</Text>
          <View style={styles.sectionBox}>
            {dish.ingredients.map((group, index) => (
              <View
                key={`${group.group_name}-${index}`}
                style={styles.ingredientGroup}
              >
                <Text style={styles.groupName}>{group.group_name}</Text>

                {group.items.map((item) => (
                  <Text key={item.ingredient_id} style={styles.bulletText}>
                    • {item.display_text}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Cách chế biến</Text>
          <View style={styles.sectionBox}>
            {dish.methods.map((step) => (
              <View key={step.step_number} style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{step.step_number}</Text>
                </View>

                <Text style={styles.stepText}>{step.instruction}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon} size={28} color="#6C9A2B" />
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  modalContentContainer: {
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#666",
    fontSize: 11,
  },
  iconButtonLeft: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonRight: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonModalTop: {
    top: 12,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 22,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#E2EDE5",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
  },
  infoTitle: {
    marginTop: 10,
    fontSize: 14,
    color: "#222222",
    textAlign: "center",
  },
  infoValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 12,
  },
  sectionBox: {
    backgroundColor: "#E2EDE5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  ingredientGroup: {
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222222",
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#222222",
    marginLeft: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#6C9A2B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 28,
    color: "#222222",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#444444",
  },
  errorText: {
    fontSize: 15,
    color: "#C62828",
    textAlign: "center",
    marginBottom: 12,
  },
  errorTextInline: {
    fontSize: 14,
    color: "#C62828",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#6C9A2B",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});