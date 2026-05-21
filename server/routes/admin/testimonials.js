const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
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
  const { name, role, company, avatarUrl, quote, orderIndex, visible } = req.body;
  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        company,
        avatarUrl,
        quote,
        orderIndex: orderIndex || 0,
        visible: visible ?? true,
      },
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
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

module.exports = router;
