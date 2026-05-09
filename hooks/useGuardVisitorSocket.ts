import { useEffect, useRef } from "react";
import config from "../src/config";

export function useGuardVisitorSocket(
  guardId: string | null,
  token: string | null,
  onMessage: (data: any) => void
) {
  const ws = useRef<WebSocket | null>(null);
  const cbRef = useRef(onMessage);

  useEffect(() => {
    cbRef.current = onMessage;
  });

  useEffect(() => {
    if (!guardId || !token) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (cancelled) return;
      const host = config.apiUrl.replace(/^http/, "ws");
      const socket = new WebSocket(
        `${host}/ws/visitor/guard/${guardId}?token=${token}`
      );

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data !== "pong") cbRef.current(data);
        } catch {}
      };

      socket.onerror = () => socket.close();

      socket.onopen = () => {
        const ping = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send("ping");
        }, 30000);
        socket.addEventListener("close", () => clearInterval(ping));
      };

      socket.onclose = () => {
        if (!cancelled) timeoutId = setTimeout(connect, 5000);
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
  }, [guardId, token]);
}
