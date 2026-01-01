import { NextResponse } from "next/server";
import { parseDateKey, toDateKey } from "@/lib/date-key";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ msg: "Use POST to sync" });
}

export async function POST() {
  try {
    const plan = await prisma.sessionPlan.findFirst({
      where: { name: { contains: "3日" } },
    });

    if (!plan) return NextResponse.json({ error: "Plan not found" });

    // Sync is now rule-based, handled by rules.
    // This debug endpoint might be obsolete or needed for specific testing.
    // For now, let's list future tasks for this plan.

    // Fetch result
    const tasks = await prisma.scheduledTask.findMany({
      where: {
        sessionPlanId: plan.id,
        status: "pending",
        scheduledDate: { gte: parseDateKey("2026-01-01") },
      },
      orderBy: { scheduledDate: "asc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      planId: String(plan.id),
      schedules: tasks.map((s) => toDateKey(s.scheduledDate)),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
