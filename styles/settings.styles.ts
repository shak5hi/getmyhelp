import { StyleSheet } from "react-native";
import { fonts, radii, spacing, shadows } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
    },
    content: {
      padding: spacing.xl,
      paddingBottom: 100,
    },
    header: {
      fontFamily: fonts.serifSemibold,
      fontSize: 28,
      color: t.text,
      marginBottom: 8,
      marginTop: 20,
      letterSpacing: -0.4,
    },
    subHeader: {
      fontFamily: fonts.regular,
      fontSize: 15,
      color: t.textSecondary,
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: fonts.bold,
      fontSize: 12,
      color: t.textTertiary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginTop: 28,
      marginBottom: 12,
      marginLeft: 4,
    },
    card: {
      backgroundColor: t.card,
      borderRadius: radii.lg,
      borderWidth: t.mode === "light" ? 1 : 0,
      borderColor: t.border,
      overflow: "hidden",
      ...(t.mode === "light" ? shadows.sm : {}),
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: t.divider,
    },
    settingRowNoBorder: {
      borderBottomWidth: 0,
    },
    settingRowLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    iconPrimary: {
      backgroundColor: t.surfaceAlt,
    },
    iconWarning: {
      backgroundColor: t.warningTint,
    },
    iconSuccess: {
      backgroundColor: t.successTint,
    },
    iconInfo: {
      backgroundColor: t.accentTint,
    },
    settingTitle: {
      fontFamily: fonts.medium,
      fontSize: 15,
      color: t.text,
    },
    settingValueText: {
      fontFamily: fonts.bold,
      fontSize: 16,
      color: t.success,
    },
    versionText: {
      textAlign: "center",
      color: t.textTertiary,
      fontSize: 13,
      marginTop: 40,
      marginBottom: 20,
    },
  });
