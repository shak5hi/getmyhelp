import { StyleSheet } from "react-native";
import { fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeOtpStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: t.bg,
    },

    title: {
      fontSize: 28,
      marginBottom: 8,
      color: t.text,
      fontFamily: "Newsreader-SemiBold",
    },

    subtitle: {
      fontSize: 14,
      color: t.textSecondary,
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
      backgroundColor: t.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },

    otpBoxFilled: {
      backgroundColor: t.accentTint,
    },

    otpBoxError: {
      borderWidth: 1,
      borderColor: t.danger,
    },

    otpText: {
      fontSize: 20,
      fontFamily: fonts.semibold,
      color: t.text,
    },

    hiddenInput: {
      position: "absolute",
      opacity: 0,
    },

    errorText: {
      color: t.danger,
      fontSize: 12,
      marginBottom: 16,
    },

    button: {
      height: 52,
      borderRadius: 26,
      backgroundColor: t.accent,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
    },

    buttonDisabled: {
      backgroundColor: t.surfaceAlt,
    },

    buttonText: {
      color: t.onAccent,
      fontSize: 16,
      fontFamily: fonts.semibold,
    },

    buttonTextDisabled: {
      color: t.textTertiary,
    },

    resendText: {
      marginTop: 24,
      fontSize: 13,
      color: t.textSecondary,
      textAlign: "center",
    },

    resendLink: {
      color: t.accent,
      fontFamily: fonts.semibold,
    },
  });
