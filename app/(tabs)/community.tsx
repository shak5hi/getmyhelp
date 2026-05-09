import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getAnnouncements,
  getForumPosts,
  getPolls,
  votePoll,
} from "../../src/api/communityApi";
import { useAnnouncementSocket } from "../../hooks/useAnnouncementSocket";
import { useForumSocket } from "../../hooks/useForumSocket";
import { communityStyles as styles } from "../../styles/community.styles";
import { colors } from "../../constants/tokens";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { CategoryBadge } from "../../components/community/CategoryBadge";

type ActiveTab = "announcements" | "forum" | "polls";

const stripHtml = (html: string) =>
  (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return s;
  }
};

const getInitials = (name: string) =>
  (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// Subtle background tints for avatars — matches app's muted palette
const AVATAR_BG = [
  { bg: "#F3F4F6", text: "#374151" },
  { bg: "#EEF2FF", text: "#4338CA" },
  { bg: "#F0FDF4", text: "#166534" },
  { bg: "#FFF7ED", text: "#92400E" },
  { bg: "#FDF4FF", text: "#7E22CE" },
  { bg: "#FFF1F2", text: "#9F1239" },
];

const avatarStyle = (name: string) =>
  AVATAR_BG[
    Math.abs((name ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
      AVATAR_BG.length
  ];

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("announcements");
  const [societyId, setSocietyId] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementRefreshing, setAnnouncementRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumRefreshing, setForumRefreshing] = useState(false);

  const [polls, setPolls] = useState<any[]>([]);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [pollsRefreshing, setPollsRefreshing] = useState(false);
  const [pollSelections, setPollSelections] = useState<Record<string, (string | number)[]>>({});
  const [submittingPoll, setSubmittingPoll] = useState<string | null>(null);
  const [votedPollIds, setVotedPollIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem("user").then((s) => {
      const user = s ? JSON.parse(s) : {};
      setSocietyId(user?.society_id ? String(user.society_id) : null);
    });
    AsyncStorage.getItem("voted_poll_ids").then((s) => {
      if (s) {
        try { setVotedPollIds(new Set(JSON.parse(s))); } catch {}
      }
    });
  }, []);

  // ── Announcements ─────────────────────────────────────────
  const loadAnnouncements = useCallback(
    async (page = 1, q = search, isRefresh = false) => {
      if (!isRefresh) setAnnouncementLoading(true);
      try {
        const json = await getAnnouncements(page, q);
        const rows: any[] =
          json?.data?.announcements ??
          json?.data?.items ??
          json?.data?.results ??
          json?.announcements ??
          json?.results ??
          (Array.isArray(json?.data) ? json.data : null) ??
          (Array.isArray(json) ? json : []);
        if (page === 1) setAnnouncements(rows);
        else setAnnouncements((prev) => [...prev, ...rows]);
      } catch (e) {
        console.error("announcements:", e);
      } finally {
        setAnnouncementLoading(false);
        setAnnouncementRefreshing(false);
      }
    },
    [search]
  );

  // ── Forum ─────────────────────────────────────────────────
  const loadForumPosts = useCallback(async (page = 1, isRefresh = false) => {
    if (!isRefresh) setForumLoading(true);
    try {
      const json = await getForumPosts(page);
      const rows: any[] =
        json?.data?.posts ??
        json?.data?.items ??
        json?.data?.results ??
        json?.posts ??
        json?.results ??
        (Array.isArray(json?.data) ? json.data : null) ??
        (Array.isArray(json) ? json : []);
      if (page === 1) setForumPosts(rows);
      else setForumPosts((prev) => [...prev, ...rows]);
    } catch (e) {
      console.error("forum:", e);
    } finally {
      setForumLoading(false);
      setForumRefreshing(false);
    }
  }, []);

  // ── Polls ─────────────────────────────────────────────────
  const loadPolls = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setPollsLoading(true);
    try {
      const json = await getPolls();
      const rows: any[] =
        json?.data?.polls ??
        json?.data?.items ??
        json?.data?.results ??
        json?.polls ??
        json?.results ??
        (Array.isArray(json?.data) ? json.data : null) ??
        (Array.isArray(json) ? json : []);
      setPolls(rows);
    } catch (e) {
      console.error("polls:", e);
    } finally {
      setPollsLoading(false);
      setPollsRefreshing(false);
    }
  }, []);

  // lazy-load on tab switch
  useEffect(() => {
    if (activeTab === "announcements" && announcements.length === 0) {
      loadAnnouncements(1, "");
    } else if (activeTab === "forum" && forumPosts.length === 0) {
      loadForumPosts();
    } else if (activeTab === "polls" && polls.length === 0) {
      loadPolls();
    }
  }, [activeTab]);

  useEffect(() => {
    loadAnnouncements(1, "");
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadAnnouncements(1, text);
    }, 400);
  };

  useAnnouncementSocket(societyId, (msg) => {
    if (msg?.type === "new_announcement" && msg?.data) {
      setAnnouncements((prev) => [msg.data, ...prev]);
    }
  });
  useForumSocket(societyId, (msg) => {
    if (msg?.type === "new_post" && msg?.data) {
      setForumPosts((prev) => [msg.data, ...prev]);
    } else if (msg?.type === "delete_post" && msg?.id) {
      setForumPosts((prev) => prev.filter((p) => String(p.id) !== String(msg.id)));
    }
  });

  // ── Poll voting ───────────────────────────────────────────
  const togglePollOption = (pollId: string, optionId: string | number, isMultiple: boolean) => {
    setPollSelections((prev) => {
      const current = prev[pollId] ?? [];
      if (isMultiple) {
        return {
          ...prev,
          [pollId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [pollId]: [optionId] };
    });
  };

  const submitPollVote = async (poll: any) => {
    const selected = pollSelections[poll.id] ?? [];
    if (selected.length === 0) return;
    setSubmittingPoll(String(poll.id));
    try {
      const json = await votePoll(poll.id, selected);
      const updatedPoll = json?.data?.poll ?? json?.poll ?? json?.data ?? null;
      if (updatedPoll) {
        setPolls((prev) =>
          prev.map((p) => (String(p.id) === String(poll.id) ? updatedPoll : p))
        );
      } else {
        setPolls((prev) =>
          prev.map((p) =>
            String(p.id) === String(poll.id) ? { ...p, is_voted: true } : p
          )
        );
      }
      setVotedPollIds((prev) => {
        const next = new Set(prev);
        next.add(String(poll.id));
        AsyncStorage.setItem("voted_poll_ids", JSON.stringify([...next]));
        return next;
      });
    } catch (e) {
      console.error("vote:", e);
    } finally {
      setSubmittingPoll(null);
    }
  };

  // ── Renderers ──────────────────────────────────────────────
  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {(["announcements", "forum", "polls"] as ActiveTab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab === "announcements" ? "Notices" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSkeleton = () => (
    <View style={{ paddingTop: 4 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height={90} style={{ marginBottom: 10, borderRadius: 16 }} />
      ))}
    </View>
  );

  const renderAnnouncement = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.announcementCard}
      onPress={() =>
        router.push({
          pathname: "/community/announcement-detail",
          params: { id: String(item.id) },
        })
      }
      activeOpacity={0.75}
    >
      {!item.is_read && <View style={styles.announcementUnreadDot} />}

      {item.category && (
        <View style={styles.announcementBadgesRow}>
          <CategoryBadge category={item.category} />
        </View>
      )}

      <Text style={styles.announcementTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.announcementMeta}>
        <Ionicons name="time-outline" size={12} color="#9CA3AF" />
        <Text style={styles.announcementDate}>
          {formatDate(item.created_at ?? item.date ?? "")}
        </Text>
        <View style={styles.announcementDateRight}>
          <Text style={[styles.announcementDate, { color: "#374151" }]}>View</Text>
          <Ionicons name="chevron-forward" size={13} color="#374151" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderForumPost = ({ item }: { item: any }) => {
    const authorName = item.author?.name ?? item.author_name ?? item.created_by?.name ?? "Anonymous";
    const initials = getInitials(authorName);
    const av = avatarStyle(authorName);
    const replyCount = item.reply_count ?? item.replies_count ?? 0;
    const reactionCount =
      item.reaction_count ??
      item.reactions?.reduce((a: number, r: any) => a + (r.count ?? 0), 0) ??
      0;
    const bodyPreview = stripHtml(item.content ?? item.body ?? "");

    return (
      <TouchableOpacity
        style={styles.forumCard}
        onPress={() =>
          router.push({
            pathname: "/community/forum-thread",
            params: { id: String(item.id) },
          })
        }
        activeOpacity={0.75}
      >
        {/* Author row */}
        <View style={styles.forumCardTop}>
          <View style={[styles.forumAvatar, { backgroundColor: av.bg }]}>
            <Text style={[styles.forumAvatarText, { color: av.text }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.forumAuthorName}>{authorName}</Text>
            <Text style={styles.forumAuthorTime}>
              {formatDate(item.created_at ?? item.date ?? "")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </View>

        {/* Title */}
        <Text style={styles.forumTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Body preview */}
        {bodyPreview.length > 0 && (
          <Text style={styles.forumBody} numberOfLines={2}>
            {bodyPreview}
          </Text>
        )}

        {/* Footer stats */}
        <View style={styles.forumFooter}>
          <View style={styles.forumStat}>
            <Ionicons name="chatbubble-outline" size={13} color="#6B7280" />
            <Text style={styles.forumStatText}>
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </Text>
          </View>
          {reactionCount > 0 && (
            <View style={styles.forumStat}>
              <Ionicons name="heart-outline" size={13} color="#6B7280" />
              <Text style={styles.forumStatText}>{reactionCount}</Text>
            </View>
          )}
          <View style={{ marginLeft: "auto" }}>
            <Text style={[styles.forumAuthorTime, { color: colors.accent, fontWeight: "600" }]}>
              Open thread
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPoll = ({ item }: { item: any }) => {
    const isVoted = item.is_voted ?? item.voted ?? votedPollIds.has(String(item.id));
    console.warn("POLL MULTI:", JSON.stringify({ id: item.id, is_multiple_choice: item.is_multiple_choice, is_multiple: item.is_multiple, allow_multiple: item.allow_multiple, multiple: item.multiple, type: item.type, poll_type: item.poll_type }));
    const isClosed =
      item.is_closed === true ||
      item.status === "closed" ||
      item.status === "expired";
    const isMultiple = item.is_multiple_choice ?? item.is_multiple ?? false;
    const options: any[] = item.options ?? [];
    const totalVotes = options.reduce((a: number, o: any) => a + (o.vote_count ?? 0), 0);
    const selected = pollSelections[String(item.id)] ?? [];
    const maxVotes = Math.max(...options.map((o) => o.vote_count ?? 0), 1);
    const showResults = isVoted || isClosed;

    return (
      <View style={styles.pollCard}>
        <Text style={styles.pollTitle}>{item.question ?? item.title}</Text>
        <Text style={styles.pollMeta}>
          {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          {isClosed ? "  ·  Closed" : ""}
          {isMultiple ? "  ·  Multiple choice" : ""}
        </Text>

        {isClosed && (
          <View style={styles.pollClosedBadge}>
            <Text style={styles.pollClosedBadgeText}>Voting Closed</Text>
          </View>
        )}

        {showResults ? (
          <>
            {options.map((opt) => {
              const count = opt.vote_count ?? 0;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isWinner = count === maxVotes && count > 0;
              return (
                <View key={opt.id} style={styles.barRow}>
                  <View style={styles.barLabel}>
                    <Text style={styles.barLabelText} numberOfLines={1}>
                      {opt.text ?? opt.label}
                    </Text>
                    <Text style={styles.barLabelPct}>{pct}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        isWinner && styles.barFillWinner,
                        { width: `${pct}%` as any },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            {options.map((opt) => {
              const isSelected = selected.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.pollOption, isSelected && styles.pollOptionSelected]}
                  onPress={() => togglePollOption(String(item.id), opt.id, isMultiple)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      isMultiple ? styles.pollCheckbox : styles.pollCircle,
                      isSelected && (isMultiple ? styles.pollCheckboxSelected : styles.pollCircleSelected),
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={[styles.pollOptionText, isSelected && styles.pollOptionTextSelected]}>
                    {opt.text ?? opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.pollSubmitBtn,
                (selected.length === 0 || submittingPoll === String(item.id)) &&
                  styles.pollSubmitDisabled,
              ]}
              disabled={selected.length === 0 || submittingPoll !== null}
              onPress={() => submitPollVote(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.pollSubmitText}>
                {submittingPoll === String(item.id) ? "Submitting…" : "Vote"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const isLoading =
    activeTab === "announcements"
      ? announcementLoading
      : activeTab === "forum"
      ? forumLoading
      : pollsLoading;

  const isRefreshing =
    activeTab === "announcements"
      ? announcementRefreshing
      : activeTab === "forum"
      ? forumRefreshing
      : pollsRefreshing;

  const currentData =
    activeTab === "announcements"
      ? announcements
      : activeTab === "forum"
      ? forumPosts
      : polls;

  const onRefresh = () => {
    if (activeTab === "announcements") {
      setAnnouncementRefreshing(true);
      loadAnnouncements(1, search, true);
    } else if (activeTab === "forum") {
      setForumRefreshing(true);
      loadForumPosts(1, true);
    } else {
      setPollsRefreshing(true);
      loadPolls(true);
    }
  };

  const renderEmpty = () => (
    <EmptyState
      title={
        activeTab === "announcements"
          ? "No Announcements"
          : activeTab === "forum"
          ? "No Posts Yet"
          : "No Polls"
      }
      message={
        activeTab === "announcements"
          ? "Your society hasn't posted any announcements yet."
          : activeTab === "forum"
          ? "Be the first to start a discussion!"
          : "No active polls right now."
      }
      icon={
        activeTab === "announcements"
          ? "megaphone-outline"
          : activeTab === "forum"
          ? "chatbubbles-outline"
          : "bar-chart-outline"
      }
    />
  );

  const renderItem = ({ item }: { item: any }) => {
    if (activeTab === "announcements") return renderAnnouncement({ item });
    if (activeTab === "forum") return renderForumPost({ item });
    return renderPoll({ item });
  };

  const SUBTITLE: Record<ActiveTab, string> = {
    announcements: "Announcements & notices",
    forum: "Discussion board",
    polls: "Active polls",
  };

  const ListHeader = (
    <>
      {renderTabBar()}

      {activeTab === "announcements" && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements…"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {!isLoading && currentData.length > 0 && (
        <View style={styles.countStrip}>
          <Text style={styles.countStripText}>
            {currentData.length}{" "}
            {activeTab === "announcements"
              ? "notices"
              : activeTab === "forum"
              ? "posts"
              : "polls"}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 4, height: 22, backgroundColor: colors.accent, borderRadius: 2, marginRight: 8 }} />
            <Text style={styles.title}>Community</Text>
          </View>
          <Text style={[styles.subtitle, { marginLeft: 12 }]}>{SUBTITLE[activeTab]}</Text>
        </View>
      </View>

      <FlatList
        data={isLoading ? [] : currentData}
        keyExtractor={(item, index) =>
          item?.id != null ? String(item.id) : `${activeTab}-${index}`
        }
        ListHeaderComponent={ListHeader}
        renderItem={renderItem}
        ListEmptyComponent={isLoading ? renderSkeleton() : renderEmpty()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />

      {activeTab === "forum" && !isLoading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/community/create-post")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
