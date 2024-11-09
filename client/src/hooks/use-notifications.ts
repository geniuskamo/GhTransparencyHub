import useSWR from "swr";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./use-user";
import type { Notification } from "db/schema";

let socket: Socket | null = null;

export function useNotifications() {
  const { user } = useUser();
  const { data: notifications, error, mutate } = useSWR<Notification[]>(
    user ? "/api/notifications" : null
  );

  useEffect(() => {
    if (!user) return;

    if (!socket) {
      socket = io({
        auth: {
          userId: user.id
        }
      });

      socket.on("notification", (notification: Notification) => {
        mutate((prev) => [notification, ...(prev || [])]);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
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
