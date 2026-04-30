import React from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DishCard from "@/components/home/DishCard";
import { useFavoriteUI } from "@/src/hooks/useFavoriteUI";
import BotIcon from "@/assets/hugeicons_bot";

const BG = "#E2EDE5";
const PRIMARY = "#3E9300";
const WHITE = "#FFFFFF";
const TEXT = "#222222";
const MUTED = "#6B7280";
const BORDER = "#CFE0D3";
const ERROR = "#D62828";

export default function FavoriteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    dishes,
    search,
    setSearch,
    loading,
    refreshing,
    error,
    emptyText,
    onPressDish,
    onPressEdit,
    onPressDelete,
    onPressCreate,
    onRefresh,
    onToggleFavorite,
  } = useFavoriteUI();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={dishes}
        keyExtractor={(item) => String(item.source_dish_id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
              <Text style={styles.title}>YÊU THÍCH</Text>

              <TouchableOpacity activeOpacity={0.85} style={styles.chatbotButton} onPress={() => router.push("/chatbot")}
>
                <BotIcon width={40} height={38} />

              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={PRIMARY} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm kiếm"
                placeholderTextColor={MUTED}
                style={styles.searchInput}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <DishCard
              item={item}
              onPress={() => onPressDish(item.dish_id)}
              onPressFavorite={() => onToggleFavorite(item.dish_id)}
              showFavoriteButton
              showManageActions
              onPressEdit={onPressEdit}
              onPressDelete={onPressDelete}
            />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.9}
        onPress={onPressCreate}
      >
        <Ionicons name="add" size={30} color={WHITE} />
      </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    minHeight: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3E9300",
    letterSpacing: 0.3,
  },
  chatbotButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    height: 52,
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: TEXT,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardWrapper: {
    width: "48%",
  },
  emptyBox: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
    textAlign: "center",
  },
  errorText: {
    marginBottom: 12,
    color: ERROR,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    ...(Platform.OS === "ios" ? { overflow: "visible" } : {}),
  },
});