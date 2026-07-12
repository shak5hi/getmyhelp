import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import HomeScreen from "../../app/index";
import { getToken } from "../../src/api/tokenStore";
import { apiGet } from "../../src/api/client";
import { useRouter } from "expo-router";
import { lightTheme } from "../../constants/themes";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../src/api/tokenStore", () => ({
  getToken: jest.fn(),
}));

jest.mock("../../src/api/client", () => ({
  apiGet: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("en"),
  setItem: jest.fn(),
}));

// Assert on translation *keys*, not copy — otherwise every string tweak in the
// marketing headline breaks the routing tests.
jest.mock("../../src/i18n", () => ({
  __esModule: true,
  default: { t: (key: string) => key, locale: "en" },
}));

// The real theme object: makeHomeStyles() indexes into it, so a stub like
// { theme: "light" } yields undefined styles and hides real regressions.
jest.mock("../../src/ThemeContext", () => ({
  useTheme: () => ({ theme: jest.requireActual("../../constants/themes").lightTheme }),
}));

describe("HomeScreen", () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("shows the landing page once the session check finds no token", async () => {
    (getToken as jest.Mock).mockResolvedValue(null);

    // RNTL 14 renders asynchronously (React 19 concurrent) — `render` must be awaited.
    const { findByText, getByText } = await render(<HomeScreen />);

    // The screen shows a spinner while the session check runs, so the landing
    // copy only exists after it settles.
    expect(await findByText("appName")).toBeTruthy();
    expect(getByText("getStarted")).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("redirects a resident with a complete profile to the dashboard", async () => {
    (getToken as jest.Mock).mockResolvedValue("fake-token");
    (apiGet as jest.Mock).mockResolvedValue({
      data: { society_id: "1", tower_id: "1", user_role: "resident" },
    });

    await render(<HomeScreen />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/dashboard");
    });
  });

  it("redirects a guard to the guard tabs", async () => {
    (getToken as jest.Mock).mockResolvedValue("fake-token");
    (apiGet as jest.Mock).mockResolvedValue({
      data: { society_id: "1", tower_id: "1", user_role: "guard" },
    });

    await render(<HomeScreen />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/(guard-tabs)/visitor-list");
    });
  });

  it("does not redirect when the profile has no society yet", async () => {
    (getToken as jest.Mock).mockResolvedValue("fake-token");
    (apiGet as jest.Mock).mockResolvedValue({ data: { user_role: "resident" } });

    const { findByText } = await render(<HomeScreen />);

    expect(await findByText("getStarted")).toBeTruthy();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
