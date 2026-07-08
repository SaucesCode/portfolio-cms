const express = require("express");
const prisma = require("../lib/prisma");
const { promoteDueScheduled } = require("../lib/publishing");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await promoteDueScheduled(prisma, "testimonial");
    const testimonials = await prisma.testimonial.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { orderIndex: "asc" },
    });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
