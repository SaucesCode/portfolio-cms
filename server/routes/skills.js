const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { orderIndex: "asc" },
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
