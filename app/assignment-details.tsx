import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../constants/tokens";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../src/config";
import { useTheme } from "../src/ThemeContext";
import { Theme } from "../constants/themes";
import { getToken } from "../src/api/tokenStore";

const DAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AssignmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${config.apiUrl}/customer/assignments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAssignment(result.data);
      }
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Assignment not found</Text>
      </View>
    );
  }

  const { provider } = assignment;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Provider Info Header */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: provider.profile_image || "https://i.pravatar.cc/150?img=47" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{provider.first_name} {provider.last_name}</Text>
        <Text style={styles.role}>{assignment.assigned_services?.join(" • ")}</Text>
        
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color={theme.warning} />
          <Text style={styles.ratingText}>{provider.rating || "N/A"}</Text>
          <View style={styles.dot} />
          <Text style={styles.experienceText}>{provider.years_experience} Years Exp.</Text>
        </View>
      </View>

      {/* Assignment Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={[styles.statusBadge, assignment.status === 'active' ? styles.statusActive : styles.statusInactive]}>
            <Text style={styles.statusBadgeText}>{assignment.status?.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Started On</Text>
          <Text style={styles.statusValue}>
            {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
          </Text>
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Working Schedule</Text>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.scheduleRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
          <View style={styles.scheduleContent}>
            <Text style={styles.infoLabel}>Days of Week</Text>
            <Text style={styles.infoValue}>
              {assignment.days_of_week?.map((d: number) => DAYS_MAP[d]).join(", ")}
            </Text>
          </View>
        </View>
        
        <View style={styles.scheduleDivider} />
        
        <View style={styles.scheduleRow}>
          <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
          <View style={styles.scheduleContent}>
            <Text style={styles.infoLabel}>Time Slots</Text>
            <Text style={styles.infoValue}>
              {assignment.assigned_time_slots?.join(", ")}
            </Text>
          </View>
        </View>
      </View>

      {/* Services Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Services Provided</Text>
      </View>
      
      <View style={styles.servicesGrid}>
        {assignment.assigned_services?.map((service: string, index: number) => (
          <View key={index} style={styles.serviceChip}>
            <Ionicons name="checkmark-circle" size={18} color={theme.success} />
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>

      {/* Contact Info */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Contact</Text>
      </View>
      
      <Pressable style={styles.contactCard}>
        <View style={styles.contactIcon}>
          <Ionicons name="call" size={20} color={theme.onAccent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactLabel}>Phone Number</Text>
          <Text style={styles.contactValue}>+91 {provider.phone}</Text>
        </View>
        <Ionicons name="chatbox-ellipses-outline" size={24} color={theme.text} />
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  content: {
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: t.danger,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: t.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  name: {
    fontSize: 24,
    fontFamily: fonts.extrabold,
    color: t.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 15,
    color: t.textSecondary,
    fontFamily: fonts.medium,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.border,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: t.text,
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.textTertiary,
    marginHorizontal: 8,
  },
  experienceText: {
    fontSize: 13,
    color: t.textSecondary,
    fontFamily: fonts.semibold,
  },
  statusCard: {
    backgroundColor: t.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: t.border,
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: t.border,
  },
  statusLabel: {
    fontSize: 12,
    color: t.textTertiary,
    textTransform: "uppercase",
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: t.successTint,
  },
  statusInactive: {
    backgroundColor: t.surfaceAlt,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: fonts.extrabold,
    color: t.success,
  },
  statusValue: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: t.text,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: t.text,
    letterSpacing: -0.2,
  },
  infoCard: {
    backgroundColor: t.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: t.border,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  scheduleContent: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: t.surfaceAlt,
    marginVertical: 16,
    marginLeft: 32,
  },
  infoLabel: {
    fontSize: 13,
    color: t.textSecondary,
    fontFamily: fonts.semibold,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: t.text,
    fontFamily: fonts.bold,
    lineHeight: 22,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  serviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.accentTint,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.accentTint,
  },
  serviceText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: t.accent,
    marginLeft: 6,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.card,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.border,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: t.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 12,
    color: t.textSecondary,
    fontFamily: fonts.semibold,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: t.text,
  },
});
