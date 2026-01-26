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
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
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
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
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

  /* CHAT */
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
});
