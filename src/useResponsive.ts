import { useWindowDimensions } from "react-native";
import { breakpoints } from "../constants/tokens";

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Width-based breakpoint, driven by the narrower of the two window
 * dimensions so rotating a tablet doesn't flip it back to "mobile".
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const shortest = Math.min(width, height);

  const breakpoint: Breakpoint =
    shortest >= breakpoints.desktop
      ? "desktop"
      : shortest >= breakpoints.tablet
      ? "tablet"
      : "mobile";

  return { breakpoint, isWide: breakpoint !== "mobile", width, height };
}
