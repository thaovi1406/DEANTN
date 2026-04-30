import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  createFoodInventory,
  deleteFoodInventory,
  FoodInventoryItem,
  getFoodInventoryList,
  updateFoodInventoryQuantity,
} from "@/src/api/foodInventoryApi";

type DraftState = {
  ingredient_name: string;
  quantity: string;
  unit: string;
  group_name: string;
  category: string;
};

type DraftErrors = Partial<Record<keyof DraftState, string>>;

type OptionItem = {
  label: string;
  value: string;
};

type ApiFieldErrors = Partial<
  Record<keyof DraftState, string | string[]>
>;

type ApiLikeError = Error & {
  fields?: ApiFieldErrors;
  errors?: ApiFieldErrors;
  data?: ApiFieldErrors;
  responseData?: {
    message?: string;
    errors?: ApiFieldErrors;
    data?: ApiFieldErrors;
  };
};

const GROUP_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "rau củ", label: "Rau củ" },
  { key: "thịt", label: "Thịt" },
  { key: "cá-hải sản", label: "Cá-Hải sản" },
  { key: "sữa-trứng", label: "Sữa - Trứng" },
  { key: "trái cây", label: "Trái cây" },
  { key: "gia vị", label: "Gia vị" },
  { key: "khác", label: "Khác" },
] as const;

const unitOptions: OptionItem[] = [
  { label: "Chọn đơn vị", value: "" },
  { label: "g", value: "g" },
  { label: "kg", value: "kg" },
  { label: "ml", value: "ml" },
  { label: "l", value: "l" },
  { label: "quả", value: "quả" },
  { label: "củ", value: "củ" },
  { label: "bó", value: "bó" },
  { label: "gói", value: "gói" },
  { label: "chai", value: "chai" },
  { label: "lon", value: "lon" },
  { label: "bịch", value: "bịch" },
  { label: "hộp", value: "hộp" },
  { label: "hũ", value: "hũ" },
  { label: "lọ", value: "lọ" },
];

  const groupOptions: OptionItem[] = [
    { label: "Chọn nhóm", value: "" },
    { label: "Rau củ", value: "rau củ" },
    { label: "Thịt", value: "thịt" },
    { label: "Cá - Hải sản", value: "cá-hải sản" },
    { label: "Sữa - Trứng", value: "sữa-trứng" },
    { label: "Trái cây", value: "trái cây" },
    { label: "Gia vị", value: "gia vị" },
    { label: "Khác", value: "khác" },
  ];

  const categoryOptions: OptionItem[] = [
    { label: "Chọn loại", value: "" },
    { label: "Thực phẩm", value: "thực phẩm" },
    { label: "Gia vị", value: "gia vị" },
  ];

function createInitialDraft(): DraftState {
  return {
    ingredient_name: "",
    quantity: "",
    unit: "",
    group_name: "",
    category: "",
  };
}

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Đã có lỗi xảy ra";
}

function getFirstErrorMessage(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string");
    return typeof first === "string" ? first : undefined;
  }

  return typeof value === "string" ? value : undefined;
}

function extractFieldErrors(error: unknown): DraftErrors {
  const apiError = error as ApiLikeError | undefined;

  const rawFields =
    apiError?.fields ||
    apiError?.errors ||
    apiError?.data ||
    apiError?.responseData?.errors ||
    apiError?.responseData?.data;

  if (!rawFields || typeof rawFields !== "object") {
    return {};
  }

  return {
    ingredient_name: getFirstErrorMessage(rawFields.ingredient_name),
    quantity: getFirstErrorMessage(rawFields.quantity),
    unit: getFirstErrorMessage(rawFields.unit),
    group_name: getFirstErrorMessage(rawFields.group_name),
    category: getFirstErrorMessage(rawFields.category),
  };
}

function hasAnyFieldError(errors: DraftErrors) {
  return Object.values(errors).some(Boolean);
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

const GROUP_LABEL_MAP: Record<string, string> = Object.fromEntries(
  groupOptions.map((opt) => [opt.value, opt.label])
);

export function useFoodInventoryUI() {
  const [items, setItems] = useState<FoodInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState<DraftState>(createInitialDraft());
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [savingDraft, setSavingDraft] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [updatingItem, setUpdatingItem] = useState(false);

  const fetchList = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError("");

        const response = await getFoodInventoryList({
          search,
          group_name: selectedGroup,
        });

        setItems(response.data.items ?? []);
      } catch (err: unknown) {
        setError(normalizeError(err));
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [search, selectedGroup]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchList(true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [fetchList]);

  useFocusEffect(
    useCallback(() => {
      fetchList(false);
    }, [fetchList])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchList(false);
    } finally {
      setRefreshing(false);
    }
  }, [fetchList]);

  const onChangeDraft = useCallback((field: keyof DraftState, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));

    setDraftErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }, []);

  const openCreateModal = useCallback(() => {
    setDraft(createInitialDraft());
    setDraftErrors({});
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    if (savingDraft) return;
    setModalVisible(false);
  }, [savingDraft]);

  const validateDraft = useCallback(() => {
    const nextErrors: DraftErrors = {};

    if (!draft.ingredient_name.trim()) {
      nextErrors.ingredient_name = "Vui lòng điền đầy đủ thông tin";
    }

    if (!draft.quantity.trim()) {
      nextErrors.quantity = "Vui lòng điền đầy đủ thông tin";
    } else if (Number.isNaN(Number(draft.quantity)) || Number(draft.quantity) <= 0) {
      nextErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!draft.group_name.trim()) {
      nextErrors.group_name = "Vui lòng điền đầy đủ thông tin";
    }

    if (!draft.category.trim()) {
      nextErrors.category = "Vui lòng điền đầy đủ thông tin";
    }

    if (!draft.unit.trim()) {
      nextErrors.unit = "Vui lòng điền đầy đủ thông tin";
    }

    setDraftErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [draft]);

  const onSaveDraft = useCallback(async () => {
    if (savingDraft) return;
    if (!validateDraft()) return;

    try {
      setSavingDraft(true);

      const payload = {
        ingredient_name: draft.ingredient_name.trim(),
        quantity: Number(draft.quantity),
        unit: draft.unit.trim(),
        group_name: draft.group_name.trim(),
        category: draft.category.trim(),
      };

      const response = await createFoodInventory(payload);

      Alert.alert(
        "Thông báo",
        response.message || "Thêm nguyên liệu mới thành công"
      );

      setModalVisible(false);
      setDraft(createInitialDraft());
      setDraftErrors({});
      await fetchList(false);
    } catch (err: unknown) {
      const nextErrors = extractFieldErrors(err);

      if (hasAnyFieldError(nextErrors)) {
        setDraftErrors(nextErrors);
        return;
      }

      Alert.alert("Thông báo", normalizeError(err));
    } finally {
      setSavingDraft(false);
    }
  }, [draft, fetchList, savingDraft, validateDraft]);

  const onDeleteItem = useCallback(
    (item: FoodInventoryItem) => {
      Alert.alert(
        "Xác nhận xóa nguyên liệu",
        `Bạn có chắc muốn xóa "${item.ingredient_name}" không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingItemId(item.food_inventory_id);
                await deleteFoodInventory(item.food_inventory_id);
                await fetchList(false);
                Alert.alert("Thông báo", "Xóa nguyên liệu thành công");
              } catch (err: unknown) {
                Alert.alert("Thông báo", normalizeError(err));
              } finally {
                setDeletingItemId(null);
              }
            },
          },
        ]
      );
    },
    [fetchList]
  );

  const openEditModal = useCallback((item: FoodInventoryItem) => {
    setEditingItemId(item.food_inventory_id);
    setDraft({
      ingredient_name: item.ingredient_name,
      quantity: formatQuantity(item.quantity),
      unit: item.unit,
      group_name: item.group_name,
      category: item.category,
    });
    setDraftErrors({});
    setEditModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    if (updatingItem) return;
    setEditModalVisible(false);
    setEditingItemId(null);
    setDraftErrors({});
    setDraft(createInitialDraft());
  }, [updatingItem]);


  const validateEditDraft = useCallback(() => {
    const nextErrors: DraftErrors = {};

    if (!draft.quantity.trim()) {
      nextErrors.quantity = "Vui lòng điền đầy đủ thông tin";
    } else if (Number.isNaN(Number(draft.quantity)) || Number(draft.quantity) <= 0) {
      nextErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!draft.unit.trim()) {
      nextErrors.unit = "Vui lòng điền đầy đủ thông tin";
    }

    setDraftErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [draft]);


  const onUpdateItem = useCallback(async () => {
    if (updatingItem || editingItemId == null) return;
    if (!validateEditDraft()) return;

    try {
      setUpdatingItem(true);

      const response = await updateFoodInventoryQuantity({
        food_inventory_id: editingItemId,
        quantity: Number(draft.quantity),
        unit: draft.unit.trim(),
      });

      Alert.alert(
        "Thông báo",
        response.message || "Đã cập nhật nguyên liệu thành công"
      );

      setEditModalVisible(false);
      setEditingItemId(null);
      setDraft(createInitialDraft());
      setDraftErrors({});
      await fetchList(false);
    } catch (err: unknown) {
      const nextErrors = extractFieldErrors(err);

      if (hasAnyFieldError(nextErrors)) {
        setDraftErrors(nextErrors);
        return;
      }

      Alert.alert("Thông báo", normalizeError(err));
    } finally {
      setUpdatingItem(false);
    }
  }, [draft, editingItemId, fetchList, updatingItem, validateEditDraft]);

  const getItemSubtitle = useCallback((item: FoodInventoryItem) => {
    const amount = `${formatQuantity(item.quantity)} ${item.unit}`.trim();
    const displayGroupName = GROUP_LABEL_MAP[item.group_name] || item.group_name;
    return `${displayGroupName}    ${amount}`;
  }, []);

  const emptyText = useMemo(() => {
    if (search.trim()) {
      return "Không tìm thấy nguyên liệu phù hợp";
    }
    return "Chưa có nguyên liệu nào";
  }, [search]);

  return {
    items,
    loading,
    refreshing,
    error,
    emptyText,

    search,
    setSearch,
    selectedGroup,
    setSelectedGroup,
    groupTabs: GROUP_TABS,

    modalVisible,
    draft,
    draftErrors,
    savingDraft,
    deletingItemId,

    unitOptions,
    groupOptions,
    categoryOptions,

    onRefresh,

    openCreateModal,
    closeModal,
    onChangeDraft,
    onSaveDraft,
    onDeleteItem,
    getItemSubtitle,

    editModalVisible,
    editingItemId,
    updatingItem,

    openEditModal,
    closeEditModal,
    onUpdateItem,
  };
}