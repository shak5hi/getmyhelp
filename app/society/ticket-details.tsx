import React, { useState, useEffect, useRef } from "react";
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
import { societyStyles as styles } from "../../styles/society.styles";
import { CommentItem } from "../../components/society/CommentItem";
import { Skeleton } from "../../components/ui/Skeleton";

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
    if (s.includes("open")) return "#6366F1";
    if (s.includes("progress")) return "#F59E0B";
    if (s.includes("closed")) return "#64748B";
    if (s.includes("resolved")) return "#10B981";
    return "#64748B";
  };

  const attachments: any[] = ticket?.attachments || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: "row", alignItems: "center" }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { fontSize: 18 }]} numberOfLines={1}>{ticket?.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 }}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket?.status) + "15", paddingVertical: 2 }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ticket?.status), fontSize: 9 }]}>
                {ticket?.status}
              </Text>
            </View>
            {ticket?.type && (
              <View style={[styles.statusBadge, { backgroundColor: ticket.type === "private" ? "#FEF3C7" : "#EEF2FF", paddingVertical: 2 }]}>
                <Ionicons
                  name={ticket.type === "private" ? "lock-closed" : "people"}
                  size={9}
                  color={ticket.type === "private" ? "#D97706" : "#6366F1"}
                  style={{ marginRight: 3 }}
                />
                <Text style={[styles.statusText, { color: ticket.type === "private" ? "#D97706" : "#6366F1", fontSize: 9 }]}>
                  {ticket.type}
                </Text>
              </View>
            )}
            <Text style={[styles.subtitle, { marginTop: 0, fontSize: 12 }]}>#{id}</Text>
          </View>
        </View>
      </View>

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
            <Text style={styles.label}>Description</Text>
            <Text style={styles.detailDescription}>{ticket?.description || "No description provided."}</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={styles.priorityContainer}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.priorityText}>
                  {new Date(ticket?.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.priorityContainer}>
                <Ionicons name="pricetag-outline" size={14} color="#64748B" />
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
                            <Ionicons name="document-text" size={28} color="#6366F1" />
                            <Text style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", paddingHorizontal: 4 }} numberOfLines={2}>
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
            <Text style={[styles.label, { fontSize: 16, color: "#1E293B" }]}>Interaction History</Text>
          </View>

          {/* Comments */}
          <View style={styles.commentContainer}>
            {comments.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <Text style={{ color: "#94A3B8", fontSize: 14 }}>No activity yet</Text>
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
