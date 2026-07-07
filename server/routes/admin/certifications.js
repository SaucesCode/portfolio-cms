const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { attachPublishingRoutes, attachReorderRoute } = require("../../lib/publishingRoutes");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const certs = await prisma.certification.findMany({ orderBy: { orderIndex: "asc" } });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, issuer, issueDate, credentialUrl, badgeImageUrl, orderIndex } = req.body;
  try {
    const cert = await prisma.certification.create({
      data: {
        name,
        issuer,
        issueDate: new Date(issueDate),
        credentialUrl,
        badgeImageUrl,
        orderIndex: orderIndex || 0,
        status: "DRAFT",
        createdById: req.user.userId,
        updatedById: req.user.userId,
      },
    });
    res.status(201).json(cert);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Content edits never touch lifecycle fields — same guard as every other module
router.patch("/:id", async (req, res) => {
  try {
    const { status, publishedAt, scheduledAt, archivedAt, ...rest } = req.body;
    const data = { ...rest, updatedById: req.user.userId };
    if (data.issueDate) data.issueDate = new Date(data.issueDate);

    const cert = await prisma.certification.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(cert);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.certification.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

attachReorderRoute(router, prisma, "certification");
attachPublishingRoutes(router, prisma, "certification"); // fully inherited — zero new lifecycle code

module.exports = router;
