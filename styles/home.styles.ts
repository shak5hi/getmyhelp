import { StyleSheet } from "react-native";
import { Theme } from "../constants/themes";
import { fonts, radii, spacing } from "../constants/tokens";

/**
 * Get-started screen.
 *
 * Colours are taken from the splash (assets/images/splash.mp4 / splash.png), not
 * from the theme: this is the first frame after the splash video, so it has to
 * be the same violet field or the handoff flickers. That means it is intentionally
 * identical in light and dark mode — it's a brand moment, not a themed surface.
 */
export const splash = {
  /** Field gradient. Soft purple fading to white. */
  gradient: ["#F3E8FF", "#FFFFFF", "#FFFFFF"] as const,
  /** Bloom disabled for light theme */
  bloom: ["transparent", "transparent"] as const,
  /** Type on the white field. */
  ink: "#111827",
  inkSoft: "#6B7280",
  /** Accent colors */
  lilac: "#7C3AED",
  warm: "#EA580C",
  /** Panel removed/transparent */
  panel: "transparent",
  panelInk: "#111827",
  panelInkSoft: "#6B7280",
  /** Glass on white */
  frameBorder: "rgba(0,0,0,0.08)",
  frameFill: "#FFFFFF",
  bubbleFill: "#F9FAFB",
};

export const makeHomeStyles = (_t: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: splash.gradient[0],
    },
    field: {
      ...StyleSheet.absoluteFillObject,
    },
    /* Bright bloom, top-right — the splash's light source. */
    bloom: {
      position: "absolute",
      top: -140,
      right: -120,
      width: 380,
      height: 380,
      borderRadius: 190,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xxl + spacing.xs,
    },

    /* TOP BAR — wordmark left, language right. */
    topBar: {
      marginTop: spacing.huge + spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    brandLogo: {
      width: 26,
      height: 26,
      borderRadius: radii.xs,
    },
    brandWord: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      letterSpacing: -0.2,
      color: splash.ink,
    },
    langPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
      borderRadius: radii.full,
      backgroundColor: "rgba(0,0,0,0.04)",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",
    },
    langPillText: {
      fontSize: 12,
      fontFamily: fonts.displaySemibold,
      color: splash.ink,
    },

    /* HEADLINE */
    headline: {
      marginTop: spacing.huge + spacing.lg,
    },
    headlineLine: {
      fontFamily: fonts.displayBold,
      fontSize: 30,
      lineHeight: 39,
      color: splash.ink,
      letterSpacing: -0.7,
    },
    headlineAccent: {
      fontFamily: fonts.displayExtrabold,
      fontSize: 32,
      lineHeight: 41,
      color: splash.lilac,
      letterSpacing: -0.9,
    },

    /* THE FRAME — glass on violet. Bottom edge dissolves into the panel. */
    frame: {
      marginTop: spacing.xxl,
      borderRadius: radii.xxl + 6,
      borderWidth: 1.5,
      borderColor: splash.frameBorder,
      backgroundColor: splash.frameFill,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxxl,
      paddingBottom: spacing.huge * 1.6,
    },

    bubbleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing.sm + 2,
    },
    bubble: {
      flexShrink: 1,
      backgroundColor: splash.bubbleFill,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md + 2,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
      fontFamily: fonts.displayMedium,
      color: splash.ink,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: radii.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: splash.ink,
    },
    avatarText: {
      fontSize: 14,
      fontFamily: fonts.displayBold,
      color: "#F9FAFB",
    },

    dashed: {
      borderBottomWidth: 1,
      borderStyle: "dashed",
      borderColor: "rgba(0,0,0,0.15)",
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },

    result: {
      fontSize: 17,
      lineHeight: 26,
      fontFamily: fonts.displaySemibold,
      color: splash.inkSoft,
    },
    resGreat: { color: splash.lilac, fontFamily: fonts.displayBold },
    resWarm: { color: splash.warm, fontFamily: fonts.displayBold },
    resPurple: { color: splash.lilac, fontFamily: fonts.displayBold },
    resValue: { color: splash.ink, fontFamily: fonts.displayExtrabold },

    chip: {
      position: "absolute",
      left: spacing.xl,
      bottom: spacing.huge * 1.6 - 46,
      width: 38,
      height: 38,
      borderRadius: radii.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#111827",
      shadowColor: "rgba(0,0,0,0.2)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 8,
    },

    /* The near-white panel the splash curves into. Painted over the frame, so
       the frame's bottom border dissolves into it exactly as in the reference. */
    panel: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "34%",
    },

    /* FOOTER — sits on the panel, so type flips to violet ink. */
    footer: {
      marginTop: "auto",
      paddingBottom: spacing.xxxl + spacing.xs,
    },
    tagline: {
      fontFamily: fonts.displayBold,
      fontSize: 19,
      lineHeight: 27,
      color: splash.ink,
      letterSpacing: -0.3,
      marginBottom: spacing.xl,
    },
    cta: {
      backgroundColor: "#5B21D6",
      shadowColor: "#4C1FD7",
    },
    terms: {
      marginTop: spacing.lg,
      textAlign: "center",
      fontSize: 11.5,
      fontFamily: fonts.displayMedium,
      color: splash.inkSoft,
    },
    termsLink: {
      fontFamily: fonts.displayBold,
      color: "#5B21D6",
    },

    /* MODAL */
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(30,15,70,0.55)",
      justifyContent: "center",
      padding: spacing.xxl,
    },
    modalCard: {
      backgroundColor: splash.panel,
      borderRadius: radii.xl,
      padding: spacing.xl,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: fonts.displaySemibold,
      marginBottom: spacing.md,
      color: splash.panelInk,
    },
    modalOption: { paddingVertical: spacing.md },
    modalOptionText: {
      fontSize: 16,
      fontFamily: fonts.displayMedium,
      color: splash.panelInk,
    },
  });
