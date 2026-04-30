import React from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import FormTextField from "@/components/individualDishForm/FormTextField";
import FormNumberField from "@/components/individualDishForm/FormNumberField";
import IngredientModal from "@/components/individualDishForm/IngredientModal";
import MethodModal from "@/components/individualDishForm/MethodModal";
import IngredientItemCard from "@/components/individualDishForm/IngredientItemCard";
import MethodItemCard from "@/components/individualDishForm/MethodItemCard";
import FormFooterActions from "@/components/individualDishForm/FormFooterActions";
import { useIndividualDishFormUI } from "@/src/hooks/useIndividualDishFormUI";
import type { IndividualDishFormPayload } from "@/src/api/individualDishFormApi";

type Props = {
  mode: "create" | "edit";
  dishId?: number;
  initialData?: Partial<IndividualDishFormPayload> | null;
};

const BG = "#E2EDE5";
const PRIMARY = "#3E9300";
const WHITE = "#FFFFFF";
const TEXT = "#2F2F2F";
const MUTED = "#6B7280";
const BORDER = "#CFE0D3";
const ERROR = "#D93A3A";

function buildIngredientDisplayText(item: {
  quantity: number;
  unit: string;
  ingredient_name: string;
}) {
  const compactUnits = ["g", "kg", "ml", "l"];
  const unit = item.unit?.trim() || "";
  const ingredientName = item.ingredient_name?.trim() || "";

  const amountText = compactUnits.includes(unit)
    ? `${item.quantity}${unit}`
    : unit
      ? `${item.quantity} ${unit}`
      : `${item.quantity}`;

  return `${amountText} ${ingredientName}`.trim();
}

export default function IndividualDishFormScreen({
  mode,
  dishId,
  initialData,
}: Props) {
  const ui = useIndividualDishFormUI({
    mode,
    dishId,
    initialData,
  });

  if (ui.loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>MÓN ĂN</Text>
        </View>

        <View style={styles.card}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.formTitle}>
              {ui.isEditMode ? "CHỈNH SỬA MÓN" : "THÊM MÓN MỚI"}
            </Text>

            <TouchableOpacity style={styles.imageBox} onPress={ui.pickImage}>
              {ui.image?.uri ? (
                <Image source={{ uri: ui.image.uri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={64} color={PRIMARY} />
                </View>
              )}
            </TouchableOpacity>

            {!!ui.errors.form && (
              <Text style={styles.generalError}>{ui.errors.form}</Text>
            )}

            <FormTextField
              label="Tên món"
              required
              value={ui.dishName}
              onChangeText={ui.onChangeDishName}
              error={ui.errors.dish_name}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <FormNumberField
                  label="Thời gian (phút)"
                  required
                  value={ui.cookingTime}
                  onChangeText={ui.onChangeCookingTime}
                  error={ui.errors.cooking_time}
                />
              </View>

              <View style={styles.half}>
                <FormNumberField
                  label="Khẩu phần"
                  required
                  value={ui.ration}
                  onChangeText={ui.onChangeRation}
                  error={ui.errors.ration}
                />
              </View>
            </View>

            <FormNumberField
              label="Giá trị dinh dưỡng (calo)"
              value={ui.calories}
              onChangeText={ui.onChangeCalories}
              error={ui.errors.calories}
            />

            <FormTextField
              label="Loại món"
              required
              value={
                ui.categoryOptions.find((item) => item.value === ui.categoryName)
                  ?.label || ""
              }
              onChangeText={() => {}}
              editable={false}
              error={ui.errors.category_name}
            />

            <View style={styles.categoryList}>
              {ui.categoryOptions.map((item) => {
                const active = ui.categoryName === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.categoryChip,
                      active && styles.categoryChipActive,
                    ]}
                    onPress={() => ui.onChangeCategoryName(item.value)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Nguyên liệu <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.sectionBox}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={ui.openIngredientModal}
                >
                  <Text style={styles.addButtonText}>+ Thêm nguyên liệu</Text>
                </TouchableOpacity>

                {!!ui.errors.ingredients && (
                  <Text style={styles.errorText}>{ui.errors.ingredients}</Text>
                )}

                {ui.ingredients.map((item, index) => (
                  <IngredientItemCard
                    key={`${item.ingredient_name}-${index}`}
                    text={buildIngredientDisplayText(item)}
                    onDelete={() => ui.removeIngredient(index)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Cách chế biến <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.sectionBox}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={ui.openMethodModal}
                >
                  <Text style={styles.addButtonText}>+ Thêm bước</Text>
                </TouchableOpacity>

                {!!ui.errors.methods && (
                  <Text style={styles.errorText}>{ui.errors.methods}</Text>
                )}

                {ui.methods.map((item, index) => (
                  <MethodItemCard
                    key={`${item.step_number}-${index}`}
                    stepNumber={item.step_number}
                    instruction={item.instruction}
                    onDelete={() => ui.removeMethod(index)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <FormFooterActions
            submitting={ui.submitting}
            onCancel={ui.cancel}
            onSave={ui.submit}
          />
        </View>

        <IngredientModal
          visible={ui.ingredientModalVisible}
          draft={ui.ingredientDraft}
          errors={ui.ingredientDraftErrors}
          unitOptions={ui.ingredientUnitOptions}
          groupOptions={ui.ingredientGroupOptions}
          categoryOptions={ui.ingredientCategoryOptions}
          onChangeDraft={ui.updateIngredientDraft}
          onClose={ui.closeIngredientModal}
          onSave={ui.addIngredient}
        />

        <MethodModal
          visible={ui.methodModalVisible}
          stepNumber={ui.nextStepNumber}
          instruction={ui.methodDraft}
          error={ui.methodDraftError}
          onChangeInstruction={(value) => {
            ui.setMethodDraft(value);
            ui.setMethodDraftError("");
          }}
          onClose={ui.closeMethodModal}
          onSave={ui.addMethod}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 0.3,
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
  },
  formTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 22,
  },
  imageBox: {
    alignSelf: "center",
    width: 230,
    height: 130,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: BG,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: BORDER,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  generalError: {
    color: ERROR,
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  half: {
    flex: 1,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: -2,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryChipActive: {
    backgroundColor: BG,
    borderColor: PRIMARY,
  },
  categoryChipText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: PRIMARY,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    color: TEXT,
    fontWeight: "500",
    marginBottom: 8,
  },
  required: {
    color: ERROR,
  },
  sectionBox: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  addButton: {
    alignSelf: "center",
    minWidth: 120,
    height: 36,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  errorText: {
    color: ERROR,
    fontSize: 12,
    marginBottom: 4,
  },
});