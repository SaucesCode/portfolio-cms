const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.use(authMiddleware);

// GET all (admin sees all, including non-featured)
router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { orderIndex: "asc" },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  const {
    title,
    description,
    techStack,
    imageUrl,
    liveUrl,
    githubUrl,
    githubRepoName,
    featured,
    orderIndex,
  } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack: techStack || [],
        imageUrl,
        liveUrl,
        githubUrl,
        githubRepoName,
        featured: featured || false,
        orderIndex: orderIndex || 0,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// REORDER — receives array of { id, orderIndex }
router.patch("/reorder", async (req, res) => {
  const { items } = req.body;
  try {
    const updates = items.map(({ id, orderIndex }) =>
      prisma.project.update({
        where: { id },
        data: { orderIndex },
      }),
    );
    await prisma.$transaction(updates);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
