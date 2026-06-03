import { prisma } from "@/lib/prisma";
import type { AccordType } from "@prisma/client";

const DEFAULT_STAMP = "/brand/logo-vert.png";

export async function getActiveTemplate(accordType: AccordType) {
  const existing = await prisma.notarialTemplate.findFirst({
    where: { accordType, active: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  return prisma.notarialTemplate.create({
    data: {
      version: `v1.0-${accordType.toLowerCase()}-togo`,
      accordType,
      stampUrl: DEFAULT_STAMP,
      fieldsSchema: {},
      active: true,
    },
  });
}
