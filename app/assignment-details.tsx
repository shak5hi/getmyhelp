import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const DAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AssignmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
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
        <ActivityIndicator size="large" color="#111827" />
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
          <Ionicons name="star" size={16} color="#F59E0B" />
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
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <View style={styles.scheduleContent}>
            <Text style={styles.infoLabel}>Days of Week</Text>
            <Text style={styles.infoValue}>
              {assignment.days_of_week?.map((d: number) => DAYS_MAP[d]).join(", ")}
            </Text>
          </View>
        </View>
        
        <View style={styles.scheduleDivider} />
        
        <View style={styles.scheduleRow}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
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
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
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
          <Ionicons name="call" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactLabel}>Phone Number</Text>
          <Text style={styles.contactValue}>+91 {provider.phone}</Text>
        </View>
        <Ionicons name="chatbox-ellipses-outline" size={24} color="#111827" />
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
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
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  role: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },
  experienceText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  statusLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: "#D1FAE5",
  },
  statusInactive: {
    backgroundColor: "#F3F4F6",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#374151",
    letterSpacing: -0.2,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
    marginLeft: 32,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "700",
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
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4338CA",
    marginLeft: 6,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contactLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});
