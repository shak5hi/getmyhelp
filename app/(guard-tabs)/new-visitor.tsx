import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import config from "../../src/config";
import { createVisitor } from "../../src/api/visitorApi";

const PURPOSES = ["delivery", "guest", "domestic", "vendor", "interview", "other"];

interface Tower {
  id: string;
  tower_number: string;
}

export default function NewVisitorScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [purpose, setPurpose] = useState("guest");
  const [towerId, setTowerId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [towersLoading, setTowersLoading] = useState(false);

  useEffect(() => {
    loadTowers();
  }, []);

  const loadTowers = async () => {
    try {
      setTowersLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const societyId = user?.guard_society_id;
      if (!societyId) return;
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${config.apiUrl}/customer/societies/${societyId}/towers`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const json = await res.json();
      const towerList: Tower[] = (json?.data || []).map((t: any) => ({
        id: t.id,
        tower_number: t.tower_number,
      }));
      setTowers(towerList);
      if (towerList.length === 1) setTowerId(towerList[0].id);
    } catch {
      // towers optional if API fails
    } finally {
      setTowersLoading(false);
    }
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera permission is needed to capture selfie");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      aspect: [1, 1],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !mobile.trim()) {
      Alert.alert("Required", "Visitor name and mobile number are required");
      return;
    }
    if (!flatNumber.trim()) {
      Alert.alert("Required", "Flat number is required to notify the resident");
      return;
    }
    if (towers.length > 0 && !towerId) {
      Alert.alert("Required", "Please select a tower");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("mobile", mobile.trim());
      formData.append("purpose", purpose);
      if (towerId.trim()) formData.append("tower_id", towerId.trim());
      formData.append("flat_number", flatNumber.trim());
      if (vehicleNumber.trim()) formData.append("vehicle_number", vehicleNumber.trim());
      if (selfieUri) {
        const filename = selfieUri.split("/").pop() ?? "selfie.jpg";
        (formData as any).append("selfie", {
          uri: selfieUri,
          name: filename,
          type: "image/jpeg",
        });
      }
      const res = await createVisitor(formData);
      if (res.detail) throw new Error(res.detail);
      const visitorId = res.id ?? res.data?.id;
      if (!visitorId) throw new Error("Failed to create visitor");
      // Reset form for next entry
      setName("");
      setMobile("");
      setPurpose("guest");
      setTowerId(towers.length === 1 ? towers[0].id : "");
      setFlatNumber("");
      setVehicleNumber("");
      setSelfieUri(null);
      Alert.alert("Entry Submitted", "Waiting for resident approval. You can add the next visitor.", [
        { text: "OK", onPress: () => router.replace("/(guard-tabs)/visitor-list") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to create visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>New Visitor Entry</Text>

          <Text style={styles.label}>Visitor Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="10-digit mobile" keyboardType="phone-pad" />

          <Text style={styles.label}>Purpose</Text>
          <View style={styles.purposeRow}>
            {PURPOSES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.purposeChip, purpose === p && styles.purposeChipActive]}
                onPress={() => setPurpose(p)}
              >
                <Text style={[styles.purposeChipText, purpose === p && styles.purposeChipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {towers.length > 1 && (
            <>
              <Text style={styles.label}>Tower *</Text>
              <View style={styles.towerRow}>
                {towersLoading ? (
                  <ActivityIndicator size="small" color={theme.accent} />
                ) : (
                  towers.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.towerChip, towerId === t.id && styles.towerChipActive]}
                      onPress={() => setTowerId(t.id)}
                    >
                      <Text style={[styles.towerChipText, towerId === t.id && styles.towerChipTextActive]}>
                        {t.tower_number}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          )}

          <Text style={styles.label}>Flat Number *</Text>
          <TextInput
            style={styles.input}
            value={flatNumber}
            onChangeText={setFlatNumber}
            placeholder="e.g. 301"
            keyboardType="default"
          />

          <Text style={styles.label}>Vehicle Number (optional)</Text>
          <TextInput style={styles.input} value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="e.g. MH01AB1234" autoCapitalize="characters" />

          <Text style={styles.label}>Selfie</Text>
          <TouchableOpacity style={styles.selfieBox} onPress={takeSelfie}>
            {selfieUri ? (
              <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
            ) : (
              <Text style={styles.selfieHint}>Tap to capture selfie</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Entry</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "700", color: t.text, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: t.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: t.text,
    backgroundColor: t.card,
  },
  purposeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  purposeChip: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: t.card,
  },
  purposeChipActive: { backgroundColor: t.accent, borderColor: t.accent },
  purposeChipText: { fontSize: 13, color: t.textSecondary },
  purposeChipTextActive: { color: "#fff", fontWeight: "600" },
  towerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  towerChip: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: t.card,
  },
  towerChipActive: { backgroundColor: t.accent, borderColor: t.accent },
  towerChipText: { fontSize: 14, color: t.textSecondary, fontWeight: "500" },
  towerChipTextActive: { color: "#fff", fontWeight: "700" },
  selfieBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: t.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 4,
    overflow: "hidden",
  },
  selfieImage: { width: 120, height: 120, borderRadius: 60 },
  selfieHint: { color: t.textTertiary, fontSize: 12, textAlign: "center" },
  submitBtn: {
    marginTop: 28,
    backgroundColor: t.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
