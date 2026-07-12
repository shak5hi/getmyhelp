import { useSocket } from "./useSocket";

export function useAnnouncementSocket(
  societyId: string | null,
  onMessage: (data: any) => void
) {
  useSocket(societyId ? `/ws/announcements/society/${societyId}` : null, onMessage);
}
