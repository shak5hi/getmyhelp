import { useLocalSearchParams, useRouter } from "expo-router";
import { fonts } from "../../constants/tokens";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { getVisitorDetail, markVisitorExit } from "../../src/api/visitorApi";

export default function ExitEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [visitor, setVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getVisitorDetail(id).then((res) => setVisitor(res?.data ?? res)).catch(() => {});
    }
  }, [id]);

  const handleExit = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await markVisitorExit(id);
      Alert.alert("Done", "Visitor checked out", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Error", "Failed to mark exit");
    } finally {
      setLoading(false);
    }
  };

  if (!visitor) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  const isCheckedOut = visitor.status === "checked_out";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{visitor.name}</Text>
        <Text style={styles.info}>{visitor.mobile}</Text>
        <Text style={styles.info}>Purpose: {visitor.purpose}</Text>
        {visitor.flat_number && <Text style={styles.info}>Flat: {visitor.flat_number}</Text>}
        <Text style={[styles.status, { color: visitor.status === "approved" || visitor.status === "checked_in" ? theme.success : theme.danger }]}>
          Status: {visitor.status}
        </Text>
      </View>

      {!isCheckedOut && (visitor.status === "approved" || visitor.status === "checked_in") && (
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.exitBtnText}>Mark Exit</Text>}
        </TouchableOpacity>
      )}

      {isCheckedOut && (
        <View style={[styles.resultBox, { backgroundColor: theme.successTint }]}>
          <Text style={[styles.resultText, { color: theme.success }]}>Visitor has checked out</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 24 },
  name: { fontSize: 18, fontFamily: fonts.bold, color: t.text, marginBottom: 4 },
  info: { fontSize: 14, color: t.textSecondary, marginBottom: 2 },
  status: { fontSize: 14, fontFamily: fonts.semibold, marginTop: 8 },
  exitBtn: {
    backgroundColor: t.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  exitBtnText: { color: "#fff", fontFamily: fonts.bold, fontSize: 16 },
  resultBox: { borderRadius: 12, padding: 20, alignItems: "center" },
  resultText: { fontSize: 16, fontFamily: fonts.semibold },
});
