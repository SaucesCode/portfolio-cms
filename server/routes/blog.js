const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// GET all published posts
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      // Don't send full content in list view — too heavy
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        tags: true,
        publishedAt: true,
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET single post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
    });
    if (!post || !post.published) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
