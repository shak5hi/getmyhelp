import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../src/config";
import { styles } from "../../styles/settings.styles";

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const [backupDays, setBackupDays] = useState<number | string>("—");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const customerId = user?.id;
      const token = await AsyncStorage.getItem("access_token");

      if (customerId && token) {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Check for backup days via subscription route
        const subRes = await fetch(`${config.apiUrl}/admin/customers/${customerId}/subscriptions`, { headers });
        const subData = await subRes.json();
        
        const activeSub = subData?.subscriptions?.find((s: any) => s.status === "active");
        if (activeSub && activeSub.days_remaining !== undefined) {
          setBackupDays(activeSub.days_remaining);
        }
      }
    } catch (error) {
      console.log("Error loading info for settings", error);
    }
  };

  const handleAction = (title: string) => {
    Alert.alert(
      title, 
      "To update these details securely, please contact our support team. The interface logic will be tied here later.",
      [{ text: "Okay" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subHeader}>Configure app preferences and view data</Text>

        {/* --- NOTIFICATIONS SECTION --- */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconPrimary]}>
                 <Ionicons name="notifications-outline" size={20} color="#111827" />
               </View>
               <Text style={styles.settingTitle}>Push Notifications</Text>
             </View>
             <Switch
                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                thumbColor={"#FFFFFF"}
                onValueChange={() => setPushEnabled(prev => !prev)}
                value={pushEnabled}
             />
          </View>
          
          <View style={styles.settingRow}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconPrimary]}>
                 <Ionicons name="mail-outline" size={20} color="#111827" />
               </View>
               <Text style={styles.settingTitle}>Email Alerts</Text>
             </View>
             <Switch
                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                thumbColor={"#FFFFFF"}
                onValueChange={() => setEmailEnabled(prev => !prev)}
                value={emailEnabled}
             />
          </View>

          <View style={[styles.settingRow, styles.settingRowNoBorder]}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconPrimary]}>
                 <Ionicons name="chatbubble-outline" size={20} color="#111827" />
               </View>
               <Text style={styles.settingTitle}>SMS Updates</Text>
             </View>
             <Switch
                trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                thumbColor={"#FFFFFF"}
                onValueChange={() => setSmsEnabled(prev => !prev)}
                value={smsEnabled}
             />
          </View>
        </View>

        {/* --- ACCOUNT DETAILS --- */}
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={() => handleAction("Change Phone Number")}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconPrimary]}>
                 <Ionicons name="call-outline" size={20} color="#111827" />
               </View>
               <Text style={styles.settingTitle}>Change Phone Number</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, styles.settingRowNoBorder]} onPress={() => handleAction("Update Address")}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconPrimary]}>
                 <Ionicons name="location-outline" size={20} color="#111827" />
               </View>
               <Text style={styles.settingTitle}>Update Address</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* --- SUPPORT & SERVICE --- */}
        <Text style={styles.sectionTitle}>Service & Support</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconWarning]}>
                 <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
               </View>
               <Text style={styles.settingTitle}>Backup Days Remaining</Text>
             </View>
             <Text style={styles.settingValueText}>{backupDays}</Text>
          </View>

          <TouchableOpacity style={[styles.settingRow, styles.settingRowNoBorder]} onPress={() => handleAction("Language Settings")}>
             <View style={styles.settingRowLeft}>
               <View style={[styles.iconContainer, styles.iconInfo]}>
                 <Ionicons name="language-outline" size={20} color="#4F46E5" />
               </View>
               <Text style={styles.settingTitle}>Language Settings</Text>
             </View>
             <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* --- APP INFO --- */}
        <Text style={styles.versionText}>GetMyHelp v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}