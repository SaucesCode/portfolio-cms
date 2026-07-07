const express = require("express");
const prisma = require("../lib/prisma");
const { promoteDueScheduled } = require("../lib/publishing");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await promoteDueScheduled(prisma, "project");
    const projects = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { orderIndex: "asc" },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!project || project.status !== "PUBLISHED") {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
