import { NextResponse } from "next/server";
import { TaskSchedulerService } from "@/lib/services/scheduler";

export const dynamic = "force-dynamic";

/**
 * 毎日のスケジュール生成ジョブ (Cron)
 * 毎日深夜に実行され、全ユーザーの向こう90日分のスケジュールを生成する
 */
export async function GET(request: Request) {
  // Bearer token authentication for cron jobs
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[Cron] Unauthorized access attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("[Cron] Starting schedule generation for all users...");

    await TaskSchedulerService.generateAllUsersTasks();

    console.log("[Cron] Completed.");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Cron] Critical error during schedule generation:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
