import { useEffect, useRef } from "react";
import config from "../src/config";

export function useNotificationSocket(
  customerId: string | null,
  token: string | null,
  onMessage: (data: any) => void
) {
  const ws = useRef<WebSocket | null>(null);
  const cbRef = useRef(onMessage);

  useEffect(() => {
    cbRef.current = onMessage;
  });

  useEffect(() => {
    if (!customerId || !token) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (cancelled) return;
      const host = config.apiUrl.replace(/^http/, "ws");
      const socket = new WebSocket(
        `${host}/ws/notifications/customer/${customerId}?token=${token}`
      );

      socket.onmessage = (e) => {
        try { cbRef.current(JSON.parse(e.data)); } catch {}
      };

      // Force reconnect path on error
      socket.onerror = () => socket.close();

      socket.onclose = () => {
        if (!cancelled) timeoutId = setTimeout(connect, 5000);
      };

      // Keepalive ping every 30s to prevent idle connection drops
      socket.onopen = () => {
        const ping = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send("ping");
        }, 30000);
        socket.addEventListener("close", () => clearInterval(ping));
      };

      ws.current = socket;
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      ws.current?.close();
      ws.current = null;
    };
  }, [customerId, token]);
}
