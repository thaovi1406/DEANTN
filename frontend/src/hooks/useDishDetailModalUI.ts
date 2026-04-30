import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

import { getDishDetailApi, toggleFavoriteApi } from "@/src/api/dishApi";
import type { DishDetail } from "@/src/api/dishTypes";
import { getAuthToken, clearAuthToken } from "@/src/utils/authStorage";

type GeneralErrors = {
  general?: string;
};

export function useDishDetailModalUI(
  dishId: number | null,
  visible: boolean
) {
  const [dish, setDish] = useState<DishDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [errors, setErrors] = useState<GeneralErrors>({});

  const parsedDishId = useMemo(() => {
    if (dishId === null || dishId === undefined) return null;

    const value = Number(dishId);
    return Number.isNaN(value) ? null : value;
  }, [dishId]);

  const getValidToken = useCallback(async () => {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("Bạn cần đăng nhập lại");
    }

    return token;
  }, []);

  const handleAuthError = useCallback(async (message: string) => {
    const normalized = message.toLowerCase();

    if (
      normalized.includes("unauthorized") ||
      normalized.includes("forbidden") ||
      normalized.includes("đăng nhập lại") ||
      normalized.includes("token")
    ) {
      await clearAuthToken();
      router.replace("/auth/login");
      return;
    }

    setErrors({ general: message });
  }, []);

  const fetchDishDetail = useCallback(async () => {
    if (!visible) return;

    if (!parsedDishId) {
      setDish(null);
      setErrors({ general: "Mã món ăn không hợp lệ" });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const token = await getValidToken();

      const response = await getDishDetailApi({
        dishId: parsedDishId,
        token,
      });

      setDish(response.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết món ăn";

      await handleAuthError(message);
    } finally {
      setLoading(false);
    }
  }, [visible, parsedDishId, getValidToken, handleAuthError]);

  const onToggleFavorite = useCallback(async () => {
    if (!dish || favoriteLoading) return;

    const previousValue = dish.is_favorite;

    try {
      setFavoriteLoading(true);
      setErrors({});

      setDish((prev) =>
        prev
          ? {
              ...prev,
              is_favorite: !previousValue,
            }
          : prev
      );

      const token = await getValidToken();

      const response = await toggleFavoriteApi({
        dishId: dish.dish_id,
        token,
      });

      setDish((prev) =>
        prev
          ? {
              ...prev,
              is_favorite: response.data.is_favorite,
            }
          : prev
      );
    } catch (error) {
      setDish((prev) =>
        prev
          ? {
              ...prev,
              is_favorite: previousValue,
            }
          : prev
      );

      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật yêu thích";

      await handleAuthError(message);
    } finally {
      setFavoriteLoading(false);
    }
  }, [dish, favoriteLoading, getValidToken, handleAuthError]);

  useEffect(() => {
    if (!visible) return;
    fetchDishDetail();
  }, [visible, fetchDishDetail]);

  useEffect(() => {
    if (!visible) {
      setDish(null);
      setErrors({});
      setLoading(false);
      setFavoriteLoading(false);
    }
  }, [visible]);

  return {
    dish,
    loading,
    favoriteLoading,
    errors,
    onToggleFavorite,
    retry: fetchDishDetail,
  };
}