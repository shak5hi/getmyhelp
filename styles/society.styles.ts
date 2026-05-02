import { StyleSheet } from "react-native";
import { colors, shadows, radii } from "../constants/tokens";

export const societyStyles = StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Fixed page header (title bar) ─────────────────────
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Segmented tab switcher ─────────────────────────────
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
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
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  activeTabText: {
    color: colors.accent,
  },

  // ── List content container ─────────────────────────────
  financeList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  ticketList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // ── Finance summary row ────────────────────────────────
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  summaryValueIncome: {
    color: colors.success,
  },
  summaryValueExpense: {
    color: colors.danger,
  },

  // ── Count strip ───────────────────────────────────────
  countStrip: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  countStripText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Transaction card ───────────────────────────────────
  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.sm,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  incomeIcon: {
    backgroundColor: "#F0FDF4",
  },
  expenseIcon: {
    backgroundColor: colors.dangerLight,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  incomeAmount: {
    color: colors.success,
  },
  expenseAmount: {
    color: colors.danger,
  },

  // ── Ticket card (no left border) ──────────────────────
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500",
  },
  ticketDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // ── FAB (Floating Action Button) ───────────────────────
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Create Ticket form ─────────────────────────────────
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
    ...shadows.sm,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Ticket type selector ───────────────────────────────
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  typeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: colors.accent,
  },
  typeButtonSub: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "400",
    textAlign: "center",
  },

  // ── Attachment picker ──────────────────────────────────
  attachmentPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  attachmentThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  attachmentThumbImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  attachmentRemove: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  attachmentPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  attachmentPickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  // ── Attachment row in detail view ──────────────────────
  detailAttachmentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  detailAttachThumb: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  detailAttachImage: {
    width: "100%",
    height: "100%",
  },

  // ── Ticket detail ──────────────────────────────────────
  detailHeader: {
    backgroundColor: colors.surface,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radii.lg,
    ...shadows.sm,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  // ── Comments ───────────────────────────────────────────
  commentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  commentBubble: {
    maxWidth: "82%",
    padding: 12,
    borderRadius: radii.lg,
    marginBottom: 10,
  },
  myComment: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  otherComment: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myCommentText: {
    color: "#FFFFFF",
  },
  otherCommentText: {
    color: colors.textPrimary,
  },
  commentTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myCommentTime: {
    color: "rgba(255,255,255,0.6)",
  },
  otherCommentTime: {
    color: colors.textTertiary,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  // ── Empty state ────────────────────────────────────────
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  // ── Skeleton loader ────────────────────────────────────
  skeleton: {
    backgroundColor: colors.border,
    borderRadius: radii.sm,
    overflow: "hidden",
  },

  // ── Transaction detail modal (light themed) ────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "82%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
    lineHeight: 24,
  },
  attachmentList: {
    marginTop: 6,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: colors.surfaceAlt,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },
});
