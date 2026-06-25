import { StyleSheet } from "react-native";
import { Theme } from "../constants/themes";

export const makeLocationStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
      paddingHorizontal: 24,
    },

    step: {
      fontSize: 12,
      color: t.textSecondary,
      marginBottom: 12,
    },

    title: {
      fontSize: 28,
      fontWeight: "600",
      color: t.text,
      marginBottom: 8,
      fontFamily: "Newsreader-SemiBold",
    },

    subtitle: {
      fontSize: 14,
      color: t.textSecondary,
      marginBottom: 24,
    },

    dropdown: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.card,
    },

    dropdownText: {
      fontSize: 14,
      color: t.text,
    },

    placeholderText: {
      color: t.textTertiary,
    },

    currentLocation: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },

    currentLocationText: {
      fontSize: 13,
      color: t.text,
      marginLeft: 6,
    },

    button: {
      height: 52,
      borderRadius: 26,
      backgroundColor: t.accent,
      justifyContent: "center",
      alignItems: "center",
      marginTop: "auto",
    },

    buttonDisabled: {
      backgroundColor: t.surfaceAlt,
    },

    buttonText: {
      color: t.onAccent,
      fontSize: 16,
      fontWeight: "600",
    },

    buttonTextDisabled: {
      color: t.textTertiary,
    },

    errorText: {
      color: t.danger,
      fontSize: 12,
      marginBottom: 8,
    },

    dropdownList: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      marginTop: 6,
      backgroundColor: t.card,
    },

    dropdownItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },

    dropdownItemText: {
      fontSize: 14,
      color: t.text,
    },

    detectedLocation: {
      marginTop: 8,
      marginBottom: 12,
      fontSize: 13,
      color: t.text,
    },

    loading: {
      marginLeft: 8,
      fontSize: 14,
      color: t.text,
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
      color: t.text,
    },

    content: {
      marginTop: 40,
    },

    bottomActions: {
      marginTop: "auto",
      paddingBottom: 30,
    },

    secondaryAction: {
      marginTop: 16,
      textAlign: "center",
      color: t.accent,
      fontSize: 14,
    },

    containerCentered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: t.bg,
    },

    iconWrapper: {
      marginBottom: 24,
    },

    centerTitle: {
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 24,
      color: t.text,
      textAlign: "center",
    },

    topContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    bottomButtons: {
      marginTop: "auto",
      paddingBottom: 30,
    },

    primaryButton: {
      width: "100%",
      backgroundColor: t.accent,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 12,
    },

    primaryButtonDisabled: {
      opacity: 0.6,
    },

    primaryButtonText: {
      color: t.onAccent,
      fontSize: 15,
      fontWeight: "600",
    },

    errorContainer: {
      marginTop: 12,
    },

    secondaryButton: {
      width: "100%",
      borderWidth: 1,
      borderColor: t.accent,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },

    secondaryButtonText: {
      color: t.accent,
      fontSize: 14,
      fontWeight: "500",
    },
  });
