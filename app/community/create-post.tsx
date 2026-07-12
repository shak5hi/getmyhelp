import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useMemo } from "react";
import { createForumPost } from "../../src/api/communityApi";
import { makeStyles } from "../../styles/community.styles";
import { useTheme } from "../../src/ThemeContext";

type PickedImage = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

export default function CreatePost() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const picked: PickedImage[] = result.assets.map((a) => ({
        uri: a.uri,
        fileName: a.fileName ?? undefined,
        mimeType: a.mimeType ?? undefined,
      }));
      setImages((prev) => [...prev, ...picked].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Required", "Please write something before posting.");
      return;
    }
    setSubmitting(true);
    try {
      await createForumPost(content.trim(), images);
      router.back();
    } catch (e) {
      console.error("create post:", e);
      Alert.alert("Error", "Could not create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = content.trim().length > 0 && !submitting;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.detailContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.createField, styles.createFieldMulti]}
            placeholder="What's on your mind? Share with your society…"
            placeholderTextColor={theme.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>
            Photos ({images.length}/5)
          </Text>
          <View style={styles.imagePickerRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imagePickerThumb}>
                <Image source={{ uri: img.uri }} style={styles.imagePickerThumbImg} />
                <TouchableOpacity
                  style={styles.imageRemove}
                  onPress={() => removeImage(i)}
                >
                  <Ionicons name="close" size={12} color={theme.onAccent} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.imagePickerAdd} onPress={pickImage}>
                <Ionicons name="camera-outline" size={22} color={theme.accent} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.onAccent} />
            ) : (
              <Text style={styles.submitBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
