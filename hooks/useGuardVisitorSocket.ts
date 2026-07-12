import { useSocket } from "./useSocket";

export function useGuardVisitorSocket(
  guardId: string | null,
  onMessage: (data: any) => void
) {
  useSocket(guardId ? `/ws/visitor/guard/${guardId}` : null, onMessage);
}
