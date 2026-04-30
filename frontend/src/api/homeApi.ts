import { API_BASE_URL } from "@/src/config/api";
import { authFetch } from "@/src/api/authFetch";

export type HomeCategory = {
  key: string;
  label: string;
};

export type HomeDish = {
  dish_id: number;
  dish_name: string;
  cooking_time: number;
  ration: number;
  image: string | null;
  category_name: string;
  category_label: string;
  is_favorite: boolean;
};

export type HomeResponse = {
  message: string;
  data: {
    user: {
      username: string;
    };
    categories: HomeCategory[];
    dishes: HomeDish[];
  };
};

export type ToggleFavoriteResponse = {
  message: string;
  data: {
    source_dish_id: number;
    individual_dish_id: number | null;
    is_favorite: boolean;
    deleted: boolean;
  };
};

type GetHomeDishesParams = {
  search?: string;
  category?: string;
  favoriteOnly?: boolean;
};

async function parseJsonSafely(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function getHomeDishes({
  search = "",
  category = "all",
  favoriteOnly = false,
}: GetHomeDishesParams): Promise<HomeResponse> {
  const query = new URLSearchParams();

  if (search.trim()) query.append("search", search.trim());
  if (category) query.append("category", category);
  if (favoriteOnly) query.append("favorite_only", "true");

  const response = await authFetch(
    `${API_BASE_URL}/home/dishes/?${query.toString()}`,
    {
      method: "GET",
    }
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải danh sách món ăn");
  }

  return data as HomeResponse;
}

export async function toggleFavorite(
  dishId: number
): Promise<ToggleFavoriteResponse> {
  const response = await authFetch(
    `${API_BASE_URL}/home/dishes/${dishId}/favorite/`,
    {
      method: "POST",
    }
  );

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data?.message || "Không thể cập nhật yêu thích");
  }

  return data as ToggleFavoriteResponse;
}