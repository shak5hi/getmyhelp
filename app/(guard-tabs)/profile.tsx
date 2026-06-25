import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import config from "../../src/config";
import { clearSession } from "../../src/api/client";

export default function GuardProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const res = await fetch(`${config.apiUrl}/customer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setProfile(json?.data ?? json);
      } catch {}
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Guard Profile</Text>
      {profile && (
        <View style={styles.card}>
          <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.info}>{profile.phone ?? profile.email}</Text>
          <Text style={styles.roleTag}>Guard</Text>
        </View>
      )}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: t.text, marginBottom: 24 },
  card: {
    backgroundColor: t.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
  },
  name: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 4 },
  info: { fontSize: 14, color: t.textSecondary, marginBottom: 8 },
  roleTag: {
    backgroundColor: t.accentTint,
    color: t.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: t.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
