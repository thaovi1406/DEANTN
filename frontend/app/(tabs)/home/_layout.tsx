import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Màn hình chính của Tab Home */}
      <Stack.Screen name="index" /> 
      <Stack.Screen name="dish/[dishId]" />
    </Stack>
  );
}