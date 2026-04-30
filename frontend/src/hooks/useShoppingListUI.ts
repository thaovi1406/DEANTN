import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import {
  deleteShoppingList,
  getShoppingLists,
  ShoppingListSummary,
} from "@/src/api/shoppingListApi";

function normalizeError(error: any) {
  return error?.message || "Đã có lỗi xảy ra";
}

export function useShoppingListUI() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [shoppingLists, setShoppingLists] = useState<ShoppingListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchShoppingLists = useCallback(
    async (keyword?: string, showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError("");

        const response = await getShoppingLists({
          search: keyword ?? search,
        });

        setShoppingLists(response.data.shopping_lists || []);
      } catch (err: any) {
        setError(normalizeError(err));
      } finally {
        if (showLoading) setLoading(false);
        setRefreshing(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchShoppingLists("", true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchShoppingLists(search, false);
    }, [fetchShoppingLists, search])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShoppingLists(search, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, fetchShoppingLists]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShoppingLists(search, false);
  }, [fetchShoppingLists, search]);

  const onPressList = useCallback(
  (shoppingId: number) => {
    router.push({
      pathname: "/shopping/[shoppingId]",
      params: { shoppingId: String(shoppingId) },
    });
  },
  [router]
);

  const onDeleteList = useCallback(
    (shoppingId: number) => {
      Alert.alert(
        "Xác nhận xóa danh sách",
        "Bạn có chắc muốn xóa danh sách mua sắm này?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đồng ý",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await deleteShoppingList(shoppingId);

                await fetchShoppingLists(search, false);

                Alert.alert(
                  "Thành công",
                  "Đã xóa danh sách mua sắm thành công"
                );
              } catch (err: any) {
                Alert.alert("Thông báo", normalizeError(err));
              }
            },
          },
        ]
      );
    },
    [fetchShoppingLists, search]
  );

  const emptyText = useMemo(() => {
    if (search.trim()) return "Không tìm thấy danh sách mua sắm phù hợp";
    return "Chưa có danh sách mua sắm";
  }, [search]);

  return {
    search,
    setSearch,
    shoppingLists,
    loading,
    refreshing,
    error,
    emptyText,
    onRefresh,
    onPressList,
    onDeleteList,
    reload: fetchShoppingLists,
  };
}