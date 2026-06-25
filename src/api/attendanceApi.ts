import { apiGet, apiRequest } from "./client";

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendancePhoto {
  uri: string;
  name?: string;
  type?: string;
}

export interface TodayProvider {
  provider: {
    id: string;
    first_name: string;
    last_name?: string | null;
    phone?: string | null;
    profile_image?: string | null;
  };
  assignment_id: string;
  assigned_services: string[];
  days_of_week: number[]; // 0=Mon … 6=Sun
  attendance_id: string | null;
  status: AttendanceStatus | null;
  marked_at: string | null;
  photo_url: string | null;
}

// Maids scheduled for the resident today, with each one's current status.
export const getTodaysProviders = async () => apiGet("/customer/providers/today");

// Mark a scheduled maid present/absent/late, with an optional proof photo.
// Sent as multipart/form-data; the Content-Type boundary is set by the runtime.
export const markAttendance = async (
  providerId: string,
  status: AttendanceStatus,
  photo?: AttendancePhoto | null
) => {
  const form = new FormData();
  form.append("status", status);
  if (photo) {
    form.append("photo", {
      uri: photo.uri,
      name: photo.name || "attendance.jpg",
      type: photo.type || "image/jpeg",
    } as any);
  }
  return apiRequest(`/customer/providers/${providerId}/attendance`, {
    method: "POST",
    body: form,
  });
};

// Monthly attendance history. month format: "YYYY-MM" (defaults to current month server-side).
export const getAttendanceHistory = async (month?: string) => {
  const q = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiGet(`/customer/providers/attendance${q}`);
};
