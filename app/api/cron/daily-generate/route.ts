import { addDays } from "date-fns";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SchedulerService } from "@/lib/services/scheduler";

export const dynamic = "force-dynamic";

/**
 * 毎日のスケジュール生成ジョブ (Cron)
 * 毎日深夜に実行され、全ユーザーの向こう90日分のスケジュールを生成する
 */
export async function GET() {
  try {
    const today = new Date();
    const threeMonthsLater = addDays(today, 90);

    // 1. 全アクティブユーザーの有効なルーティンを取得
    //    （本来はバッチサイズを考慮してページネーションすべきだが、初期フェーズなので一括取得）
    const activeRoutines = await prisma.scheduleRoutine.findMany({
      where: {
        isEnabled: true,
        user: {
          deletedAt: null, // アクティブユーザーのみ
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    console.log(
      `[Cron] Starting schedule generation for ${activeRoutines.length} routines...`,
    );

    // 2. 各ルーティンに対して生成処理を実行
    //    Promise.all で並列実行（数が多い場合は p-limit 等で制限が必要）
    const results = await Promise.allSettled(
      activeRoutines.map((routine) =>
        SchedulerService.generateSchedules(
          Number(routine.userId),
          Number(routine.id),
          today,
          threeMonthsLater,
        ),
      ),
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    console.log(
      `[Cron] Completed. Success: ${successCount}, Failed: ${failCount}`,
    );

    if (failCount > 0) {
      console.error(`[Cron] Some jobs failed.`);
    }

    return NextResponse.json({
      success: true,
      processed: activeRoutines.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("[Cron] Critical error during schedule generation:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
