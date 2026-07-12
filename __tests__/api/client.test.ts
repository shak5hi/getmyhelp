import { apiRequest, setUnauthorizedHandler, NetworkError, ApiError, clearSession } from "../../src/api/client";
import { setToken } from "../../src/api/tokenStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// SecureStore is where the token actually lives, so the mock has to *store*
// things. With bare jest.fn()s, setToken() writes nowhere and getToken() returns
// undefined — every assertion about an authenticated request then passes or fails
// for the wrong reason.
const mockSecureStore = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  multiRemove: jest.fn(),
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  getItemAsync: jest.fn(async (k: string) => mockSecureStore.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    mockSecureStore.set(k, v);
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    mockSecureStore.delete(k);
  }),
}));

describe("apiRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.clear();
    setUnauthorizedHandler(null);
    global.fetch = jest.fn();
  });

  it("adds Authorization header if token exists", async () => {
    await setToken("fake-token");
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ success: true }),
    });

    await apiRequest("/test");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("handles 401 Unauthorized by clearing session and calling handler", async () => {
    await setToken("fake-token");
    
    const mockHandler = jest.fn();
    setUnauthorizedHandler(mockHandler);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
      text: async () => JSON.stringify({ detail: "Expired" }),
    });

    // A 401 both drives the session-expiry flow *and* rejects, so the calling
    // screen cannot carry on as though the request succeeded.
    await expect(apiRequest("/test")).rejects.toThrow(ApiError);

    await new Promise(process.nextTick);

    expect(mockHandler).toHaveBeenCalled();
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
  });

  it("throws ApiError on 404 so a missing route can never look like empty data", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 404,
      text: async () => JSON.stringify({ detail: "Not Found" }),
    });

    await expect(apiRequest("/customer/account", { method: "DELETE" })).rejects.toThrow(
      ApiError
    );
  });

  it("surfaces the server's detail as the error message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 400,
      text: async () => JSON.stringify({ detail: "Visitor already exists" }),
    });

    await expect(apiRequest("/test")).rejects.toThrow("Visitor already exists");
  });

  it("throws NetworkError on timeout", async () => {
    // Mock fetch to simulate AbortError
    (global.fetch as jest.Mock).mockRejectedValueOnce({ name: "AbortError" });

    await expect(apiRequest("/test", { timeoutMs: 1 })).rejects.toThrow(NetworkError);
  });

  it("returns benign shape on 403 feature disabled", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 403,
      text: async () => JSON.stringify({ detail: "Module not enabled" }),
    });

    const res = await apiRequest("/test");
    expect(res).toEqual(
      expect.objectContaining({
        featureDisabled: true,
        data: { items: [] }
      })
    );
  });

  it("parses non-JSON responses gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 500,
      text: async () => "<html>Internal Server Error</html>",
    });

    try {
      await apiRequest("/test");
    } catch (e: any) {
      expect(e.message).toContain("500");
    }
  });
});
