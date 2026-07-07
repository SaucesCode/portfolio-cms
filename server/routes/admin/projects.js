const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { promoteDueScheduled } = require("../../lib/publishing");
const { attachPublishingRoutes, attachReorderRoute } = require("../../lib/publishingRoutes");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    await promoteDueScheduled(prisma, "project");
    const projects = await prisma.project.findMany({ orderBy: { orderIndex: "asc" } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const {
    title,
    description,
    techStack,
    imageUrl,
    liveUrl,
    githubUrl,
    githubRepoName,
    featured,
    orderIndex,
  } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack: techStack || [],
        imageUrl,
        liveUrl,
        githubUrl,
        githubRepoName,
        featured: featured || false,
        orderIndex: orderIndex || 0,
        status: "DRAFT",
        createdById: req.user.userId,
        updatedById: req.user.userId,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// General field updates — does not change status. Use the transition
// routes below for lifecycle changes so the timestamps stay honest.
router.patch("/:id", async (req, res) => {
  try {
    const { status, publishedAt, scheduledAt, archivedAt, ...rest } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { ...rest, updatedById: req.user.userId },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/reorder", async (req, res) => {
  const { items } = req.body;
  try {
    const updates = items.map(({ id, orderIndex }) =>
      prisma.project.update({ where: { id }, data: { orderIndex } }),
    );
    await prisma.$transaction(updates);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Lifecycle transitions ---

router.patch("/:id/publish", async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!existing) return res.status(404).json({ error: "Project not found" });

    const project = await prisma.project.update({
      where: { id: existing.id },
      data: {
        status: "PUBLISHED",
        publishedAt: existing.publishedAt || new Date(), // preserve original publish date on republish
        scheduledAt: null,
        archivedAt: null,
        updatedById: req.user.userId,
      },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/unpublish", async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "DRAFT", updatedById: req.user.userId },
    });
    res.json(project);
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
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status: "SCHEDULED",
        scheduledAt: new Date(scheduledAt),
        updatedById: req.user.userId,
      },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/archive", async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "ARCHIVED", archivedAt: new Date(), updatedById: req.user.userId },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

attachReorderRoute(router, prisma, "project");
attachPublishingRoutes(router, prisma, "project");

module.exports = router;
