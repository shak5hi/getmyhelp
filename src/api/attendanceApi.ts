import { apiGet, apiRequest } from "./client";

/**
 * The attendance mark, and nothing else.
 *
 * Leave is a *separate* axis (see `on_leave` on TodayProvider) and must not be
 * folded in here: `absent` means "was expected, didn't show"; on leave means
 * "was never expected". Collapsing them loses a distinction that can't be
 * recovered — and would quietly turn approved time-off into a no-show on the
 * maid's record.
 */
export type AttendanceStatus = "present" | "absent" | "late";

export const normalizeStatus = (raw: any): AttendanceStatus | null => {
  const s = String(raw ?? "").toLowerCase();
  if (s === "present" || s === "absent" || s === "late") return s;
  return null;
};

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
  // 0=Sun … 6=Sat — same indexing as JS Date.getDay(). (The comment here used to
  // say 0=Mon; it was wrong, and verified against live data.)
  days_of_week: number[];
  attendance_id: string | null;
  status: AttendanceStatus | null;
  marked_at: string | null;
  photo_url: string | null;

  /**
   * Admin-set leave for today. Deliberately separate from `status`: that field
   * carries *attendance* (did they turn up), and leave is a different axis — a
   * maid on leave has no attendance to record. Overloading one field would lose
   * the difference between "marked absent" and "not expected".
   */
  on_leave?: boolean | null;

  /** Set when this maid is standing in for someone. The name is what the
   *  resident needs — a stranger at the door is the whole problem being solved. */
  substitute_for?: string | null;
  substitute_for_name?: string | null;
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
