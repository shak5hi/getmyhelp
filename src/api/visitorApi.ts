import { apiGet, apiPost, apiDelete, apiRequest } from "./client";

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
  const q = new URLSearchParams();
  if (params?.status) q.append("status", params.status);
  if (params?.date) q.append("date", params.date);
  if (params?.skip != null) q.append("skip", String(params.skip));
  if (params?.limit != null) q.append("limit", String(params.limit));
  return apiGet(`/guard/visitors?${q}`);
};

export const createVisitor = async (formData: FormData) =>
  apiRequest(`/guard/visitors`, { method: "POST", body: formData });

export const getPendingVisitors = async () => apiGet(`/guard/visitors/pending`);

export const getVisitorDetail = async (id: string) => apiGet(`/guard/visitors/${id}`);

export const getResidentVisitorDetail = async (id: string) =>
  apiGet(`/customer/visitors/${id}`);

export const markVisitorExit = async (id: string) =>
  apiPost(`/guard/visitors/${id}/exit`);

export const scanQRCode = async (token: string) =>
  apiPost(`/guard/visitors/scan-qr?token=${encodeURIComponent(token)}`);

// Resident
export const getVisitorHistory = async (skip = 0, limit = 20, visitorStatus?: string) => {
  const q = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (visitorStatus) q.append("status", visitorStatus);
  return apiGet(`/customer/visitors/history?${q}`);
};

export const getPendingApprovals = async () => apiGet(`/customer/visitors/pending`);

export const approveVisitor = async (id: string, note?: string) =>
  apiPost(`/customer/visitors/${id}/approve`, { note: note ?? null });

export const rejectVisitor = async (id: string, note: string) =>
  apiPost(`/customer/visitors/${id}/reject`, { note });

export const createQRInvite = async (data: QRInviteCreate) =>
  apiPost(`/customer/visitors/qr-invites`, data);

export const getQRInvites = async (skip = 0, limit = 20, activeOnly = false) => {
  const q = new URLSearchParams({ skip: String(skip), limit: String(limit), active_only: String(activeOnly) });
  return apiGet(`/customer/visitors/qr-invites?${q}`);
};

export const getQRInviteDetail = async (id: string) =>
  apiGet(`/customer/visitors/qr-invites/${id}`);

export const revokeQRInvite = async (id: string) =>
  apiDelete(`/customer/visitors/qr-invites/${id}`);

// OTP invites (Resident)
export const createOTPInvite = async (data: OTPInviteCreate) =>
  apiPost(`/customer/visitors/otp-invites`, data);

export const getOTPInvites = async (skip = 0, limit = 20, activeOnly = false) => {
  const q = new URLSearchParams({ skip: String(skip), limit: String(limit), active_only: String(activeOnly) });
  return apiGet(`/customer/visitors/otp-invites?${q}`);
};

export const revokeOTPInvite = async (id: string) =>
  apiDelete(`/customer/visitors/otp-invites/${id}`);

// OTP verification (Guard)
export const verifyOTP = async (otpCode: string) =>
  apiPost(`/guard/visitors/verify-otp?otp_code=${encodeURIComponent(otpCode)}`);
