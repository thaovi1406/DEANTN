import React from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useMealPlanUI } from "@/src/hooks/useMealPlanUI";
import MealPlanHeader from "@/components/meal-plan/MealPlanHeader";
import MealPlanWeekTable from "@/components/meal-plan/MealPlanWeekTable";
import DishPickerModal from "@/components/meal-plan/DishPickerModal";
import CopyWeekModal from "@/components/meal-plan/CopyWeekModal";
import CopyDayModal from "@/components/meal-plan/CopyDayModal";
import DishDetailModal from "@/components/meal-plan/DishDetailModal";
import BotIcon from "@/assets/hugeicons_bot";

const BORDER = "#CFE0D3";
const GREEN = "#3E9300";
const BG = "#E2EDE5";
const CARD = "#FFFFFF";
const RED = "#D95C5C";
const TEXT = "#2F2F2F";
const MUTED = "#6B7280";

export default function MealPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    screenLoading,
    screenRefreshing,
    screenError,
    weekData,
    weekTitle,

    onRefresh,
    goToPreviousWeek,
    goToNextWeek,
    clearCurrentWeek,
    onPressDishDetail,
    confirmDeleteAssignedDish,
    confirmClearDayPlan,

    dishPickerVisible,
    dishPickerLoading,
    dishPickerError,
    dishSearch,
    availableDishes,
    assigningDishId,
    setDishSearch,
    submitDishSearch,
    openDishPicker,
    closeDishPicker,
    assignDish,

    copyWeekState,
    openCopyWeekModal,
    closeCopyWeekModal,
    loadCopyWeekOptions,
    setCopyWeekState,
    submitCopyWeek,

    copyDayState,
    openCopyDayModal,
    closeCopyDayModal,
    loadCopyDayOptions,
    setCopyDayState,
    submitCopyDay,

    detailModalVisible,
    selectedDishId,
    closeDishDetailModal,
    addedDishIdSet,

    createShoppingWeek,
    createShoppingDay,
    creatingWeekShopping,
    creatingDayShoppingDate,
  } = useMealPlanUI();

  if (screenLoading && !weekData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  if (screenError && !weekData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{screenError}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onRefresh}>
          <Text style={styles.primaryButtonText}>Tải lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handlePrevMonthInCopyWeek = () => {
    if (!copyWeekState.monthDate) return;

    const current = new Date(copyWeekState.monthDate);
    current.setMonth(current.getMonth() - 1);
    loadCopyWeekOptions(current.toISOString().slice(0, 10));
  };

  const handleNextMonthInCopyWeek = () => {
    if (!copyWeekState.monthDate) return;

    const current = new Date(copyWeekState.monthDate);
    current.setMonth(current.getMonth() + 1);
    loadCopyWeekOptions(current.toISOString().slice(0, 10));
  };

  const handlePrevWeekInCopyDay = () => {
    if (!copyDayState.weekDate) return;

    const current = new Date(copyDayState.weekDate);
    current.setDate(current.getDate() - 7);
    loadCopyDayOptions(current.toISOString().slice(0, 10));
  };

  const handleNextWeekInCopyDay = () => {
    if (!copyDayState.weekDate) return;

    const current = new Date(copyDayState.weekDate);
    current.setDate(current.getDate() + 7);
    loadCopyDayOptions(current.toISOString().slice(0, 10));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={[{ key: "meal-plan" }]}
        keyExtractor={(item) => item.key}
        refreshing={screenRefreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        renderItem={() => (
          <>
            <View style={styles.topScreenHeader}>
              <Text style={styles.topScreenTitle}>THỰC ĐƠN</Text>
              <TouchableOpacity style={styles.chatbotButton} activeOpacity={0.85} onPress={() => router.push("/chatbot")}>
                <BotIcon width={40} height={38} />
              </TouchableOpacity>
            </View>

            <MealPlanHeader
              styles={styles}
              weekTitle={weekTitle}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onCopyWeek={openCopyWeekModal}
              onClearWeek={clearCurrentWeek}
              onCreateShoppingWeek={createShoppingWeek}
              creatingWeekShopping={creatingWeekShopping}
            />

            <MealPlanWeekTable
              styles={styles}
              days={weekData?.days ?? []}
              onOpenDishPicker={openDishPicker}
              onPressDish={onPressDishDetail}
              onDeleteDish={confirmDeleteAssignedDish}
              onCopyDay={openCopyDayModal}
              onClearDay={confirmClearDayPlan}
              onCreateShoppingDay={createShoppingDay}
              creatingDayShoppingDate={creatingDayShoppingDate}
            />
          </>
        )}
      />

      <DishPickerModal
        styles={styles}
        visible={dishPickerVisible}
        search={dishSearch}
        dishes={availableDishes}
        loading={dishPickerLoading}
        error={dishPickerError}
        assigningDishId={assigningDishId}
        addedDishIdSet={addedDishIdSet}
        onChangeSearch={setDishSearch}
        onSubmitSearch={submitDishSearch}
        onClose={closeDishPicker}
        onAssignDish={assignDish}
      />

      <CopyWeekModal
        styles={styles}
        visible={copyWeekState.visible}
        loading={copyWeekState.loading}
        sourceStartDate={copyWeekState.sourceStartDate}
        sourceEndDate={copyWeekState.sourceEndDate}
        monthRangeLabel={copyWeekState.monthRangeLabel}
        weeks={copyWeekState.weeks}
        selectedTargetStartDate={copyWeekState.selectedTargetStartDate}
        generalError={copyWeekState.generalError}
        targetError={copyWeekState.fieldErrors.target_start_date || ""}
        onClose={closeCopyWeekModal}
        onPrevMonth={handlePrevMonthInCopyWeek}
        onNextMonth={handleNextMonthInCopyWeek}
        onSelectWeek={(startDate) =>
          setCopyWeekState((prev) => ({
            ...prev,
            selectedTargetStartDate: startDate,
            fieldErrors: {
              ...prev.fieldErrors,
              target_start_date: "",
            },
          }))
        }
        onSubmit={submitCopyWeek}
      />

      <DishDetailModal
        visible={detailModalVisible}
        dishId={selectedDishId}
        onClose={closeDishDetailModal}
      />

      <CopyDayModal
        styles={styles}
        visible={copyDayState.visible}
        loading={copyDayState.loading}
        sourceDate={copyDayState.sourceDate}
        weekLabel={copyDayState.weekLabel}
        days={copyDayState.days}
        selectedTargetDate={copyDayState.selectedTargetDate}
        generalError={copyDayState.generalError}
        targetError={copyDayState.fieldErrors.target_date || ""}
        onClose={closeCopyDayModal}
        onPrevWeek={handlePrevWeekInCopyDay}
        onNextWeek={handleNextWeekInCopyDay}
        onSelectDate={(date) =>
          setCopyDayState((prev) => ({
            ...prev,
            selectedTargetDate: date,
            fieldErrors: {
              ...prev.fieldErrors,
              target_date: "",
            },
          }))
        }
        onSubmit={submitCopyDay}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContent: {
    paddingHorizontal: 16,
  },

  topScreenHeader: {
    marginTop: 16,
    marginBottom: 18,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topScreenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: GREEN,
    letterSpacing: 0.3,
  },
  chatbotButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerRow: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  screenTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: GREEN,
    letterSpacing: 0.3,
  },

  weekSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  circleButton: {
    width: 32,
    height: 32,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
  },
  weekTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
    marginHorizontal: 12,
  },

  topActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
  },
  smallGreenButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: GREEN,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  smallRedButton: {
    flex: 1.25,
    minHeight: 38,
    borderRadius: 8,
    backgroundColor: RED,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  headerCellText: {
    textAlign: "center",
    color: GREEN,
    fontWeight: "700",
    fontSize: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderColor: BORDER,
  },
  dayColumn: {
    width: 70,
  },
  mealColumn: {
    flex: 1,
  },
  actionColumnSpacer: {
    width: 38,
  },

  rowBox: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#F8FBF8",
    minHeight: 130,
  },
  dayCell: {
    width: 70,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: BORDER,
  },
  monthText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "700",
  },
  dayNumber: {
    color: "#D9702A",
    fontSize: 13,
    fontWeight: "800",
    marginVertical: 2,
  },
  weekdayText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  mealCell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderColor: BORDER,
    justifyContent: "flex-start",
  },
  mealCellList: {
    gap: 8,
  },

  emptySlotButton: {
    minHeight: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BORDER,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    backgroundColor: CARD,
  },
  emptySlotPlus: {
    color: GREEN,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 24,
  },

  assignedDishWrapper: {
    position: "relative",
  },
  assignedDishPill: {
    minHeight: 28,
    borderRadius: 8,
    backgroundColor: BG,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
  },
  assignedDishText: {
    fontSize: 12,
    color: TEXT,
    fontWeight: "600",
    flexWrap: "wrap",
  },
  assignedDishDelete: {
    position: "absolute",
    right: 4,
    top: 5,
  },

  actionColumn: {
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
  },
  iconBox: {
    width: 25,
    height: 25,
    borderRadius: 6,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.20)",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  modalCardLarge: {
    backgroundColor: BG,
    borderRadius: 24,
    padding: 18,
    maxHeight: "88%",
  },
  modalCardMedium: {
    backgroundColor: BG,
    borderRadius: 24,
    padding: 18,
    maxHeight: "82%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    color: GREEN,
    fontSize: 20,
    fontWeight: "700",
  },

  searchBox: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: CARD,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: TEXT,
    paddingVertical: 10,
  },

  modalLoadingBox: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  modalListContent: {
    paddingTop: 4,
    paddingBottom: 8,
    gap: 12,
  },

  dishCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  dishImage: {
    width: 78,
    height: 78,
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
  },
  dishContent: {
    flex: 1,
  },
  dishTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  dishName: {
    fontSize: 18,
    color: TEXT,
    fontWeight: "500",
    flexShrink: 1,
  },
  dishImageWrapper: {
    position: "relative",
    width: 78,
    height: 78,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
  },
  favoriteBadgeOnImage: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dishMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dishMetaText: {
    fontSize: 14,
    color: MUTED,
  },
  addDishButton: {
    minWidth: 78,
    height: 40,
    borderRadius: 8,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  addDishButtonText: {
    color: GREEN,
    fontWeight: "600",
    fontSize: 14,
  },
  addDishButtonDisabled: {
    backgroundColor: "#E0E0E0",
    opacity: 1,
  },
  addDishButtonTextDisabled: {
    color: "#333333",
    fontWeight: "400",
  },

  infoBox: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoLabel: {
    fontSize: 15,
    color: MUTED,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 18,
    color: GREEN,
    fontWeight: "800",
  },

  sectionLabel: {
    fontSize: 16,
    color: MUTED,
    marginBottom: 10,
  },
  rangeSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rangeLabel: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
    color: TEXT,
    fontSize: 17,
    fontWeight: "700",
  },

  copyWeekGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    marginBottom: 14,
  },
  copyTargetCard: {
    width: "47.5%",
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  copyTargetCardSelected: {
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: GREEN,
  },
  copyTargetTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  copyTargetValue: {
    color: "#DF4E4E",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  copyDayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    marginBottom: 14,
  },
  copyDayCard: {
    width: "30.5%",
    minHeight: 126,
    borderRadius: 16,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  copyDayMonth: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "800",
  },
  copyDayNumber: {
    color: "#DF4E4E",
    fontSize: 20,
    fontWeight: "800",
    marginVertical: 4,
  },
  copyDayWeekday: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  primaryButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  fieldErrorText: {
    color: "#D84B4B",
    fontSize: 13,
    marginBottom: 10,
  },
  errorText: {
    color: "#D84B4B",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: MUTED,
    fontSize: 15,
    paddingVertical: 20,
  },
  copyTargetCardDisabled: {
    backgroundColor: "#ECECEC",
    borderWidth: 1,
    borderColor: "#D6D6D6",
  },
  copyTargetTextDisabled: {
    color: "#9A9A9A",
  },
  copyDisabledHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#9A9A9A",
    fontWeight: "600",
  },
});