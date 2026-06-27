import { StyleSheet } from "react-native";
import { fonts } from "../constants/tokens";

export const manualLocationStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  step: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 8,
    fontFamily: fonts.medium,
  },

  title: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: "#1E293B",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    padding: 0,
  },

  error: {
    color: "#EF4444",
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
  },

  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  noResultsText: {
    fontSize: 16,
    color: "#6B7280",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },

  cardSelected: {
    backgroundColor: "#1E293B",
    borderColor: "#1E293B",
  },

  societyName: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: "#1E293B",
    marginBottom: 6,
  },

  societyNameSelected: {
    color: "#FFFFFF",
  },

  societyAddress: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    marginBottom: 6,
  },

  societyAddressSelected: {
    color: "#CBD5E1",
  },

  pincode: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: fonts.medium,
  },

  pincodeSelected: {
    color: "#94A3B8",
  },

  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  locationButtonText: {
    color: "#1E293B",
    fontSize: 14,
    fontFamily: fonts.semibold,
  },

  continueButton: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: fonts.semibold,
  },

  continueButtonTextDisabled: {
    color: "#9CA3AF",
  },
});