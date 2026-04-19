import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Matched with dashboard
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111827", // Dark dashboard theme accent
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF", // White text on dark avatar
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827", // Dark gray for high contrast
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  addressBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  userAddress: {
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 4,
    fontWeight: "500",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F9FAFB", // Neutral like dashboard highlights
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainerDanger: {
    backgroundColor: "#FEF2F2",
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  menuItemTitleDanger: {
    color: "#EF4444",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 68, // Aligned with the title text
  },
  bottomPadding: {
    height: 40,
  },
});
