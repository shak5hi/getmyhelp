import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../constants/tokens";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, FlatList, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthorTag } from "../../components/community/AuthorTag";
import { EmojiReactionBar, Reaction } from "../../components/community/EmojiReactionBar";
import { ImageGallery } from "../../components/community/ImageGallery";
import { ErrorState } from "../../components/ui/ErrorState";
import { usePostSocket } from "../../hooks/usePostSocket";
import {
  createReply,
  editPost,
  editReply,
  getForumPostDetail,
  reactToPost,
  reactToReply,
  reportPost,
  reportReply,
} from "../../src/api/communityApi";
import { makeStyles } from "../../styles/community.styles";
import { useTheme } from "../../src/ThemeContext";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";

const stripHtml = (html: string) =>
  (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

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

type ActionModal = {
  visible: boolean;
  mode: "edit" | "report";
  type: "post" | "reply";
  id: string;
  content: string;
};

const isMine = (r: any, uid: string | null) =>
  r.is_mine === true ||
  r._isOwn === true ||
  (!!uid && String(r.author_id ?? r.replied_by_customer_id ?? r.customer_id ?? r.author?.id ?? "") === uid);

// Recursively flatten reply tree (child_replies nested inside each reply)
const flattenReplies = (list: any[]): any[] => {
  const out: any[] = [];
  for (const r of list) {
    out.push(r);
    if (Array.isArray(r.child_replies) && r.child_replies.length > 0) {
      out.push(...flattenReplies(r.child_replies));
    }
  }
  return out;
};

export default function ForumThread() {
  useFeatureGuard(MODULES.community);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [postReactions, setPostReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyImages, setReplyImages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [emojiPickerTargetId, setEmojiPickerTargetId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string; text: string } | null>(null);
  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [bannerText, setBannerText] = useState("");
  const bannerAnim = useRef(new Animated.Value(-56)).current;
  const bannerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatRef = useRef<FlatList>(null);
  const inputRef = useRef<any>(null);

  // O(1) lookup for quoted messages — rebuilt whenever replies change
  const repliesById = useMemo(() => {
    const m = new Map<string, any>();
    replies.forEach((r) => { if (r.id) m.set(String(r.id), r); });
    return m;
  }, [replies]);

  const markOwn = (list: any[], uid: string | null) =>
    list.map((r) => ({
      ...r,
      content: r.content ?? r.body ?? "",
      _isOwn: isMine(r, uid),
    }));

  const showBanner = (text: string) => {
    if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
    setBannerText(text);
    Animated.timing(bannerAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    bannerTimeout.current = setTimeout(() => {
      Animated.timing(bannerAnim, { toValue: -56, duration: 280, useNativeDriver: true }).start();
    }, 3500);
  };

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Ensure we have userId before processing replies
      let uid = currentUserIdRef.current;
      if (!uid) {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          uid = String(JSON.parse(userStr).id);
          currentUserIdRef.current = uid;
          setCurrentUserId(uid);
        }
      }
      const json = await getForumPostDetail(id);
      const item = json?.data?.post ?? json?.data ?? json?.post ?? json;
      setPost(item);
      const rawReplies = item?.replies ?? json?.data?.replies ?? json?.replies ?? [];
      const flat = flattenReplies(rawReplies).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setReplies(markOwn(flat, uid));
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

  useEffect(() => {
    (async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const uid = String(JSON.parse(userStr).id);
          currentUserIdRef.current = uid;
          setCurrentUserId(uid);
          setReplies((prev) => markOwn(prev, uid));
        }
      } catch { }
    })();
  }, []);

  usePostSocket(id ?? null, (msg) => {
    if (msg?.event === "new_reply" && msg?.data) {
      const incoming = msg.data;
      const incomingId = incoming.id != null ? String(incoming.id) : null;
      const uid = currentUserIdRef.current;

      const incomingText = incoming.content ?? incoming.body ?? "";
      const own = isMine(incoming, uid);

      setReplies((prev) => {
        // Dedup by server ID
        if (incomingId) {
          const existingIdx = prev.findIndex(
            (r) => r.id != null && String(r.id) === incomingId
          );
          if (existingIdx !== -1) {
            return prev.map((r, i) =>
              i === existingIdx
                ? { ...incoming, content: incomingText, _isOwn: r._isOwn || own, _pending: false }
                : r
            );
          }
        }
        // Replace our own pending optimistic reply by content match
        const pendingIdx = prev.findIndex(
          (r) => r._pending && r._isOwn && r.id == null && r.content === incomingText
        );
        if (pendingIdx !== -1) {
          return prev.map((r, i) =>
            i === pendingIdx
              ? { ...incoming, content: incomingText, _isOwn: true, _pending: false }
              : r
          );
        }
        // Genuinely new reply from someone else — show banner
        if (!own) {
          const senderName =
            incoming.author_name ?? incoming.author?.name ?? incoming.user?.name ?? "Someone";
          showBanner(`💬 ${senderName}: ${incomingText.slice(0, 60)}`);
        }
        return [...prev, { ...incoming, content: incomingText, _isOwn: own }];
      });
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } else if (msg?.event === "delete_reply" && msg?.data?.id) {
      setReplies((prev) => prev.filter((r) => r.id !== msg.data.id));
    }
  });

  const handlePostReact = async (emoji: string) => {
    setPostReactions((prev) => toggleReactionLocal(prev, emoji));
    try { await reactToPost(id!, emoji); } catch { }
  };

  const handleReplyReact = async (replyId: string, emoji: string) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, reactions: toggleReactionLocal(r.reactions ?? [], emoji) }
          : r
      )
    );
    try { await reactToReply(replyId, emoji); } catch { }
  };

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
      setReplyImages((prev) => [...prev, ...result.assets].slice(0, 3));
    }
  };

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text || sending) return;
    const uid = currentUserIdRef.current ?? currentUserId;
    const parentId = replyingTo?.id;
    setReplyingTo(null);
    setSending(true);
    // Optimistic: add immediately on the right
    const optimistic: any = {
      content: text,
      created_at: new Date().toISOString(),
      reactions: [],
      author_id: uid,
      is_mine: true,
      _isOwn: true,
      _pending: true,
      parent_reply_id: parentId ?? null,
      _quotedAuthor: replyingTo?.name ?? null,
      _quotedText: replyingTo?.text ?? null,
    };
    setReplies((prev) => [...prev, optimistic]);
    setReplyText("");
    setReplyImages([]);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      const json = await createReply(id!, text, replyImages, parentId);
      const serverReply = json?.data?.reply ?? json?.reply ?? json?.data;
      const hasValidReply =
        serverReply &&
        typeof serverReply === "object" &&
        (serverReply.id || serverReply.body || serverReply.content);
      if (hasValidReply) {
        // Normalise: always store text in `content` for display consistency
        const normalised = {
          ...serverReply,
          content: serverReply.body ?? serverReply.content ?? text,
          _isOwn: true,
          _pending: false,
          replied_by_customer_id: uid,
        };
        setReplies((prev) =>
          prev.map((r) => (r._pending && r.content === text ? normalised : r))
        );
      } else {
        // API returned no reply object — keep optimistic, just clear _pending
        setReplies((prev) =>
          prev.map((r) =>
            r._pending && r.content === text ? { ...r, _pending: false } : r
          )
        );
      }
    } catch (e) {
      console.error("sendReply error:", e);
      setReplies((prev) => prev.filter((r) => !(r._pending && r.content === text)));
      setReplyText(text);
      Alert.alert("Error", "Could not send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const startReplyTo = (item: any) => {
    setReplyingTo({
      id: String(item.id),
      name: item.author_name ?? item.author?.name ?? "Member",
      text: stripHtml(item.content ?? "").slice(0, 80),
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleLongPress = (type: "post" | "reply", item: any) => {
    const isOwn = isMine(item, currentUserId);
    const buttons: any[] = [];

    if (type === "reply") {
      buttons.push({
        text: "Reply",
        onPress: () => startReplyTo(item),
      });
    }
    if (isOwn) {
      buttons.push({
        text: "Edit",
        onPress: () =>
          setActionModal({
            visible: true,
            mode: "edit",
            type,
            id: String(item.id),
            content: stripHtml(item.content ?? ""),
          }),
      });
    } else {
      buttons.push({
        text: "Report",
        style: "destructive" as const,
        onPress: () =>
          setActionModal({
            visible: true,
            mode: "report",
            type,
            id: String(item.id),
            content: "",
          }),
      });
    }
    buttons.push({ text: "Cancel", style: "cancel" as const });
    Alert.alert("", undefined, buttons);
  };

  const handleActionSubmit = async () => {
    if (!actionModal) return;
    const { mode, type, id: itemId, content } = actionModal;
    setActionModal(null);
    try {
      if (mode === "edit") {
        if (type === "post") {
          await editPost(itemId, content);
          setPost((prev: any) =>
            prev ? { ...prev, content } : prev
          );
        } else {
          await editReply(itemId, content);
          setReplies((prev) =>
            prev.map((r) => (String(r.id) === itemId ? { ...r, content } : r))
          );
        }
      } else {
        if (type === "post") {
          await reportPost(itemId, content);
        } else {
          await reportReply(itemId, content);
        }
        Alert.alert("Reported", "Thank you for your feedback.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={[styles.detailContainer, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
      </SafeAreaView>
    );
  }

  const postImages =
    post?.images ??
    post?.attachments?.filter((a: any) =>
      (a.file_type ?? a.type ?? "").startsWith("image")
    ) ??
    [];

  const getInitials = (name: string) =>
    (name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const renderReply = ({ item }: { item: any }) => {
    const isOwn = isMine(item, currentUserId);
    const authorName =
      item.author_name ??
      item.author?.name ??
      item.user?.name ??
      item.created_by?.name ??
      "Member";
    const timeStr = (() => {
      try {
        return new Date(item.created_at ?? "").toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch { return ""; }
    })();

    // Resolve quoted message: prefer live data from map, fall back to optimistic fields
    const parentReply = item.parent_reply_id
      ? repliesById.get(String(item.parent_reply_id))
      : null;
    const quotedAuthor =
      parentReply?.author_name ?? item._quotedAuthor ?? null;
    const quotedText = parentReply
      ? stripHtml(parentReply.content ?? "").slice(0, 100)
      : item._quotedText ?? null;
    const hasQuote = !!(quotedAuthor || quotedText);

    const iconColor = isOwn ? "rgba(255,255,255,0.65)" : "#9CA3AF";
    const reactions = buildReactions(item.reactions ?? []);
    const replyId = String(item.id);

    return (
      <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
        {!isOwn && (
          <View style={styles.bubbleAvatar}>
            <Text style={styles.bubbleAvatarText}>{getInitials(authorName)}</Text>
          </View>
        )}

        <View style={{ maxWidth: "75%" }}>
          {/* Bubble */}
          <TouchableOpacity
            style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
            onLongPress={() => handleLongPress("reply", item)}
            delayLongPress={350}
            activeOpacity={0.85}
          >
            {!isOwn && <Text style={styles.bubbleAuthor}>{authorName}</Text>}

            {hasQuote && (
              <View style={[styles.quotedBox, isOwn && styles.quotedBoxOwn]}>
                {quotedAuthor && (
                  <Text style={[styles.quotedAuthor, isOwn && styles.quotedAuthorOwn]}>
                    {quotedAuthor}
                  </Text>
                )}
                {quotedText ? (
                  <Text style={[styles.quotedText, isOwn && styles.quotedTextOwn]} numberOfLines={2}>
                    {quotedText}
                  </Text>
                ) : null}
              </View>
            )}

            <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
              {stripHtml(item.content ?? item.body ?? item.text ?? "")}
            </Text>

            {/* Time + actions */}
            <View style={styles.bubbleFooter}>
              <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>{timeStr}</Text>
              <View style={styles.bubbleActions}>
                <TouchableOpacity
                  onPress={() => setEmojiPickerTargetId(replyId)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Text style={{ fontSize: 12 }}>😊</Text>
                </TouchableOpacity>
                {isOwn && (
                  <TouchableOpacity
                    onPress={() =>
                      setActionModal({
                        visible: true,
                        mode: "edit",
                        type: "reply",
                        id: replyId,
                        content: stripHtml(item.content ?? ""),
                      })
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Ionicons name="pencil-outline" size={12} color={iconColor} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => startReplyTo(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Ionicons name="return-down-back-outline" size={13} color={iconColor} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Reaction pills below the bubble — only when reactions exist */}
          {reactions.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {reactions.filter(r => r.count > 0).map(r => (
                <TouchableOpacity
                  key={r.emoji}
                  onPress={() => handleReplyReact(replyId, r.emoji)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 3,
                    backgroundColor: r.reacted ? "#EEF2FF" : "#F3F4F6",
                    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
                    borderWidth: 1, borderColor: r.reacted ? "#6366F1" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{r.emoji}</Text>
                  <Text style={{ fontSize: 11, fontFamily: fonts.semibold, color: r.reacted ? "#6366F1" : "#6B7280" }}>
                    {r.count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const ListHeader = (
    <View style={{ padding: 16, paddingBottom: 8 }}>
      <TouchableOpacity
        onLongPress={() => post && handleLongPress("post", post)}
        delayLongPress={500}
        activeOpacity={1}
      >
        {(post?.author_name || post?.author?.name || post?.created_by?.name) && (
          <View style={{ marginBottom: 12 }}>
            <AuthorTag
              name={post.author_name ?? post.author?.name ?? post.created_by?.name}
              timestamp={post.created_at ?? ""}
            />
          </View>
        )}
        <Text style={styles.detailBody}>
          {stripHtml(post?.content ?? post?.body ?? "")}
        </Text>
        {postImages.length > 0 && <ImageGallery images={postImages} />}
      </TouchableOpacity>

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
      {/* In-app notification banner */}
      <Animated.View
        style={[bannerStyles.banner, { transform: [{ translateY: bannerAnim }] }]}
        pointerEvents="none"
      >
        <Ionicons name="chatbubble-outline" size={14} color={theme.onAccent} />
        <Text style={bannerStyles.bannerText} numberOfLines={1}>{bannerText}</Text>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <FlatList
          ref={flatRef}
          data={replies}
          keyExtractor={(item, i) =>
            item?.id != null ? String(item.id) : `reply-${i}`
          }
          ListHeaderComponent={ListHeader}
          renderItem={renderReply}
          contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 8, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#9CA3AF", padding: 24, fontSize: 14 }}
            >
              No replies yet. Be the first!
            </Text>
          }
        />

        {/* Replying-to preview */}
        {replyingTo && (
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "#EFF6FF", borderTopWidth: 1, borderTopColor: "#BFDBFE",
            paddingHorizontal: 14, paddingVertical: 8, gap: 8,
          }}>
            <Ionicons name="return-down-back-outline" size={16} color="#1D4ED8" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: "#1D4ED8" }}>
                Replying to {replyingTo.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#4B5563" }} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

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
                  <Ionicons name="close" size={12} color={theme.onAccent} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.replyBar}>
          <TouchableOpacity
            onPress={pickReplyImage}
            style={{ padding: 6 }}
            disabled={replyImages.length >= 3}
          >
            <Ionicons
              name="image-outline"
              size={22}
              color={replyImages.length >= 3 ? theme.textTertiary : theme.accent}
            />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.replyInput}
            placeholder={replyingTo ? `Reply to ${replyingTo.name}…` : "Write a reply…"}
            placeholderTextColor={theme.textTertiary}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="center"
          />

          <TouchableOpacity
            style={[
              styles.replySendBtn,
              (!replyText.trim() || sending) && { backgroundColor: "#C7D2FE" },
            ]}
            onPress={sendReply}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.onAccent} />
            ) : (
              <Ionicons name="send" size={18} color={theme.onAccent} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Edit / Report modal */}
      <Modal
        visible={actionModal?.visible ?? false}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModal(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <Text style={modalStyles.title}>
              {actionModal?.mode === "edit" ? "Edit" : "Report Content"}
            </Text>
            <TextInput
              style={modalStyles.input}
              value={actionModal?.content ?? ""}
              onChangeText={(t) =>
                setActionModal((prev) => (prev ? { ...prev, content: t } : prev))
              }
              multiline
              placeholder={
                actionModal?.mode === "edit"
                  ? "Edit content…"
                  : "Reason for reporting…"
              }
              placeholderTextColor={theme.textTertiary}
              autoFocus
            />
            <View style={modalStyles.row}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => setActionModal(null)}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.submitBtn,
                  actionModal?.mode === "report" && modalStyles.submitBtnRed,
                ]}
                onPress={handleActionSubmit}
              >
                <Text style={modalStyles.submitText}>
                  {actionModal?.mode === "edit" ? "Save" : "Report"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Emoji picker modal */}
      <Modal
        visible={!!emojiPickerTargetId}
        transparent
        animationType="fade"
        onRequestClose={() => setEmojiPickerTargetId(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setEmojiPickerTargetId(null)}
        >
          <View style={{ backgroundColor: "#fff", padding: 20, flexDirection: "row", flexWrap: "wrap", gap: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            {["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => {
                  if (emojiPickerTargetId) handleReplyReact(emojiPickerTargetId, emoji);
                  setEmojiPickerTargetId(null);
                }}
                style={{ width: 52, height: 52, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 26 }}
              >
                <Text style={{ fontSize: 26 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const bannerStyles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    backgroundColor: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: "#fff",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: "#111827",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },
  cancelBtn: { paddingVertical: 4 },
  cancelText: { fontSize: 14, color: "#6B7280", fontFamily: fonts.semibold },
  submitBtn: { paddingVertical: 4 },
  submitBtnRed: {},
  submitText: { fontSize: 14, color: "#1D4ED8", fontFamily: fonts.bold },
});
