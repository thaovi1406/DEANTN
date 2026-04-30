import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProfileIcon from "@/assets/profile.svg";
import PasswordIcon from "@/assets/password.svg";
import LogoutIcon from "@/assets/logout.svg";

type Props = {
  visible: boolean;
  onClose: () => void;
  top: number;
  left: number;
  username?: string;
  onPressChangePassword: () => void;
  onPressLogout: () => void;
};

const { width: screenWidth } = Dimensions.get("window");

// ✅ giống hook
const menuWidth = Math.min(screenWidth * 0.5, 260);

export default function ProfileDropdown({
  visible,
  onClose,
  top,
  left,
  username,
  onPressChangePassword,
  onPressLogout,
}: Props) {
  // ✅ đảm bảo không tràn phải
  const safeLeft = Math.min(left, screenWidth - menuWidth - 12);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.menuContainer,
            {
              top,
              left: safeLeft,
              width: menuWidth,
            },
          ]}
        >
          <View style={styles.userRow}>
            <ProfileIcon width={30} height={30} />
            <Text style={styles.username} numberOfLines={1}>
              {username || "Người dùng"}
            </Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onPressChangePassword}
          >
            <PasswordIcon width={30} height={30} />
            <Text style={styles.menuText}>Đổi mật khẩu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onPressLogout}
          >
            <LogoutIcon width={22} height={22} />
            <Text style={styles.menuText}>Đăng xuất</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  menuContainer: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === "ios" ? 0.12 : 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  username: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 6,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  menuText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#222",
  },
});