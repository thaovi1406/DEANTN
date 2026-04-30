import { API_BASE_URL } from "@/src/config/api";
import { authFetch } from "@/src/api/authFetch";

export type MealType = "breakfast" | "lunch" | "dinner";

export type AssignedDishItem = {
  plan_detail_id: number;
  dish_id: number;
  dish_name: string;
  image: string | null;
  cooking_time: number;
  ration: number;
  category_name: string;
  category_label: string;
  source_dish_id: number | null;
};

export type MealPlanMeal = {
  meal_type: MealType;
  label: string;
  dishes: AssignedDishItem[];
};

export type MealPlanDay = {
  date: string;
  day: number;
  month: number;
  weekday_key: string;
  weekday_label: string;
  meals: MealPlanMeal[];
};

export type MealPlanWeekData = {
  plan_id: number | null;
  start_date: string;
  end_date: string;
  previous_week_date: string;
  next_week_date: string;
  days: MealPlanDay[];
};

export type MealPlanWeekResponse = {
  message: string;
  data: MealPlanWeekData;
};

export type MealPlanAvailableDish = {
  dish_id: number;
  dish_name: string;
  cooking_time: number;
  ration: number;
  image: string | null;
  category_name: string;
  category_label: string;
  is_favorite: boolean;
  source_dish_id: number | null;
};

export type MealPlanDishListResponse = {
  message: string;
  data: {
    dishes: MealPlanAvailableDish[];
  };
};

export type AssignMealPlanPayload = {
  dish_id: number;
  date: string;
  meal_type: MealType;
};

export type AssignMealPlanResponse = {
  message: string;
  data: {
    plan_detail_id: number;
    plan_id: number;
    date: string;
    meal_type: MealType;
    dish: AssignedDishItem;
  };
};

export type DeleteMealPlanPayload = {
  plan_detail_id: number;
};

export type DeleteMealPlanResponse = {
  message: string;
  data: {
    plan_detail_id: number;
    plan_id: number;
    date: string;
    meal_type: MealType;
    dish_id: number;
  };
};

export type ClearWeekPayload = {
  start_date: string;
};

export type ClearWeekResponse = {
  message: string;
  data: {
    plan_id?: number;
    start_date: string;
    end_date: string;
    deleted_count: number;
  };
};

export type CopyWeekOptionItem = {
  start_date: string;
  end_date: string;
  has_data: boolean;
};

export type CopyWeekOptionsResponse = {
  message: string;
  data: {
    source_week: {
      start_date: string;
      end_date: string;
    };
    month_range: {
      start_date: string;
      end_date: string;
    };
    previous_month_date: string;
    next_month_date: string;
    weeks: CopyWeekOptionItem[];
  };
};

export type CopyWeekPayload = {
  source_start_date: string;
  target_start_date: string;
};

export type CopyWeekResponse = {
  message: string;
  data: {
    source_start_date: string;
    source_end_date: string;
    target_start_date: string;
    target_end_date: string;
    created_count: number;
  };
};

export type CopyDayOptionItem = {
  date: string;
  day: number;
  month: number;
  weekday_label: string;
  has_data: boolean;
};

export type CopyDayOptionsResponse = {
  message: string;
  data: {
    source_date: string;
    source_week_start: string;
    source_week_end: string;
    week_start_date: string;
    week_end_date: string;
    previous_week_date: string;
    next_week_date: string;
    days: CopyDayOptionItem[];
  };
};

export type CopyDayPayload = {
  source_date: string;
  target_date: string;
};

export type CopyDayResponse = {
  message: string;
  data: {
    source_date: string;
    target_date: string;
    created_count: number;
  };
};

type ApiValidationError = Record<string, string[] | string>;

async function parseJsonSafe(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeErrorMessage(
  data: { message?: string } | ApiValidationError | null,
  fallback: string
) {
  if (!data) return fallback;

  if (typeof data === "object" && "message" in data && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

export class ApiFormError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

function mapFieldErrors(data: ApiValidationError | null): Record<string, string> {
  if (!data || typeof data !== "object") return {};

  const result: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (key === "message") return;

    if (Array.isArray(value) && value.length > 0) {
      result[key] = String(value[0]);
      return;
    }

    if (typeof value === "string") {
      result[key] = value;
    }
  });

  return result;
}

async function handleResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const fieldErrors = mapFieldErrors(data);
    const message = normalizeErrorMessage(data, fallbackMessage);
    throw new ApiFormError(message, fieldErrors);
  }

  return data as T;
}

export async function getMealPlanWeekApi(date?: string): Promise<MealPlanWeekResponse> {
  const query = new URLSearchParams();

  if (date) {
    query.append("date", date);
  }

  const response = await authFetch(
    `${API_BASE_URL}/meal-plan/week/${query.toString() ? `?${query.toString()}` : ""}`,
    {
      method: "GET",
    }
  );

  return handleResponse<MealPlanWeekResponse>(
    response,
    "Không thể tải thực đơn tuần"
  );
}

export async function getMealPlanDishesApi(search?: string): Promise<MealPlanDishListResponse> {
  const query = new URLSearchParams();

  if (search?.trim()) {
    query.append("search", search.trim());
  }

  const response = await authFetch(
    `${API_BASE_URL}/meal-plan/dishes/${query.toString() ? `?${query.toString()}` : ""}`,
    {
      method: "GET",
    }
  );

  return handleResponse<MealPlanDishListResponse>(
    response,
    "Không thể tải danh sách món ăn"
  );
}

export async function assignMealPlanDishApi(
  payload: AssignMealPlanPayload
): Promise<AssignMealPlanResponse> {
  const response = await authFetch(`${API_BASE_URL}/meal-plan/assign/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse<AssignMealPlanResponse>(
    response,
    "Không thể thêm món vào thực đơn"
  );
}

export async function deleteMealPlanDetailApi(
  payload: DeleteMealPlanPayload
): Promise<DeleteMealPlanResponse> {
  const response = await authFetch(`${API_BASE_URL}/meal-plan/detail/delete/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse<DeleteMealPlanResponse>(
    response,
    "Không thể xóa món khỏi thực đơn"
  );
}

export async function clearMealPlanWeekApi(
  payload: ClearWeekPayload
): Promise<ClearWeekResponse> {
  const response = await authFetch(`${API_BASE_URL}/meal-plan/week/clear/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse<ClearWeekResponse>(
    response,
    "Không thể xóa thực đơn tuần"
  );
}

export async function getCopyWeekOptionsApi(params: {
  source_start_date: string;
  month_date?: string;
}): Promise<CopyWeekOptionsResponse> {
  const query = new URLSearchParams();
  query.append("source_start_date", params.source_start_date);

  if (params.month_date) {
    query.append("month_date", params.month_date);
  }

  const response = await authFetch(
    `${API_BASE_URL}/meal-plan/copy-week/options/?${query.toString()}`,
    {
      method: "GET",
    }
  );

  return handleResponse<CopyWeekOptionsResponse>(
    response,
    "Không thể tải danh sách tuần đích"
  );
}

export async function copyMealPlanWeekApi(
  payload: CopyWeekPayload
): Promise<CopyWeekResponse> {
  const response = await authFetch(`${API_BASE_URL}/meal-plan/copy-week/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse<CopyWeekResponse>(
    response,
    "Không thể sao chép thực đơn tuần"
  );
}

export async function getCopyDayOptionsApi(params: {
  source_date: string;
  week_date?: string;
}): Promise<CopyDayOptionsResponse> {
  const query = new URLSearchParams();
  query.append("source_date", params.source_date);

  if (params.week_date) {
    query.append("week_date", params.week_date);
  }

  const response = await authFetch(
    `${API_BASE_URL}/meal-plan/copy-day/options/?${query.toString()}`,
    {
      method: "GET",
    }
  );

  return handleResponse<CopyDayOptionsResponse>(
    response,
    "Không thể tải danh sách ngày đích"
  );
}

export async function copyMealPlanDayApi(
  payload: CopyDayPayload
): Promise<CopyDayResponse> {
  const response = await authFetch(`${API_BASE_URL}/meal-plan/copy-day/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse<CopyDayResponse>(
    response,
    "Không thể sao chép thực đơn ngày"
  );
}

export type ClearDayPayload = {
  date: string;
};

export type ClearDayResponse = {
  message: string;
  data: {
    plan_id?: number;
    date: string;
    start_date: string;
    end_date: string;
    deleted_count: number;
  };
};

export async function clearMealPlanDayApi(
  payload: ClearDayPayload
): Promise<ClearDayResponse> {
  const response = await authFetch(`${API_BASE_URL}/meal-plan/day/clear/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return handleResponse<ClearDayResponse>(
    response,
    "Không thể xóa thực đơn ngày"
  );
}