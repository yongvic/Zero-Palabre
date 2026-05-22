import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  console.log("DB OK", result);
} catch (e) {
  console.error("DB FAIL:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
