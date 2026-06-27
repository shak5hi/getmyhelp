import { StyleSheet } from "react-native";
import { fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeSocietyDetectedStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },

    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: t.bg,
    },

    loadingText: {
      marginTop: 12,
      color: t.textSecondary,
      fontSize: 14,
    },

    step: {
      color: t.textTertiary,
      fontSize: 13,
      marginBottom: 8,
      fontFamily: fonts.medium,
    },

    title: {
      fontSize: 24,
      fontFamily: fonts.bold,
      color: t.text,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
      color: t.textSecondary,
      lineHeight: 20,
    },

    error: {
      color: t.danger,
      marginHorizontal: 20,
      marginBottom: 12,
      fontSize: 14,
    },

    noDataText: {
      fontSize: 16,
      color: t.textSecondary,
      marginBottom: 16,
      textAlign: "center",
    },

    retryButton: {
      backgroundColor: t.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },

    retryButtonText: {
      color: t.onAccent,
      fontSize: 14,
      fontFamily: fonts.semibold,
    },

    scrollView: { flex: 1 },

    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },

    card: {
      width: "48%",
      backgroundColor: t.card,
      borderWidth: 1.5,
      borderColor: t.border,
      borderRadius: 16,
      padding: 16,
      minHeight: 120,
    },

    cardSelected: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },

    societyName: {
      fontSize: 16,
      fontFamily: fonts.semibold,
      color: t.text,
      marginBottom: 6,
    },

    societyNameSelected: { color: t.onAccent },

    societyAddress: {
      fontSize: 12,
      color: t.textSecondary,
      lineHeight: 16,
      marginBottom: 6,
    },

    societyAddressSelected: { color: t.onAccent, opacity: 0.85 },

    pincode: {
      fontSize: 11,
      color: t.textTertiary,
      fontFamily: fonts.medium,
    },

    pincodeSelected: { color: t.onAccent, opacity: 0.75 },

    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: t.divider,
    },

    continueButton: {
      backgroundColor: t.accent,
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: "center",
    },

    continueButtonDisabled: { backgroundColor: t.surfaceAlt },

    continueButtonText: {
      color: t.onAccent,
      fontSize: 16,
      fontFamily: fonts.semibold,
    },

    continueButtonTextDisabled: { color: t.textTertiary },
  });
