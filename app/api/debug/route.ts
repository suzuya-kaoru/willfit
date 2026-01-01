import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SchedulerService } from "@/lib/services/scheduler";

export const dynamic = "force-dynamic";

export async function GET() {
  // ... existing GET ...
  return NextResponse.json({ msg: "Use POST to sync" });
}

export async function POST() {
  try {
    const routine = await prisma.scheduleRoutine.findFirst({
      where: { menu: { name: { contains: "3日" } } },
    });

    if (!routine) return NextResponse.json({ error: "Routine not found" });

    // Sync
    await SchedulerService.syncRoutineSchedules(
      Number(routine.userId),
      Number(routine.id),
    );

    // Fetch result
    const schedules = await prisma.dailySchedule.findMany({
      where: {
        routineId: routine.id,
        status: "pending",
        scheduledDate: { gte: new Date("2026-01-01") },
      },
      orderBy: { scheduledDate: "asc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      routineId: String(routine.id),
      schedules: schedules.map(
        (s) => s.scheduledDate.toISOString().split("T")[0],
      ),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
