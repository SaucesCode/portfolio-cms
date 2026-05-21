const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const stats = await prisma.stat.findMany();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { label, value, iconName } = req.body;
  try {
    const stat = await prisma.stat.update({
      where: { id: parseInt(req.params.id) },
      data: { label, value, iconName },
    });
    res.json(stat);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
