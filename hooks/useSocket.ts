import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import config from "../src/config";
import { getToken } from "../src/api/tokenStore";

const MAX_BACKOFF_MS = 30000;
const INITIAL_BACKOFF_MS = 1000;

export function useSocket(
  endpoint: string | null,
  onMessage: (data: any) => void
) {
  const ws = useRef<WebSocket | null>(null);
  const cbRef = useRef(onMessage);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    cbRef.current = onMessage;
  });

  useEffect(() => {
    if (!endpoint) return;

    let cancelled = false;

    const connect = async () => {
      // Don't connect if app is in background or we've unmounted
      if (cancelled || appState.current.match(/inactive|background/)) return;
      if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return;

      const token = await getToken();
      if (!token || cancelled) return;

      const host = config.apiUrl.replace(/^http/, "ws");
      const url = endpoint.includes("?") 
        ? `${host}${endpoint}&token=${token}`
        : `${host}${endpoint}?token=${token}`;
      
      const socket = new WebSocket(url);

      socket.onopen = () => {
        if (cancelled) {
          socket.close();
          return;
        }
        backoffRef.current = INITIAL_BACKOFF_MS; // reset on successful connection
      };

      socket.onmessage = (e) => {
        try {
          cbRef.current(JSON.parse(e.data));
        } catch {}
      };

      socket.onclose = () => {
        ws.current = null;
        if (!cancelled && appState.current === "active") {
          // Schedule reconnect with capped exponential backoff + jitter
          const delay = backoffRef.current + Math.random() * 500;
          reconnectTimeout.current = setTimeout(connect, delay);
          backoffRef.current = Math.min(backoffRef.current * 1.5, MAX_BACKOFF_MS);
        }
      };

      socket.onerror = () => {
        // onerror is usually followed by onclose, so we don't need to trigger reconnect here
        // to avoid double-scheduling.
      };

      ws.current = socket;
    };

    connect();

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App came to foreground
        appState.current = nextAppState;
        backoffRef.current = INITIAL_BACKOFF_MS;
        connect();
      } else if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        // App went to background
        appState.current = nextAppState;
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.remove();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [endpoint]);
}
