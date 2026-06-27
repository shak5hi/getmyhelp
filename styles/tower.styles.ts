import { StyleSheet } from "react-native";
import { fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeTowerStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: t.bg,
    },

    step: {
      fontSize: 12,
      color: t.textSecondary,
      marginBottom: 8,
    },

    title: {
      fontSize: 28,
      fontFamily: "Newsreader-SemiBold",
      color: t.text,
      marginBottom: 6,
    },

    subtitle: {
      fontSize: 14,
      color: t.textSecondary,
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

      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,

      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },

      elevation: 2,
    },

    bubbleSelected: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },

    bubbleText: {
      fontSize: 14,
      fontFamily: fonts.semibold,
      color: t.text,
    },

    bubbleTextSelected: {
      color: t.onAccent,
    },

    seeMore: {
      fontSize: 13,
      color: t.textSecondary,
      marginTop: 10,
      alignSelf: "flex-end",
    },

    button: {
      marginTop: "auto",
      height: 52,
      borderRadius: 26,
      backgroundColor: t.accent,
      justifyContent: "center",
      alignItems: "center",
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
  });
