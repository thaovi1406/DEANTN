import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { getAuthToken, clearAuthToken } from "@/src/utils/authStorage";
import {
  getIndividualDishesApi,
  deleteIndividualDishApi,
  toggleFavoriteApi,
  type IndividualDish,
} from "@/src/api/individualApi";

export function useFavoriteUI() {
  const router = useRouter();

  const [dishes, setDishes] = useState<IndividualDish[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingDishId, setDeletingDishId] = useState<number | null>(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const firstLoadRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hàm xử lý lỗi xác thực (Token hết hạn)
  const handleAuthError = useCallback(async (err: any) => {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("đăng nhập lại") ||
      message.includes("token")
    ) {
      await clearAuthToken();
      router.replace("/auth/login");
      return true;
    }
    return false;
  }, [router]);

  // Tải danh sách món ăn
  const fetchData = useCallback(
    async (options?: { isRefresh?: boolean; keyword?: string }) => {
      const isRefresh = options?.isRefresh ?? false;
      const keyword = options?.keyword ?? search;

      try {
        setError("");
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const token = await getAuthToken();
        if (!token) throw new Error("Phiên đăng nhập không hợp lệ");

        const response = await getIndividualDishesApi({
          token,
          search: keyword,
        });

        setDishes(response.data.dishes || []);
      } catch (err) {
        if (!(await handleAuthError(err))) {
          setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, handleAuthError]
  );

    useFocusEffect(
    useCallback(() => {
      fetchData({ keyword: search }).catch(() => {});
    }, [fetchData, search])
  );

  // Xử lý logic Yêu thích (Toggle Favorite)
  const onToggleFavorite = useCallback(
    async (dishId: number) => {
      if (togglingFavoriteId === dishId) return;

      try {
        setTogglingFavoriteId(dishId);

        const token = await getAuthToken();
        if (!token) {
          router.replace("/auth/login");
          return;
        }

        await toggleFavoriteApi({ dishId, token });

        // Reload lại danh sách để đồng bộ tuyệt đối với backend
        await fetchData();
      } catch (err) {
        if (!(await handleAuthError(err))) {
          Alert.alert("Lỗi", "Không thể cập nhật trạng thái yêu thích");
        }
      } finally {
        setTogglingFavoriteId(null);
      }
    },
    [togglingFavoriteId, handleAuthError, router, fetchData]
  );

  // Xử lý Xóa món ăn
  const handleDeleteDish = async (dishId: number) => {
    try {
      setDeletingDishId(dishId);
      const token = await getAuthToken();
      if (!token) throw new Error("Phiên đăng nhập hết hạn");

      await deleteIndividualDishApi({ token, dishId });
      setDishes((prev) => prev.filter((item) => item.dish_id !== dishId));
      Alert.alert("Thông báo", "Đã xóa món ăn thành công");
    } catch (err) {
      if (!(await handleAuthError(err))) {
        Alert.alert("Lỗi", "Không thể xóa món ăn");
      }
    } finally {
      setDeletingDishId(null);
    }
  };

  const onPressDelete = (dishId: number) => {
    Alert.alert("Xóa món ăn", "Bạn có chắc muốn xóa món ăn này không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đồng ý", style: "destructive", onPress: () => handleDeleteDish(dishId) },
    ]);
  };

  // Các hiệu ứng Load dữ liệu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData({ keyword: search });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchData]);

  return {
    dishes,
    search,
    setSearch,
    loading,
    refreshing,
    error,
    onToggleFavorite, // Export hàm này cho DishCard
    onPressDelete,
    onRefresh: useCallback(() => fetchData({ isRefresh: true }), [fetchData]),
    onPressDish: (dishId: number) => router.push(`/favourite/dish/${dishId}`),
    onPressEdit: (dishId: number) => router.push(`/favourite/update/${dishId}/edit`),
    onPressCreate: () => router.push("/favourite/create"),
    emptyText: useMemo(() => search.trim() ? "Không tìm thấy món ăn phù hợp" : "Bạn chưa có món yêu thích nào", [search]),
    reload: fetchData,
  };
}