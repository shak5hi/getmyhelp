export const towerStyles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },

  step: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // 🔑 wrapper controls spacing — NOT the bubble itself
  bubbleWrapper: {
    width: "30%",
    marginBottom: 12,
  },

  // 🫧 REAL bubble
  bubble: {
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255, 255, 255, 0.35)",

    borderWidth: 1,
    borderColor: "rgba(46, 58, 70, 0.12)",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },

    elevation: 3,
  },

  bubbleSelected: {
    backgroundColor: "rgba(46, 58, 70, 0.9)",
    borderColor: "rgba(46, 58, 70, 0.9)",
  },

  bubbleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A46",
  },

  bubbleTextSelected: {
    color: "#FFFFFF",
  },

  seeMore: {
    fontSize: 13,
    color: "#6B7280",
    alignSelf: "flex-end",
    marginBottom: 24,
  },

  button: {
    marginTop: "auto",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2E3A46",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#E5E7EB",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  buttonTextDisabled: {
    color: "#9CA3AF",
  },
};
