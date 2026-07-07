// Attaches the four lifecycle transitions to any router, for any Prisma model
// that has status/publishedAt/scheduledAt/archivedAt. Zero model-specific logic.
function attachPublishingRoutes(router, prisma, modelName) {
  router.patch("/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await prisma[modelName].findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Not found" });

      const updated = await prisma[modelName].update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: existing.publishedAt || new Date(), // preserved across republish
          scheduledAt: null,
          archivedAt: null,
          updatedById: req.user.userId,
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.patch("/:id/unpublish", async (req, res) => {
    try {
      const updated = await prisma[modelName].update({
        where: { id: parseInt(req.params.id) },
        data: { status: "DRAFT", updatedById: req.user.userId },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.patch("/:id/schedule", async (req, res) => {
    const { scheduledAt } = req.body;
    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      return res.status(400).json({ error: "Scheduled time must be in the future" });
    }
    try {
      const updated = await prisma[modelName].update({
        where: { id: parseInt(req.params.id) },
        data: {
          status: "SCHEDULED",
          scheduledAt: new Date(scheduledAt),
          updatedById: req.user.userId,
        },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.patch("/:id/archive", async (req, res) => {
    try {
      const updated = await prisma[modelName].update({
        where: { id: parseInt(req.params.id) },
        data: { status: "ARCHIVED", archivedAt: new Date(), updatedById: req.user.userId },
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
}

// Same story for reordering — identical shape needed by Projects and Skills alike.
function attachReorderRoute(router, prisma, modelName) {
  router.patch("/reorder", async (req, res) => {
    const { items } = req.body;
    try {
      const updates = items.map(({ id, orderIndex }) =>
        prisma[modelName].update({ where: { id }, data: { orderIndex } }),
      );
      await prisma.$transaction(updates);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
}

module.exports = { attachPublishingRoutes, attachReorderRoute };
