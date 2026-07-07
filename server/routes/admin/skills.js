const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { attachPublishingRoutes, attachReorderRoute } = require("../../lib/publishingRoutes");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { orderIndex: "asc" } });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, category, proficiencyLevel, iconName, orderIndex } = req.body;
  try {
    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        proficiencyLevel: proficiencyLevel || 3,
        iconName,
        orderIndex: orderIndex || 0,
        status: "DRAFT", // every new item starts as a draft — publishing is a deliberate, separate action
        createdById: req.user.userId,
        updatedById: req.user.userId,
      },
    });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Content edits never touch lifecycle fields — status/publishedAt/scheduledAt/archivedAt
// are stripped out here so this route can never accidentally change publishing state.
router.patch("/:id", async (req, res) => {
  try {
    const { status, publishedAt, scheduledAt, archivedAt, ...rest } = req.body;
    const skill = await prisma.skill.update({
      where: { id: parseInt(req.params.id) },
      data: { ...rest, updatedById: req.user.userId },
    });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

attachReorderRoute(router, prisma, "skill");
attachPublishingRoutes(router, prisma, "skill");

module.exports = router;
