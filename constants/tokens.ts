import { TextStyle } from "react-native";

/**
 * Brand palette (source colors).
 *   Raunak        primary actions, buttons, links, active states
 *   Bougainvillea highlights, badges, promotions
 *   Dhoop         warnings, notifications, warm accents
 *   Phatak        secondary actions, info states
 *   Deewar        text / on-dark foreground
 *   Syahi         deep background base
 */
export const palette = {
  raunak: "#9D5CFF", // brightened purple that glows on a dark canvas
  raunakDeep: "#7B2FD1",
  bougainvillea: "#F25CAE",
  dhoop: "#FFD43B",
  phatak: "#22C0D4",
  deewar: "#FFFFFF",
  syahi: "#1A0E1F",
};

/**
 * DARK THEME. Background is near-black with a faint purple cast (Syahi-derived);
 * cards are a lifted dark surface. Accent is a vibrant purple. Each role is solid.
 */
export const colors = {
  /* Brand — primary (mirrors dark theme in constants/themes.ts) */
  accent: "#6E56F7",
  accentLight: "#1C1830",
  accentMid: "#3C2A5C",

  /* Highlight */
  highlight: palette.bougainvillea,
  highlightLight: "#2E1726",

  /* Secondary — info */
  secondary: palette.phatak,
  secondaryLight: "#0F2A2E",

  /* Warm accent */
  warning: palette.dhoop,
  warningLight: "#2C2410",
  warningText: palette.dhoop,

  /* Surfaces */
  background: "#0D0D0D",
  surface: "#202020",
  surfaceAlt: "#2A2A2A",

  /* Text */
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textTertiary: "#6E6E76",
  textInverse: "#0D0D0D",

  /* Lines */
  border: "#2A2A2A",
  divider: "#232323",

  /* Functional (palette-aligned) */
  success: palette.phatak,
  successLight: "#0F2A2E",
  danger: palette.bougainvillea,
  dangerLight: "#2E1726",
  info: palette.phatak,
  infoLight: "#0F2A2E",

  /* Legacy keys (kept solid; no gradients used anywhere) */
  gradientStart: palette.raunak,
  gradientEnd: palette.raunak,
};

/**
 * Typeface families (loaded in app/_layout).
 *   Inter      — UI / body: minimal, neutral, legible at small sizes.
 *   Newsreader — editorial serif for big greetings & display moments.
 */
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
  serif: "Newsreader-Regular",
  serifSemibold: "Newsreader-SemiBold",
};

/** 4 / 8 px spacing rhythm. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

/** Corner radius scale. */
export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  full: 999,
};

/** Elevation — on dark, separation comes mostly from surface lift; shadows stay subtle. */
export const shadows = {
  none: {},
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 8,
  },
  accent: {
    shadowColor: palette.raunak,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};

/** Typography system — Plus Jakarta Sans, deliberate scale + weight contrast. */
export const typography: Record<string, TextStyle> = {
  display: { fontFamily: fonts.extrabold, fontSize: 32, letterSpacing: -0.8, color: colors.textPrimary },
  h1: { fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.6, color: colors.textPrimary },
  h2: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3, color: colors.textPrimary },
  title: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: -0.1, color: colors.textPrimary },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textPrimary },
  body: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.6, color: colors.textTertiary },
  caption: { fontFamily: fonts.medium, fontSize: 12, color: colors.textTertiary },
};
