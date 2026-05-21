const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { orderIndex: "asc" },
    });
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
