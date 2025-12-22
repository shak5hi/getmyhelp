import { StyleSheet } from "react-native";

export const otpStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2E3A46",
    fontFamily: "Newsreader-SemiBold",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#EEF3F8",
    justifyContent: "center",
    alignItems: "center",
  },

  otpBoxFilled: {
    backgroundColor: "#E6EDF5",
  },

  otpBoxError: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },

  otpText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E3A46",
  },

  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 16,
  },

  button: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2E3A46",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
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

  resendText: {
    marginTop: 24,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },

  resendLink: {
    color: "#2E3A46",
    fontWeight: "600",
  },
});
