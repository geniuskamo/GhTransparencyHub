import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { db } from "db";
import { notifications } from "db/schema";
import type { InsertNotification } from "db/schema";
import { sql } from "drizzle-orm";

export let io: Server;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function verifyNotificationsTable() {
  try {
    await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'notifications'
      );
    `);
  } catch (error) {
    console.error("Error verifying notifications table:", error);
    throw new Error("Notifications table verification failed");
  }
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation. Attempts remaining: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
}

export function setupWebSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    pingTimeout: 60000,
    connectTimeout: 60000,
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? false 
        : ["http://localhost:5000"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    
    try {
      if (!userId) {
        throw new Error("No user ID provided");
      }
      
      socket.join(`user:${userId}`);
      console.log(`User ${userId} connected`);

      socket.on("disconnect", () => {
        try {
          if (userId) {
            socket.leave(`user:${userId}`);
            console.log(`User ${userId} disconnected`);
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }
      });

      socket.on("markAsRead", async (notificationId: number) => {
        try {
          await retryOperation(async () => {
            await db.update(notifications)
              .set({ read: "true" })
              .where({ id: notificationId });
          });
        } catch (error) {
          console.error("Error marking notification as read:", error);
          socket.emit("error", "Failed to mark notification as read");
        }
      });

    } catch (error) {
      console.error("Error handling socket connection:", error);
      socket.emit("error", "Connection error occurred");
      socket.disconnect(true);
    }
  });

  // Handle server-wide errors
  io.engine.on("connection_error", (err) => {
    console.error("Connection error:", err);
  });
}

export async function createNotification(data: InsertNotification) {
  await verifyNotificationsTable();

  return retryOperation(async () => {
    try {
      const [notification] = await db.insert(notifications)
        .values(data)
        .returning();

      if (notification.userId) {
        io?.to(`user:${notification.userId}`).emit("notification", notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  });
}
