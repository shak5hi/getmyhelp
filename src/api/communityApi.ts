import { apiGet, apiPost, apiRequest } from "./client";

// Build a multipart body for forum content (+ optional images / parent reply).
const forumForm = (
  content: string,
  images: Array<{ uri: string; fileName?: string; mimeType?: string }> = [],
  parentReplyId?: string
) => {
  const formData = new FormData();
  formData.append("content", content);
  if (parentReplyId) formData.append("parent_reply_id", parentReplyId);
  images.forEach((img, i) => {
    formData.append("images", {
      uri: img.uri,
      name: img.fileName ?? `image_${i}.jpg`,
      type: img.mimeType ?? "image/jpeg",
    } as any);
  });
  return formData;
};

export const getAnnouncements = async (page = 1, search = "") => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.append("search", search);
  return apiGet(`/customer/announcements?${params}`);
};

export const getAnnouncementDetail = async (id: string | number) =>
  apiGet(`/customer/announcements/${id}`);

export const markAnnouncementRead = async (id: string | number) =>
  apiPost(`/customer/announcements/${id}/mark-read`);

export const reactToAnnouncement = async (id: string | number, emoji: string) =>
  apiPost(`/customer/announcements/${id}/react`, { emoji });

export const getForumPosts = async (page = 1) =>
  apiGet(`/customer/forum/posts?page=${page}`);

export const getForumPostDetail = async (id: string | number) =>
  apiGet(`/customer/forum/posts/${id}`);

export const createForumPost = async (
  content: string,
  images: Array<{ uri: string; fileName?: string; mimeType?: string }> = []
) =>
  apiRequest(`/customer/forum/posts`, {
    method: "POST",
    body: forumForm(content, images),
  });

export const reactToPost = async (id: string | number, emoji: string) =>
  apiPost(`/customer/forum/posts/${id}/react`, { emoji });

export const reactToReply = async (id: string | number, emoji: string) =>
  apiPost(`/customer/forum/replies/${id}/react`, { emoji });

export const getPolls = async () => apiGet(`/customer/polls`);

export const votePoll = async (
  id: string | number,
  optionIds: (string | number)[]
) => apiPost(`/customer/polls/${id}/vote`, { option_ids: optionIds });

export const createReply = async (
  postId: string,
  content: string,
  images: Array<{ uri: string; fileName?: string; mimeType?: string }> = [],
  parentReplyId?: string
) =>
  apiRequest(`/customer/forum/posts/${postId}/replies`, {
    method: "POST",
    body: forumForm(content, images, parentReplyId),
  });

export const editPost = async (postId: string, content: string) =>
  apiRequest(`/customer/forum/posts/${postId}`, {
    method: "PATCH",
    body: forumForm(content),
  });

export const editReply = async (replyId: string, content: string) =>
  apiRequest(`/customer/forum/replies/${replyId}`, {
    method: "PATCH",
    body: forumForm(content),
  });

export const reportPost = async (postId: string, reason: string) =>
  apiPost(`/customer/forum/posts/${postId}/report`, { reason });

export const reportReply = async (replyId: string, reason: string) =>
  apiPost(`/customer/forum/replies/${replyId}/report`, { reason });

export const listNotifications = async (skip = 0, limit = 30, unreadOnly = false) => {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
    unread_only: String(unreadOnly),
  });
  return apiGet(`/customer/notifications?${params}`);
};

export const markNotificationRead = async (id: string) =>
  apiRequest(`/customer/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsRead = async () =>
  apiPost(`/customer/notifications/read-all`);
