import { StyleSheet } from "react-native";
import { radii, spacing, shadows, fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeStyles = (t: Theme) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bg,
  },
  safeArea: {
    flex: 1,
    backgroundColor: t.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 120,
  },

  /* ===== CLEAN WHITE HEADER ===== */
  header: {
    backgroundColor: t.bg,
    paddingHorizontal: spacing.xl,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  headerKicker: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: t.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: t.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: t.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarText: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: t.text,
  },
  userName: {
    fontFamily: fonts.extrabold,
    fontSize: 20,
    color: t.text,
    letterSpacing: -0.4,
  },
  userPhone: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textSecondary,
    marginTop: 2,
  },
  addressBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 4,
  },
  userAddress: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: t.accent,
  },

  /* ===== SECTION CARDS ===== */
  sectionContainer: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: t.textTertiary,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: t.card,
    borderRadius: radii.xl,
    overflow: "hidden",
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: t.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconContainerDanger: {
    backgroundColor: t.dangerTint,
  },
  menuItemTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  menuItemTitleDanger: {
    color: t.danger,
  },
  divider: {
    height: 1,
    backgroundColor: t.divider,
    marginLeft: 72,
  },
  bottomPadding: {
    height: 40,
  },
});
