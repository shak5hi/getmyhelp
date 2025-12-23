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

  /* ✅ FLEX BUBBLE LAYOUT */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  /* 🫧 TRUE BUBBLE */
  bubble: {
    paddingHorizontal: 18,
    height: 44,
    minWidth: 60,

    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(255, 255, 255, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(46, 58, 70, 0.15)",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 2,
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
    marginTop: 10,
    alignSelf: "flex-end",
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

