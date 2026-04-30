import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  getHomeDishes,
  toggleFavorite,
  type HomeCategory,
  type HomeDish,
} from "@/src/api/homeApi";
import { clearAuthToken } from "@/src/utils/authStorage";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isAuthExpiredError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes("phiên đăng nhập") ||
    message.includes("đăng nhập lại") ||
    message.includes("401") ||
    message.includes("unauthorized")
  );
}


export function useHomeUI() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [dishes, setDishes] = useState<HomeDish[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRenderRef = useRef(true);

  const isNotFound = !loading && dishes.length === 0;

  const handleAuthExpired = useCallback(async () => {
    await clearAuthToken();
    router.replace("/auth/login");
  }, [router]);

  const fetchData = useCallback(
    async (
      keyword: string,
      category: string,
      options?: { silent?: boolean; isRefresh?: boolean }
    ) => {
      const silent = options?.silent ?? false;
      const isRefresh = options?.isRefresh ?? false;

      try {
        if (!silent && !isRefresh) {
          setLoading(true);
        }

        if (isRefresh) {
          setRefreshing(true);
        }

        setError("");

        const response = await getHomeDishes({
          search: keyword,
          category,
        });

        setUsername(response.data.user.username);
        setCategories(response.data.categories);
        setDishes(response.data.dishes);
      } catch (err) {
        if (isAuthExpiredError(err)) {
          await handleAuthExpired();
          return;
        }

        setError(getErrorMessage(err, "Không thể tải dữ liệu trang chủ"));
      } finally {
        if (!silent && !isRefresh) {
          setLoading(false);
        }

        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    [handleAuthExpired]
  );


  useEffect(() => {
    fetchData("", "all");
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(search, selectedCategory, { silent: true }).catch(() => {});
    }, [fetchData, search, selectedCategory])
  );

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchData(search, selectedCategory, { silent: true });
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, selectedCategory, fetchData]);

  const onChangeSearch = (value: string) => {
    setSearch(value);
  };

  const onSelectCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const refreshData = async () => {
    await fetchData(search, selectedCategory, { isRefresh: true });
  };

  const retryFetch = async () => {
    await fetchData(search, selectedCategory);
  };

  const togglingFavoriteRef = useRef<number | null>(null);

  const onToggleFavorite = useCallback(
    async (dishId: number) => {
      if (togglingFavoriteRef.current === dishId) return;

      togglingFavoriteRef.current = dishId;
      setTogglingFavoriteId(dishId);
      setError("");

      try {
        const response = await toggleFavorite(dishId);

        Alert.alert(
          "Thông báo",
          response.data?.is_favorite
            ? "Đã thêm món vào danh sách yêu thích"
            : "Đã bỏ món khỏi danh sách yêu thích"
        );

        await fetchData(search, selectedCategory, { silent: true });
      } catch (err) {
        if (isAuthExpiredError(err)) {
          await handleAuthExpired();
          return;
        }

        setError(getErrorMessage(err, "Không thể cập nhật yêu thích"));
      } finally {
        togglingFavoriteRef.current = null;
        setTogglingFavoriteId(null);
      }
    },
    [fetchData, search, selectedCategory, handleAuthExpired]
  );

  const onPressDish = (dishId: number) => {
  router.push({
    pathname: "/home/dish/[dishId]",
    params: { dishId: String(dishId) },
  });
};

  const emptyMessage = useMemo(() => {
    if (search.trim()) return "Không tìm thấy món ăn phù hợp";
    if (selectedCategory !== "all") return "Không có món ăn trong danh mục này";
    return "Không tìm thấy món ăn phù hợp";
  }, [search, selectedCategory]);
  return {
    username,
    categories,
    dishes,

    search,
    setSearch: onChangeSearch,

    selectedCategory,
    loading,
    refreshing,
    error,
    togglingFavoriteId,

    onSelectCategory,
    onToggleFavorite,
    onPressDish,
    refreshData,
    retryFetch,

    isNotFound,
    emptyMessage,
  };
}