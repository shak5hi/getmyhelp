export const subscriptionStyles = {
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontFamily: "Newsreader-SemiBold",
    color: "#2E3A46",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },

  /* TOGGLE */
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  toggleItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
  },

  toggleItemActive: {
    backgroundColor: "#2E3A46",
  },

  toggleText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  toggleTextActive: {
    color: "#FFFFFF",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(46,58,70,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },

  badgeText: {
    fontSize: 12,
    color: "#2E3A46",
    fontWeight: "600",
  },

  planTitle: {
    fontSize: 22,
    fontFamily: "Newsreader-SemiBold",
    color: "#2E3A46",
    marginBottom: 6,
  },

  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E3A46",
    marginBottom: 14,
  },

  feature: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },

  cta: {
    marginTop: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2E3A46",
    justifyContent: "center",
    alignItems: "center",
  },

  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
};
