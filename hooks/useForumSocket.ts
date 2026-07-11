import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../src/config";
import { getToken } from "../src/api/tokenStore";

export function useForumSocket(
  societyId: string | null,
  onMessage: (data: any) => void
) {
  const ws = useRef<WebSocket | null>(null);
  const cbRef = useRef(onMessage);

  useEffect(() => {
    cbRef.current = onMessage;
  });

  useEffect(() => {
    if (!societyId) return;

    let cancelled = false;

    const connect = async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      const host = config.apiUrl.replace(/^http/, "ws");
      const socket = new WebSocket(
        `${host}/ws/forum/society/${societyId}?token=${token}`
      );

      socket.onmessage = (e) => {
        try {
          cbRef.current(JSON.parse(e.data));
        } catch {}
      };

      ws.current = socket;
    };

    connect();

    return () => {
      cancelled = true;
      ws.current?.close();
      ws.current = null;
    };
  }, [societyId]);
}
