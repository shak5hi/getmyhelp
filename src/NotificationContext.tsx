import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { listNotifications } from "./api/communityApi";
import { approveVisitor, rejectVisitor, getResidentVisitorDetail } from "./api/visitorApi";
import { useNotificationSocket } from "../hooks/useNotificationSocket";
import config from "./config";

const toFullUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${config.fileBaseUrl}${url}`;
};

export interface VisitorApprovalRequest {
  visitorId: string;
  visitorName: string;
  visitorMobile: string;
  purpose: string;
  selfieUrl: string | null;
  guardName: string;
}

interface NotificationContextType {
  unreadCount: number;
  decrement: () => void;
  clear: () => void;
  refresh: () => Promise<void>;
  pendingApproval: VisitorApprovalRequest | null;
  dismissApproval: () => void;
  approveVisitor: (visitorId: string) => Promise<void>;
  rejectVisitor: (visitorId: string, note: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  decrement: () => {},
  clear: () => {},
  refresh: async () => {},
  pendingApproval: null,
  dismissApproval: () => {},
  approveVisitor: async () => {},
  rejectVisitor: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // null = still loading role from storage; true = guard; false = resident
  const [isGuard, setIsGuard] = useState<boolean | null>(null);
  const [pendingApproval, setPendingApproval] = useState<VisitorApprovalRequest | null>(null);

  const refresh = async () => {
    try {
      const res = await listNotifications(0, 1, true);
      const count = res?.unread_count ?? res?.data?.unread_count ?? 0;
      setUnreadCount(count);
    } catch {}
  };

  useEffect(() => {
    (async () => {
      const userStr = await AsyncStorage.getItem("user");
      const tok = await AsyncStorage.getItem("access_token");
      const role = await AsyncStorage.getItem("user_role");
      const guardFlag = role === "guard";
      setIsGuard(guardFlag);
      setToken(tok);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCustomerId(String(user.id));
        } catch {}
      }
      if (!guardFlag) refresh();
    })();
  }, []);

  // Only connect the notification socket after role is confirmed as resident.
  // null = still loading (don't connect), true = guard (don't connect), false = resident (connect).
  const socketCustomerId = isGuard === false ? customerId : null;
  const socketToken = isGuard === false ? token : null;

  useNotificationSocket(socketCustomerId, socketToken, async (msg) => {
    if (!msg) return;
    const ev: string = msg.event ?? msg.type ?? "";
    if (ev === "ping" || ev === "pong" || ev === "heartbeat") return;

    setUnreadCount((c) => c + 1);

    if (ev === "new_notification" && msg.data?.type === "visitor_approval_request") {
      try {
        const linkId = msg.data.link_id ?? msg.link_id;
        const res = await getResidentVisitorDetail(linkId);
        const detail = res?.data ?? res;
        setPendingApproval({
          visitorId: detail.id,
          visitorName: detail.name,
          visitorMobile: detail.mobile,
          purpose: detail.purpose,
          selfieUrl: toFullUrl(detail.selfie_url),
          guardName: "",
        });
      } catch {}
    }
  });

  const dismissApproval = () => setPendingApproval(null);

  const handleApproveVisitor = async (visitorId: string) => {
    await approveVisitor(visitorId);
  };

  const handleRejectVisitor = async (visitorId: string, note: string) => {
    await rejectVisitor(visitorId, note);
  };

  const decrement = () => setUnreadCount((c) => Math.max(0, c - 1));
  const clear = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        decrement,
        clear,
        refresh,
        pendingApproval,
        dismissApproval,
        approveVisitor: handleApproveVisitor,
        rejectVisitor: handleRejectVisitor,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
