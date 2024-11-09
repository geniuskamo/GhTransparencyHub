import useSWR from "swr";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./use-user";
import type { Notification } from "db/schema";

export function useNotifications() {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);
  const { data: notifications, error, mutate } = useSWR<Notification[]>(
    user ? "/api/notifications" : null
  );

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io({
        auth: {
          userId: user.id
        }
      });

      socketRef.current.on("notification", (notification: Notification) => {
        mutate((prev) => [notification, ...(prev || [])]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, mutate]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT"
      });
      mutate();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return {
    notifications,
    isLoading: !error && !notifications,
    error,
    markAsRead
  };
}
