import { useSocket } from "./useSocket";

export function usePostSocket(
  postId: string | null,
  onMessage: (data: any) => void
) {
  useSocket(postId ? `/ws/forum/post/${postId}` : null, onMessage);
}
