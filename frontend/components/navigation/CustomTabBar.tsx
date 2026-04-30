import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

function getTabMeta(routeName: string, focused: boolean) {
  switch (routeName) {
    case "home":
      return {
        label: "Trang chủ",
        icon: (
          <Ionicons
            name={focused ? "home" : "home-outline"}
            size={24}
            color={focused ? "#669C2F" : "#707070"}
          />
        ),
      };

    case "favourite":
      return {
        label: "Món ăn",
        icon: (
          <Ionicons
            name={focused ? "book" : "book-outline"}
            size={24}
            color={focused ? "#669C2F" : "#707070"}
          />
        ),
      };

    case "mealplan":
      return {
        label: "Thực đơn",
        icon: (
          <Ionicons
            name={focused ? "calendar" : "calendar-outline"}
            size={24}
            color={focused ? "#669C2F" : "#707070"}
          />
        ),
      };

    case "shopping":
      return {
        label: "Mua sắm",
        icon: (
          <Ionicons
            name={focused ? "cart" : "cart-outline"}
            size={24}
            color={focused ? "#669C2F" : "#707070"}
          />
        ),
      };

    case "inventory":
      return {
        label: "Nguyên liệu",
        icon: (
          <MaterialCommunityIcons
            name={focused ? "fridge" : "fridge-outline"}
            size={24}
            color={focused ? "#669C2F" : "#707070"}
          />
        ),
      };

    default:
      return {
        label: routeName,
        icon: (
          <Ionicons
            name="ellipse-outline"
            size={24}
            color={focused ? "#669C2F" : "#707070"}
          />
        ),
      };
  }
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const meta = getTabMeta(route.name, focused);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) return;

            if (route.name === "shopping") {
              router.replace("/shopping");
              return;
            }

            if (route.name === "favourite") {
              router.replace("/favourite");
              return;
            }

            if (!focused) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              activeOpacity={0.85}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              {meta.icon}
              <Text style={[styles.label, focused && styles.activeLabel]}>
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  container: {
    flexDirection: "row",
    minHeight: 72,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: "#707070",
  },
  activeLabel: {
    color: "#669C2F",
    fontWeight: "700",
  },
});