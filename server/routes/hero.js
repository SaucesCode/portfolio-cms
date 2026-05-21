const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const hero = await prisma.hero.findFirst();
    if (!hero) return res.status(404).json({ error: "Hero not found" });
    res.json(hero);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
