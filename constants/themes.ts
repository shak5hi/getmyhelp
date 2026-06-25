/**
 * Theme palettes — "Violet & Magenta" (the gh brand).
 *
 * Matched to the "gh" wordmark: a vivid gradient that runs from electric violet
 * (#7C2AE8) into hot magenta-pink (#E91E8C). One brand gradient, a solid
 * orchid-magenta accent drawn from its midpoint, on cool lilac paper (light) or
 * deep plum-black (dark). One identity, designed twice.
 *
 * Consumed via `useTheme()` (src/ThemeContext). Spacing / radii / fonts remain
 * in constants/tokens (theme-independent).
 */
export type Theme = {
  mode: "light" | "dark";
  bg: string;
  surface: string;
  card: string;
  /** Subtle filled control background — segmented tracks, icon chips, toggles. */
  surfaceAlt: string;
  border: string;
  /** Hairline divider inside cards/lists (can equal border). */
  divider: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentPressed: string;
  accentTint: string;
  /** Two-stop brand gradient (the logo): violet → magenta. */
  accentGradient: [string, string];
  /** Foreground that sits on top of the accent / gradient. */
  onAccent: string;
  success: string;
  successTint: string;
  warning: string;
  warningTint: string;
  danger: string;
  dangerTint: string;
  overlay: string;
  // soft elevation for the single hero card (whisper in light, none-needed in dark)
  heroShadow: object;
};

export const darkTheme: Theme = {
  mode: "dark",
  bg: "#130C1A", // deep plum-black
  surface: "#1C1326",
  card: "#221730", // lifted plum charcoal
  surfaceAlt: "#2B1E3A",
  border: "#352544",
  divider: "#291C36",
  text: "#F3ECFA", // soft lilac-white
  textSecondary: "#B6A6C8",
  textTertiary: "#7E6E90",
  accent: "#D556EE", // fuchsia-violet that glows on a dark canvas
  accentPressed: "#C23FDD",
  accentTint: "#2C1838",
  accentGradient: ["#9A4BF5", "#F23C9A"], // logo violet → magenta (brighter for dark)
  onAccent: "#FFFFFF",
  success: "#5FD08A", // mint glow
  successTint: "#14271C",
  warning: "#E8B24A", // brass
  warningTint: "#2C2310",
  danger: "#F2606B",
  dangerTint: "#2E191C",
  overlay: "rgba(0,0,0,0.6)",
  heroShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 6,
  },
};

export const lightTheme: Theme = {
  mode: "light",
  bg: "#FAF7FD", // soft lilac paper
  surface: "#FFFFFF",
  card: "#FFFFFF",
  surfaceAlt: "#F2EAFA",
  border: "#E8DEF3",
  divider: "#EFE7F7",
  text: "#1F1229", // deep plum ink
  textSecondary: "#6B5F7B",
  textTertiary: "#A89BB8",
  accent: "#A21CAF", // orchid-magenta (the logo's violet↔pink midpoint)
  accentPressed: "#8A1796",
  accentTint: "#F7E6FB",
  accentGradient: ["#7C2AE8", "#E91E8C"], // logo violet → magenta
  onAccent: "#FFFFFF",
  success: "#2E9E5B", // readable green on tint
  successTint: "#E4F4EA",
  warning: "#9A6A1B", // antique brass
  warningTint: "#F6ECD3",
  danger: "#D11F35",
  dangerTint: "#FAE3E6",
  overlay: "rgba(31,18,41,0.42)",
  heroShadow: {
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.20,
    shadowRadius: 20,
    elevation: 4,
  },
};
