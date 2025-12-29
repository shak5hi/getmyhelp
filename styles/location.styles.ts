import { StyleSheet } from "react-native";

export const locationStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  step: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#2E3A46",
    marginBottom: 8,
    fontFamily: "Newsreader-SemiBold",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },

  dropdown: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 14,
    color: "#2E3A46",
  },

  placeholderText: {
    color: "#9CA3AF",
  },

  currentLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  currentLocationText: {
    fontSize: 13,
    color: "#2E3A46",
    marginLeft: 6,
  },

  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2E3A46",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
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
  errorText: {
  color: "#EF4444",
  fontSize: 12,
  marginBottom: 8,
},
    dropdownList: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    },

    dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    },

    dropdownItemText: {
    fontSize: 14,
    color: "#2E3A46",
    },
    detectedLocation: {
  marginTop: 8,
  marginBottom: 12,
  fontSize: 13,
  color: "#2E3A46",
},
loading: {
  marginLeft: 8,
  fontSize: 14,
  color: "#2E3A46",
},
header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 12,
},

headerTitle: {
  fontSize: 16,
  fontWeight: "600",
},

content: {
  marginTop: 40,
},

bottomActions: {
  marginTop: "auto", // ⭐ THIS IS THE MAGIC
  paddingBottom: 30,
},

primaryButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#6C5CE7",
  paddingVertical: 16,
  borderRadius: 12,
  gap: 8,
},

primaryButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
},

secondaryAction: {
  marginTop: 16,
  textAlign: "center",
  color: "#6C5CE7",
  fontSize: 14,
},
containerCentered: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 24,
  backgroundColor: "#fff",
},

iconWrapper: {
  marginBottom: 24,
},

centerTitle: {
  fontSize: 22,
  fontWeight: "600",
  marginBottom: 24,
  color: "#111827",
  textAlign: "center",
},

/* 🔥 YOUR BRAND COLOR */
container: {
  flex: 1,
  backgroundColor: "#fff",
  paddingHorizontal: 24,
},

topContent: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},

bottomButtons: {
  marginTop: "auto", // 🔥 pushes buttons to bottom
  paddingBottom: 30,
},

primaryButton: {
  width: "100%",
  backgroundColor: "#2E3A46",
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: "center",
  marginBottom: 12,
},

primaryButtonText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "600",
},

secondaryButton: {
  width: "100%",
  borderWidth: 1,
  borderColor: "#2E3A46",
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: "center",
},

secondaryButtonText: {
  color: "#2E3A46",
  fontSize: 14,
  fontWeight: "500",
},


});
