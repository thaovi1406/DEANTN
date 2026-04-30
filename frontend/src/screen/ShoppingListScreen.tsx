import React from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useShoppingListUI } from "@/src/hooks/useShoppingListUI";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import BotIcon from "@/assets/hugeicons_bot";

const BG = "#E2EDE5";
const PRIMARY = "#3E9300";
const WHITE = "#FFFFFF";
const TEXT = "#2F2F2F";
const MUTED = "#6B7280";
const BORDER = "#CFE0D3";
const ERROR = "#D93A3A";

export default function ShoppingListScreen() {
  const router = useRouter();
  const {
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
  } = useShoppingListUI();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={shoppingLists}
        keyExtractor={(item) => String(item.shopping_id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.screenTitle}>MUA SẮM</Text>

              <TouchableOpacity style={styles.chatbotButton} activeOpacity={0.85} onPress={() => router.push("/chatbot")}>
                <BotIcon width={40} height={38} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={22} color={PRIMARY} />
              <TextInput
                placeholder="Tìm kiếm"
                placeholderTextColor={MUTED}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <ShoppingListCard
            item={item}
            styles={styles}
            onPress={() => onPressList(item.shopping_id)}
            onDelete={() => onDeleteList(item.shopping_id)}
          />
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
    paddingBottom: 24,
  },
  header: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  screenTitle: {
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
    borderRadius: 16,
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 14,
    color: TEXT,
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 14,
    color: MUTED,
  },
  emptyBox: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: MUTED,
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    marginBottom: 12,
    color: ERROR,
    fontSize: 15,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});