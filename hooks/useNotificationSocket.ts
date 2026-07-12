import { useSocket } from "./useSocket";

export function useNotificationSocket(
  customerId: string | null,
  onMessage: (data: any) => void
) {
  useSocket(customerId ? `/ws/notifications/customer/${customerId}` : null, onMessage);
}
