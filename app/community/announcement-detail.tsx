import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import {
  getAnnouncementDetail,
  markAnnouncementRead,
  reactToAnnouncement,
} from "../../src/api/communityApi";
import { communityStyles as styles } from "../../styles/community.styles";
import { EmojiReactionBar, Reaction } from "../../components/community/EmojiReactionBar";
import { ImageGallery } from "../../components/community/ImageGallery";
import { AuthorTag } from "../../components/community/AuthorTag";
import { PriorityBadge } from "../../components/community/PriorityBadge";
import { CategoryBadge } from "../../components/community/CategoryBadge";

const stripHtml = (html: string) =>
  (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const buildReactions = (raw: any[], userId?: string): Reaction[] => {
  const map: Record<string, Reaction> = {};
  (raw ?? []).forEach((r) => {
    const emoji = r.emoji ?? r.reaction;
    if (!emoji) return;
    if (!map[emoji]) map[emoji] = { emoji, count: 0, reacted: false };
    map[emoji].count += r.count ?? 1;
    if (r.user_id && String(r.user_id) === userId) map[emoji].reacted = true;
    if (r.reacted) map[emoji].reacted = true;
  });
  return Object.values(map);
};

export default function AnnouncementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<any>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detailJson] = await Promise.all([
        getAnnouncementDetail(id),
        markAnnouncementRead(id).catch(() => {}),
      ]);
      const item =
        detailJson?.data?.announcement ??
        detailJson?.data ??
        detailJson?.announcement ??
        detailJson;
      setAnnouncement(item);
      setReactions(buildReactions(item?.reactions ?? []));
    } catch (e) {
      console.error("announcement detail:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReact = async (emoji: string) => {
    // optimistic update immediately
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji
            ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
            : r
        );
      }
      return [...prev, { emoji, count: 1, reacted: true }];
    });
    try {
      await reactToAnnouncement(id!, emoji);
    } catch {}
  };

  if (loading) {
    return (
      <SafeAreaView edges={["bottom"]} style={[styles.detailContainer, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.detailContainer}>
        <Text style={{ textAlign: "center", marginTop: 40, color: "#9CA3AF" }}>
          Announcement not found.
        </Text>
      </SafeAreaView>
    );
  }

  const images =
    announcement.images ??
    announcement.attachments?.filter((a: any) =>
      (a.file_type ?? a.type ?? "").startsWith("image")
    ) ??
    [];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.detailContainer}>
      <ScrollView contentContainerStyle={styles.detailScroll}>
        <Text style={styles.detailTitle}>{announcement.title}</Text>

        <View style={[styles.announcementMeta, { marginTop: 0, marginBottom: 16 }]}>
          {announcement.category && (
            <CategoryBadge category={announcement.category} />
          )}
          {announcement.priority && (
            <PriorityBadge priority={announcement.priority} />
          )}
        </View>

        {(announcement.author?.name || announcement.created_by?.name) && (
          <AuthorTag
            name={announcement.author?.name ?? announcement.created_by?.name}
            timestamp={announcement.created_at ?? announcement.date ?? ""}
          />
        )}

        <Text style={styles.detailBody}>
          {stripHtml(announcement.body ?? announcement.content ?? announcement.message ?? "")}
        </Text>

        {images.length > 0 && (
          <View style={styles.detailSection}>
            <ImageGallery images={images} />
          </View>
        )}

        <View style={styles.detailSection}>
          <EmojiReactionBar reactions={reactions} onReact={handleReact} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
