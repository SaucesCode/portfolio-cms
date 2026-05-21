const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// GET all projects — sorted by order_index
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

// GET single project by id
router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
