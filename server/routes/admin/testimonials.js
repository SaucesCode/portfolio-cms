const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { attachPublishingRoutes, attachReorderRoute } = require("../../lib/publishingRoutes");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { orderIndex: "asc" } });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, role, company, avatarUrl, quote, orderIndex } = req.body;
  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        company,
        avatarUrl,
        quote,
        orderIndex: orderIndex || 0,
        status: "DRAFT",
        createdById: req.user.userId,
        updatedById: req.user.userId,
      },
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Content edits never touch lifecycle fields — same guard as every other module
router.patch("/:id", async (req, res) => {
  try {
    const { status, publishedAt, scheduledAt, archivedAt, ...rest } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(req.params.id) },
      data: { ...rest, updatedById: req.user.userId },
    });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

attachReorderRoute(router, prisma, "testimonial"); // curated order — like Projects, unlike Experience/Blog
attachPublishingRoutes(router, prisma, "testimonial"); // fully inherited — zero new lifecycle code

module.exports = router;
