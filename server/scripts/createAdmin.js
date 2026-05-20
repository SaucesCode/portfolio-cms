require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function main() {
  const email = "jamesdemesa@portfolio.com";
  const password = "jamesportfolio";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("Admin user ready:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
