import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { dashboardStyles as styles } from "../styles/dashboard.styles";

export default function DashboardScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* GREETING */}
      <Text style={styles.greeting}>Good Morning, Shakshi!</Text>
      <Text style={styles.subGreeting}>
        Here's your home help overview.
      </Text>

      {/* HERO CARD */}
      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.heroLabel}>Your Maid</Text>
          <Text style={styles.heroName}>Aaradhya Singh</Text>
          <Text style={styles.heroRole}>Everyday Maid</Text>
          <Text style={styles.heroDate}>Entry: 07 Jul 2024</Text>

          <Pressable style={styles.heroButton}>
            <Text style={styles.heroButtonText}>View Details</Text>
          </Pressable>
        </View>

        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=47" }}
          style={styles.heroImage}
        />
      </View>

      {/* BACKUP CARD */}
      <View style={styles.backupCard}>
        <Text style={styles.backupNumber}>12</Text>
        <View>
          <Text style={styles.backupLabel}>Backup days left</Text>
          <Pressable>
            <Text style={styles.backupAction}>Request Backup</Text>
          </Pressable>
        </View>
      </View>

      {/* ACTIVE MAIDS */}
      <Text style={styles.sectionTitle}>Active Maids</Text>

      {[
        { name: "Anjali", role: "Househelp" },
        { name: "Sunita", role: "Cook" },
      ].map((maid) => (
        <Pressable key={maid.name} style={styles.maidRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.maidAvatar}
          />
          <View>
            <Text style={styles.maidName}>{maid.name}</Text>
            <Text style={styles.maidRole}>{maid.role}</Text>
          </View>
        </Pressable>
      ))}

      {/* TIMELINE */}
      <Text style={styles.sectionTitle}>Today's Timeline</Text>

      <View style={styles.timelineItem}>
        <Text style={styles.timelineTime}>09:02 AM</Text>
        <Text style={styles.timelineText}>
          Anjali (Househelp) Entered
        </Text>
      </View>

      <View style={styles.timelineItem}>
        <Text style={styles.timelineTime}>08:30 AM</Text>
        <Text style={styles.timelineText}>
          Society Alert: Water Supply
        </Text>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickActions}>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>Add New Maid</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>Request Replacement</Text>
        </Pressable>
      </View>

      <Pressable style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>Emergency Help</Text>
      </Pressable>
    </ScrollView>
  );
}
