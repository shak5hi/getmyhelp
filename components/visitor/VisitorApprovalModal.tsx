import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../../src/NotificationContext";

// Repeating alarm vibration: 700ms buzz, 300ms pause, repeat
const VIBRATION_PATTERN = [0, 700, 300, 700, 300, 700];

const PHOTO_SIZE = 148;
const RING_SIZE = PHOTO_SIZE + 28;

export default function VisitorApprovalModal() {
  const { pendingApproval, dismissApproval, approveVisitor, rejectVisitor } =
    useNotifications();
  const [loading, setLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Sound ref — loaded dynamically so missing expo-av doesn't crash
  const soundRef = useRef<any>(null);

  useEffect(() => {
    if (!pendingApproval) return;

    // Vibration alarm
    Vibration.vibrate(VIBRATION_PATTERN, true);

    // Expanding ring 1
    const ring1 = Animated.loop(
      Animated.sequence([
        Animated.timing(ring1Anim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(ring1Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    // Expanding ring 2 — offset by half
    const ring2 = Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(ring2Anim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );

    // Photo pulse
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    // Header flash (red↔dark)
    const flash = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
      ])
    );

    ring1.start();
    ring2.start();
    pulse.start();
    flash.start();

    // Load and play alarm sound (requires expo-av + assets/sounds/doorbell.mp3)
    let mounted = true;
    (async () => {
      try {
        const { Audio } = require("expo-av");
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/dorbell.wav"),
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        if (mounted) soundRef.current = sound;
      } catch {
        // expo-av not installed or sound file missing — silent fallback
      }
    })();

    return () => {
      mounted = false;
      Vibration.cancel();
      ring1.stop();
      ring2.stop();
      pulse.stop();
      flash.stop();
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [pendingApproval]);

  const stopAlarm = () => {
    Vibration.cancel();
    soundRef.current?.stopAsync().catch(() => {});
  };

  if (!pendingApproval) return null;

  const handleApprove = async () => {
    stopAlarm();
    setLoading(true);
    try {
      await approveVisitor(pendingApproval.visitorId);
      dismissApproval();
    } catch {
      Alert.alert("Error", "Failed to approve visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      Alert.alert("Required", "Please provide a reason for rejection");
      return;
    }
    stopAlarm();
    setLoading(true);
    try {
      await rejectVisitor(pendingApproval.visitorId, rejectNote);
      setRejectNote("");
      setShowRejectInput(false);
      dismissApproval();
    } catch {
      Alert.alert("Error", "Failed to reject visitor");
    } finally {
      setLoading(false);
    }
  };

  const ring1Scale = ring1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.0],
  });
  const ring1Opacity = ring1Anim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.7, 0.4, 0],
  });
  const ring2Scale = ring2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.0],
  });
  const ring2Opacity = ring2Anim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.7, 0.4, 0],
  });
  const headerBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1a0000", "#3d0000"],
  });

  const purposeLabel = (pendingApproval.purpose ?? "visitor").toUpperCase();

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.root}>
        {/* Flashing alarm header */}
        <Animated.View style={[styles.alarmHeader, { backgroundColor: headerBg }]}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.alarmHeaderText}>VISITOR AT YOUR GATE</Text>
          <Ionicons name="warning" size={20} color="#EF4444" />
        </Animated.View>

        <View style={styles.body}>
          {/* Photo with expanding rings */}
          <View style={styles.photoWrap}>
            <Animated.View
              style={[
                styles.ring,
                { transform: [{ scale: ring1Scale }], opacity: ring1Opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.ring,
                { transform: [{ scale: ring2Scale }], opacity: ring2Opacity },
              ]}
            />
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              {pendingApproval.selfieUrl ? (
                <Image
                  source={{ uri: pendingApproval.selfieUrl }}
                  style={styles.selfie}
                />
              ) : (
                <View style={[styles.selfie, styles.selfiePlaceholder]}>
                  <Ionicons name="person" size={64} color="#475569" />
                </View>
              )}
            </Animated.View>
          </View>

          {/* Name */}
          <Text style={styles.visitorName}>{pendingApproval.visitorName}</Text>

          {/* Purpose badge */}
          <View style={styles.purposeBadge}>
            <Text style={styles.purposeText}>{purposeLabel}</Text>
          </View>

          {/* Mobile */}
          <Text style={styles.mobile}>{pendingApproval.visitorMobile}</Text>

          <View style={styles.divider} />

          {/* Action area */}
          {showRejectInput ? (
            <View style={styles.rejectBox}>
              <TextInput
                style={styles.rejectInput}
                placeholder="Reason for rejection..."
                placeholderTextColor="#64748b"
                value={rejectNote}
                onChangeText={setRejectNote}
                multiline
                autoFocus
              />
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={() => {
                    setShowRejectInput(false);
                    setRejectNote("");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.rejectBtn]}
                  onPress={handleReject}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Confirm Reject</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.prompt}>Allow entry to your home?</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.rejectBtn]}
                  onPress={() => {
                    Vibration.cancel();
                    setShowRejectInput(true);
                  }}
                  disabled={loading}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.approveBtn]}
                  onPress={handleApprove}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.btnText}>Let In</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  alarmHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 16,
    gap: 10,
  },
  alarmHeaderText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: 2.5,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  photoWrap: {
    width: PHOTO_SIZE + 80,
    height: PHOTO_SIZE + 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2.5,
    borderColor: "#EF4444",
  },
  selfie: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 3,
    borderColor: "#EF4444",
  },
  selfiePlaceholder: {
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  visitorName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 10,
  },
  purposeBadge: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#EF4444",
    marginBottom: 8,
  },
  purposeText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  mobile: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 20,
    fontWeight: "500",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#1e293b",
    marginBottom: 20,
  },
  prompt: {
    fontSize: 15,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  approveBtn: { backgroundColor: "#16a34a" },
  rejectBtn:  { backgroundColor: "#dc2626" },
  cancelBtn:  { backgroundColor: "#1e293b" },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtnText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
  },
  rejectBox: { width: "100%" },
  rejectInput: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: "top",
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
  },
});
