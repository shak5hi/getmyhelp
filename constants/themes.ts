/**
 * Theme palettes — "Terracotta & Ink".
 *
 * A warm, editorial aesthetic built for a home-help / residential concierge app.
 * Terracotta clay accent over warm paper (light) or espresso black (dark), with
 * sage + brass as functional companions. One brand accent, designed twice.
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
  /** Two-stop gradient for the hero / focal surfaces (warm → deep). */
  accentGradient: [string, string];
  /** Foreground that sits on top of the accent gradient. */
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
  bg: "#14110D", // warm espresso black
  surface: "#1E1913",
  card: "#241E17", // lifted warm charcoal
  surfaceAlt: "#2C241B",
  border: "#332A20",
  divider: "#2A2218",
  text: "#F4ECE0", // warm white
  textSecondary: "#B6A795",
  textTertiary: "#7C6F60",
  accent: "#E8763F", // terracotta that glows on a dark canvas
  accentPressed: "#CF5E2C",
  accentTint: "#2C2018",
  accentGradient: ["#EE824B", "#C24E27"],
  onAccent: "#FFF8F2",
  success: "#6BBE85", // sage glow
  successTint: "#16271B",
  warning: "#E8B24A", // brass
  warningTint: "#2C2310",
  danger: "#E8736B",
  dangerTint: "#2C1A18",
  overlay: "rgba(0,0,0,0.6)",
  heroShadow: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 6,
  },
};

export const lightTheme: Theme = {
  mode: "light",
  bg: "#F7F2EA", // warm cream paper
  surface: "#FFFFFF",
  card: "#FFFFFF",
  surfaceAlt: "#F0E9DC",
  border: "#EAE1D3",
  divider: "#EFE7D9",
  text: "#241C16", // warm ink
  textSecondary: "#7A6E61",
  textTertiary: "#AA9D8C",
  accent: "#C2522E", // terracotta clay
  accentPressed: "#A4421F",
  accentTint: "#F6E7DC",
  accentGradient: ["#D5612F", "#B23E22"],
  onAccent: "#FFF7F1",
  success: "#3E7A52", // deep sage (readable on tint)
  successTint: "#E5F0E6",
  warning: "#9A6A1B", // antique brass
  warningTint: "#F6ECD3",
  danger: "#C2413B",
  dangerTint: "#F8E4E1",
  overlay: "rgba(36,28,22,0.42)",
  heroShadow: {
    shadowColor: "#8A4A2A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
};
