const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const { fetchRepo } = require("../../services/github");

const router = express.Router();

// All routes in this file require login
router.use(authMiddleware);

// POST /api/admin/github/sync
// Loops through all projects with a repo name and updates their GitHub data
router.post('/sync', async (req, res) => {
  try {
    // Step 1: Get all projects that have a github repo name set
    const projects = await prisma.project.findMany({
      where: {
        githubRepoName: { not: null }
      }
    });

    if (projects.length === 0) {
      return res.json({ ok: true, message: 'No projects with GitHub repos to sync' });
    }

    const results = [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Step 2: Loop through each project
    for (const project of projects) {

      // Step 3: Skip if already synced within the last hour
      // This protects against hitting GitHub's rate limit
      if (project.githubSyncedAt && project.githubSyncedAt > oneHourAgo) {
        results.push({
          id: project.id,
          title: project.title,
          status: 'skipped — synced recently'
        });
        continue; // jump to next project in the loop
      }

      try {
        // Step 4: Call GitHub API for this repo
        const githubData = await fetchRepo(project.githubRepoName);

        // Step 5: Update the project in the database
        await prisma.project.update({
          where: { id: project.id },
          data: {
            stars: githubData.stars,
            forks: githubData.forks,
            language: githubData.language,
            githubSyncedAt: new Date(), // record when we last synced
          }
        });

        results.push({
          id: project.id,
          title: project.title,
          status: 'synced',
          data: githubData
        });

      } catch (fetchError) {
        // If one repo fails, don't crash the whole sync
        // Just record the error and move on to the next project
        results.push({
          id: project.id,
          title: project.title,
          status: 'error',
          error: fetchError.message
        });
      }
    }

    res.json({ ok: true, results });

  } catch (error) {
    res.status(500).json({ error: 'Sync failed', detail: error.message });
  }
});


// GET /api/admin/github/sync-status
// Returns the most recently synced project's timestamp
router.get('/sync-status', async (req, res) => {
  try {
    // Find the project that was synced most recently
    const lastSynced = await prisma.project.findFirst({
      where: { githubSyncedAt: { not: null } },
      orderBy: { githubSyncedAt: 'desc' },
      select: { githubSyncedAt: true, title: true }
    });

    res.json({
      lastSyncedAt: lastSynced?.githubSyncedAt || null,
      lastSyncedProject: lastSynced?.title || null,
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.get("/repo/:repoName", async (req, res) => {
  try {
    const { repoName } = req.params;
    const githubData = await fetchRepo(repoName);

    res.json({
      title: repoName.replace(/-/g, " ").replace(/_/g, " "),
      description: githubData.description,
      language: githubData.language,
      stars: githubData.stars,
      forks: githubData.forks,
      githubUrl: `https://github.com/${process.env.GITHUB_USERNAME}/${repoName}`,
    });
  } catch (error) {
    res.status(404).json({ error: "Repo not found" });
  }
});

module.exports = router;