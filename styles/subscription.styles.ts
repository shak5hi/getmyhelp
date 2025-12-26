export const subscriptionStyles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 28,
    fontFamily: "Newsreader-SemiBold",
    color: "#2E3A46",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },

  /* ───── SLIDER ───── */
  slider: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    padding: 4,
    marginBottom: 24,
  },

  sliderItemWrapper: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: "center",
  },

  sliderItemActive: {
    backgroundColor: "#2E3A46",
  },

  sliderItemText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  sliderItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  /* ───── CARD ───── */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  planTitle: {
    fontSize: 22,
    fontFamily: "Newsreader-SemiBold",
    color: "#2E3A46",
    marginBottom: 4,
  },

  price: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2E3A46",
    marginBottom: 16,
  },

  feature: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },

  seeMore: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  button: {
    marginTop: 20,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2E3A46",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
};
