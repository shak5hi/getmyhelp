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

export interface QRInviteCreate {
  visitor_name: string;
  visitor_mobile: string;
  purpose: string;
  tower_id?: string;
  flat_number?: string;
  valid_from: string;
  valid_until: string;
  entry_type?: "single" | "multi";
  max_uses?: number;
}

export interface OTPInviteCreate {
  visitor_name: string;
  visitor_mobile: string;
  purpose: string;
  tower_id?: string;
  flat_number?: string;
}


// Guard
export const getVisitorList = async (params?: { status?: string; date?: string; skip?: number; limit?: number }) => {
  const headers = await authHeaders();
  const q = new URLSearchParams();
  if (params?.status) q.append("status", params.status);
  if (params?.date) q.append("date", params.date);
  if (params?.skip != null) q.append("skip", String(params.skip));
  if (params?.limit != null) q.append("limit", String(params.limit));
  const res = await fetch(`${config.apiUrl}/guard/visitors?${q}`, { headers });
  return res.json();
};

export const createVisitor = async (formData: FormData) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/guard/visitors`, {
    method: "POST",
    headers,
    body: formData,
  });
  return res.json();
};

export const getPendingVisitors = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/guard/visitors/pending`, { headers });
  return res.json();
};

export const getVisitorDetail = async (id: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/guard/visitors/${id}`, { headers });
  return res.json();
};

export const getResidentVisitorDetail = async (id: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/${id}`, { headers });
  return res.json();
};

export const markVisitorExit = async (id: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/guard/visitors/${id}/exit`, {
    method: "POST",
    headers,
  });
  return res.json();
};

export const scanQRCode = async (token: string) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/guard/visitors/scan-qr?token=${encodeURIComponent(token)}`,
    { method: "POST", headers }
  );
  return res.json();
};

// Resident
export const getVisitorHistory = async (skip = 0, limit = 20, visitorStatus?: string) => {
  const headers = await authHeaders();
  const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (visitorStatus) q.append("status", visitorStatus);
  const res = await fetch(`${config.apiUrl}/customer/visitors/history?${q}`, { headers });
  return res.json();
};

export const getPendingApprovals = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/pending`, { headers });
  return res.json();
};

export const approveVisitor = async (id: string, note?: string) => {
  const headers = await jsonHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/${id}/approve`, {
    method: "POST",
    headers,
    body: JSON.stringify({ note: note ?? null }),
  });
  return res.json();
};

export const rejectVisitor = async (id: string, note: string) => {
  const headers = await jsonHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/${id}/reject`, {
    method: "POST",
    headers,
    body: JSON.stringify({ note }),
  });
  return res.json();
};

export const createQRInvite = async (data: QRInviteCreate) => {
  const headers = await jsonHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/qr-invites`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getQRInvites = async (skip = 0, limit = 20, activeOnly = false) => {
  const headers = await authHeaders();
  const q = new URLSearchParams({ skip: String(skip), limit: String(limit), active_only: String(activeOnly) });
  const res = await fetch(`${config.apiUrl}/customer/visitors/qr-invites?${q}`, { headers });
  return res.json();
};

export const getQRInviteDetail = async (id: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/qr-invites/${id}`, { headers });
  return res.json();
};

export const revokeQRInvite = async (id: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/qr-invites/${id}`, {
    method: "DELETE",
    headers,
  });
  return res.json();
};

// OTP invites (Resident)
export const createOTPInvite = async (data: OTPInviteCreate) => {
  const headers = await jsonHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/otp-invites`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getOTPInvites = async (skip = 0, limit = 20, activeOnly = false) => {
  const headers = await authHeaders();
  const q = new URLSearchParams({ skip: String(skip), limit: String(limit), active_only: String(activeOnly) });
  const res = await fetch(`${config.apiUrl}/customer/visitors/otp-invites?${q}`, { headers });
  return res.json();
};

export const revokeOTPInvite = async (id: string) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/visitors/otp-invites/${id}`, {
    method: "DELETE",
    headers,
  });
  return res.json();
};

// OTP verification (Guard)
export const verifyOTP = async (otpCode: string) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/guard/visitors/verify-otp?otp_code=${encodeURIComponent(otpCode)}`,
    { method: "POST", headers }
  );
  return res.json();
};
