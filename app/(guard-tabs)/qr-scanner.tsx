import { CameraView, useCameraPermissions } from "expo-camera";
import { fonts } from "../../constants/tokens";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { errorMessage } from "../../src/api/client";
import { scanQRCode } from "../../src/api/visitorApi";

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permText}>Camera permission is required to scan QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleScanned = async ({ data }: { data: string }) => {
    if (!scanning || loading) return;
    setScanning(false);
    setLoading(true);
    try {
      const res = await scanQRCode(data);
      const visitorId = res?.id ?? res?.data?.id;
      if (!visitorId) throw new Error("Could not verify QR code");
      router.push(`/visitor/exit-entry?id=${visitorId}&qr=1`);
    } catch (err) {
      // A rejected QR now arrives as a thrown ApiError carrying the server's
      // reason ("expired", "already used") — surface it rather than a generic.
      Alert.alert("Invalid QR", errorMessage(err, "Could not verify QR code"), [
        { text: "Try Again", onPress: () => setScanning(true) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Text style={styles.headerText}>Scan Visitor QR Code</Text>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanning && !loading ? handleScanned : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          {loading && <ActivityIndicator color="#fff" size="large" style={{ marginTop: 24 }} />}
          {!scanning && !loading && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanning(true)}>
              <Text style={styles.rescanBtnText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: t.bg },
  permText: { fontSize: 16, color: t.text, textAlign: "center", marginBottom: 16 },
  permBtn: { backgroundColor: t.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  permBtnText: { color: "#fff", fontFamily: fonts.semibold },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.bold,
    textAlign: "center",
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: "#fff",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  rescanBtn: {
    marginTop: 24,
    backgroundColor: t.accent,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  rescanBtnText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 15 },
});
