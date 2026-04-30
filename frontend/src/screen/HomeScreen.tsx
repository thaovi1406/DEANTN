import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DishCard from "@/components/home/DishCard";
import { useHomeUI } from "@/src/hooks/useHomeUI";
import Profile_icon from "@/assets/profile.svg";
import BotIcon from "@/assets/hugeicons_bot";
import { useProfileDropdown } from "@/src/hooks/useProfileDropdown";
import ProfileDropdown from "@/components/home/ProfileDropdown";
import ChangePasswordModal from "@/components/home/ChangePasswordModal";
import { useChangePasswordUI } from "@/src/hooks/useChangePasswordUI";
import { router } from "expo-router";
import { logoutApi } from "@/src/api/logoutApi";
import { clearAuthToken } from "@/src/utils/authStorage";

const BG = "#E2EDE5";
const PRIMARY = "#3E9300";
const WHITE = "#FFFFFF";
const TEXT = "#2F2F2F";
const MUTED = "#6B7280";
const BORDER = "#CFE0D3";
const ERROR = "#D62828";

export default function HomeScreen() {
  const {
    username,
    categories,
    dishes,
    search,
    setSearch,
    selectedCategory,
    loading,
    error,
    onSelectCategory,
    onToggleFavorite,
    onPressDish,
    emptyMessage,
    isNotFound,
  } = useHomeUI();

  const {
    profileButtonRef,
    dropdownVisible,
    dropdownPosition,
    openDropdown,
    closeDropdown,
  } = useProfileDropdown();

  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const changePasswordUI = useChangePasswordUI({
    onClose: () => setChangePasswordVisible(false),
  });

  const onPressChangePassword = () => {
    closeDropdown();
    setChangePasswordVisible(true);
  };

  const onPressLogout = async () => {
    closeDropdown();

    try {
      await logoutApi();
    } catch {
      // nếu logout server lỗi vẫn xóa token local để buộc user đăng nhập lại
    }
    await clearAuthToken();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dishes}
        keyExtractor={(item) => String(item.dish_id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isNotFound ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hi {username || "bạn"},</Text>
                <Text style={styles.title}>Hôm nay bạn ăn gì?</Text>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity activeOpacity={0.85} style={styles.chatbotButton} onPress={() => router.push("/chatbot")}>
                  <BotIcon width={40} height={38} />
                </TouchableOpacity>

                <TouchableOpacity
                  ref={profileButtonRef}
                  activeOpacity={0.8}
                  onPress={openDropdown}
                  style={styles.profileButton}
                >
                  <Profile_icon width={28} height={28} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color={PRIMARY} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm kiếm"
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabList}
            >
              {categories.map((item) => {
                const isActive = item.key === selectedCategory;

                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.tabItem, isActive && styles.tabItemActive]}
                    activeOpacity={0.8}
                    onPress={() => onSelectCategory(item.key)}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <DishCard
              item={item}
              onPress={onPressDish}
              onPressFavorite={onToggleFavorite}
            />
          </View>
        )}
      />

      <ProfileDropdown
        visible={dropdownVisible}
        onClose={closeDropdown}
        top={dropdownPosition.top}
        left={dropdownPosition.left}
        username={username}
        onPressChangePassword={onPressChangePassword}
        onPressLogout={onPressLogout}
      />

      <ChangePasswordModal
        visible={changePasswordVisible}
        oldPassword={changePasswordUI.oldPassword}
        newPassword={changePasswordUI.newPassword}
        confirmPassword={changePasswordUI.confirmPassword}
        showOldPassword={changePasswordUI.showOldPassword}
        showNewPassword={changePasswordUI.showNewPassword}
        showConfirmPassword={changePasswordUI.showConfirmPassword}
        errors={changePasswordUI.errors}
        submitting={changePasswordUI.submitting}
        setOldPassword={changePasswordUI.setOldPassword}
        setNewPassword={changePasswordUI.setNewPassword}
        setConfirmPassword={changePasswordUI.setConfirmPassword}
        setShowOldPassword={changePasswordUI.setShowOldPassword}
        setShowNewPassword={changePasswordUI.setShowNewPassword}
        setShowConfirmPassword={changePasswordUI.setShowConfirmPassword}
        onSubmit={changePasswordUI.onSubmit}
        onCancel={changePasswordUI.onCancel}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  greeting: {
    fontSize: 14,
    color: TEXT,
  },
  title: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "600",
    color: TEXT,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chatbotButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 36,
    height: 36,
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
  tabList: {
    paddingBottom: 16,
  },
  tabItem: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    marginRight: 12,
  },
  tabItemActive: {
    backgroundColor: BG,
    borderColor: PRIMARY,
  },
  tabText: {
    fontSize: 16,
    color: TEXT,
    fontWeight: "500",
  },
  tabTextActive: {
    color: PRIMARY,
    fontWeight: "700",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardWrapper: {
    width: "48%",
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
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
    textAlign: "center",
  },
});