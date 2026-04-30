import { Alert } from "react-native";
import { useRouter } from "expo-router";
export function useAuthLanding() {
  const router = useRouter();
   const onLoginPress = () => {
    router.push("/auth/login"); 
  };

  const onRegisterPress = () => {
    router.push("/auth/register"); 
  };

  return {
    onLoginPress,
    onRegisterPress,
  };
}