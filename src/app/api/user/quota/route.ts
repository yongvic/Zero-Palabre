import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAccordQuota } from "@/lib/accord-quota";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const quota = await getAccordQuota(session.user.id);
  return NextResponse.json({ data: quota });
}
