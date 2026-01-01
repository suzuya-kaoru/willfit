import { addDays, eachDayOfInterval, startOfDay } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { isScheduledDate } from "@/lib/schedule-utils";
import { mapScheduleRoutine } from "@/lib/db/queries";
import { toUtcDateOnly } from "@/lib/timezone";
import { toDateKey } from "@/lib/date-key";

/**
 * スケジュール生成サービスのコアロジック
 */
export const SchedulerService = {
  /**
   * 指定されたユーザー・ルーティンのスケジュールを生成する
   * 既に存在するレコードはスキップされる（冪等性あり）
   *
   * @param userId ユーザーID
   * @param routineId ルーティンID
   * @param fromDate 開始日
   * @param toDate 終了日
   */
  async generateSchedules(
    userId: number,
    routineId: number,
    fromDate: Date,
    toDate: Date,
  ) {
    // ルーティンとメニュー情報を取得
    const routine = await prisma.scheduleRoutine.findUnique({
      where: { id: routineId },
      include: { menu: true },
    });

    if (!routine || !routine.isEnabled) return;

    // 指定期間の日付をループ
    const interval = eachDayOfInterval({
      start: startOfDay(fromDate),
      end: startOfDay(toDate),
    });

    // 一括作成用のデータ配列
    const dataToCreate = [];

    // ドメイン型に変換
    const mappedRoutine = mapScheduleRoutine(routine);

    for (const date of interval) {
      // 1. ルーティンのルールに基づいて「その日にやるべきか」判定
      if (!isScheduledDate(mappedRoutine, date)) {
        continue;
      }

      // 2. 既にレコードが存在するかチェック（メモリ上での簡易チェック用）
      // ※ 実際の重複排除はDBのskipDuplicatesまたはクエリで行うのが確実だが
      //    PrismaのcreateMany(skipDuplicates)はDB依存があるため、
      //    ここでは「無い日だけリストアップ」する前にDBチェックを入れる。

      // パフォーマンスのため、チェックはループ外で行うのが理想だが、
      // ここでは可読性優先で、既存チェック済みの日付リストを取得してからフィルタリングする実装にする。
      dataToCreate.push({
        userId,
        routineId,
        scheduledDate: toUtcDateOnly(date),
        status: "pending" as const, // デフォルトステータス
      });
    }

    if (dataToCreate.length === 0) return;

    // 既に存在する日付をDBから取得
    const existingSchedules = await prisma.dailySchedule.findMany({
      where: {
        userId,
        routineId,
        scheduledDate: {
          in: dataToCreate.map((d) => d.scheduledDate),
        },
      },
      select: { scheduledDate: true },
    });

    const existingDateSet = new Set(
      existingSchedules.map((s) => toDateKey(s.scheduledDate)),
    );

    // 存在しないものだけをフィルタリング
    const finalCreates = dataToCreate.filter(
      (d) => !existingDateSet.has(toDateKey(d.scheduledDate)),
    );

    if (finalCreates.length > 0) {
      await prisma.dailySchedule.createMany({
        data: finalCreates,
      });
      console.log(
        `[Scheduler] Created ${finalCreates.length} schedules for routine ${routineId}`,
      );
    }
  },

  /**
   * ルーティン設定変更時に、未来のスケジュールを同期（再生成）する
   * - 未来の未完了(status=pending)レコードを物理削除
   * - 新しいルールで再生成
   *
   * @param userId ユーザーID
   * @param routineId ルーティンID
   */
  async syncRoutineSchedules(userId: number, routineId: number) {
    const today = startOfDay(new Date());

    // 1. 未来の未完了タスクを物理削除
    //    【重要】completed, skipped 等の「実績」は絶対に消さない
    const deleteResult = await prisma.dailySchedule.deleteMany({
      where: {
        userId,
        routineId,
        scheduledDate: { gt: today }, // 明日以降
        status: "pending",
      },
    });

    console.log(
      `[Scheduler] Deleted ${deleteResult.count} pending schedules for routine ${routineId}`,
    );

    // 2. 向こう3ヶ月分を再生成
    const threeMonthsLater = addDays(today, 90);

    // 明日から3ヶ月後までを生成対象とする
    // （今日は既に終わっている可能性や、中途半端に残るのを防ぐため、同期は「明日以降」を基本とするが
    //   ユーザー体験としては「今日」も変わってほしい場合がある。
    //   今回は「明日以降」を再生成し、今日の分は既存ロジック（そのまま）とするのが安全）
    //   -> いや、Sync on Saveなら「今日」も直すべき。
    //      ただし今日既に「完了」しているなら消えないので安全。
    //      今日の分も再生成対象に含める。

    await this.generateSchedules(
      userId,
      routineId,
      addDays(today, 0),
      threeMonthsLater,
    );
  },

  /**
   * ルーティン削除時のクリーンアップ
   * 未来の未完了タスクのみ削除する
   */
  async cleanupFutureSchedules(userId: number, routineId: number) {
    const today = startOfDay(new Date());
    await prisma.dailySchedule.deleteMany({
      where: {
        userId,
        routineId,
        scheduledDate: { gt: today },
        status: "pending",
      },
    });
  },
};
