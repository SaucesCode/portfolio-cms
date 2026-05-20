const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// --- Login ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic input check
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 2. Find the admin user by email
    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    // 3. If no user found, or password doesn't match — same error message
    //    (never tell attackers which one was wrong)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4. Create the JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // 5. Send it as an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // JS cannot read this
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Logout ---
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true, message: "Logged out" });
});

// --- Check current session (used by React on app load) ---
router.get("/me", authMiddleware, (req, res) => {
  res.json({ ok: true, user: req.user });
});

module.exports = router;
