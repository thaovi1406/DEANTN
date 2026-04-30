import { API_BASE_URL } from "@/src/config/api";
import type {
  DishDetailResponse,
  ToggleFavoriteResponse,
} from "./dishTypes";

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function getDishDetailApi(params: {
  dishId: number;
  token: string;
}): Promise<DishDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/home/dishes/${params.dishId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${params.token}`,
    },
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể tải chi tiết món ăn");
  }

  return payload as DishDetailResponse;
}

export async function toggleFavoriteApi(params: {
  dishId: number;
  token: string;
}): Promise<ToggleFavoriteResponse> {
  const response = await fetch(
    `${API_BASE_URL}/home/dishes/${params.dishId}/favorite/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${params.token}`,
      },
    }
  );

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể cập nhật yêu thích");
  }

  return payload as ToggleFavoriteResponse;
}