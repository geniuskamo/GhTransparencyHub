import { Express, static as expressStatic } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { requests, requestAnalytics, notifications } from "db/schema";
import { eq, sql } from "drizzle-orm";
import multer from "multer";
import { extname, join } from "path";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../client/src/lib/constants";
import { createNotification } from "./notifications";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

export function registerRoutes(app: Express) {
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', expressStatic(join(process.cwd(), 'uploads')));

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.user.id))
        .orderBy(sql`${notifications.createdAt} DESC`);
      res.json(userNotifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get all requests - public access
  app.get("/api/requests", async (req, res) => {
    try {
      const allRequests = await db
        .select()
        .from(requests)
        .orderBy(sql`${requests.createdAt} DESC`);
      res.json(allRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Create new request - requires authentication
  app.post("/api/requests", upload.single("document"), async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [newRequest] = await db.insert(requests).values({
        title: req.body.title,
        description: req.body.description,
        userId: req.user.id,
        institutionId: parseInt(req.body.institutionId),
        documentUrl: req.file ? `/uploads/${req.file.filename}` : null
      }).returning();

      // Create notification for new request
      await createNotification({
        userId: req.user.id,
        title: "Request Submitted",
        message: `Your request "${newRequest.title}" has been submitted successfully.`,
        type: "request_update",
        requestId: newRequest.id
      });

      res.json(newRequest);
    } catch (error) {
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err: any) => {
          if (err) console.error('Error removing file:', err);
        });
      }
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  // Error handling for multer
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        });
      }
      return res.status(400).json({ message: err.message });
    }
    
    if (err.message === "Only PDF files are allowed") {
      return res.status(400).json({ message: err.message });
    }
    
    next(err);
  });

  // Update request status (admin only)
  app.put("/api/requests/:id/status", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [updatedRequest] = await db.update(requests)
        .set({ status: req.body.status })
        .where(eq(requests.id, parseInt(req.params.id)))
        .returning();

      // Create notification for status update
      await createNotification({
        userId: updatedRequest.userId,
        title: "Request Status Updated",
        message: `Your request "${updatedRequest.title}" status has been updated to ${req.body.status}.`,
        type: "status_change",
        requestId: updatedRequest.id
      });

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [updatedNotification] = await db.update(notifications)
        .set({ read: "true" })
        .where(eq(notifications.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Get analytics data (admin only)
  app.get("/api/analytics", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const statusCounts = await db
        .select({
          status: requests.status,
          count: sql<number>`count(*)::int`
        })
        .from(requests)
        .groupBy(requests.status);

      const avgProcessingTime = await db
        .select({
          avgTime: sql<number>`
            avg(extract(epoch from (updated_at - created_at)) / 3600)::int`
        })
        .from(requests)
        .where(eq(requests.status, 'completed'));

      const requestsOverTime = await db
        .select({
          date: sql<string>`date_trunc('day', created_at)::date`,
          count: sql<number>`count(*)::int`
        })
        .from(requests)
        .where(sql`created_at >= now() - interval '7 days'`)
        .groupBy(sql`date_trunc('day', created_at)`)
        .orderBy(sql`date_trunc('day', created_at)`);

      const institutionStats = await db
        .select({
          institutionId: requests.institutionId,
          totalRequests: sql<number>`count(*)::int`,
          completedRequests: sql<number>`
            sum(case when status = 'completed' then 1 else 0 end)::int`
        })
        .from(requests)
        .groupBy(requests.institutionId);

      res.json({
        statusCounts,
        avgProcessingTime: avgProcessingTime[0]?.avgTime || 0,
        requestsOverTime,
        institutionStats
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
}