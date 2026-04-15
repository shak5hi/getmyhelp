/* PRODUCTION ARCHITECTURE UPGRADE — moved from app/profile.tsx */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import config from "../../src/config";

type CustomerProfile = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string;
  profile_image: string | null;
  is_verified: boolean;
  is_active: boolean;
  society_id: string | null;
  tower_id: string | null;
  flat_number: string | null;
};

export default function ProfileScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem("access_token");
  };

  // ── Fetch profile on mount ─────────────────────────────────────────────────

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(`${config.apiUrl}/customer/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(data.message || "Failed to load profile.");
        }
        return;
      }

      const p: CustomerProfile = data.data;
      setProfile(p);
      setFirstName(p.first_name ?? "");
      setLastName(p.last_name ?? "");
      setEmail(p.email ?? "");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save profile ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      const token = await getToken();
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(`${config.apiUrl}/customer/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(data.message || "Failed to update profile.");
        }
        return;
      }

      // Update stored user for greeting on dashboard
      if (data.data) {
        await AsyncStorage.setItem("user", JSON.stringify(data.data));
        setProfile(data.data);
        setFirstName(data.data.first_name ?? "");
        setLastName(data.data.last_name ?? "");
        setEmail(data.data.email ?? "");
      }

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ width: 38 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        {/* Settings button */}
        <Pressable style={styles.backButton} onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={20} color="#2E3A46" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR */}
        <View style={styles.avatarSection}>
          {profile?.profile_image ? (
            <Image
              source={{ uri: profile.profile_image }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#6366F1" />
            </View>
          )}
          <Text style={styles.avatarName}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.avatarPhone}>{profile?.phone}</Text>
        </View>

        {/* SUCCESS BANNER */}
        {successMsg ? (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {/* ERROR BANNER */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* EDITABLE FIELDS */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Personal Info</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* READ-ONLY FIELDS */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account Details</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.phone}</Text>
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Flat Number</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {profile?.flat_number ?? "—"}
              </Text>
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Verified</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {profile?.is_verified ? "Yes ✓" : "No"}
              </Text>
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving…" : "Save Changes"}
          </Text>
          {!saving && (
            <Ionicons name="checkmark" size={20} color="#fff" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  avatarPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  readOnlyInput: {
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readOnlyText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  saveButton: {
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
/* END PRODUCTION ARCHITECTURE UPGRADE */
