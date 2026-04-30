import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import IngredientModal from "@/components/individualDishForm/IngredientModal";
import ShoppingItemCard from "@/components/shopping/ShoppingItemCard";
import { useShoppingListDetailUI } from "@/src/hooks/useShoppingListDetailUI";

const BG = "#E2EDE5";
const PRIMARY = "#3E9300";
const WHITE = "#FFFFFF";
const TEXT = "#2F2F2F";
const MUTED = "#6B7280";
const BORDER = "#CFE0D3";
const ERROR = "#D93A3A";

function formatDate(dateString?: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
}

type RowItem =
  | { type: "section"; key: string; title: string; count: number; showInventory?: boolean }
  | { type: "item"; key: string; item: any; checked: boolean }
  | { type: "empty"; key: string };

export default function ShoppingListDetailScreen() {
  const insets = useSafeAreaInsets();

  const {
    detail,
    loading,
    error,
    pendingItems,
    boughtItems,
    submittingItemId,
    deletingItemId,
    modalVisible,
    draft,
    draftErrors,
    unitOptions,
    groupOptions,
    categoryOptions,
    onBack,
    reload,
    onToggleStatus,
    onDeleteItem,
    openCreateModal,
    closeModal,
    onChangeDraft,
    onSaveDraft,
    addingToInventory,
    onAddBoughtItemsToInventory,
  } = useShoppingListDetailUI();

  const data: RowItem[] = React.useMemo(() => {
    const rows: RowItem[] = [
      {
        type: "section",
        key: "pending-section",
        title: "Cần mua",
        count: detail?.pending_count ?? pendingItems.length,
      },
    ];

    pendingItems.forEach((item) => {
      rows.push({
        type: "item",
        key: `pending-${item.item_id}`,
        item,
        checked: false,
      });
    });

    rows.push({
      type: "section",
      key: "bought-section",
      title: "Đã mua",
      count: detail?.bought_count ?? boughtItems.length,
      showInventory: true,
    });

    boughtItems.forEach((item) => {
      rows.push({
        type: "item",
        key: `bought-${item.item_id}`,
        item,
        checked: true,
      });
    });

    if (!pendingItems.length && !boughtItems.length) {
      rows.push({
        type: "empty",
        key: "empty-state",
      });
    }

    return rows;
  }, [detail, pendingItems, boughtItems]);

  const renderItem: ListRenderItem<RowItem> = ({ item }) => {
    if (item.type === "section") {
      return (
        <View
          style={[
            styles.sectionHeader,
            item.showInventory && styles.sectionHeaderWithAction,
          ]}
        >
          <Text style={styles.sectionTitle}>
            {item.title} ({item.count})
          </Text>

          {item.showInventory ? (
            <TouchableOpacity
              style={styles.inventoryBtn}
              activeOpacity={0.85}
              onPress={onAddBoughtItemsToInventory}
              disabled={addingToInventory}
            >
              {addingToInventory ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="archive" size={14} color="#FFF" />
                  <Text style={styles.inventoryBtnText}>Thêm vào kho</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    if (item.type === "empty") {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            Danh sách mua sắm chưa có nguyên liệu
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.cardWrap}>
        <ShoppingItemCard
          item={item.item}
          styles={styles}
          checked={item.checked}
          toggling={submittingItemId === item.item.item_id}
          deleting={deletingItemId === item.item.item_id}
          onToggle={() => onToggleStatus(item.item.item_id)}
          onDelete={
            item.checked ? undefined : () => onDeleteItem(item.item.item_id)
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={18} color={PRIMARY} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {detail?.list_name ?? "Chi tiết mua sắm"}
          </Text>
          <Text style={styles.createdDate}>
            Ngày tạo: {formatDate(detail?.created_date)}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => reload(true)}>
            <Text style={styles.retryText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={data}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 108 },
            ]}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={[styles.fab, { bottom: insets.bottom + 20 }]}
            onPress={openCreateModal}
          >
            <Ionicons name="add" size={30} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      <IngredientModal
        visible={modalVisible}
        draft={draft}
        errors={draftErrors}
        unitOptions={unitOptions}
        groupOptions={groupOptions}
        categoryOptions={categoryOptions}
        onChangeDraft={onChangeDraft}
        onClose={closeModal}
        onSave={onSaveDraft}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 18,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: WHITE,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 0.3,
    marginBottom: 6,
    flexShrink: 1,
  },
  createdDate: {
    fontSize: 12,
    color: MUTED,
  },

  listContent: {
    paddingHorizontal: 16,
  },

  sectionHeader: {
    marginBottom: 12,
    marginTop: 6,
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: "600",
    flexShrink: 1,
  },

  cardWrap: {
    marginBottom: 14,
  },

  inventoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 36,
    flexShrink: 0,
    gap: 8,
  },
  inventoryBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },

  itemCard: {
    width: "100%",
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  checkButton: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  uncheckedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 8,
    flexShrink: 1,
  },
  itemTitleBought: {
    fontSize: 17,
    fontWeight: "800",
    color: "#999",
    marginBottom: 8,
    textDecorationLine: "line-through",
    flexShrink: 1,
  },
  itemMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 4,
    columnGap: 16,
  },
  itemMeta: {
    fontSize: 14,
    color: MUTED,
  },

  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    ...(Platform.OS === "ios" ? { overflow: "visible" } : {}),
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: ERROR,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "700",
  },

  emptyWrap: {
    alignItems: "center",
    paddingTop: 36,
  },
  emptyText: {
    color: MUTED,
    fontSize: 15,
    textAlign: "center",
  },
});