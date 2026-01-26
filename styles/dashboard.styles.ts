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

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subGreeting: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },

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
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  heroRole: {
    color: "#D1D5DB",
    marginTop: 4,
  },
  heroDate: {
    color: "#9CA3AF",
    marginVertical: 10,
  },
  heroButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    fontWeight: "700",
  },
  heroImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginLeft: 16,
  },

  subscriptionCard: {
    backgroundColor: "#fff",
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
  },
  planName: {
    fontSize: 22,
    fontWeight: "800",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#6366F1",
  },
  planPriceMonth: {
    fontSize: 14,
    color: "#6B7280",
  },

  planDetailsContainer: {
    marginTop: 16,
    gap: 12,
  },
  planDetailCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  planDetailCardActive: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  planDetailName: {
    fontSize: 16,
    fontWeight: "700",
  },
  planDetailPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6366F1",
  },
  popularBadge: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

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
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    backgroundColor: "#fff",
    height: "85%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  chatHeader: {
    backgroundColor: "#6366F1",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  messagesList: {
    padding: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  botMessage: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
  },
  userMessage: {
    backgroundColor: "#6366F1",
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 15,
  },
  botMessageText: {
    color: "#111827",
  },
  userMessageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  sendButton: {
    backgroundColor: "#6366F1",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
