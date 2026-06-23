import { StyleSheet } from "react-native";
import { shadows, radii } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeStyles = (t: Theme) => StyleSheet.create({
  // ── Shell ────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },

  // ── Fixed page header ────────────────────────────────────
  header: {
    backgroundColor: t.card,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: t.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: t.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Segmented tab bar ────────────────────────────────────
  tabContainer: {
    flexDirection: "row",
    backgroundColor: t.surfaceAlt,
    borderRadius: radii.md,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: t.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: t.textTertiary,
  },
  activeTabText: {
    color: t.accent,
  },

  // ── Search bar ───────────────────────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.surfaceAlt,
    borderRadius: radii.md,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: t.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: t.text,
    fontWeight: "500",
  },

  // ── Count strip ──────────────────────────────────────────
  countStrip: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  countStripText: {
    fontSize: 12,
    fontWeight: "600",
    color: t.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── List content ─────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  // ── Announcement card ────────────────────────────────────
  announcementCard: {
    backgroundColor: t.card,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
    overflow: "hidden",
  },
  announcementUnread: {
    // Left border removed; unread dot handled in JSX
  },
  announcementUnreadDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: t.accent,
  },
  announcementBadgesRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: t.text,
    marginBottom: 5,
    lineHeight: 21,
  },
  announcementBody: {
    fontSize: 13,
    color: t.textSecondary,
    lineHeight: 20,
  },
  announcementMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: t.divider,
    gap: 6,
  },
  announcementDate: {
    fontSize: 12,
    color: t.textTertiary,
    fontWeight: "500",
  },
  announcementDateRight: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // ── Forum post card ──────────────────────────────────────
  forumCard: {
    backgroundColor: t.card,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
  },
  forumCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  forumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  forumAvatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  forumAuthorName: {
    fontSize: 13,
    fontWeight: "700",
    color: t.text,
  },
  forumAuthorTime: {
    fontSize: 11,
    color: t.textTertiary,
    marginTop: 1,
  },
  forumTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: t.text,
    marginBottom: 12,
    lineHeight: 21,
  },
  forumBody: {
    fontSize: 13,
    color: t.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  forumFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: t.divider,
  },
  forumStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  forumStatText: {
    fontSize: 12,
    color: t.textSecondary,
    fontWeight: "600",
  },

  // ── Poll card ────────────────────────────────────────────
  pollCard: {
    backgroundColor: t.card,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
  },
  pollTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: t.text,
    marginBottom: 4,
    lineHeight: 21,
  },
  pollMeta: {
    fontSize: 12,
    color: t.textTertiary,
    marginBottom: 14,
    fontWeight: "500",
  },
  pollClosedBadge: {
    alignSelf: "flex-start",
    backgroundColor: t.dangerTint,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  pollClosedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: t.danger,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pollOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
    backgroundColor: t.bg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: t.border,
  },
  pollOptionSelected: {
    borderColor: t.accent,
    backgroundColor: t.accentTint,
  },
  pollOptionText: {
    fontSize: 14,
    color: t.textSecondary,
    flex: 1,
    fontWeight: "500",
  },
  pollOptionTextSelected: {
    color: t.text,
    fontWeight: "700",
  },
  pollCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: t.border,
    justifyContent: "center",
    alignItems: "center",
  },
  pollCircleSelected: {
    borderColor: t.accent,
    backgroundColor: t.accent,
  },
  pollCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: t.border,
    justifyContent: "center",
    alignItems: "center",
  },
  pollCheckboxSelected: {
    borderColor: t.accent,
    backgroundColor: t.accent,
  },
  pollSubmitBtn: {
    backgroundColor: t.accent,
    borderRadius: radii.md,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 6,
    shadowColor: t.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  pollSubmitText: {
    color: t.card,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  pollSubmitDisabled: {
    backgroundColor: t.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // ── Poll results bar chart ───────────────────────────────
  barRow: {
    marginBottom: 12,
  },
  barLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
  barLabelText: {
    fontSize: 13,
    color: t.textSecondary,
    flex: 1,
    fontWeight: "500",
    marginRight: 8,
  },
  barLabelPct: {
    fontSize: 13,
    fontWeight: "700",
    color: t.text,
  },
  barBg: {
    height: 8,
    backgroundColor: t.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: t.textTertiary,
    borderRadius: 4,
  },
  barFillWinner: {
    backgroundColor: t.accent,
  },
  pollClosed: {
    fontSize: 12,
    color: t.danger,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },

  // ── FAB ──────────────────────────────────────────────────
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: t.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: t.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Detail screen ────────────────────────────────────────
  detailContainer: {
    flex: 1,
    backgroundColor: t.bg,
  },
  detailScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: t.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  detailBody: {
    fontSize: 15,
    color: t.textSecondary,
    lineHeight: 24,
    marginTop: 14,
  },
  detailSection: {
    marginTop: 16,
  },

  // ── Thread / create-post ─────────────────────────────────
  replyBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: t.border,
    backgroundColor: t.card,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: t.bg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 14,
    color: t.text,
    maxHeight: 100,
    minHeight: 42,
  },
  replySendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: t.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: t.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    flexShrink: 0,
  },

  // ── Chat bubbles ─────────────────────────────────────────
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  bubbleRowOwn: {
    justifyContent: "flex-end",
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    flexShrink: 0,
    alignSelf: "flex-end",
  },
  bubbleAvatarText: {
    color: t.onAccent,
    fontSize: 10,
    fontWeight: "700",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: t.accent,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: t.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: t.border,
    ...shadows.sm,
  },
  bubbleAuthor: {
    fontSize: 11,
    fontWeight: "700",
    color: t.accent,
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 14,
    color: t.text,
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: t.onAccent,
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 8,
  },
  bubbleActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bubbleTime: {
    fontSize: 10,
    color: t.textTertiary,
  },
  bubbleTimeOwn: {
    color: "rgba(255,255,255,0.6)",
  },

  // ── Quoted message inside bubble ─────────────────────────
  quotedBox: {
    borderLeftWidth: 3,
    borderLeftColor: t.accent,
    paddingLeft: 6,
    paddingVertical: 3,
    marginBottom: 5,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
  },
  quotedBoxOwn: {
    borderLeftColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  quotedAuthor: {
    fontSize: 11,
    fontWeight: "700",
    color: t.accent,
    marginBottom: 1,
  },
  quotedAuthorOwn: {
    color: "rgba(255,255,255,0.95)",
  },
  quotedText: {
    fontSize: 12,
    color: t.textSecondary,
    lineHeight: 16,
  },
  quotedTextOwn: {
    color: "rgba(255,255,255,0.8)",
  },

  replyCard: {
    backgroundColor: t.card,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8,
    ...shadows.sm,
  },
  replyText: {
    fontSize: 14,
    color: t.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },
  createField: {
    backgroundColor: t.card,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    color: t.text,
    borderWidth: 1,
    borderColor: t.border,
  },
  createFieldMulti: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  imagePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  imagePickerAdd: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: t.accent,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.bg,
  },
  imagePickerThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
  },
  imagePickerThumbImg: {
    width: "100%",
    height: "100%",
  },
  imageRemove: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: t.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    shadowColor: t.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: t.card,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  submitBtnDisabled: {
    backgroundColor: t.textTertiary,
    shadowOpacity: 0,
    elevation: 0,
  },
  divider: {
    height: 1,
    backgroundColor: t.border,
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: t.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
});
