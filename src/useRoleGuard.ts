import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useRoleGuard(allowedRole: string, fallback: string) {
  const router = useRouter();
  const [roleOk, setRoleOk] = useState<boolean>(true); // optimistic

  useEffect(() => {
    AsyncStorage.getItem("user_role").then((role) => {
      // If role is null, we assume they are customer by default or the phone flow will catch them
      const currentRole = role || "customer";
      if (currentRole !== allowedRole) {
        setRoleOk(false);
        router.replace(fallback as any);
      }
    });
  }, [allowedRole, fallback, router]);

  return roleOk;
}
