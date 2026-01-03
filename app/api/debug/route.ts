import { NextResponse } from "next/server";
import { parseDateKey, toDateKey } from "@/lib/date-key";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.json({ msg: "Use POST to sync" });
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const session = await prisma.workoutSession.findFirst({
      where: { name: { contains: "3日" } },
    });

    if (!session) return NextResponse.json({ error: "Session not found" });

    // Sync is now rule-based, handled by rules.
    // This debug endpoint might be obsolete or needed for specific testing.
    // For now, let's list future tasks for this session.

    // Fetch result
    const tasks = await prisma.scheduledTask.findMany({
      where: {
        workoutSessionId: session.id,
        status: "pending",
        scheduledDate: { gte: parseDateKey("2026-01-01") },
      },
      orderBy: { scheduledDate: "asc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      sessionId: String(session.id),
      schedules: tasks.map((s) => toDateKey(s.scheduledDate)),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
