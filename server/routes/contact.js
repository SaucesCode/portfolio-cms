const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const prisma = require("../lib/prisma");
const router = express.Router();

// Rate limit: max 5 submissions per IP per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many messages sent. Please try again later." },
});

// Validation rules
const validateContact = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("body").trim().notEmpty().withMessage("Message is required"),
];

router.post("/", contactLimiter, validateContact, async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, subject, body: messageBody } = req.body;

  try {
    const message = await prisma.message.create({
      data: { name, email, subject, body: messageBody },
    });
    res.status(201).json({ ok: true, message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
