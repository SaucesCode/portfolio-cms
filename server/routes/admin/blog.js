const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { attachPublishingRoutes } = require("../../lib/publishingRoutes");
const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const { title, slug, content, excerpt, coverImageUrl, tags } = req.body;
  try {
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImageUrl,
        tags: tags || [],
        status: "DRAFT",
        createdById: req.user.userId,
        updatedById: req.user.userId,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "That slug is already taken — try a different one" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Content edits never touch lifecycle fields — same guard as every other module
router.patch("/:id", async (req, res) => {
  try {
    const { status, publishedAt, scheduledAt, archivedAt, ...rest } = req.body;
    const post = await prisma.blogPost.update({
      where: { id: parseInt(req.params.id) },
      data: { ...rest, updatedById: req.user.userId },
    });
    res.json(post);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "That slug is already taken — try a different one" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

attachPublishingRoutes(router, prisma, "blogPost"); // fully inherited — zero new lifecycle code

module.exports = router;
