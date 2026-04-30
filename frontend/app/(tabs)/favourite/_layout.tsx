import { Stack } from "expo-router";

export default function FavouriteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="dish/[dishId]" />
    </Stack>
  );
}