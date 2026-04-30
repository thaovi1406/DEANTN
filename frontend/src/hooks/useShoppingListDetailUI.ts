import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import {
  ApiError,
  createShoppingItem,
  deleteShoppingItem,
  getShoppingListDetail,
  ShoppingListDetail,
  toggleShoppingItemStatus,
} from "@/src/api/shoppingListApi";
import { addBoughtItemsToInventory, checkBoughtItemsToInventory } from "@/src/api/foodInventoryApi";

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

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Đã có lỗi xảy ra";
}

function createInitialDraft(): DraftState {
  return {
    ingredient_name: "",
    quantity: "",
    unit: "",
    group_name: "",
    category: "",
  };
}

function getFirstErrorMessage(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string");
    return typeof first === "string" ? first : undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function mapFieldErrors(error: unknown): DraftErrors {
  const apiError = error as ApiError | undefined;

  const rawErrors =
    apiError?.errors ||
    (apiError?.responseData?.errors as Record<string, unknown> | undefined) ||
    (apiError?.responseData as Record<string, unknown> | undefined) ||
    {};

  return {
    ingredient_name: getFirstErrorMessage(
      rawErrors.ingredient_name ?? rawErrors.name
    ),
    quantity: getFirstErrorMessage(rawErrors.quantity),
    unit: getFirstErrorMessage(rawErrors.unit),
    group_name: getFirstErrorMessage(
      rawErrors.group_name ?? rawErrors.ingredient_group ?? rawErrors.group
    ),
    category: getFirstErrorMessage(
      rawErrors.category ?? rawErrors.ingredient_type ?? rawErrors.type
    ),
  };
}

function hasAnyFieldError(errors: DraftErrors) {
  return Object.values(errors).some(Boolean);
}

export function useShoppingListDetailUI() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shoppingId: string }>();
  const shoppingId = Number(params.shoppingId);

  const [detail, setDetail] = useState<ShoppingListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submittingItemId, setSubmittingItemId] = useState<number | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState<DraftState>(createInitialDraft());
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
  const [savingDraft, setSavingDraft] = useState(false);

  const [addingToInventory, setAddingToInventory] = useState(false);

  const unitOptions: OptionItem[] = [
    { label: "Chọn đơn vị", value: "" },
    { label: "g", value: "g" },
    { label: "kg", value: "kg" },
    { label: "ml", value: "ml" },
    { label: "l", value: "l" },
    { label: "quả", value: "quả" },
    { label: "củ", value: "củ" },
    { label: "gói", value: "gói" },
    { label: "chai", value: "chai" },
    { label: "lon", value: "lon" },
    { label: "bịch", value: "bịch" },
    { label: "hộp", value: "hộp" },
    { label: "hũ", value: "hũ" },
    { label: "lọ", value: "lọ" },
  ];

  const fetchDetail = useCallback(
    async (showLoading = true) => {
      if (!shoppingId || Number.isNaN(shoppingId)) {
        setError("Danh sách mua sắm không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        if (showLoading) setLoading(true);
        setError("");

        const response = await getShoppingListDetail(shoppingId);
        setDetail(response.data);
      } catch (err: unknown) {
        setError(normalizeError(err));
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [shoppingId]
  );

  useEffect(() => {
    fetchDetail(true);
  }, [fetchDetail]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail(false);
    }, [fetchDetail])
  );

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

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

    if (!draft.unit.trim()) {
      nextErrors.unit = "Vui lòng điền đầy đủ thông tin";
    }

    if (!draft.group_name.trim()) {
      nextErrors.group_name = "Vui lòng điền đầy đủ thông tin";
    }

    if (!draft.category.trim()) {
      nextErrors.category = "Vui lòng điền đầy đủ thông tin";
    }

    setDraftErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [draft]);

  const onSaveDraft = useCallback(async () => {
    if (!detail) return;
    if (!validateDraft()) return;

    try {
      setSavingDraft(true);
      setDraftErrors({});

      await createShoppingItem(detail.shopping_id, {
        ingredient_name: draft.ingredient_name.trim(),
        quantity: Number(draft.quantity),
        unit: draft.unit.trim(),
        group_name: draft.group_name.trim(),
        category: draft.category.trim(),
      });

      setModalVisible(false);
      setDraft(createInitialDraft());
      setDraftErrors({});
      await fetchDetail(false);
    } catch (err: unknown) {
      const nextFieldErrors = mapFieldErrors(err);

      if (hasAnyFieldError(nextFieldErrors)) {
        setDraftErrors(nextFieldErrors);
        return;
      }

      Alert.alert("Thông báo", normalizeError(err));
    } finally {
      setSavingDraft(false);
    }
  }, [detail, draft, fetchDetail, validateDraft]);

  const onToggleStatus = useCallback(
    async (itemId: number) => {
      try {
        setSubmittingItemId(itemId);
        await toggleShoppingItemStatus(itemId);
        await fetchDetail(false);
      } catch (err: unknown) {
        Alert.alert("Thông báo", normalizeError(err));
      } finally {
        setSubmittingItemId(null);
      }
    },
    [fetchDetail]
  );

  const handleAfterDeleteShoppingItem = useCallback(
    async (currentShoppingId: number) => {
      try {
        const response = await getShoppingListDetail(currentShoppingId);
        const data = response.data;

        const totalItems =
          (data?.pending_items?.length || 0) + (data?.bought_items?.length || 0);

        if (totalItems === 0) {
          router.replace("/shopping");
          return;
        }

        setDetail(data);
      } catch {
        router.replace("/shopping");
      }
    },
    [router]
  );

  const onDeleteItem = useCallback(
    (itemId: number) => {
      const item = [...(detail?.pending_items || []), ...(detail?.bought_items || [])]
        .find((i) => i.item_id === itemId);

      const ingredientName = item?.ingredient_name || "nguyên liệu này";

      Alert.alert(
        "Xác nhận xóa nguyên liệu",
        `Bạn có chắc chắn muốn xóa nguyên liệu "${ingredientName}" khỏi danh sách không?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingItemId(itemId);
                await deleteShoppingItem(itemId);
                await fetchDetail(false);
                Alert.alert("Thành công", "Xóa nguyên liệu khỏi danh sách thành công");

                if (detail?.shopping_id) {
                  await handleAfterDeleteShoppingItem(detail.shopping_id);
                }
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
    [detail, fetchDetail, handleAfterDeleteShoppingItem]
  );

  const onAddBoughtItemsToInventory = useCallback(async () => {
    if (!detail || addingToInventory) return;

    try {
      setAddingToInventory(true);

      const checkResponse = await checkBoughtItemsToInventory(detail.shopping_id);

      if (!checkResponse.success) {
        Alert.alert(
          "Thông báo",
          checkResponse.message || "Không thể kiểm tra nguyên liệu"
        );
        return;
      }

      const sufficientItems = checkResponse.data?.items ?? [];
      const hasSufficient = checkResponse.data?.has_sufficient ?? false;

      const confirmMessage = hasSufficient
        ? sufficientItems.length > 0
          ? `Bạn có chắc chắn muốn cập nhật các nguyên liệu đã mua vào kho? Các nguyên liệu đã có đủ: ${sufficientItems.join(", ")} sẽ không cập nhật vào kho.`
          : "Một số nguyên liệu đã đủ trong kho. Bạn vẫn muốn tiếp tục?"
        : "Bạn có chắc chắn muốn cập nhật các nguyên liệu đã mua vào kho?";

      Alert.alert("Xác nhận", confirmMessage, [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setAddingToInventory(true);

              const addResponse = await addBoughtItemsToInventory(detail.shopping_id);

              if (!addResponse.success) {
                Alert.alert(
                  "Thông báo",
                  addResponse.message || "Không thể cập nhật nguyên liệu vào kho"
                );
                return;
              }

              Alert.alert(
                "Thông báo",
                addResponse.message || "Đã cập nhật nguyên liệu vào kho thực phẩm"
              );

              await fetchDetail(false);
              router.replace("/inventory");
            } catch (err: unknown) {
              Alert.alert("Thông báo", normalizeError(err));
            } finally {
              setAddingToInventory(false);
            }
          },
        },
      ]);
    } catch (err: unknown) {
      Alert.alert("Thông báo", normalizeError(err));
      setAddingToInventory(false);
    }
  }, [detail, addingToInventory, fetchDetail, router]);

  const pendingItems = useMemo(() => detail?.pending_items ?? [], [detail]);
  const boughtItems = useMemo(() => detail?.bought_items ?? [], [detail]);

  return {
    shoppingId,
    detail,
    loading,
    error,

    pendingItems,
    boughtItems,

    submittingItemId,
    deletingItemId,

    modalVisible,
    draft,
    draftErrors,
    savingDraft,
    unitOptions,
    groupOptions,
    categoryOptions,

    onBack,
    reload: fetchDetail,

    onToggleStatus,
    onDeleteItem,

    openCreateModal,
    closeModal,
    onChangeDraft,
    onSaveDraft,

    addingToInventory,
    onAddBoughtItemsToInventory,
  };
}