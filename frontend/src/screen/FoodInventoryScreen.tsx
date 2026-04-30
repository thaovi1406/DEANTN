import React from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import IngredientModal from "@/components/individualDishForm/IngredientModal";
import InventoryEditIngredientModal from "@/components/individualDishForm/InventoryEditIngredientModal";
import { useFoodInventoryUI } from "@/src/hooks/useFoodInventoryUI";
import BotIcon from "@/assets/hugeicons_bot";

const BG = "#E2EDE5";
const PRIMARY = "#3E9300";
const WHITE = "#FFFFFF";
const TEXT = "#2F2F2F";
const MUTED = "#6B7280";
const BORDER = "#CFE0D3";
const ERROR = "#D93A3A";
const DANGER = "#E14B4B";

export default function FoodInventoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    items,
    loading,
    refreshing,
    error,
    emptyText,
    search,
    setSearch,
    selectedGroup,
    setSelectedGroup,
    groupTabs,
    modalVisible,
    editModalVisible,
    draft,
    draftErrors,
    deletingItemId,
    unitOptions,
    groupOptions,
    categoryOptions,
    onRefresh,
    openCreateModal,
    openEditModal,
    closeModal,
    closeEditModal,
    onChangeDraft,
    onSaveDraft,
    onUpdateItem,
    onDeleteItem,
    getItemSubtitle,
  } = useFoodInventoryUI();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.food_inventory_id)}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 108 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>NGUYÊN LIỆU</Text>

              <TouchableOpacity
                style={styles.chatbotButton}
                activeOpacity={0.85}
                onPress={() => router.push("/chatbot")}
              >
                <BotIcon width={40} height={38} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={22} color={PRIMARY} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm kiếm"
                placeholderTextColor={MUTED}
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabList}
            >
              {groupTabs.map((tab) => {
                const active = tab.key === selectedGroup;

                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.tabItem, active && styles.tabItemActive]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedGroup(tab.key)}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={PRIMARY} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.ingredient_name}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {getItemSubtitle(item)}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => openEditModal(item)}
                  activeOpacity={0.8}
                  disabled={deletingItemId === item.food_inventory_id}
                >
                  <Feather name="edit-2" size={20} color={PRIMARY} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onDeleteItem(item)}
                  activeOpacity={0.8}
                  disabled={deletingItemId === item.food_inventory_id}
                >
                  {deletingItemId === item.food_inventory_id ? (
                    <ActivityIndicator size="small" color={DANGER} />
                  ) : (
                    <Feather name="trash-2" size={20} color={DANGER} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={openCreateModal}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={30} color={WHITE} />
      </TouchableOpacity>

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

      <InventoryEditIngredientModal
        visible={editModalVisible}
        draft={draft}
        errors={draftErrors}
        unitOptions={unitOptions}
        groupOptions={groupOptions}
        categoryOptions={categoryOptions}
        onChangeDraft={onChangeDraft}
        onClose={closeEditModal}
        onSave={onUpdateItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    minHeight: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 0.3,
  },

  chatbotButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    height: 52,
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: TEXT,
  },

  tabList: {
    paddingBottom: 18,
    gap: 12,
  },
  tabItem: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  tabItemActive: {
    backgroundColor: BG,
    borderColor: PRIMARY,
  },
  tabText: {
    fontSize: 15,
    color: TEXT,
    fontWeight: "500",
  },
  tabTextActive: {
    color: PRIMARY,
    fontWeight: "700",
  },

  cardWrap: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 14,
    color: MUTED,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
    paddingTop: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 70,
  },
  emptyText: {
    fontSize: 15,
    color: MUTED,
    textAlign: "center",
    marginBottom: 12,
  },
  errorText: {
    color: ERROR,
    fontSize: 14,
    marginBottom: 12,
  },
});