import { Express } from "express";
import { setupAuth } from "./auth";
import { db } from "db";
import { requests } from "db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import { extname } from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export function registerRoutes(app: Express) {
  setupAuth(app);

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
      res.status(500).json({ message: "Failed to create request" });
    }
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
