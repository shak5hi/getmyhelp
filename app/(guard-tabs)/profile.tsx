import AsyncStorage from "@react-native-async-storage/async-storage";
import { fonts } from "../../constants/tokens";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, Modal, ActivityIndicator } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { clearSession, apiGet, apiDelete } from "../../src/api/client";
import { unregisterForPush } from "../../src/push";

export default function GuardProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [profile, setProfile] = useState<any>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // apiGet injects auth header, timeout, and 401 guard automatically.
        const json = await apiGet("/customer/profile");
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
          // Stop pushes to this device before the session token is wiped.
          await unregisterForPush();
          await clearSession();
          router.replace("/");
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      Alert.alert("Invalid input", "Please type DELETE to confirm.");
      return;
    }
    setDeleting(true);
    try {
      await apiDelete("/customer/account");
      await unregisterForPush();
      await clearSession();
      router.replace("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
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

      <TouchableOpacity 
        style={[styles.logoutBtn, { marginTop: 12, backgroundColor: "transparent", borderWidth: 1, borderColor: theme.danger }]} 
        onPress={() => {
          setDeleteConfirmText("");
          setDeleteModalVisible(true);
        }}
      >
        <Text style={[styles.logoutText, { color: theme.danger }]}>Delete my account</Text>
      </TouchableOpacity>

      {/* DELETE ACCOUNT MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: theme.surface, padding: 24, borderRadius: 12, width: "100%" }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text, marginBottom: 12 }}>Delete Account</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 20, lineHeight: 20 }}>
              This action is permanent. All your personal data will be deleted. Visitor logs are retained as society records.
              Type &quot;DELETE&quot; to confirm.
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, color: theme.text, marginBottom: 20 }}
              placeholder="DELETE"
              placeholderTextColor={theme.textTertiary}
              onChangeText={setDeleteConfirmText}
              value={deleteConfirmText}
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={{ padding: 12 }}>
                <Text style={{ color: theme.textSecondary, fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deleting}
                style={{ padding: 12, backgroundColor: theme.danger, borderRadius: 8, marginLeft: 8 }}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 20 },
  title: { fontSize: 22, fontFamily: fonts.bold, color: t.text, marginBottom: 24 },
  card: {
    backgroundColor: t.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
  },
  name: { fontSize: 18, fontFamily: fonts.bold, color: t.text, marginBottom: 4 },
  info: { fontSize: 14, color: t.textSecondary, marginBottom: 8 },
  roleTag: {
    backgroundColor: t.accentTint,
    color: t.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
  logoutBtn: {
    backgroundColor: t.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontFamily: fonts.bold, fontSize: 16 },
});
