import { StyleSheet } from "react-native";
import { radii, spacing, shadows, fonts } from "../constants/tokens";
import { Theme } from "../constants/themes";

export const makeStyles = (t: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  header: {
    fontSize: 28,
    fontFamily: fonts.extrabold,
    color: t.text,
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: -0.6,
  },
  subHeader: {
    fontSize: 15,
    color: t.textSecondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.extrabold,
    color: t.textTertiary,
    marginTop: 28,
    marginBottom: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  /* EMPTY STATE */
  emptyState: {
    backgroundColor: t.card,
    padding: 32,
    borderRadius: radii.xl,
    alignItems: "center",
    ...shadows.sm,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontFamily: fonts.extrabold,
    color: t.text,
    marginTop: 14,
  },
  emptyStateText: {
    fontSize: 14,
    color: t.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: t.accent,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: radii.full,
    ...shadows.accent,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 15,
  },

  /* ACTIVE PLAN — premium spotlight card */
  activeCard: {
    backgroundColor: t.card,
    borderRadius: radii.xl,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: t.border,
    ...shadows.md,
  },
  activeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.successTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  activeBadgeText: {
    fontSize: 11,
    fontFamily: fonts.extrabold,
    color: t.success,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  planName: {
    fontSize: 24,
    fontFamily: fonts.extrabold,
    color: t.text,
    letterSpacing: -0.4,
  },
  planPrice: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: t.accent,
    marginTop: 4,
  },
  planInfo: {
    fontSize: 14,
    color: t.textSecondary,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  updateButton: {
    flex: 1,
    backgroundColor: t.accent,
    paddingVertical: 13,
    borderRadius: radii.full,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontFamily: fonts.extrabold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: t.surfaceAlt,
    paddingVertical: 13,
    borderRadius: radii.full,
    alignItems: "center",
  },
  deleteButtonText: {
    color: t.danger,
    fontFamily: fonts.bold,
  },

  /* AVAILABLE PLAN CARDS */
  availableCard: {
    backgroundColor: t.card,
    borderRadius: radii.xl,
    padding: 22,
    marginBottom: 16,
    ...shadows.sm,
  },
  availablePlanName: {
    fontSize: 19,
    fontFamily: fonts.extrabold,
    color: t.text,
    letterSpacing: -0.3,
  },
  availablePlanPrice: {
    fontSize: 26,
    fontFamily: fonts.extrabold,
    color: t.text,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  subscribeButton: {
    flexDirection: "row",
    backgroundColor: t.accentTint,
    paddingVertical: 13,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  subscribeButtonText: {
    color: t.accent,
    fontFamily: fonts.extrabold,
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: t.bg,
  },
});
