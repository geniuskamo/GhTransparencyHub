import { Express, static as expressStatic } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { requests } from "db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import { extname, join } from "path";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../client/src/lib/constants";

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

  // Get all requests
  app.get("/api/requests", async (req, res) => {
    try {
      const allRequests = await db.select().from(requests);
      res.json(allRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Create new request
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

      res.json(newRequest);
    } catch (error) {
      // Remove uploaded file if database insertion fails
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

      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update request status" });
    }
  });
}
