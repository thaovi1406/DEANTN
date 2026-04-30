import { Tabs } from "expo-router";
import CustomTabBar from "@/components/navigation/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: "Trang chủ" }} />
      <Tabs.Screen name="favourite" options={{ title: "Món ăn" }}/>
      <Tabs.Screen name="mealplan" options={{ title: "Thực đơn" }} />
      <Tabs.Screen name="shopping" options={{ title: "Mua sắm" }} />
      <Tabs.Screen name="inventory" options={{ title: "Thực phẩm" }} />
    </Tabs>
  );
}