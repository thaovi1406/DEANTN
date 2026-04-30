import { API_BASE_URL } from "@/src/config/api";

export type DishCategory = {
  key: string;
  label: string;
};
import type {
  ToggleFavoriteResponse,
} from "./dishTypes";

export type IndividualDish = {
  dish_id: number;
  source_dish_id: number | null;
  dish_name: string;
  cooking_time: number;
  ration: number;
  image: string | null;
  category_name: string;
  category_label: string;
  is_favorite: boolean;
};

export type IndividualDishListResponse = {
  message: string;
  data: {
    user: {
      username: string;
    };
    categories: DishCategory[];
    dishes: IndividualDish[];
  };
};

export type DeleteIndividualDishResponse = {
  message: string;
  data: {
    dish_id: number;
    source_dish_id: number | null;
    deleted: boolean;
  } | null;
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

export async function getIndividualDishesApi(params: {
  token: string;
  search?: string;
  category?: string;
}): Promise<IndividualDishListResponse> {
  const query = new URLSearchParams();

  if (params.search?.trim()) {
    query.append("search", params.search.trim());
  }

  if (params.category?.trim()) {
    query.append("category", params.category.trim());
  }

  const queryString = query.toString();
  const url = queryString
    ? `${API_BASE_URL}/home/individual/dishes/?${queryString}`
    : `${API_BASE_URL}/home/individual/dishes/`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${params.token}`,
    },
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể tải danh sách món yêu thích");
  }

  return payload as IndividualDishListResponse;
}

export async function deleteIndividualDishApi(params: {
  token: string;
  dishId: number;
}): Promise<DeleteIndividualDishResponse> {
  const response = await fetch(
    `${API_BASE_URL}/home/individual/dishes/${params.dishId}/`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${params.token}`,
      },
    }
  );

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Không thể xóa món ăn khỏi danh sách yêu thích");
  }

  return payload as DeleteIndividualDishResponse;

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