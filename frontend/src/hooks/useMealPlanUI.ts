import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";

import {
  ApiFormError,
  assignMealPlanDishApi,
  clearMealPlanDayApi,
  clearMealPlanWeekApi,
  copyMealPlanDayApi,
  copyMealPlanWeekApi,
  deleteMealPlanDetailApi,
  getCopyDayOptionsApi,
  getCopyWeekOptionsApi,
  getMealPlanDishesApi,
  getMealPlanWeekApi,
  type CopyDayOptionItem,
  type CopyWeekOptionItem,
  type MealPlanAvailableDish,
  type MealPlanDay,
  type MealPlanMeal,
  type MealPlanWeekData,
  type MealType,
} from "@/src/api/mealPlanApi";
import {
  generateWeekShoppingList,
  generateDayShoppingList,
} from "@/src/api/shoppingListApi";

type PickerContext = {
  date: string;
  meal_type: MealType;
  label: string;
} | null;

type DishPickerState = {
  visible: boolean;
  loading: boolean;
  error: string;
  search: string;
  searchError: string;
  dishes: MealPlanAvailableDish[];
  context: PickerContext;
  assigningDishId: number | null;
  existingDishIds: number[];
  addedDishIds: number[];
};

type CopyWeekState = {
  visible: boolean;
  loading: boolean;
  sourceStartDate: string | null;
  sourceEndDate: string | null;
  monthDate: string | null;
  monthRangeLabel: string;
  weeks: CopyWeekOptionItem[];
  selectedTargetStartDate: string | null;
  generalError: string;
  fieldErrors: Record<string, string>;
};

type CopyDayState = {
  visible: boolean;
  loading: boolean;
  sourceDate: string | null;
  sourceWeekLabel: string;
  weekDate: string | null;
  weekLabel: string;
  days: CopyDayOptionItem[];
  selectedTargetDate: string | null;
  generalError: string;
  fieldErrors: Record<string, string>;
};

const DEFAULT_DISH_PICKER_STATE: DishPickerState = {
  visible: false,
  loading: false,
  error: "",
  search: "",
  searchError: "",
  dishes: [],
  context: null,
  assigningDishId: null,
  existingDishIds: [],
  addedDishIds: [],
};

const DEFAULT_COPY_WEEK_STATE: CopyWeekState = {
  visible: false,
  loading: false,
  sourceStartDate: null,
  sourceEndDate: null,
  monthDate: null,
  monthRangeLabel: "",
  weeks: [],
  selectedTargetStartDate: null,
  generalError: "",
  fieldErrors: {},
};

const DEFAULT_COPY_DAY_STATE: CopyDayState = {
  visible: false,
  loading: false,
  sourceDate: null,
  sourceWeekLabel: "",
  weekDate: null,
  weekLabel: "",
  days: [],
  selectedTargetDate: null,
  generalError: "",
  fieldErrors: {},
};


function showMessage(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert("Thông báo", message);
}

function formatDateLabel(dateString?: string | null) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatWeekLabel(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return "";
  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
}

function mapCopyWeekFieldErrors(fieldErrors: Record<string, string>) {
  const mapped: Record<string, string> = {};

  if (fieldErrors.source_start_date) {
    mapped.source_start_date = fieldErrors.source_start_date;
  }

  if (fieldErrors.target_start_date) {
    mapped.target_start_date = fieldErrors.target_start_date;
  }

  if (fieldErrors.non_field_errors) {
    mapped.target_start_date = fieldErrors.non_field_errors;
  }

  return mapped;
}

function mapCopyDayFieldErrors(fieldErrors: Record<string, string>) {
  const mapped: Record<string, string> = {};

  if (fieldErrors.source_date) {
    mapped.source_date = fieldErrors.source_date;
  }

  if (fieldErrors.target_date) {
    mapped.target_date = fieldErrors.target_date;
  }

  if (fieldErrors.non_field_errors) {
    mapped.target_date = fieldErrors.non_field_errors;
  }

  return mapped;
}

export function useMealPlanUI() {
  const [weekData, setWeekData] = useState<MealPlanWeekData | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [screenRefreshing, setScreenRefreshing] = useState(false);
  const [screenError, setScreenError] = useState("");
  const router = useRouter();
  const [creatingWeekShopping, setCreatingWeekShopping] = useState(false);
  const [creatingDayShoppingDate, setCreatingDayShoppingDate] = useState<string | null>(null);
  const [dishPickerState, setDishPickerState] = useState<DishPickerState>(
    DEFAULT_DISH_PICKER_STATE
  );

  const [copyWeekState, setCopyWeekState] = useState<CopyWeekState>(DEFAULT_COPY_WEEK_STATE);
  const [copyDayState, setCopyDayState] = useState<CopyDayState>(DEFAULT_COPY_DAY_STATE);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);

  const weekTitle = useMemo(() => {
    if (!weekData) return "";
    return formatWeekLabel(weekData.start_date, weekData.end_date);
  }, [weekData]);

  const addedDishIdSet = useMemo(() => {
    return new Set([
      ...dishPickerState.existingDishIds,
      ...dishPickerState.addedDishIds,
    ]);
  }, [dishPickerState.existingDishIds, dishPickerState.addedDishIds]);

  const loadWeek = useCallback(async (date?: string, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setScreenRefreshing(true);
      } else {
        setScreenLoading(true);
      }

      setScreenError("");

      const response = await getMealPlanWeekApi(date);
      setWeekData(response.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải thực đơn tuần";
      setScreenError(message);
    } finally {
      setScreenLoading(false);
      setScreenRefreshing(false);
    }
  }, []);

  const loadAvailableDishes = useCallback(async (searchText?: string) => {
    try {
      setDishPickerState((prev) => ({
        ...prev,
        loading: true,
        error: "",
        searchError: "",
      }));

      const response = await getMealPlanDishesApi(searchText);

      setDishPickerState((prev) => ({
        ...prev,
        loading: false,
        dishes: response.data.dishes,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải danh sách món ăn";

      setDishPickerState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  useFocusEffect(
    useCallback(() => {
      if (!weekData?.start_date) return;
      loadWeek(weekData.start_date);
    }, [loadWeek, weekData?.start_date])
  );

  const openDishPicker = useCallback(
    async (day: MealPlanDay, meal: MealPlanMeal) => {
      const seededExistingDishIds = meal.dishes.map((dish) => dish.dish_id);

      setDishPickerState({
        visible: true,
        loading: true,
        error: "",
        search: "",
        searchError: "",
        dishes: [],
        context: {
          date: day.date,
          meal_type: meal.meal_type,
          label: `${meal.label} - ${day.weekday_label}`,
        },
        assigningDishId: null,
        existingDishIds: seededExistingDishIds,
        addedDishIds: [],
      });

      try {
        const response = await getMealPlanDishesApi("");

        setDishPickerState((prev) => ({
          ...prev,
          loading: false,
          dishes: response.data.dishes,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Không thể tải danh sách món ăn";

        setDishPickerState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    },
    []
  );

  const closeDishPicker = useCallback(() => {
    setDishPickerState(DEFAULT_DISH_PICKER_STATE);
  }, []);

  const setDishSearch = useCallback((value: string) => {
    setDishPickerState((prev) => ({
      ...prev,
      search: value,
    }));
  }, []);

  const submitDishSearch = useCallback(async () => {
    await loadAvailableDishes(dishPickerState.search);
  }, [dishPickerState.search, loadAvailableDishes]);

  const assignDish = useCallback(
    async (dish: MealPlanAvailableDish) => {
      const pickerContext = dishPickerState.context;
      if (!pickerContext) return;

      if (addedDishIdSet.has(dish.dish_id)) {
        return;
      }

      try {
        setDishPickerState((prev) => ({
          ...prev,
          assigningDishId: dish.dish_id,
          error: "",
        }));

        await assignMealPlanDishApi({
          dish_id: dish.dish_id,
          date: pickerContext.date,
          meal_type: pickerContext.meal_type,
        });

        setDishPickerState((prev) => ({
          ...prev,
          assigningDishId: null,
          addedDishIds: prev.addedDishIds.includes(dish.dish_id)
            ? prev.addedDishIds
            : [...prev.addedDishIds, dish.dish_id],
        }));

        await loadWeek(weekData?.start_date || pickerContext.date);
        Alert.alert(
        "Thông báo",
        "Thêm món vào thực đơn thành công"
      );
      } catch (error) {
        if (error instanceof ApiFormError) {
          setDishPickerState((prev) => ({
            ...prev,
            assigningDishId: null,
            error: error.message,
          }));
        } else {
          setDishPickerState((prev) => ({
            ...prev,
            assigningDishId: null,
            error:
              error instanceof Error ? error.message : "Không thể thêm món vào thực đơn",
          }));
        }
      }
    },
    [dishPickerState.context, addedDishIdSet, loadWeek, weekData?.start_date]
  );

  const deleteAssignedDish = useCallback(
    async (planDetailId: number) => {
      try {
        await deleteMealPlanDetailApi({ plan_detail_id: planDetailId });
        await loadWeek(weekData?.start_date);
        Alert.alert(
        "Thông báo",
        "Đã xóa món ăn thành công"
      );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Không thể xóa món khỏi thực đơn";
        showMessage(message);
      }
    },
    [loadWeek, weekData?.start_date]
  );

  const confirmDeleteAssignedDish = useCallback(
    (planDetailId: number) => {
      Alert.alert("Xóa món ăn", "Bạn có chắc muốn xóa món này khỏi thực đơn? Nếu đã tạo danh sách mua sắm, danh sách đó sẽ bị xóa.", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: () => deleteAssignedDish(planDetailId),
        },
      ]);
    },
    [deleteAssignedDish]
  );

  const clearCurrentWeek = useCallback(() => {
    if (!weekData?.start_date) return;

    Alert.alert(
      "Xóa thực đơn tuần",
      `Bạn có chắc chắn thực đơn tuần từ ${formatDateLabel(
        weekData.start_date
      )} đến ${formatDateLabel(weekData.end_date)} không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          style: "destructive",
          onPress: async () => {
            try {
              // Lấy response trả về từ API
              const response = await clearMealPlanWeekApi({ start_date: weekData.start_date });
              
              await loadWeek(weekData.start_date);

              // Hiển thị message từ Backend (nếu có), nếu không có mới dùng message mặc định
              showMessage(response.message || "Xóa thực đơn tuần thành công"); 
            } catch (error) {
              const message = error instanceof Error ? error.message : "Không thể xóa thực đơn tuần";
              showMessage(message);
            }
          },
        },
      ]
    );
  }, [loadWeek, weekData?.start_date]);

  const clearDayPlan = useCallback(
    async (date: string) => {
      try {
        // Lưu response từ API
        const response = await clearMealPlanDayApi({ date });
        
        await loadWeek(weekData?.start_date || date);
        
        // Hiển thị message: "Thực đơn ngày đã trống" hoặc "Xóa thực đơn ngày thành công"
        showMessage(response.message || "Xóa thực đơn ngày thành công");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Không thể xóa thực đơn ngày";
        showMessage(message);
      }
    },
    [loadWeek, weekData?.start_date]
  );

  const confirmClearDayPlan = useCallback(
    (date: string) => {
      Alert.alert(
        "Xóa thực đơn ngày",
        `Bạn có chắc chắn muốn xóa thực đơn ngày ${formatDateLabel(date)} không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            style: "destructive",
            onPress: () => clearDayPlan(date),
          },
        ]
      );
    },
    [clearDayPlan]
  );

  const goToPreviousWeek = useCallback(() => {
    if (!weekData?.previous_week_date) return;
    loadWeek(weekData.previous_week_date);
  }, [loadWeek, weekData?.previous_week_date]);

  const goToNextWeek = useCallback(() => {
    if (!weekData?.next_week_date) return;
    loadWeek(weekData.next_week_date);
  }, [loadWeek, weekData?.next_week_date]);

  const onRefresh = useCallback(() => {
    loadWeek(weekData?.start_date, true);
  }, [loadWeek, weekData?.start_date]);

  const onPressDishDetail = useCallback((dishId: number) => {
    setSelectedDishId(dishId);
    setDetailModalVisible(true);
  }, []);

  const closeDishDetailModal = useCallback(async () => {
    setDetailModalVisible(false);
    setSelectedDishId(null);
    await loadWeek(weekData?.start_date);
  }, [loadWeek, weekData?.start_date]);

  const openCopyWeekModal = useCallback(async () => {
    if (!weekData?.start_date) return;

    try {
      setCopyWeekState({
        ...DEFAULT_COPY_WEEK_STATE,
        visible: true,
        loading: true,
        sourceStartDate: weekData.start_date,
        sourceEndDate: weekData.end_date,
        monthDate: weekData.start_date,
      });

      const response = await getCopyWeekOptionsApi({
        source_start_date: weekData.start_date,
        month_date: weekData.start_date,
      });

      setCopyWeekState((prev) => ({
        ...prev,
        visible: true,
        loading: false,
        sourceStartDate: response.data.source_week.start_date,
        sourceEndDate: response.data.source_week.end_date,
        monthDate: weekData.start_date,
        monthRangeLabel: formatWeekLabel(
          response.data.month_range.start_date,
          response.data.month_range.end_date
        ),
        weeks: response.data.weeks,
      }));
    } catch (error) {
      setCopyWeekState((prev) => ({
        ...prev,
        visible: true,
        loading: false,
        generalError:
          error instanceof Error ? error.message : "Không thể tải danh sách tuần đích",
      }));
    }
  }, [weekData?.start_date, weekData?.end_date]);

  const closeCopyWeekModal = useCallback(() => {
    setCopyWeekState(DEFAULT_COPY_WEEK_STATE);
  }, []);

  const loadCopyWeekOptions = useCallback(
    async (monthDate: string) => {
      if (!copyWeekState.sourceStartDate) return;

      try {
        setCopyWeekState((prev) => ({
          ...prev,
          loading: true,
          generalError: "",
        }));

        const response = await getCopyWeekOptionsApi({
          source_start_date: copyWeekState.sourceStartDate,
          month_date: monthDate,
        });

        setCopyWeekState((prev) => ({
          ...prev,
          loading: false,
          monthDate,
          monthRangeLabel: formatWeekLabel(
            response.data.month_range.start_date,
            response.data.month_range.end_date
          ),
          weeks: response.data.weeks,
        }));
      } catch (error) {
        setCopyWeekState((prev) => ({
          ...prev,
          loading: false,
          generalError:
            error instanceof Error ? error.message : "Không thể tải danh sách tuần đích",
        }));
      }
    },
    [copyWeekState.sourceStartDate]
  );

  const submitCopyWeek = useCallback(async () => {
    if (!copyWeekState.sourceStartDate) return;

    if (!copyWeekState.selectedTargetStartDate) {
      setCopyWeekState((prev) => ({
        ...prev,
        fieldErrors: {
          target_start_date: "Vui lòng chọn tuần đích",
        },
      }));
      return;
    }

    const selectedWeek = copyWeekState.weeks.find(
      (item) => item.start_date === copyWeekState.selectedTargetStartDate
    );

    const doSubmitCopyWeek = async () => {
      try {
        setCopyWeekState((prev) => ({
          ...prev,
          loading: true,
          generalError: "",
          fieldErrors: {},
        }));

        await copyMealPlanWeekApi({
          source_start_date: copyWeekState.sourceStartDate!,
          target_start_date: copyWeekState.selectedTargetStartDate!,
        });

        closeCopyWeekModal();
        await loadWeek(copyWeekState.selectedTargetStartDate!);
        showMessage("Sao chép thực đơn tuần thành công");
      } catch (error) {
        if (error instanceof ApiFormError) {
          setCopyWeekState((prev) => ({
            ...prev,
            loading: false,
            generalError: error.message,
            fieldErrors: mapCopyWeekFieldErrors(error.fieldErrors),
          }));
          return;
        }

        setCopyWeekState((prev) => ({
          ...prev,
          loading: false,
          generalError:
            error instanceof Error ? error.message : "Không thể sao chép thực đơn tuần",
        }));
      }
    };

    if (selectedWeek?.has_data) {
      Alert.alert(
        "Xác nhận ghi đè",
        "Khoảng thời gian này đã có thực đơn, bạn có muốn ghi đè không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            style: "destructive",
            onPress: () => {
              void doSubmitCopyWeek();
            },
          },
        ]
      );
      return;
    }

    await doSubmitCopyWeek();
  }, [
    copyWeekState.selectedTargetStartDate,
    copyWeekState.sourceStartDate,
    copyWeekState.weeks,
    closeCopyWeekModal,
    loadWeek,
  ]);

  const openCopyDayModal = useCallback(async (sourceDate: string) => {
    try {
      setCopyDayState({
        ...DEFAULT_COPY_DAY_STATE,
        visible: true,
        loading: true,
        sourceDate,
        weekDate: sourceDate,
      });

      const response = await getCopyDayOptionsApi({
        source_date: sourceDate,
        week_date: sourceDate,
      });

      setCopyDayState((prev) => ({
        ...prev,
        visible: true,
        loading: false,
        sourceDate: response.data.source_date,
        sourceWeekLabel: formatWeekLabel(
          response.data.source_week_start,
          response.data.source_week_end
        ),
        weekDate: response.data.week_start_date,
        weekLabel: formatWeekLabel(
          response.data.week_start_date,
          response.data.week_end_date
        ),
        days: response.data.days,
      }));
    } catch (error) {
      setCopyDayState((prev) => ({
        ...prev,
        visible: true,
        loading: false,
        generalError:
          error instanceof Error ? error.message : "Không thể tải danh sách ngày đích",
      }));
    }
  }, []);

  const closeCopyDayModal = useCallback(() => {
    setCopyDayState(DEFAULT_COPY_DAY_STATE);
  }, []);

  const loadCopyDayOptions = useCallback(
    async (weekDate: string) => {
      if (!copyDayState.sourceDate) return;

      try {
        setCopyDayState((prev) => ({
          ...prev,
          loading: true,
          generalError: "",
        }));

        const response = await getCopyDayOptionsApi({
          source_date: copyDayState.sourceDate,
          week_date: weekDate,
        });

        setCopyDayState((prev) => ({
          ...prev,
          loading: false,
          weekDate,
          weekLabel: formatWeekLabel(
            response.data.week_start_date,
            response.data.week_end_date
          ),
          days: response.data.days,
        }));
      } catch (error) {
        setCopyDayState((prev) => ({
          ...prev,
          loading: false,
          generalError:
            error instanceof Error ? error.message : "Không thể tải danh sách ngày đích",
        }));
      }
    },
    [copyDayState.sourceDate]
  );

  const submitCopyDay = useCallback(async () => {
    if (!copyDayState.sourceDate) return;

    if (!copyDayState.selectedTargetDate) {
      setCopyDayState((prev) => ({
        ...prev,
        fieldErrors: {
          target_date: "Vui lòng chọn ngày đích",
        },
      }));
      return;
    }

    const targetDate = copyDayState.selectedTargetDate;

    const selectedDay = copyDayState.days.find(
      (item) => item.date === targetDate
    );

    const doSubmitCopyDay = async () => {
      try {
        setCopyDayState((prev) => ({
          ...prev,
          loading: true,
          generalError: "",
          fieldErrors: {},
        }));

        await copyMealPlanDayApi({
          source_date: copyDayState.sourceDate!,
          target_date: targetDate,
        });

        closeCopyDayModal();
        await loadWeek(targetDate);
        showMessage("Sao chép thực đơn ngày thành công");
      } catch (error) {
        if (error instanceof ApiFormError) {
          setCopyDayState((prev) => ({
            ...prev,
            loading: false,
            generalError: error.message,
            fieldErrors: mapCopyDayFieldErrors(error.fieldErrors),
          }));
          return;
        }

        setCopyDayState((prev) => ({
          ...prev,
          loading: false,
          generalError:
            error instanceof Error ? error.message : "Không thể sao chép thực đơn ngày",
        }));
      }
    };

    if (selectedDay?.has_data) {
      Alert.alert(
        "Xác nhận ghi đè",
        "Khoảng thời gian này đã có thực đơn, bạn có muốn ghi đè không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            style: "destructive",
            onPress: () => {
              void doSubmitCopyDay();
            },
          },
        ]
      );
      return;
    }

    await doSubmitCopyDay();
  }, [
    copyDayState.selectedTargetDate,
    copyDayState.sourceDate,
    copyDayState.days,
    closeCopyDayModal,
    loadWeek,
  ]);

  const createShoppingWeek = useCallback(() => {
    if (!weekData?.start_date || creatingWeekShopping) return;

    Alert.alert(
      "Xác nhận tạo danh sách mua sắm",
      `Tạo danh sách mua sắm từ thực đơn tuần bắt đầu ${weekData.start_date} - ${weekData.end_date}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setCreatingWeekShopping(true);

              const response = await generateWeekShoppingList(weekData.start_date);

              Alert.alert(
                "Thành công",
                response.message || "Đã tạo danh sách mua sắm tuần"
              );

              router.push("/shopping");
            } catch (error: any) {
              Alert.alert(
                "Thông báo",
                error?.message || "Không thể tạo danh sách mua sắm tuần"
              );
            } finally {
              setCreatingWeekShopping(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [weekData?.start_date, creatingWeekShopping, router]);

  const createShoppingDay = useCallback(
    (date: string) => {
      if (!date || creatingDayShoppingDate === date) return;

      Alert.alert(
        "Xác nhận tạo danh sách mua sắm",
        `Tạo danh sách mua sắm từ thực đơn ngày ${date}?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              try {
                setCreatingDayShoppingDate(date);

                const response = await generateDayShoppingList(date);
                Alert.alert(
                  "Thành công",
                  response.message || "Đã tạo danh sách mua sắm ngày"
                );

                router.push("/shopping");
              } catch (error: any) {
                Alert.alert(
                  "Thông báo",
                  error?.message || "Không thể tạo danh sách mua sắm ngày"
                );
              } finally {
                setCreatingDayShoppingDate(null);
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [creatingDayShoppingDate, router]
  );


  return {
    screenLoading,
    screenRefreshing,
    screenError,
    weekData,
    weekTitle,

    onRefresh,
    goToPreviousWeek,
    goToNextWeek,
    clearCurrentWeek,
    confirmClearDayPlan,
    onPressDishDetail,
    confirmDeleteAssignedDish,

    dishPickerVisible: dishPickerState.visible,
    dishPickerLoading: dishPickerState.loading,
    dishPickerError: dishPickerState.error,
    dishSearch: dishPickerState.search,
    dishSearchError: dishPickerState.searchError,
    availableDishes: dishPickerState.dishes,
    pickerContext: dishPickerState.context,
    assigningDishId: dishPickerState.assigningDishId,
    existingDishIds: dishPickerState.existingDishIds,
    addedDishIds: dishPickerState.addedDishIds,
    addedDishIdSet,
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

    createShoppingWeek,
    createShoppingDay,
    creatingWeekShopping,
    creatingDayShoppingDate,
  };
}