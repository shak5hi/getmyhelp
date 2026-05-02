import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import {
  getForumPostDetail,
  reactToPost,
  reactToReply,
} from "../../src/api/communityApi";
import config from "../../src/config";
import { usePostSocket } from "../../hooks/usePostSocket";
import { communityStyles as styles } from "../../styles/community.styles";
import { EmojiReactionBar, Reaction } from "../../components/community/EmojiReactionBar";
import { ImageGallery } from "../../components/community/ImageGallery";
import { AuthorTag } from "../../components/community/AuthorTag";

const stripHtml = (html: string) =>
  (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Backend returns {emoji, count, mine} — map to Reaction type used by EmojiReactionBar
const buildReactions = (raw: any[]): Reaction[] =>
  (raw ?? []).map((r) => ({
    emoji: r.emoji,
    count: r.count ?? 0,
    reacted: r.mine ?? r.reacted ?? false,
  }));

const toggleReactionLocal = (reactions: any[], emoji: string): any[] => {
  const existing = reactions.find((r) => r.emoji === emoji);
  if (existing) {
    const updated = reactions.map((r) =>
      r.emoji === emoji
        ? { ...r, count: r.mine ? r.count - 1 : r.count + 1, mine: !r.mine }
        : r
    );
    return updated.filter((r) => r.count > 0);
  }
  return [...reactions, { emoji, count: 1, mine: true }];
};

const formatTime = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

export default function ForumThread() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [postReactions, setPostReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyImages, setReplyImages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const json = await getForumPostDetail(id);
      const item = json?.data?.post ?? json?.data ?? json?.post ?? json;
      setPost(item);
      setReplies(
        item?.replies ?? json?.data?.replies ?? json?.replies ?? []
      );
      setPostReactions(item?.reactions ?? []);
    } catch (e) {
      console.error("forum thread:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // WebSocket — backend uses "event" field not "type"
  usePostSocket(id ?? null, (msg) => {
    if (msg?.event === "new_reply" && msg?.data) {
      setReplies((prev) => [...prev, msg.data]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } else if (msg?.event === "delete_reply" && msg?.data?.id) {
      setReplies((prev) => prev.filter((r) => r.id !== msg.data.id));
    }
  });

  // ── Post reactions ────────────────────────────────────
  const handlePostReact = async (emoji: string) => {
    setPostReactions((prev) => toggleReactionLocal(prev, emoji));
    try {
      await reactToPost(id!, emoji);
    } catch {}
  };

  // ── Reply reactions ───────────────────────────────────
  const handleReplyReact = async (replyId: string, emoji: string) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, reactions: toggleReactionLocal(r.reactions ?? [], emoji) }
          : r
      )
    );
    try {
      await reactToReply(replyId, emoji);
    } catch {}
  };

  // ── Reply images ──────────────────────────────────────
  const pickReplyImage = async () => {
    if (replyImages.length >= 3) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setReplyImages((prev) =>
        [...prev, ...result.assets].slice(0, 3)
      );
    }
  };

  // ── Send reply ────────────────────────────────────────
  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("content", text);

      const res = await fetch(
        `${config.apiUrl}/customer/forum/posts/${id}/replies`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token ?? ""}` },
          body: formData,
        }
      );

      let newReply: any = {
        content: text,
        created_at: new Date().toISOString(),
        reactions: [],
      };
      try {
        const json = await res.json();
        newReply = json?.data?.reply ?? json?.reply ?? json?.data ?? newReply;
        if (!newReply.reactions) newReply.reactions = [];
      } catch {}

      setReplies((prev) => [...prev, newReply]);
      setReplyText("");
      setReplyImages([]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error("reply:", e);
      Alert.alert("Error", "Could not send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={[styles.detailContainer, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  const postImages =
    post?.images ??
    post?.attachments?.filter((a: any) =>
      (a.file_type ?? a.type ?? "").startsWith("image")
    ) ??
    [];

  const renderReply = ({ item }: { item: any }) => (
    <View style={styles.replyCard}>
      <AuthorTag
        name={
          item.author_name ??
          item.author?.name ??
          item.user?.name ??
          item.created_by?.name ??
          "Member"
        }
        timestamp={item.created_at ?? ""}
      />
      <Text style={styles.replyText}>
        {stripHtml(item.content ?? item.body ?? item.text ?? "")}
      </Text>
      {Array.isArray(item.reactions) && (
        <EmojiReactionBar
          reactions={buildReactions(item.reactions)}
          onReact={(emoji) => handleReplyReact(item.id, emoji)}
        />
      )}
    </View>
  );

  const ListHeader = (
    <View style={{ padding: 16, paddingBottom: 8 }}>
      {/* Author */}
      {(post?.author_name || post?.author?.name || post?.created_by?.name) && (
        <View style={{ marginBottom: 12 }}>
          <AuthorTag
            name={post.author_name ?? post.author?.name ?? post.created_by?.name}
            timestamp={post.created_at ?? ""}
          />
        </View>
      )}

      {/* Post content */}
      <Text style={styles.detailBody}>
        {stripHtml(post?.content ?? post?.body ?? "")}
      </Text>

      {/* Post images */}
      {postImages.length > 0 && <ImageGallery images={postImages} />}

      {/* Post reactions */}
      <EmojiReactionBar
        reactions={buildReactions(postReactions)}
        onReact={handlePostReact}
      />

      <View style={styles.divider} />

      {replies.length > 0 && (
        <Text style={styles.sectionLabel}>
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.detailContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatRef}
          data={replies}
          keyExtractor={(item, i) =>
            item?.id != null ? String(item.id) : `reply-${i}`
          }
          ListHeaderComponent={ListHeader}
          renderItem={renderReply}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#9CA3AF", padding: 16 }}
            >
              No replies yet. Be the first!
            </Text>
          }
        />

        {/* Reply images preview */}
        {replyImages.length > 0 && (
          <View style={[styles.imagePickerRow, { paddingHorizontal: 12, paddingTop: 8 }]}>
            {replyImages.map((img, i) => (
              <View key={i} style={styles.imagePickerThumb}>
                <Image source={{ uri: img.uri }} style={styles.imagePickerThumbImg} />
                <TouchableOpacity
                  style={styles.imageRemove}
                  onPress={() =>
                    setReplyImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  <Ionicons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Reply bar */}
        <View style={styles.replyBar}>
          <TouchableOpacity onPress={pickReplyImage} style={{ padding: 4 }}>
            <Ionicons
              name="image-outline"
              size={22}
              color={replyImages.length >= 3 ? "#D1D5DB" : "#6366F1"}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply…"
            placeholderTextColor="#9CA3AF"
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.replySendBtn,
              (!replyText.trim() || sending) && { backgroundColor: "#C7D2FE" },
            ]}
            onPress={sendReply}
            disabled={!replyText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
