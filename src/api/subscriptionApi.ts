import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const authHeaders = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return { Authorization: `Bearer ${token ?? ""}` };
};

const jsonHeaders = async () => ({
  ...(await authHeaders()),
  "Content-Type": "application/json",
});

// Safely parse a response: if the server returns non-JSON (e.g. a 500 "Internal
// Server Error" text page), log the status + raw body instead of throwing, and
// return a consistent empty shape so screens degrade gracefully.
const parseResponse = async (res: Response, label: string) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.log(`[${label}] HTTP ${res.status} non-JSON response:`, text.slice(0, 300));
    return {
      message: null,
      detail: `Server error (${res.status}). Please try again later.`,
      data: { items: [] },
    };
  }
};

export const getAvailablePlans = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/subscriptions/plans`, { headers });
  return parseResponse(res, "plans");
};

export const getMySubscriptions = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/subscriptions`, { headers });
  return parseResponse(res, "subscriptions");
};

export const selectSubscription = async (planId: string) => {
  const headers = await jsonHeaders();
  const res = await fetch(`${config.apiUrl}/customer/select-subscription`, {
    method: "POST",
    headers,
    body: JSON.stringify({ plan_id: planId }),
  });
  return parseResponse(res, "select-subscription");
};

export const requestSubscriptionCancellation = async (subId: string) => {
  const headers = await jsonHeaders();
  const res = await fetch(`${config.apiUrl}/customer/subscriptions/${subId}/cancel-request`, {
    method: "POST",
    headers,
  });
  return parseResponse(res, "cancel-request");
};
