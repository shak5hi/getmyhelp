import { useSocket } from "./useSocket";

export function useForumSocket(
  societyId: string | null,
  onMessage: (data: any) => void
) {
  useSocket(societyId ? `/ws/forum/society/${societyId}` : null, onMessage);
}
