const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.project.delete({ where: { id: "b119bc90-b8d6-4fb8-907c-32ef243c6932" }}); // Duplicate CarX
  await prisma.project.delete({ where: { id: "31f43111-cb6e-4ac1-a068-a10825a7e348" }}); // Duplicate Opus - LMS
  console.log("Deleted duplicates.");
  await prisma.$disconnect();
}

main().catch(console.error);
