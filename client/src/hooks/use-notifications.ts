import useSWR from "swr";
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "./use-user";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "db/schema";

const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 3000;

export function useNotifications() {
  const { user } = useUser();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const { data: notifications, error, mutate } = useSWR<Notification[]>(
    user ? "/api/notifications" : null
  );

  const connectSocket = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    socketRef.current = io({
      auth: { userId: user.id },
      reconnection: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
      timeout: 10000
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      reconnectAttemptsRef.current = 0;
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast({
        title: "Connection Error",
        description: "Having trouble connecting to notifications",
        variant: "destructive"
      });
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Reconnect manually if server disconnected
        setTimeout(() => {
          if (reconnectAttemptsRef.current < RECONNECTION_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            socketRef.current?.connect();
          }
        }, RECONNECTION_DELAY);
      }
    });

    socketRef.current.on("notification", (notification: Notification) => {
      mutate((prev) => [notification, ...(prev || [])]);
      toast({
        title: notification.title,
        description: notification.message
      });
    });

    socketRef.current.on("error", (error: string) => {
      console.error("Socket error:", error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    });
  }, [user, toast, mutate]);

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include"
      });
      
      // Optimistically update the local data
      mutate((prev) => 
        prev?.map(n => 
          n.id === notificationId ? { ...n, read: "true" } : n
        )
      );

      // Also notify the socket
      socketRef.current?.emit("markAsRead", notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  return {
    notifications,
    isLoading: !error && !notifications,
    error,
    markAsRead
  };
}
