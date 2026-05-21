const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
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
      },
    });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const skill = await prisma.skill.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
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

module.exports = router;
