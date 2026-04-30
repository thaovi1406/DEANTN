import { API_BASE_URL } from "@/src/config/api";

export type DishCategoryKey =
  | "Main Dish"
  | "Side Dish"
  | "Salad"
  | "Soup"
  | "Dessert"
  | "Drink";

export type IngredientGroupKey =
  | "rau củ"
  | "thịt"
  | "cá-hải sản"
  | "sữa-trứng"
  | "trái cây"
  | "gia vị"
  | "khác";

export type IngredientCategoryKey =
  | "thực phẩm"
  | "gia vị";

export type IngredientFormItem = {
  ingredient_name: string;
  quantity: number;
  unit: string;
  group_name: IngredientGroupKey;
  category: IngredientCategoryKey;
};

export type MethodFormItem = {
  step_number: number;
  instruction: string;
};

export type DishFormImage =
  | {
      uri: string;
      name?: string;
      type?: string;
    }
  | null;

export type IndividualDishFormPayload = {
  dish_name: string;
  cooking_time: number;
  ration: number;
  calories: number | null;
  category_name: DishCategoryKey;
  image?: DishFormImage;
  ingredients: IngredientFormItem[];
  methods: MethodFormItem[];
};

export type IndividualDishSubmitResponse = {
  message: string;
  data: {
    dish_id: number;
    dish_name: string;
    image: string | null;
    is_system: boolean;
    source_dish_id: number | null;
  } | null;
};

export type IndividualDishDetailResponse = {
  message: string;
  data: {
    dish_id: number;
    dish_name: string;
    cooking_time: number;
    ration: number;
    calories: number | null;
    image: string | null;
    category_name: DishCategoryKey;
    is_favorite: boolean;
    source_dish_id: number | null;
    ingredients?: IngredientFormItem[];
    methods?: MethodFormItem[];
  };
};

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeImageFile(
  image: NonNullable<DishFormImage>
): { uri: string; name: string; type: string } {
  const fallbackName = image.uri.split("/").pop() || `dish_${Date.now()}.jpg`;

  return {
    uri: image.uri,
    name: image.name || fallbackName,
    type: image.type || "image/jpeg",
  };
}

function appendPayload(formData: FormData, payload: IndividualDishFormPayload) {
  formData.append("dish_name", payload.dish_name.trim());
  formData.append("cooking_time", String(payload.cooking_time));
  formData.append("ration", String(payload.ration));
  formData.append("category_name", payload.category_name);

  if (payload.calories !== null && payload.calories !== undefined) {
    formData.append("calories", String(payload.calories));
  }

  if (payload.image?.uri) {
    formData.append("image", normalizeImageFile(payload.image) as any);
  }

  formData.append("ingredients", JSON.stringify(payload.ingredients));
  formData.append("methods", JSON.stringify(payload.methods));
}

async function submitMultipart(params: {
  url: string;
  method: "POST" | "PUT";
  token: string;
  payload: IndividualDishFormPayload;
}) {
  const formData = new FormData();
  appendPayload(formData, params.payload);

  const response = await fetch(params.url, {
    method: params.method,
    headers: {
      Authorization: `Token ${params.token}`,
    },
    body: formData,
  });

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const error: any = new Error(json?.message || "Không thể lưu món ăn");
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json as IndividualDishSubmitResponse;
}

export async function createIndividualDishApi(params: {
  token: string;
  payload: IndividualDishFormPayload;
}) {
  return submitMultipart({
    url: `${API_BASE_URL}/home/individual/dishes/create/`,
    method: "POST",
    token: params.token,
    payload: params.payload,
  });
}

export const INGREDIENT_GROUP_OPTIONS: {
  label: string;
  value: IngredientGroupKey;
}[] = [
  { label: "Rau củ", value: "rau củ" },
  { label: "Thịt", value: "thịt" },
  { label: "Cá - hải sản", value: "cá-hải sản" },
  { label: "Sữa - trứng", value: "sữa-trứng" },
  { label: "Trái cây", value: "trái cây" },
  { label: "Gia vị", value: "gia vị" },
  { label: "Khác", value: "khác" },
];

export const INGREDIENT_CATEGORY_OPTIONS: {
  label: string;
  value: IngredientCategoryKey;
}[] = [
  { label: "Thực phẩm", value: "thực phẩm" },
  { label: "Gia vị", value: "gia vị" },
];

export async function updateIndividualDishApi(params: {
  token: string;
  dishId: number;
  payload: IndividualDishFormPayload;
}) {
  return submitMultipart({
    url: `${API_BASE_URL}/home/individual/dishes/${params.dishId}/update/`,
    method: "PUT",
    token: params.token,
    payload: params.payload,
  });
}

/**
 * Chỉ dùng nếu backend detail đã trả raw ingredients + methods.
 * Nếu backend hiện chưa trả đủ raw form data thì bỏ function này
 * và truyền initial data từ màn trước sang edit screen.
 */
export async function getIndividualDishFormDataApi(params: {
  token: string;
  dishId: number;
}) {
  const response = await fetch(
    `${API_BASE_URL}/home/individual/dishes/${params.dishId}/update/`,
    {
      method: "GET",
      headers: {
        Authorization: `Token ${params.token}`,
      },
    }
  );

  const json = await parseJsonSafe(response);

  if (!response.ok) {
    const error: any = new Error(json?.message || "Không thể tải dữ liệu món ăn");
    error.status = response.status;
    error.data = json;
    throw error;
  }

  return json as IndividualDishDetailResponse;
}