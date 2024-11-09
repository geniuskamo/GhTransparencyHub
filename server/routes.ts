// ... (previous imports remain the same)

export function registerRoutes(app: Express) {
  // ... (previous route handlers remain the same until the status update route)

  // Update request status (admin only)
  app.put("/api/requests/:id/status", async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Start a transaction
      const updatedRequest = await db.transaction(async (tx) => {
        // Update request status
        const [request] = await tx.update(requests)
          .set({ 
            status: req.body.status,
            updatedAt: new Date()
          })
          .where(eq(requests.id, parseInt(req.params.id)))
          .returning();

        if (!request) {
          throw new Error("Request not found");
        }

        // Create notification within the same transaction
        const [notification] = await tx.insert(notifications)
          .values({
            userId: request.userId,
            title: "Request Status Updated",
            message: `Your request "${request.title}" status has been updated to ${req.body.status}.`,
            type: "status_change",
            requestId: request.id
          })
          .returning();

        // Return both updated request and notification
        return { request, notification };
      });

      // Emit WebSocket event after successful transaction
      if (updatedRequest.notification) {
        await createNotification(updatedRequest.notification)
          .catch(error => {
            console.error("Failed to emit notification:", error);
            // Don't throw here as the status update was successful
          });
      }

      res.json(updatedRequest.request);
    } catch (error) {
      console.error("Failed to update request status:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to update request status" 
      });
    }
  });

  // ... (remaining route handlers stay the same)
}
