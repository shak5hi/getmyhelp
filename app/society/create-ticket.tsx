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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import config from "../../src/config";
import { societyStyles as styles } from "../../styles/society.styles";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

export default function CreateTicketScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("maintenance");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState<"common" | "private">("private");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<ImagePicker.ImagePickerAsset[]>([]);

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

  const pickImages = async () => {
    if (attachments.length >= MAX_FILES) {
      Alert.alert("Limit Reached", `You can attach a maximum of ${MAX_FILES} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow photo access to attach images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: MAX_FILES - attachments.length,
    });

    if (result.canceled) return;

    const valid: ImagePicker.ImagePickerAsset[] = [];
    for (const asset of result.assets) {
      const sizeBytes = asset.fileSize ?? 0;
      if (sizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
        Alert.alert("File Too Large", `"${asset.fileName ?? "Image"}" exceeds ${MAX_FILE_SIZE_MB}MB and was skipped.`);
        continue;
      }
      const ext = (asset.fileName ?? "").toLowerCase();
      if (!ext.endsWith(".jpg") && !ext.endsWith(".jpeg") && !ext.endsWith(".png")) {
        const mime = asset.mimeType ?? "";
        if (!mime.includes("jpeg") && !mime.includes("png")) {
          Alert.alert("Invalid Format", `Only JPG and PNG images are allowed.`);
          continue;
        }
      }
      valid.push(asset);
    }

    setAttachments((prev) => [...prev, ...valid].slice(0, MAX_FILES));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please provide a title for the ticket.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("type", type);
      if (description.trim()) formData.append("description", description.trim());

      attachments.forEach((asset, index) => {
        const fileName = asset.fileName ?? `attachment_${index}.jpg`;
        const mimeType = asset.mimeType ?? "image/jpeg";
        formData.append("attachments", {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        } as any);
      });

      const response = await fetch(`${config.apiUrl}/customer/tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Success ✅", "Your support ticket has been raised successfully.", [
          { text: "Done", onPress: () => router.back() },
        ]);
      } else {
        const error = await response.json().catch(() => ({}));
        const detail = error.detail || "Failed to create ticket.";
        const isInvalidCategory = detail.toLowerCase().includes("invalid category");
        Alert.alert(
          "Error",
          isInvalidCategory
            ? "That category isn't available yet. Please select a different category."
            : detail
        );
      }
    } catch {
      Alert.alert("Network Error", "Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
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
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Briefly describe the issue"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {categoryMap.map((cat) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={[
                    styles.tab,
                    { flex: 0, paddingHorizontal: 16, marginRight: 8, marginBottom: 8 },
                    category === cat.slug ? styles.activeTab : { backgroundColor: "#E5E7EB" },
                  ]}
                  onPress={() => setCategory(cat.slug)}
                >
                  <Text style={[styles.tabText, category === cat.slug && styles.activeTabText]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority *</Text>
            <View style={{ flexDirection: "row" }}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.slug}
                  style={[
                    styles.tab,
                    { marginRight: 8 },
                    priority === p.slug ? styles.activeTab : { backgroundColor: "#E5E7EB" },
                  ]}
                  onPress={() => setPriority(p.slug)}
                >
                  <Text style={[styles.tabText, priority === p.slug && styles.activeTabText]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Visibility / Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visibility *</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === "private" && styles.typeButtonActive,
                ]}
                onPress={() => setType("private")}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={type === "private" ? "#111827" : "#9CA3AF"}
                />
                <Text style={[styles.typeButtonText, type === "private" && styles.typeButtonTextActive]}>
                  Private
                </Text>
                <Text style={styles.typeButtonSub}>Only you & admins</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === "common" && styles.typeButtonActive,
                ]}
                onPress={() => setType("common")}
              >
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={type === "common" ? "#111827" : "#9CA3AF"}
                />
                <Text style={[styles.typeButtonText, type === "common" && styles.typeButtonTextActive]}>
                  Common
                </Text>
                <Text style={styles.typeButtonSub}>All society members</Text>
              </TouchableOpacity>
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
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Attachments */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Attachments{" "}
              <Text style={{ color: "#9CA3AF", textTransform: "none", fontSize: 11 }}>
                (JPG/PNG · max 5 · 10MB each)
              </Text>
            </Text>

            {attachments.length > 0 && (
              <View style={styles.attachmentPreviewRow}>
                {attachments.map((asset, index) => (
                  <View key={index} style={styles.attachmentThumb}>
                    <Image source={{ uri: asset.uri }} style={styles.attachmentThumbImage} />
                    <TouchableOpacity
                      style={styles.attachmentRemove}
                      onPress={() => removeAttachment(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {attachments.length < MAX_FILES && (
              <TouchableOpacity style={styles.attachmentPicker} onPress={pickImages}>
                <Ionicons name="image-outline" size={22} color="#6366F1" />
                <Text style={styles.attachmentPickerText}>
                  {attachments.length === 0 ? "Add Photos" : `Add More (${attachments.length}/${MAX_FILES})`}
                </Text>
              </TouchableOpacity>
            )}
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
