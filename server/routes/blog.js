const express = require("express");
const prisma = require("../lib/prisma");
const { promoteDueScheduled } = require("../lib/publishing");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await promoteDueScheduled(prisma, "blogPost");
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
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

router.get("/:slug", async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
    if (!post || post.status !== "PUBLISHED") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
