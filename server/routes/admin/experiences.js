const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { attachPublishingRoutes, attachReorderRoute } = require("../../lib/publishingRoutes");
const { enforceSingleton } = require("../../lib/singleton");
const router = express.Router();

router.use(authMiddleware);

// Current role first, then most-recent-first; orderIndex only breaks ties on identical dates
router.get("/", async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }, { orderIndex: "asc" }],
    });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { company, role, description, startDate, endDate, isCurrent, orderIndex } = req.body;
  try {
    const experience = await prisma.experience.create({
      data: {
        company,
        role,
        description,
        startDate: new Date(startDate),
        endDate: isCurrent ? null : endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        orderIndex: orderIndex || 0,
        status: "DRAFT",
        createdById: req.user.userId,
        updatedById: req.user.userId,
      },
    });
    if (experience.isCurrent) {
      await enforceSingleton(prisma, "experience", "isCurrent", experience.id);
    }
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Content edits never touch lifecycle fields — same guard as every other module
router.patch("/:id", async (req, res) => {
  try {
    const { status, publishedAt, scheduledAt, archivedAt, ...rest } = req.body;
    const data = { ...rest, updatedById: req.user.userId };

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.isCurrent) data.endDate = null;
    else if (data.endDate) data.endDate = new Date(data.endDate);

    const experience = await prisma.experience.update({
      where: { id: parseInt(req.params.id) },
      data,
    });

    if (experience.isCurrent) {
      await enforceSingleton(prisma, "experience", "isCurrent", experience.id);
    }
    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.experience.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

attachReorderRoute(router, prisma, "experience");
attachPublishingRoutes(router, prisma, "experience");

module.exports = router;
