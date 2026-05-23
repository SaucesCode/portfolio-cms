require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear all tables first so we can re-run safely
  await prisma.message.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.stat.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.hero.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log("🗑️  Cleared existing data");

  // --- Admin User ---
  await prisma.adminUser.create({
    data: {
      email: "admin@portfolio.com",
      passwordHash: await bcrypt.hash("changeme123", 12),
    },
  });

  // --- Hero ---
  await prisma.hero.create({
    data: {
      name: "Juan dela Cruz",
      tagline: [
        "Full-Stack Developer",
        "React Enthusiast",
        "Problem Solver",
      ],
      bio: "I build fast, beautiful web apps that solve real problems. Passionate about clean code, great UX, and learning something new every day.",
      profileImageUrl: "https://avatars.githubusercontent.com/u/583231",
      resumeUrl: "https://example.com/resume.pdf",
      availableForWork: true,
    },
  });

  // --- Projects ---
  await prisma.project.createMany({
    data: [
      {
        title: "QuickAid Geomapping",
        description: "A geomapping application for quick aid and emergency response.",
        techStack: ["React", "Node.js", "PostgreSQL"],
        liveUrl: null,
        githubUrl: "https://github.com/SaucesCode/QuickAid-Geomapping",
        githubRepoName: "QuickAid-Geomapping", // must match exactly
        featured: true,
        orderIndex: 1,
      },
      {
        title: "PayFairy — Pay Tracker",
        description: "A payment tracker built with the MERN stack.",
        techStack: ["MongoDB", "Express", "React", "Node.js"],
        liveUrl: null,
        githubUrl: "https://github.com/SaucesCode/PayFairy-A-Pay-Tracker-using-MERN",
        githubRepoName: "PayFairy-A-Pay-Tracker-using-MERN",
        featured: true,
        orderIndex: 2,
      },
      {
        title: "Payroll System",
        description: "A payroll management system built with Django, React and Tailwind CSS.",
        techStack: ["Django", "React", "TailwindCSS"],
        liveUrl: null,
        githubUrl: "https://github.com/SaucesCode/Payroll-System-w-Django-React-TailwindCSS",
        githubRepoName: "Payroll-System-w-Django-React-TailwindCSS",
        featured: false,
        orderIndex: 3,
      },
    ],
  });

  // --- Skills ---
  await prisma.skill.createMany({
    data: [
      {
        name: "React",
        category: "Frontend",
        proficiencyLevel: 5,
        iconName: "react",
        orderIndex: 1,
      },
      {
        name: "TypeScript",
        category: "Frontend",
        proficiencyLevel: 4,
        iconName: "typescript",
        orderIndex: 2,
      },
      {
        name: "Tailwind CSS",
        category: "Frontend",
        proficiencyLevel: 5,
        iconName: "tailwind",
        orderIndex: 3,
      },
      {
        name: "Node.js",
        category: "Backend",
        proficiencyLevel: 4,
        iconName: "nodejs",
        orderIndex: 4,
      },
      {
        name: "PostgreSQL",
        category: "Backend",
        proficiencyLevel: 4,
        iconName: "postgresql",
        orderIndex: 5,
      },
      {
        name: "Prisma",
        category: "Backend",
        proficiencyLevel: 3,
        iconName: "prisma",
        orderIndex: 6,
      },
      { name: "Git", category: "Tools", proficiencyLevel: 5, iconName: "git", orderIndex: 7 },
      {
        name: "Docker",
        category: "Tools",
        proficiencyLevel: 3,
        iconName: "docker",
        orderIndex: 8,
      },
    ],
  });

  // --- Experiences ---
  await prisma.experience.createMany({
    data: [
      {
        company: "Tech Startup PH",
        role: "Frontend Developer",
        description:
          "Built and maintained React dashboards for enterprise clients. Led migration from CRA to Vite, cutting build times by 60%.",
        startDate: new Date("2023-06-01"),
        endDate: null,
        isCurrent: true,
        orderIndex: 1,
      },
      {
        company: "Freelance",
        role: "Full-Stack Developer",
        description:
          "Delivered 10+ client projects including e-commerce sites, booking systems, and landing pages.",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2023-05-31"),
        isCurrent: false,
        orderIndex: 2,
      },
    ],
  });

  // --- Certifications ---
  await prisma.certification.createMany({
    data: [
      {
        name: "AWS Certified Developer – Associate",
        issuer: "Amazon Web Services",
        issueDate: new Date("2024-01-15"),
        credentialUrl: "https://example.com/cert",
        orderIndex: 1,
      },
      {
        name: "Meta Front-End Developer Certificate",
        issuer: "Meta / Coursera",
        issueDate: new Date("2023-08-01"),
        credentialUrl: "https://example.com/cert",
        orderIndex: 2,
      },
    ],
  });

  // --- Testimonials ---
  await prisma.testimonial.createMany({
    data: [
      {
        name: "Maria Santos",
        role: "Product Manager",
        company: "Tech Startup PH",
        quote:
          "One of the most reliable devs I have worked with. Delivers clean, well-documented code every time.",
        visible: true,
        orderIndex: 1,
      },
      {
        name: "James Reyes",
        role: "CEO",
        company: "Reyes Digital",
        quote:
          "Rebuilt our entire platform in 6 weeks. The new site loads 3x faster and our conversions went up 40%.",
        visible: true,
        orderIndex: 2,
      },
    ],
  });

  // --- Stats ---
  await prisma.stat.createMany({
    data: [
      { label: "Projects Built", value: 20, iconName: "code" },
      { label: "Happy Clients", value: 12, iconName: "smile" },
      { label: "GitHub Stars", value: 180, iconName: "star" },
      { label: "Cups of Coffee", value: 999, iconName: "coffee" },
    ],
  });

  // --- Blog Posts ---
  await prisma.blogPost.createMany({
    data: [
      {
        title: "Why I switched from CRA to Vite",
        slug: "cra-to-vite",
        content: "# Why I switched from CRA to Vite\n\nVite is fast. Really fast...",
        excerpt: "How switching to Vite cut my build time from 45 seconds to 3 seconds.",
        tags: ["React", "Vite", "Performance"],
        published: true,
        publishedAt: new Date("2024-03-01"),
      },
      {
        title: "Understanding Prisma for beginners",
        slug: "prisma-for-beginners",
        content: "# Prisma for Beginners\n\nPrisma makes database access easy...",
        excerpt: "A plain-English guide to Prisma ORM for developers coming from raw SQL.",
        tags: ["Prisma", "PostgreSQL", "Backend"],
        published: false,
      },
    ],
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
