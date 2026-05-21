const express = require("express");
const prisma = require("../../lib/prisma");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.use(authMiddleware); // protects ALL routes in this file

// Update hero (single record — always update, never create here)
router.patch("/", async (req, res) => {
  const { name, tagline, bio, profileImageUrl, resumeUrl, availableForWork } = req.body;

  try {
    const hero = await prisma.hero.findFirst();

    if (!hero) {
      // Create if doesn't exist yet
      const newHero = await prisma.hero.create({
        data: { name, tagline, bio, profileImageUrl, resumeUrl, availableForWork },
      });
      return res.json(newHero);
    }

    const updated = await prisma.hero.update({
      where: { id: hero.id },
      data: { name, tagline, bio, profileImageUrl, resumeUrl, availableForWork },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
