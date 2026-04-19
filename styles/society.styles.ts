import { StyleSheet } from "react-native";

export const societyStyles = StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // ── Fixed page header (title bar) ─────────────────────
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    color: "#111827",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Segmented tab switcher ─────────────────────────────
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
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
    backgroundColor: "#fff",
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
    color: "#111827",
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

  // ── Transaction card ───────────────────────────────────
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  incomeIcon: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  expenseIcon: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: "#9CA3AF",
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
    color: "#10B981",
  },
  expenseAmount: {
    color: "#EF4444",
  },

  // ── Ticket card (dark style) ───────────────────────────
  ticketCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    color: "#FFFFFF",
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 5,
    fontWeight: "500",
  },
  ticketDate: {
    fontSize: 12,
    color: "#6B7280",
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
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Create Ticket form ─────────────────────────────────
  formContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Ticket type selector ───────────────────────────────
  typeButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  typeButtonActive: {
    borderColor: "#111827",
    backgroundColor: "#F9FAFB",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: "#111827",
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
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  attachmentPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
  },
  attachmentPickerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
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
    borderRadius: 12,
    backgroundColor: "#1F2937",
    overflow: "hidden",
  },
  detailAttachImage: {
    width: "100%",
    height: "100%",
  },

  // ── Ticket detail ──────────────────────────────────────
  detailHeader: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
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
    borderRadius: 16,
    marginBottom: 10,
  },
  myComment: {
    alignSelf: "flex-end",
    backgroundColor: "#111827",
    borderBottomRightRadius: 4,
  },
  otherComment: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myCommentText: {
    color: "#FFFFFF",
  },
  otherCommentText: {
    color: "#111827",
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
    color: "#9CA3AF",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    color: "#111827",
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#111827",
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
    color: "#111827",
    marginTop: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  // ── Skeleton loader ────────────────────────────────────
  skeleton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },

  // ── Transaction detail modal ───────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111827",
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
    color: "#FFFFFF",
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 16,
    color: "#E5E7EB",
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
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: "#D1D5DB",
    marginLeft: 10,
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#9CA3AF",
  },
});
