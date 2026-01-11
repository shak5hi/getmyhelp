import { StyleSheet } from "react-native";

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },

  // SUBSCRIPTION SECTION
  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  currentPlanBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  currentPlanText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },
  planPriceMonth: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6B7280",
  },
  chevron: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  planPills: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  planPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  planPillActive: {
    backgroundColor: "#1F2937",
  },
  planPillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  planPillTextActive: {
    color: "#FFFFFF",
  },
  planDetailsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  planDetailCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  planDetailCardActive: {
    borderColor: "#1F2937",
    borderWidth: 2,
  },
  popularBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
  },
  planDetailName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  planDetailPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  planFeature: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  getPlanButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  getPlanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // GREETING
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },

  // HERO CARD
  heroCard: {
    backgroundColor: "#1F2937",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  heroText: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
    fontWeight: "500",
  },
  heroName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroRole: {
    fontSize: 16,
    color: "#D1D5DB",
    marginBottom: 8,
  },
  heroDate: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 20,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 15,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#374151",
    marginLeft: 16,
  },

  // BACKUP CARD
  backupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backupNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111827",
  },
  backupLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  backupAction: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    textDecorationLine: "underline",
  },

  // SECTION TITLE
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  // ACTIVE MAIDS
  activeMaidsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 16,
  },
  maidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  maidAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
  },
  maidName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  maidRole: {
    fontSize: 14,
    color: "#6B7280",
  },

  // TIMELINE
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 20,
  },
  timelineItem: {
    gap: 4,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  timelineText: {
    fontSize: 15,
    color: "#6B7280",
  },

  // QUICK ACTIONS
  quickActions: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  actionText: {
    color: "#111827",
    fontWeight: "500",
    fontSize: 15,
  },

  // EMERGENCY BUTTON
  emergencyButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emergencyText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});