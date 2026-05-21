const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// Only return visible testimonials to the public
router.get("/", async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: { orderIndex: "asc" },
    });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
