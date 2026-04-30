import { useRef, useState } from "react";
import {
  Dimensions,
  TouchableOpacity,
  findNodeHandle,
  UIManager,
} from "react-native";

type MenuPosition = {
  top: number;
  left: number;
};

export function useProfileDropdown() {
  const profileButtonRef = useRef<
    React.ElementRef<typeof TouchableOpacity> | null
  >(null);

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
  });

  const openDropdown = () => {
    if (!profileButtonRef.current) return;

    const node = findNodeHandle(profileButtonRef.current);
    if (!node) return;

    UIManager.measureInWindow(
      node,
      (x: number, y: number, width: number, height: number) => {
        const screenWidth = Dimensions.get("window").width;

        // ✅ ĐỒNG BỘ với ProfileDropdown
        const menuWidth = Math.min(screenWidth * 0.5, 260);

        // ✅ căn mép phải dropdown theo mép phải icon
        const calculatedLeft = x + width - menuWidth;

        // ✅ tránh tràn màn
        const safeLeft = Math.max(
          12,
          Math.min(calculatedLeft, screenWidth - menuWidth - 12)
        );

        setPosition({
          top: y + height + 6, // khoảng cách dưới icon
          left: safeLeft,
        });

        setVisible(true);
      }
    );
  };

  const closeDropdown = () => {
    setVisible(false);
  };

  return {
    profileButtonRef,
    dropdownVisible: visible,
    dropdownPosition: position,
    openDropdown,
    closeDropdown,
  };
}