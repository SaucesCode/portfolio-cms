const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const stats = await prisma.stat.findMany({ orderBy: { id: "asc" } });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { label, value, iconName } = req.body;
  try {
    const stat = await prisma.stat.create({
      data: { label, value: parseInt(value) || 0, iconName },
    });
    res.status(201).json(stat);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { label, value, iconName } = req.body;
  try {
    const stat = await prisma.stat.update({
      where: { id: parseInt(req.params.id) },
      data: { label, value: parseInt(value), iconName },
    });
    res.json(stat);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.stat.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
