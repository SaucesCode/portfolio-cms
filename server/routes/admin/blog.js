const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
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
        published: false,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const post = await prisma.blogPost.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(post);
  } catch (error) {
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

// Publish / unpublish toggle
router.patch("/:id/publish", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: parseInt(req.params.id) } });
    const updated = await prisma.blogPost.update({
      where: { id: parseInt(req.params.id) },
      data: {
        published: !post.published,
        publishedAt: !post.published ? new Date() : null,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
