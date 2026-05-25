require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Public routes
const authRoutes = require("./routes/auth");
const heroRoutes = require("./routes/hero");
const projectsRoutes = require("./routes/projects");
const skillsRoutes = require("./routes/skills");
const experiencesRoutes = require("./routes/experience");
const certificationsRoutes = require("./routes/certifications");
const testimonialsRoutes = require("./routes/testimonials");
const statsRoutes = require("./routes/stats");
const blogRoutes = require("./routes/blog");
const contactRoutes = require("./routes/contact");
const githubRoutes = require("./routes/github");

// Admin routes
const adminHeroRoutes = require("./routes/admin/hero");
const adminProjectsRoutes = require("./routes/admin/projects");
const adminSkillsRoutes = require("./routes/admin/skills");
const adminExperiencesRoutes = require("./routes/admin/experiences");
const adminCertificationsRoutes = require("./routes/admin/certifications");
const adminTestimonialsRoutes = require("./routes/admin/testimonials");
const adminStatsRoutes = require("./routes/admin/stats");
const adminBlogRoutes = require("./routes/admin/blog");
const adminMessagesRoutes = require("./routes/admin/messages");
const adminGithubRoutes = require("./routes/admin/github");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// --- Public API ---
app.use("/api/auth", authRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/experiences", experiencesRoutes);
app.use("/api/certifications", certificationsRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/github", githubRoutes);

// --- Admin API ---
app.use("/api/admin/hero", adminHeroRoutes);
app.use("/api/admin/projects", adminProjectsRoutes);
app.use("/api/admin/skills", adminSkillsRoutes);
app.use("/api/admin/experiences", adminExperiencesRoutes);
app.use("/api/admin/certifications", adminCertificationsRoutes);
app.use("/api/admin/testimonials", adminTestimonialsRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/blog", adminBlogRoutes);
app.use("/api/admin/messages", adminMessagesRoutes);
app.use("/api/admin/github", adminGithubRoutes);

// --- Health check ---
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Portfolio API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
