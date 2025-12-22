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
});
