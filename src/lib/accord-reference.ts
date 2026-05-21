import { prisma } from "@/lib/prisma";

export async function generateAccordReference(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.accord.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
      },
    },
  });
  const seq = String(count + 1).padStart(5, "0");
  return `ZP-${year}-${seq}`;
}
