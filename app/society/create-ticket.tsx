import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../src/config";
import { societyStyles as styles } from "../../styles/society.styles";

export default function CreateTicketScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "maintenance",
    priority: "medium",
    description: "",
  });

  const categoryMap = [
    { label: "Maintenance", slug: "maintenance" },
    { label: "Electricity", slug: "electricity" },
    { label: "Plumbing", slug: "plumbing" },
    { label: "Cleaning", slug: "cleaning" },
    { label: "Security", slug: "security" },
    { label: "Internet", slug: "internet" },
    { label: "Other", slug: "other" },
  ];
  const priorities = [
    { label: "Low", slug: "low" },
    { label: "Medium", slug: "medium" },
    { label: "High", slug: "high" },
  ];

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert("Required Fields", "Please provide a title and description.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${config.apiUrl}/customer/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Alert.alert("Success ✅", "Your support ticket has been raised successfully.", [
          { text: "Great", onPress: () => router.back() },
        ]);
      } else {
        const error = await response.json();
        const detail = error.detail || "Failed to create ticket.";
        const isInvalidCategory = detail.toLowerCase().includes("invalid category");
        Alert.alert(
          "Error",
          isInvalidCategory
            ? "That category isn't available yet. Please select a different category."
            : detail
        );
      }
    } catch (error) {
      Alert.alert("Network Error", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={[styles.header, { flexDirection: "row", alignItems: "center" }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { fontSize: 20 }]}>New Ticket</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Briefly describe the issue"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {categoryMap.map((cat) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={[
                    styles.tab,
                    { flex: 0, paddingHorizontal: 16, marginRight: 8, marginBottom: 8 },
                    formData.category === cat.slug ? styles.activeTab : { backgroundColor: "#F1F5F9" },
                  ]}
                  onPress={() => setFormData({ ...formData, category: cat.slug })}
                >
                  <Text
                    style={[
                      styles.tabText,
                      formData.category === cat.slug && styles.activeTabText,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={{ flexDirection: "row" }}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.slug}
                  style={[
                    styles.tab,
                    { marginRight: 8 },
                    formData.priority === p.slug ? styles.activeTab : { backgroundColor: "#F1F5F9" },
                  ]}
                  onPress={() => setFormData({ ...formData, priority: p.slug })}
                >
                  <Text
                    style={[
                      styles.tabText,
                      formData.priority === p.slug && styles.activeTabText,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide more details about your request..."
              multiline
              numberOfLines={5}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Ticket</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
