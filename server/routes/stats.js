const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stats = await prisma.stat.findMany();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
