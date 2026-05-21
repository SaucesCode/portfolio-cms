const express = require("express");
const prisma = require("../lib/prisma");
const router = express.Router();

// Returns projects that have a github_repo_name (acts as pinned repos)
router.get("/pinned", async (req, res) => {
  try {
    const pinned = await prisma.project.findMany({
      where: {
        githubRepoName: { not: null },
        featured: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        language: true,
        stars: true,
        forks: true,
        githubUrl: true,
        liveUrl: true,
      },
    });
    res.json(pinned);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Proxy the GitHub contribution SVG
router.get("/contributions", async (req, res) => {
  try {
    const username = process.env.GITHUB_USERNAME;
    const response = await fetch(`https://ghchart.rshah.org/${username}`);
    const svg = await response.text();
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch contributions" });
  }
});

module.exports = router;
