import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import config from "../../src/config";
import { makeStyles } from "../../styles/society.styles";
import { useTheme } from "../../src/ThemeContext";
import { CommentItem } from "../../components/society/CommentItem";
import { Skeleton } from "../../components/ui/Skeleton";

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchDetails();
    getUserId();
  }, [id]);

  const getUserId = async () => {
    const userStr = await AsyncStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id.toString());
    }
  };

  const resolveFileUrl = (fileUrl: string) => {
    if (!fileUrl) return "";
    return fileUrl.startsWith("http") ? fileUrl : `${config.fileBaseUrl}${fileUrl}`;
  };

  const fetchDetails = async () => {
    const ticketId = Array.isArray(id) ? id[0] : id;
    if (!ticketId) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${config.apiUrl}/customer/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ticket details fetch failed (${response.status}):`, errorText.substring(0, 500));
        throw new Error(`Server responded with ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response format from server");
      }

      const rawJson = await response.json();
      const ticketData = rawJson.data || rawJson;

      if (ticketData) {
        setTicket(ticketData);
        setComments(ticketData.comments || []);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    setSending(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${config.apiUrl}/customer/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const json = await response.json();
        const updatedTicket = json.data;
        if (updatedTicket?.comments) {
          setComments(updatedTicket.comments);
        }
        setNewComment("");
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setSending(false);
    }
  };

  const openAttachment = async (fileUrl: string) => {
    try {
      await WebBrowser.openBrowserAsync(resolveFileUrl(fileUrl), {
        toolbarColor: "#111827",
        enableBarCollapsing: true,
        showTitle: true,
      });
    } catch (err) {
      console.error("Could not open attachment", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={24} height={24} style={{ marginRight: 16, borderRadius: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
            <Skeleton width="35%" height={14} />
          </View>
        </View>
        <View style={{ padding: 20 }}>
          <Skeleton height={150} style={{ borderRadius: 16, marginBottom: 20 }} />
          <Skeleton width="30%" height={24} style={{ marginBottom: 10 }} />
          <Skeleton height={60} style={{ borderRadius: 12, marginBottom: 10 }} />
          <Skeleton height={60} style={{ borderRadius: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("open"))     return { bg: "#F3F4F6",  text: "#374151"  };
    if (s.includes("progress")) return { bg: "#FEF3C7",  text: "#92400E"  };
    if (s.includes("closed"))   return { bg: "#F3F4F6",  text: "#6B7280"  };
    if (s.includes("resolved")) return { bg: "#D1FAE5",  text: "#065F46"  };
    return { bg: "#F3F4F6", text: "#6B7280" };
  };

  const attachments: any[] = ticket?.attachments || [];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Ticket Description */}
          <View style={styles.detailHeader}>
            <Text style={[styles.title, { fontSize: 20, marginBottom: 8 }]} numberOfLines={2}>{ticket?.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              {(() => {
                const sc = getStatusColor(ticket?.status);
                return (
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>
                      {ticket?.status}
                    </Text>
                  </View>
                );
              })()}
              {ticket?.type && (
                <View style={[styles.statusBadge, { backgroundColor: theme.surfaceAlt, flexDirection: "row", alignItems: "center", gap: 4 }]}>
                  <Ionicons
                    name={ticket.type === "private" ? "lock-closed" : "people"}
                    size={11}
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                    {ticket.type}
                  </Text>
                </View>
              )}
              <Text style={[styles.subtitle, { marginTop: 0 }]}>#{id}</Text>
            </View>

            <Text style={styles.label}>Description</Text>
            <Text style={styles.detailDescription}>{ticket?.description || "No description provided."}</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={styles.priorityContainer}>
                <Ionicons name="calendar-outline" size={14} color={theme.textTertiary} />
                <Text style={styles.priorityText}>
                  {new Date(ticket?.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.priorityContainer}>
                <Ionicons name="pricetag-outline" size={14} color={theme.textTertiary} />
                <Text style={styles.priorityText}>{ticket?.category}</Text>
              </View>
            </View>

            {/* Attachments */}
            {attachments.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Attachments ({attachments.length})
                </Text>
                <View style={styles.detailAttachmentsRow}>
                  {attachments.map((att: any, idx: number) => {
                    const isImage = att.file_type?.startsWith("image/");
                    const fullUrl = resolveFileUrl(att.file_url);
                    return (
                      <TouchableOpacity
                        key={att.id || idx}
                        style={styles.detailAttachThumb}
                        onPress={() => openAttachment(att.file_url)}
                      >
                        {isImage ? (
                          <Image
                            source={{ uri: fullUrl }}
                            style={styles.detailAttachImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 4 }}>
                            <Ionicons name="document-text" size={28} color={theme.textTertiary} />
                            <Text style={{ fontSize: 10, color: theme.textTertiary, textAlign: "center", paddingHorizontal: 4 }} numberOfLines={2}>
                              {att.original_filename || "File"}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Activity/Comments Title */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
            <Text style={styles.label}>Interaction History</Text>
          </View>

          {/* Comments */}
          <View style={styles.commentContainer}>
            {comments.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <Text style={{ color: theme.textTertiary, fontSize: 14 }}>No activity yet</Text>
              </View>
            ) : (
              comments.map((item, index) => (
                <CommentItem
                  key={item.id || index}
                  text={item.content}
                  timestamp={item.created_at}
                  isMe={item.customer_author_id === userId}
                  authorName={item.author_name}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        {ticket?.status !== "closed" && (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a reply..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newComment.trim() || sending) && { opacity: 0.5 }]}
              onPress={handleSendComment}
              disabled={!newComment.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
