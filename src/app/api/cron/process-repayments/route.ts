import { NextResponse } from "next/server";
import { markOverdueAccords } from "@/lib/fulfillment/overdue";
import { processScheduledRepayments } from "@/lib/wallet/scheduled-repayment";
import { sendDueDateReminders } from "@/lib/reminders/due-date";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: { message: "CRON_SECRET non configuré" } }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const overdue = await markOverdueAccords();
  const dueReminders = await sendDueDateReminders();
  const repayments = await processScheduledRepayments();

  return NextResponse.json({ data: { overdue, dueReminders, repayments } });
}
