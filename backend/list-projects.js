const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
  console.log(JSON.stringify(projects, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
