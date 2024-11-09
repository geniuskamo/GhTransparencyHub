import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { db } from "db";
import { notifications } from "db/schema";
import type { InsertNotification } from "db/schema";

export let io: Server;

export function setupWebSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer);

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("disconnect", () => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    socket.on("markAsRead", async (notificationId: number) => {
      try {
        await db.update(notifications)
          .set({ read: "true" })
          .where({ id: notificationId });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });
  });
}

export async function createNotification(data: InsertNotification) {
  try {
    const [notification] = await db.insert(notifications)
      .values(data)
      .returning();

    if (notification.userId) {
      io.to(`user:${notification.userId}`).emit("notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}
