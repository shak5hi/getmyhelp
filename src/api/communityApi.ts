import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const authHeaders = async () => {
  const token = await AsyncStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token ?? ""}`,
    "Content-Type": "application/json",
  };
};

const safeJson = async (res: Response) => {
  try { return await res.json(); } catch { return null; }
};

export const getAnnouncements = async (page = 1, search = "") => {
  const headers = await authHeaders();
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.append("search", search);
  const res = await fetch(
    `${config.apiUrl}/customer/announcements?${params}`,
    { headers }
  );
  return res.json();
};

export const getAnnouncementDetail = async (id: string | number) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/announcements/${id}`,
    { headers }
  );
  return res.json();
};

export const markAnnouncementRead = async (id: string | number) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/announcements/${id}/mark-read`,
    { method: "POST", headers }
  );
  return safeJson(res);
};

export const reactToAnnouncement = async (id: string | number, emoji: string) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/announcements/${id}/react`,
    { method: "POST", headers, body: JSON.stringify({ emoji }) }
  );
  return safeJson(res);
};

export const getForumPosts = async (page = 1) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/forum/posts?page=${page}`,
    { headers }
  );
  return res.json();
};

export const getForumPostDetail = async (id: string | number) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/forum/posts/${id}`,
    { headers }
  );
  return res.json();
};

export const createForumPost = async (
  content: string,
  images: Array<{ uri: string; fileName?: string; mimeType?: string }> = []
) => {
  const token = await AsyncStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("content", content);
  images.forEach((img, i) => {
    formData.append("images", {
      uri: img.uri,
      name: img.fileName ?? `image_${i}.jpg`,
      type: img.mimeType ?? "image/jpeg",
    } as any);
  });
  const res = await fetch(`${config.apiUrl}/customer/forum/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token ?? ""}` },
    body: formData,
  });
  return safeJson(res);
};

export const reactToPost = async (id: string | number, emoji: string) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/forum/posts/${id}/react`,
    { method: "POST", headers, body: JSON.stringify({ emoji }) }
  );
  return safeJson(res);
};

export const reactToReply = async (id: string | number, emoji: string) => {
  const headers = await authHeaders();
  const res = await fetch(
    `${config.apiUrl}/customer/forum/replies/${id}/react`,
    { method: "POST", headers, body: JSON.stringify({ emoji }) }
  );
  return safeJson(res);
};

export const getPolls = async () => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/polls`, { headers });
  return res.json();
};

export const votePoll = async (
  id: string | number,
  optionIds: (string | number)[]
) => {
  const headers = await authHeaders();
  const res = await fetch(`${config.apiUrl}/customer/polls/${id}/vote`, {
    method: "POST",
    headers,
    body: JSON.stringify({ option_ids: optionIds }),
  });
  return safeJson(res);
};
