import { StyleSheet } from "react-native";
import { fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makePhoneStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
      paddingHorizontal: 24,
      paddingTop: 40,
    },

    appName: {
      textAlign: "center",
      fontSize: 16,
      fontFamily: fonts.semibold,
      marginBottom: 40,
      color: t.text,
    },

    title: {
      marginBottom: 6,
      fontFamily: "Newsreader-SemiBold",
      fontSize: 24,
      color: t.text,
    },

    subtitle: {
      fontSize: 14,
      color: t.textSecondary,
      marginBottom: 24,
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 52,
      marginBottom: 24,
      backgroundColor: t.card,
    },

    countryCode: {
      fontSize: 16,
      marginRight: 8,
      color: t.text,
    },

    input: {
      flex: 1,
      fontSize: 16,
      color: t.text,
    },

    button: {
      backgroundColor: t.accent,
      height: 52,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    },

    buttonText: {
      color: t.onAccent,
      fontSize: 16,
      fontFamily: fonts.semibold,
    },
    buttonDisabled: {
      backgroundColor: t.surfaceAlt,
    },

    buttonTextDisabled: {
      color: t.textTertiary,
    },
    inputError: {
      borderColor: t.danger,
      borderWidth: 1,
    },

    errorText: {
      color: t.danger,
      fontSize: 12,
      marginTop: 6,
      marginBottom: 6,
    },
  });
