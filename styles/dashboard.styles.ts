import { StyleSheet } from "react-native";

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 24,
  },

  /* HEADER */
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  /* GREETING */
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subGreeting: {
    fontSize: 16,
    color: "#6B7280",
  },

  /* HERO */
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  heroText: { flex: 1 },
  heroLabel: {
    color: "#9CA3AF",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroRole: {
    color: "#D1D5DB",
    marginTop: 4,
    fontSize: 14,
  },
  heroDate: {
    color: "#9CA3AF",
    marginVertical: 10,
    fontSize: 13,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 14,
  },
  heroImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginLeft: 16,
  },

  /* SUBSCRIPTION */
  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentPlanText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#6366F1",
    marginTop: 2,
  },
  planPriceMonth: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
  },

  updatePlanButton: {
    marginTop: 12,
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  updatePlanButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6366F1",
  },

  planDetailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  planDetailCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  planDetailCardActive: {
    borderColor: "#6366F1",
    borderWidth: 2,
    backgroundColor: "#EEF2FF",
  },
  planDetailName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  planDetailPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6366F1",
    marginTop: 4,
  },

  /* CHAT BUTTON */
  chatButton: {
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  /* CHAT MODAL */
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    overflow: "hidden",
  },
  chatHeader: {
    backgroundColor: "#6366F1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  chatHeaderSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
    fontWeight: "500",
  },
  messagesList: {
    padding: 20,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  botMessage: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: "#6366F1",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  botMessageText: {
    color: "#111827",
  },
  userMessageText: {
    color: "#FFFFFF",
  },

  /* CHAT OPTIONS */
  optionsContainer: {
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
    paddingLeft: 0,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#6366F1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: "flex-start",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
});