import { StyleSheet } from "react-native";

export const phoneStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  appName: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 40,
  },

  title: {
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: "Newsreader-SemiBold",
    fontSize: 24,
    color: "#2E3A46",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B8BB5",
    marginBottom: 24,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d1d1ff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 24,
  },

  countryCode: {
    fontSize: 16,
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#2E3A46",
    height: 52,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
  backgroundColor: "#E5E7EB", // greyed out
  },

  buttonTextDisabled: {
    color: "#9CA3AF",
  },
  inputError: {
  borderColor: "#EF4444",
  borderWidth: 1,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 6,
  },
});
