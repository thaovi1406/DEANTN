import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { getAuthToken } from "@/src/utils/authStorage";
import {
  createIndividualDishApi,
  updateIndividualDishApi,
  getIndividualDishFormDataApi,
  DishCategoryKey,
  DishFormImage,
  IngredientFormItem,
  MethodFormItem,
  IndividualDishFormPayload,
  IngredientCategoryKey,
  IngredientGroupKey,
} from "@/src/api/individualDishFormApi";

type Mode = "create" | "edit";

type FieldErrors = {
  dish_name?: string;
  cooking_time?: string;
  ration?: string;
  calories?: string;
  category_name?: string;
  image?: string;
  ingredients?: string;
  methods?: string;
  form?: string;
};

type IngredientDraftErrors = {
  ingredient_name?: string;
  quantity?: string;
  unit?: string;
  group_name?: string;
  category?: string;
};

type IngredientDraft = {
  ingredient_name: string;
  quantity: string;
  unit: string;
  group_name: IngredientGroupKey | "";
  category: IngredientCategoryKey | "";
};

type Params = {
  mode: Mode;
  dishId?: number;
  initialData?: Partial<IndividualDishFormPayload> | null;
  successRoute?: string;
};

const CATEGORY_OPTIONS: { label: string; value: DishCategoryKey }[] = [
  { label: "Món chính", value: "Main Dish" },
  { label: "Món phụ", value: "Side Dish" },
  { label: "Salad", value: "Salad" },
  { label: "Canh / Súp", value: "Soup" },
  { label: "Tráng miệng", value: "Dessert" },
  { label: "Đồ uống", value: "Drink" },
];

const INGREDIENT_GROUP_OPTIONS: {
  label: string;
  value: IngredientGroupKey;
}[] = [
  { label: "Chọn nhóm", value: "" },
  { label: "Rau củ", value: "rau củ" },
  { label: "Thịt", value: "thịt" },
  { label: "Cá - Hải sản", value: "cá-hải sản" },
  { label: "Sữa - Trứng", value: "sữa-trứng" },
  { label: "Trái cây", value: "trái cây" },
  { label: "Gia vị", value: "gia vị" },
  { label: "Khác", value: "khác" },
];

const INGREDIENT_CATEGORY_OPTIONS: {
  label: string;
  value: IngredientCategoryKey;
}[] = [
  { label: "Chọn loại", value: "" },
  { label: "Thực phẩm", value: "thực phẩm" },
  { label: "Gia vị", value: "gia vị" },
];

const DEFAULT_INGREDIENT_DRAFT: IngredientDraft = {
  ingredient_name: "",
  quantity: "",
  unit: "",
  group_name: "",
  category: "",
};
const ingredientUnitOptions = [
  { label: "Chọn đơn vị", value: "" },
  { label: "g", value: "g" },
  { label: "kg", value: "kg" },
  { label: "ml", value: "ml" },
  { label: "l", value: "l" },
  { label: "quả", value: "quả" },
  { label: "củ", value: "củ" },
  { label: "tép", value: "tép" },
  { label: "bó", value: "bó" },
  { label: "muỗng cà phê", value: "muỗng cà phê" },
  { label: "muỗng canh", value: "muỗng canh" },
];

function normalizeIngredient(
  item: Partial<IngredientFormItem>
): IngredientFormItem {
  return {
    ingredient_name: item.ingredient_name?.trim() || "",
    quantity: Number(item.quantity) || 0,
    unit: item.unit?.trim() || "",
    group_name: (item.group_name || "khác") as IngredientGroupKey,
    category: (item.category || "thực phẩm") as IngredientCategoryKey,
  };
}

function normalizeMethod(
  item: Partial<MethodFormItem>,
  index: number
): MethodFormItem {
  return {
    step_number: Number(item.step_number) || index + 1,
    instruction: item.instruction?.trim() || "",
  };
}

export function useIndividualDishFormUI({
  mode,
  dishId,
  initialData,
  successRoute = "/favourite",
}: Params) {
  const isEditMode = mode === "edit";

  const [loading, setLoading] = useState(isEditMode && !initialData);
  const [submitting, setSubmitting] = useState(false);

  const [dishName, setDishName] = useState(initialData?.dish_name ?? "");
  const [cookingTime, setCookingTime] = useState(
    initialData?.cooking_time ? String(initialData.cooking_time) : ""
  );
  const [ration, setRation] = useState(
    initialData?.ration ? String(initialData.ration) : ""
  );
  const [calories, setCalories] = useState(
    initialData?.calories !== null && initialData?.calories !== undefined
      ? String(initialData.calories)
      : ""
  );
  const [categoryName, setCategoryName] = useState<DishCategoryKey | "">(
    initialData?.category_name ?? ""
  );
  const [image, setImage] = useState<DishFormImage>(initialData?.image ?? null);

  const [ingredients, setIngredients] = useState<IngredientFormItem[]>(
    (initialData?.ingredients ?? []).map(normalizeIngredient)
  );
  const [methods, setMethods] = useState<MethodFormItem[]>(
    (initialData?.methods ?? []).map(normalizeMethod)
  );

  const [errors, setErrors] = useState<FieldErrors>({});

  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [ingredientDraft, setIngredientDraft] =
    useState<IngredientDraft>(DEFAULT_INGREDIENT_DRAFT);
  const [ingredientDraftErrors, setIngredientDraftErrors] =
    useState<IngredientDraftErrors>({});

  const [methodModalVisible, setMethodModalVisible] = useState(false);
  const [methodDraft, setMethodDraft] = useState("");
  const [methodDraftError, setMethodDraftError] = useState("");

  

  useEffect(() => {
    if (!isEditMode || !dishId || initialData) return;

    let mounted = true;

    async function loadDetail() {
      try {
        setLoading(true);

        const token = await getAuthToken();
        if (!token) {
          if (mounted) {
            setErrors({ form: "Phiên đăng nhập đã hết hạn" });
          }
          return;
        }

        const res = await getIndividualDishFormDataApi({
          token,
          dishId,
        });

        if (!mounted) return;

        const detail = res.data;

        setDishName(detail.dish_name || "");
        setCookingTime(
          detail.cooking_time !== undefined ? String(detail.cooking_time) : ""
        );
        setRation(detail.ration !== undefined ? String(detail.ration) : "");
        setCalories(
          detail.calories !== null && detail.calories !== undefined
            ? String(detail.calories)
            : ""
        );
        setCategoryName((detail.category_name || "") as DishCategoryKey | "");
        setImage(detail.image ? { uri: detail.image } : null);

        setIngredients((detail.ingredients ?? []).map(normalizeIngredient));
        setMethods((detail.methods ?? []).map(normalizeMethod));

        setErrors({});
      } catch (error: any) {
        if (!mounted) return;
        setErrors({
          form: error?.message || "Không thể tải dữ liệu món ăn",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [dishId, initialData, isEditMode]);

  const nextStepNumber = useMemo(() => methods.length + 1, [methods.length]);

  const clearFormError = useCallback(() => {
    setErrors((prev) => ({ ...prev, form: undefined }));
  }, []);

  const pickImage = async () => {
    clearFormError();

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Thông báo", "Cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    setImage({
      uri: asset.uri,
      name: asset.fileName || `dish_${Date.now()}.jpg`,
      type: asset.mimeType || "image/jpeg",
    });

    setErrors((prev) => ({ ...prev, image: undefined, form: undefined }));
  };

  const onChangeDishName = (value: string) => {
    setDishName(value);
    setErrors((prev) => ({ ...prev, dish_name: undefined }));
  };

  const onChangeCookingTime = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    setCookingTime(sanitized);
    setErrors((prev) => ({ ...prev, cooking_time: undefined }));
  };

  const onChangeRation = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    setRation(sanitized);
    setErrors((prev) => ({ ...prev, ration: undefined }));
  };

  const onChangeCalories = (value: string) => {
    const sanitized = value.replace(/[^\d]/g, "");
    setCalories(sanitized);
    setErrors((prev) => ({ ...prev, calories: undefined }));
  };

  const onChangeCategoryName = (value: DishCategoryKey) => {
    setCategoryName(value);
    setErrors((prev) => ({ ...prev, category_name: undefined }));
  };

  const openIngredientModal = () => {
    setIngredientDraft(DEFAULT_INGREDIENT_DRAFT);
    setIngredientDraftErrors({});
    setIngredientModalVisible(true);
  };

  const closeIngredientModal = () => {
    setIngredientModalVisible(false);
    setIngredientDraft(DEFAULT_INGREDIENT_DRAFT);
    setIngredientDraftErrors({});
  };

  const updateIngredientDraft = (
    field: keyof IngredientDraft,
    value: string
  ) => {
    setIngredientDraft((prev) => ({
      ...prev,
      [field]: field === "quantity" ? value.replace(/[^\d]/g, "") : value,
    }));

    setIngredientDraftErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const addIngredient = () => {
    const nextErrors: IngredientDraftErrors = {};

    if (!ingredientDraft.ingredient_name.trim()) {
      nextErrors.ingredient_name = "Vui lòng điền đầy đủ thông tin";
    }

    if (!ingredientDraft.quantity.trim()) {
      nextErrors.quantity = "Vui lòng điền đầy đủ thông tin";
    }

    if (!ingredientDraft.unit.trim()) {
      nextErrors.unit = "Vui lòng điền đầy đủ thông tin";
    }

    if (!ingredientDraft.group_name) {
      nextErrors.group_name = "Vui lòng chọn nhóm nguyên liệu";
    }

    if (!ingredientDraft.category) {
      nextErrors.category = "Vui lòng chọn loại nguyên liệu";
    }

    setIngredientDraftErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const newIngredient: IngredientFormItem = {
      ingredient_name: ingredientDraft.ingredient_name.trim(),
      quantity: Number(ingredientDraft.quantity),
      unit: ingredientDraft.unit.trim(),
      group_name: ingredientDraft.group_name,
      category: ingredientDraft.category,
    };

    setIngredients((prev) => [...prev, newIngredient]);
    setErrors((prev) => ({ ...prev, ingredients: undefined }));
    closeIngredientModal();
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const openMethodModal = () => {
    setMethodDraft("");
    setMethodDraftError("");
    setMethodModalVisible(true);
  };

  const closeMethodModal = () => {
    setMethodModalVisible(false);
    setMethodDraft("");
    setMethodDraftError("");
  };

  const addMethod = () => {
    if (!methodDraft.trim()) {
      setMethodDraftError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setMethods((prev) => [
      ...prev,
      {
        step_number: prev.length + 1,
        instruction: methodDraft.trim(),
      },
    ]);

    setErrors((prev) => ({ ...prev, methods: undefined }));
    closeMethodModal();
  };

  const removeMethod = (index: number) => {
    setMethods((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, idx) => ({
          ...item,
          step_number: idx + 1,
        }))
    );
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!dishName.trim()) {
      nextErrors.dish_name = "Vui lòng điền đầy đủ thông tin";
    }

    if (!cookingTime.trim()) {
      nextErrors.cooking_time = "Vui lòng điền đầy đủ thông tin";
    }

    if (!ration.trim()) {
      nextErrors.ration = "Vui lòng điền đầy đủ thông tin";
    }

    if (!categoryName) {
      nextErrors.category_name = "Vui lòng điền đầy đủ thông tin";
    }

    if (ingredients.length === 0) {
      nextErrors.ingredients = "Vui lòng thêm ít nhất 1 nguyên liệu";
    }

    if (methods.length === 0) {
      nextErrors.methods = "Vui lòng thêm ít nhất 1 bước";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const mapBackendErrors = (errorData: any) => {
    const data = errorData?.data || errorData || {};

    const ingredientError =
      Array.isArray(data?.ingredients) && typeof data.ingredients[0] === "string"
        ? data.ingredients[0]
        : Array.isArray(data?.ingredients)
        ? "Thông tin nguyên liệu không hợp lệ"
        : undefined;

    const methodError =
      Array.isArray(data?.methods) && typeof data.methods[0] === "string"
        ? data.methods[0]
        : Array.isArray(data?.methods)
        ? "Thông tin các bước thực hiện không hợp lệ"
        : undefined;

    setErrors((prev) => ({
      ...prev,
      dish_name:
        Array.isArray(data?.dish_name) && data.dish_name[0]
          ? data.dish_name[0]
          : prev.dish_name,
      cooking_time:
        Array.isArray(data?.cooking_time) && data.cooking_time[0]
          ? data.cooking_time[0]
          : prev.cooking_time,
      ration:
        Array.isArray(data?.ration) && data.ration[0]
          ? data.ration[0]
          : prev.ration,
      calories:
        Array.isArray(data?.calories) && data.calories[0]
          ? data.calories[0]
          : prev.calories,
      category_name:
        Array.isArray(data?.category_name) && data.category_name[0]
          ? data.category_name[0]
          : prev.category_name,
      ingredients: ingredientError || prev.ingredients,
      methods: methodError || prev.methods,
      form:
        (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) ||
        data?.message ||
        prev.form,
    }));
  };

  const submit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      clearFormError();

      const token = await getAuthToken();

      if (!token) {
        setErrors({ form: "Phiên đăng nhập đã hết hạn" });
        return;
      }

      const payload: IndividualDishFormPayload = {
        dish_name: dishName.trim(),
        cooking_time: Number(cookingTime),
        ration: Number(ration),
        calories: calories.trim() ? Number(calories) : null,
        category_name: categoryName as DishCategoryKey,
        image,
        ingredients,
        methods,
      };

      if (isEditMode) {
        if (!dishId) {
          setErrors({ form: "Thiếu mã món ăn để cập nhật" });
          return;
        }

        await updateIndividualDishApi({
          token,
          dishId,
          payload,
        });
      } else {
        await createIndividualDishApi({
          token,
          payload,
        });
      }

      Alert.alert(
        "Thông báo",
        isEditMode ? "Chỉnh sửa thành công" : "Thêm mới thành công",
        [
          {
            text: "OK",
            onPress: () => router.replace("/favourite"),
          },
        ]
      );
    } catch (error: any) {
      if (error?.data) {
        mapBackendErrors(error.data);
      } else {
        setErrors({
          form: error?.message || "Không thể lưu món ăn",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    router.back();
  };

  return {
    loading,
    submitting,
    isEditMode,
    errors,

    dishName,
    cookingTime,
    ration,
    calories,
    categoryName,
    image,
    ingredients,
    methods,

    categoryOptions: CATEGORY_OPTIONS,
    ingredientGroupOptions: INGREDIENT_GROUP_OPTIONS,
    ingredientCategoryOptions: INGREDIENT_CATEGORY_OPTIONS,

    ingredientModalVisible,
    ingredientDraft,
    ingredientDraftErrors,
    ingredientUnitOptions,

    methodModalVisible,
    methodDraft,
    methodDraftError,
    nextStepNumber,

    onChangeDishName,
    onChangeCookingTime,
    onChangeRation,
    onChangeCalories,
    onChangeCategoryName,
    pickImage,

    openIngredientModal,
    closeIngredientModal,
    updateIngredientDraft,
    addIngredient,
    removeIngredient,

    openMethodModal,
    closeMethodModal,
    setMethodDraft,
    setMethodDraftError,
    addMethod,
    removeMethod,

    submit,
    cancel,
  };
}