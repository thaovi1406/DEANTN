import { API_BASE_URL } from "@/src/config/api";
import { authFetch } from "@/src/api/authFetch";

export type FoodInventoryItem = {
  food_inventory_id: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  group_name: string;
  category: string;
};

export type FoodInventoryListResponse = {
  message: string;
  data: {
    items: FoodInventoryItem[];
  };
};

export type CheckBoughtItemsToInventoryResponse = {
  success: boolean;
  message: string;
  data?: {
    has_sufficient: boolean;
    items: string[];
  } | null;
};

export type UpdateFoodInventoryQuantityPayload = {
  food_inventory_id: number;
  quantity: number;
  unit: string;
};

export type UpdateFoodInventoryQuantityResponse = {
  message: string;
  data: {
    food_inventory_id: number;
    ingredient_id: number;
    ingredient_name: string;
    quantity: number;
    unit: string;
    group_name: string;
    category: string;
  };
};

export type FoodInventoryDetailResponse = {
  message: string;
  data: FoodInventoryItem;
};

export type UpsertFoodInventoryPayload = {
  ingredient_name: string;
  quantity: number;
  unit: string;
  group_name: string;
  category: string;
};

export type CreateFoodInventoryResponse = {
  message: string;
  data: {
    food_inventory_id: number;
    ingredient_id: number;
    ingredient_name: string;
    quantity: number;
    unit: string;
    group_name: string;
    category: string;
    merged_from_food_inventory_id?: number;
  };
};

export type DeleteFoodInventoryResponse = {
  message: string;
  data: {
    food_inventory_id: number;
  };
};

export type AddBoughtItemsToInventoryResponse = {
  success: boolean;
  message: string;
  data?: {
    // ===== CASE WARNING =====
    has_sufficient?: boolean;
    items?: string[];

    // ===== CASE SUCCESS =====
    shopping_id?: number;
    created_count?: number;
    merged_count?: number;
    skipped_count?: number;
    moved_item_count?: number;
    processed_item_ids?: number[];
    shopping_deleted?: boolean;
  } | null;
};

export type FoodInventoryFieldName =
  | "ingredient_name"
  | "quantity"
  | "unit"
  | "group_name"
  | "category";

export type ApiFieldErrors = Partial<
  Record<FoodInventoryFieldName, string | string[]>
>;

type ErrorResponseShape = {
  message?: string;
  errors?: ApiFieldErrors;
  data?: unknown;
  [key: string]: unknown;
};

export class ApiValidationError extends Error {
  fields?: ApiFieldErrors;
  responseData?: ErrorResponseShape;

  constructor(
    message: string,
    options?: {
      fields?: ApiFieldErrors;
      responseData?: ErrorResponseShape;
    }
  ) {
    super(message);
    this.name = "ApiValidationError";
    this.fields = options?.fields;
    this.responseData = options?.responseData;
  }
}

type GetFoodInventoryParams = {
  search?: string;
  group_name?: string;
};

async function parseJsonSafely(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function pickFieldErrors(data: any): ApiFieldErrors | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  if (data.errors && typeof data.errors === "object") {
    return data.errors as ApiFieldErrors;
  }

  const candidateKeys: FoodInventoryFieldName[] = [
    "ingredient_name",
    "quantity",
    "unit",
    "group_name",
    "category",
  ];

  const extracted: ApiFieldErrors = {};

  for (const key of candidateKeys) {
    const value = data[key];
    if (typeof value === "string" || Array.isArray(value)) {
      extracted[key] = value;
    }
  }

  return Object.keys(extracted).length > 0 ? extracted : undefined;
}

function buildApiError(
  data: any,
  fallbackMessage: string
): ApiValidationError | Error {
  const message = data?.message || fallbackMessage;
  const fields = pickFieldErrors(data);

  if (fields) {
    return new ApiValidationError(message, {
      fields,
      responseData: data,
    });
  }

  return new Error(message);
}

export async function getFoodInventoryList({
  search = "",
  group_name = "",
}: GetFoodInventoryParams = {}): Promise<FoodInventoryListResponse> {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.append("search", search.trim());
  }

  if (group_name.trim() && group_name !== "all") {
    query.append("group_name", group_name.trim());
  }

  const queryString = query.toString();
  const url = queryString
    ? `${API_BASE_URL}/inventory/?${queryString}`
    : `${API_BASE_URL}/inventory/`;

  const response = await authFetch(url, {
    method: "GET",
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(data, "Không thể tải danh sách nguyên liệu");
  }

  return data as FoodInventoryListResponse;
}

export async function getFoodInventoryDetail(
  foodInventoryId: number
): Promise<FoodInventoryDetailResponse> {
  const query = new URLSearchParams({
    food_inventory_id: String(foodInventoryId),
  });

  const response = await authFetch(
    `${API_BASE_URL}/inventory/detail/?${query.toString()}`,
    {
      method: "GET",
    }
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(data, "Không thể tải chi tiết nguyên liệu");
  }

  return data as FoodInventoryDetailResponse;
}

export async function createFoodInventory(
  payload: UpsertFoodInventoryPayload
): Promise<CreateFoodInventoryResponse> {
  const response = await authFetch(`${API_BASE_URL}/inventory/create/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(data, "Không thể thêm nguyên liệu vào kho");
  }

  return data as CreateFoodInventoryResponse;
}

export async function deleteFoodInventory(
  foodInventoryId: number
): Promise<DeleteFoodInventoryResponse> {
  const response = await authFetch(`${API_BASE_URL}/inventory/delete/`, {
    method: "POST",
    body: JSON.stringify({
      food_inventory_id: foodInventoryId,
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(data, "Không thể xóa nguyên liệu khỏi kho");
  }

  return data as DeleteFoodInventoryResponse;
}

export async function checkBoughtItemsToInventory(
  shoppingId: number
): Promise<CheckBoughtItemsToInventoryResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/inventory/check-bought-items/`,
    {
      method: "POST",
      body: JSON.stringify({
        shopping_id: shoppingId,
      }),
    }
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(
      data,
      "Không thể kiểm tra nguyên liệu trước khi cập nhật vào kho"
    );
  }

  return data as CheckBoughtItemsToInventoryResponse;
}

export async function addBoughtItemsToInventory(
  shoppingId: number
): Promise<AddBoughtItemsToInventoryResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/inventory/add-bought-items/`,
    {
      method: "POST",
      body: JSON.stringify({
        shopping_id: shoppingId,
      }),
    }
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(
      data,
      "Không thể thêm các nguyên liệu đã mua vào kho"
    );
  }

  return data as AddBoughtItemsToInventoryResponse;
}


export async function updateFoodInventoryQuantity(
  payload: UpdateFoodInventoryQuantityPayload
): Promise<UpdateFoodInventoryQuantityResponse> {
  const response = await authFetch(`${API_BASE_URL}/inventory/update-quantity/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(data, "Không thể cập nhật số lượng nguyên liệu");
  }

  return data as UpdateFoodInventoryQuantityResponse;
}