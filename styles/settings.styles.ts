import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    marginTop: 20,
  },
  subHeader: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 32,
    marginBottom: 12,
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingRowNoBorder: {
    borderBottomWidth: 0,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconPrimary: {
    backgroundColor: "#F9FAFB",
  },
  iconWarning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
  },
  iconSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#D1FAE5",
  },
  iconInfo: {
    backgroundColor: "#EEF2FF",
    borderColor: "#E0E7FF",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  settingValueText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  versionText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 40,
    marginBottom: 20,
  }
});
