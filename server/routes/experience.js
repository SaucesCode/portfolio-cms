const express = require("express");
const prisma = require("../lib/prisma");
const { promoteDueScheduled } = require("../lib/publishing");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await promoteDueScheduled(prisma, "experience");
    const experiences = await prisma.experience.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }, { orderIndex: "asc" }],
    });
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
