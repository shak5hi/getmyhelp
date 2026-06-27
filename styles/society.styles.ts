import { StyleSheet } from "react-native";
import { shadows, radii, fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeStyles = (t: Theme) => StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },

  // ── Fixed page header (title bar) ─────────────────────
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
    fontFamily: fonts.extrabold,
    color: t.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: t.textSecondary,
    marginTop: 2,
    fontFamily: fonts.medium,
  },

  // ── Segmented tab switcher ─────────────────────────────
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
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: t.textTertiary,
  },
  activeTabText: {
    color: t.accent,
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
    backgroundColor: t.card,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: t.border,
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
    fontFamily: fonts.semibold,
    color: t.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 17,
    fontFamily: fonts.extrabold,
    color: t.text,
  },
  summaryValueIncome: {
    color: t.success,
  },
  summaryValueExpense: {
    color: t.danger,
  },

  // ── Segment caption (money vs. issues framing) ────────
  tabCaption: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    fontSize: 13,
    color: t.textSecondary,
    lineHeight: 18,
  },

  // ── Count strip ───────────────────────────────────────
  countStrip: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  countStripText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: t.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Transaction card ───────────────────────────────────
  transactionCard: {
    backgroundColor: t.card,
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
    backgroundColor: t.successTint,
  },
  expenseIcon: {
    backgroundColor: t.dangerTint,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: t.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: t.textTertiary,
    fontFamily: fonts.medium,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  incomeAmount: {
    color: t.success,
  },
  expenseAmount: {
    color: t.danger,
  },

  // ── Ticket card (no left border) ──────────────────────
  ticketCard: {
    backgroundColor: t.card,
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
    fontFamily: fonts.bold,
    color: t.text,
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
    fontFamily: fonts.bold,
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
    color: t.textTertiary,
    fontFamily: fonts.medium,
  },
  ticketDate: {
    fontSize: 12,
    color: t.textSecondary,
    fontFamily: fonts.medium,
  },

  // ── FAB (Floating Action Button) ───────────────────────
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

  // ── Create Ticket form ─────────────────────────────────
  formContainer: {
    flex: 1,
    backgroundColor: t.bg,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: t.textSecondary,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: radii.md,
    padding: 14,
    fontSize: 15,
    color: t.text,
    ...shadows.sm,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: t.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
    shadowColor: t.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: t.card,
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },

  // ── Ticket type selector ───────────────────────────────
  typeButton: {
    flex: 1,
    backgroundColor: t.card,
    borderWidth: 1.5,
    borderColor: t.border,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  typeButtonActive: {
    borderColor: t.accent,
    backgroundColor: t.accentTint,
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: t.textTertiary,
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: t.accent,
  },
  typeButtonSub: {
    fontSize: 11,
    color: t.textTertiary,
    fontFamily: fonts.regular,
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
    backgroundColor: t.card,
    borderRadius: 10,
  },
  attachmentPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: t.bg,
    borderRadius: radii.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: t.border,
    borderStyle: "dashed",
  },
  attachmentPickerText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: t.textSecondary,
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
    backgroundColor: t.surfaceAlt,
    overflow: "hidden",
  },
  detailAttachImage: {
    width: "100%",
    height: "100%",
  },

  // ── Ticket detail ──────────────────────────────────────
  detailHeader: {
    backgroundColor: t.card,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radii.lg,
    ...shadows.sm,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 20,
    fontFamily: fonts.extrabold,
    color: t.text,
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: t.textSecondary,
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
    backgroundColor: t.accent,
    borderBottomRightRadius: 4,
  },
  otherComment: {
    alignSelf: "flex-start",
    backgroundColor: t.card,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myCommentText: {
    color: t.onAccent,
  },
  otherCommentText: {
    color: t.text,
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
    color: t.textTertiary,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: t.card,
    borderTopWidth: 1,
    borderTopColor: t.divider,
  },
  commentInput: {
    flex: 1,
    backgroundColor: t.bg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    color: t.text,
    maxHeight: 100,
  },
  sendButton: {
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
    fontFamily: fonts.bold,
    color: t.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: t.textTertiary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  // ── Skeleton loader ────────────────────────────────────
  skeleton: {
    backgroundColor: t.border,
    borderRadius: radii.sm,
    overflow: "hidden",
  },

  // ── Transaction detail modal (light themed) ────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: t.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: t.card,
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
    fontFamily: fonts.extrabold,
    color: t.text,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: t.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    color: t.textSecondary,
    fontFamily: fonts.medium,
    lineHeight: 24,
  },
  attachmentList: {
    marginTop: 6,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.surfaceAlt,
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: t.border,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: t.textSecondary,
    marginLeft: 10,
    fontFamily: fonts.medium,
  },
  closeButton: {
    backgroundColor: t.surfaceAlt,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: t.border,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: t.textSecondary,
  },
});
