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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  const fetchDetails = async () => {
    // Ensure ID is a string and not an array
    const ticketId = Array.isArray(id) ? id[0] : id;
    if (!ticketId) {
      console.error("No ticket ID provided");
      return;
    }

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
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response from server:", text.substring(0, 200));
        throw new Error("Invalid response format from server");
      }

      const rawJson = await response.json();
      console.log("Ticket Detail rawJson:", JSON.stringify(rawJson).substring(0, 200));

      // Handle GenericResponse mapping or direct object mapping
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
        if (updatedTicket && updatedTicket.comments) {
          setComments(updatedTicket.comments);
        }
        setNewComment("");
        // Scroll to bottom
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Skeleton width="60%" height={30} style={{ marginBottom: 10 }} />
            <Skeleton width="40%" height={20} />
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: "row", alignItems: "center" }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { fontSize: 18 }]} numberOfLines={1}>{ticket?.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
             <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket?.status) + "15", paddingVertical: 2 }]}>
               <Text style={[styles.statusText, { color: getStatusColor(ticket?.status), fontSize: 9 }]}>{ticket?.status}</Text>
             </View>
             <Text style={[styles.subtitle, { marginLeft: 8, marginTop: 0, fontSize: 12 }]}>#{id}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 20 }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Ticket Description */}
          <View style={styles.detailHeader}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.detailDescription}>{ticket?.description}</Text>
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
               <View style={styles.priorityContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.priorityText}>
                    Created on {new Date(ticket?.created_at).toLocaleDateString()}
                  </Text>
               </View>
               <View style={styles.priorityContainer}>
                  <Ionicons name="pricetag-outline" size={14} color="#64748B" />
                  <Text style={styles.priorityText}>{ticket?.category}</Text>
               </View>
            </View>
          </View>

          {/* Activity/Comments Title */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
            <Text style={[styles.label, { fontSize: 16, color: "#1E293B" }]}>Interaction History</Text>
          </View>

          {/* Comments List */}
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
