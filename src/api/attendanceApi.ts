import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const authHeaders = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return { Authorization: `Bearer ${token ?? ""}` };
};

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
export const getTodaysProviders = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/providers/today`, { headers });
  return res.json();
};

// Mark a scheduled maid present/absent/late, with an optional proof photo.
// Sent as multipart/form-data; the Content-Type boundary is set by the runtime.
export const markAttendance = async (
  providerId: string,
  status: AttendanceStatus,
  photo?: AttendancePhoto | null
) => {
  const headers = await authHeaders();
  const form = new FormData();
  form.append("status", status);
  if (photo) {
    form.append("photo", {
      uri: photo.uri,
      name: photo.name || "attendance.jpg",
      type: photo.type || "image/jpeg",
    } as any);
  }
  const res = await fetch(`${config.apiUrl}/customer/providers/${providerId}/attendance`, {
    method: "POST",
    headers, // do NOT set Content-Type manually — let FormData set the boundary
    body: form,
  });
  return res.json();
};

// Monthly attendance history. month format: "YYYY-MM" (defaults to current month server-side).
export const getAttendanceHistory = async (month?: string) => {
  const headers = await authHeaders();
  const q = month ? `?month=${encodeURIComponent(month)}` : "";
  const res = await fetch(`${config.apiUrl}/customer/providers/attendance${q}`, { headers });
  return res.json();
};
