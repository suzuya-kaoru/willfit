/**
 * FitLog - モックデータ
 *
 * 開発用のモックデータ。
 * DB移行時にはこのファイルは不要になります。
 *
 * @see docs/DATA_MODEL.md
 */

import type {
  BodyPart,
  Exercise,
  ExerciseBodyPart,
  ExerciseLogWithDetails,
  ExerciseWithBodyParts,
  MenuExercise,
  WeekSchedule,
  WeightRecord,
  WorkoutMenu,
  WorkoutMenuWithExercises,
  WorkoutSession,
  WorkoutSessionWithDetails,
  WorkoutSet,
} from "./types";

// =============================================================================
// ユーティリティ
// =============================================================================

const now = new Date();

/**
 * モックデータ用の日時を生成
 */
function mockDate(daysAgo = 0): Date {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// =============================================================================
// 部位マスタ（共通マスタ）
// =============================================================================

export const mockBodyParts: BodyPart[] = [
  {
    id: 1,
    name: "胸",
    nameEn: "chest",
    displayOrder: 1,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 2,
    name: "背中",
    nameEn: "back",
    displayOrder: 2,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 3,
    name: "肩",
    nameEn: "shoulder",
    displayOrder: 3,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 4,
    name: "二頭筋",
    nameEn: "biceps",
    displayOrder: 4,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 5,
    name: "三頭筋",
    nameEn: "triceps",
    displayOrder: 5,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 6,
    name: "脚",
    nameEn: "legs",
    displayOrder: 6,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 7,
    name: "大臀筋",
    nameEn: "glutes",
    displayOrder: 7,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: 8,
    name: "腹筋",
    nameEn: "abs",
    displayOrder: 8,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
];

// =============================================================================
// 種目
// =============================================================================

const MOCK_USER_ID = 1;

export const mockExercises: Exercise[] = [
  {
    id: 1,
    userId: MOCK_USER_ID,
    name: "ベンチプレス",
    formNote: "肩甲骨を寄せ、手首を真っ直ぐに保つ。足は床にしっかりつける。",
    videoUrl: "https://youtube.com/watch?v=example1",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: 2,
    userId: MOCK_USER_ID,
    name: "ラットプルダウン",
    formNote: "胸を張り、肘を体の横に引く。反動を使わない。",
    videoUrl: "https://youtube.com/watch?v=example2",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: 3,
    userId: MOCK_USER_ID,
    name: "スクワット",
    formNote: "膝がつま先より前に出ないように。背中は真っ直ぐ。",
    videoUrl: "https://youtube.com/watch?v=example3",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: 4,
    userId: MOCK_USER_ID,
    name: "ショルダープレス",
    formNote: "肘は体の少し前方に。首を縮めない。",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: 5,
    userId: MOCK_USER_ID,
    name: "デッドリフト",
    formNote: "腰を丸めない。バーは体に近い位置をキープ。",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: 6,
    userId: MOCK_USER_ID,
    name: "ダンベルカール",
    formNote: "肘は固定。反動を使わずコントロール。",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
];

// 種目-部位 中間テーブル
export const mockExerciseBodyParts: ExerciseBodyPart[] = [
  // ベンチプレス → 胸, 三頭筋
  { exerciseId: 1, bodyPartId: 1 },
  { exerciseId: 1, bodyPartId: 5 },
  // ラットプルダウン → 背中, 二頭筋
  { exerciseId: 2, bodyPartId: 2 },
  { exerciseId: 2, bodyPartId: 4 },
  // スクワット → 脚, 大臀筋
  { exerciseId: 3, bodyPartId: 6 },
  { exerciseId: 3, bodyPartId: 7 },
  // ショルダープレス → 肩
  { exerciseId: 4, bodyPartId: 3 },
  // デッドリフト → 背中, 脚, 大臀筋
  { exerciseId: 5, bodyPartId: 2 },
  { exerciseId: 5, bodyPartId: 6 },
  { exerciseId: 5, bodyPartId: 7 },
  // ダンベルカール → 二頭筋
  { exerciseId: 6, bodyPartId: 4 },
];

// =============================================================================
// メニュー
// =============================================================================

export const mockMenus: WorkoutMenu[] = [
  {
    id: 1,
    userId: MOCK_USER_ID,
    name: "Day1 胸・背中",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 2,
    userId: MOCK_USER_ID,
    name: "Day2 脚・肩",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 3,
    userId: MOCK_USER_ID,
    name: "Day3 背中・腕",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
];

// メニュー-種目 中間テーブル
export const mockMenuExercises: MenuExercise[] = [
  // Day1 胸・背中 → ベンチプレス, ラットプルダウン
  {
    id: 1,
    menuId: 1,
    exerciseId: 1,
    displayOrder: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 2,
    menuId: 1,
    exerciseId: 2,
    displayOrder: 2,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  // Day2 脚・肩 → スクワット, ショルダープレス
  {
    id: 3,
    menuId: 2,
    exerciseId: 3,
    displayOrder: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 4,
    menuId: 2,
    exerciseId: 4,
    displayOrder: 2,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  // Day3 背中・腕 → デッドリフト, ダンベルカール
  {
    id: 5,
    menuId: 3,
    exerciseId: 5,
    displayOrder: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 6,
    menuId: 3,
    exerciseId: 6,
    displayOrder: 2,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
];

// =============================================================================
// セッション
// =============================================================================

export const mockSessions: WorkoutSession[] = [
  {
    id: 1,
    userId: MOCK_USER_ID,
    menuId: 1,
    startedAt: new Date("2024-12-01T10:00:00"),
    endedAt: new Date("2024-12-01T11:30:00"),
    condition: 8,
    fatigue: 6,
    note: "ベンチプレスの手首の角度に注意。今日は調子が良かった。",
    createdAt: new Date("2024-12-01T11:30:00"),
    updatedAt: new Date("2024-12-01T11:30:00"),
  },
  {
    id: 2,
    userId: MOCK_USER_ID,
    menuId: 2,
    startedAt: new Date("2024-11-29T09:00:00"),
    endedAt: new Date("2024-11-29T10:15:00"),
    condition: 7,
    fatigue: 8,
    note: "脚の疲労が強かった。次回はウォームアップを長めに。",
    createdAt: new Date("2024-11-29T10:15:00"),
    updatedAt: new Date("2024-11-29T10:15:00"),
  },
];

// セット
// exerciseRecordIdは、セッションIDと種目の順序から生成される数値ID
// session-001 (id: 1) の1番目の種目 → exerciseRecordId: 1
// session-001 (id: 1) の2番目の種目 → exerciseRecordId: 2
// session-002 (id: 2) の1番目の種目 → exerciseRecordId: 3
export const mockSets: WorkoutSet[] = [
  // session-001, ベンチプレス (exerciseRecordId: 1)
  {
    id: 1,
    exerciseRecordId: 1,
    setNumber: 1,
    weight: 60,
    reps: 10,
    completed: true,
    createdAt: new Date("2024-12-01T10:15:00"),
    updatedAt: new Date("2024-12-01T10:15:00"),
  },
  {
    id: 2,
    exerciseRecordId: 1,
    setNumber: 2,
    weight: 60,
    reps: 10,
    completed: true,
    createdAt: new Date("2024-12-01T10:20:00"),
    updatedAt: new Date("2024-12-01T10:20:00"),
  },
  {
    id: 3,
    exerciseRecordId: 1,
    setNumber: 3,
    weight: 60,
    reps: 8,
    completed: true,
    createdAt: new Date("2024-12-01T10:25:00"),
    updatedAt: new Date("2024-12-01T10:25:00"),
  },
  // session-001, ラットプルダウン (exerciseRecordId: 2)
  {
    id: 4,
    exerciseRecordId: 2,
    setNumber: 1,
    weight: 50,
    reps: 12,
    completed: true,
    createdAt: new Date("2024-12-01T10:40:00"),
    updatedAt: new Date("2024-12-01T10:40:00"),
  },
  {
    id: 5,
    exerciseRecordId: 2,
    setNumber: 2,
    weight: 50,
    reps: 10,
    completed: true,
    createdAt: new Date("2024-12-01T10:45:00"),
    updatedAt: new Date("2024-12-01T10:45:00"),
  },
  // session-002, スクワット (exerciseRecordId: 3)
  {
    id: 6,
    exerciseRecordId: 3,
    setNumber: 1,
    weight: 80,
    reps: 8,
    completed: true,
    createdAt: new Date("2024-11-29T09:15:00"),
    updatedAt: new Date("2024-11-29T09:15:00"),
  },
  {
    id: 7,
    exerciseRecordId: 3,
    setNumber: 2,
    weight: 80,
    reps: 8,
    completed: true,
    createdAt: new Date("2024-11-29T09:20:00"),
    updatedAt: new Date("2024-11-29T09:20:00"),
  },
];

// =============================================================================
// 体重記録
// =============================================================================

export const mockWeightRecords: WeightRecord[] = [
  {
    id: 1,
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-01T08:00:00"),
    weight: 72.5,
    createdAt: new Date("2024-11-01T08:00:00"),
    updatedAt: new Date("2024-11-01T08:00:00"),
  },
  {
    id: 2,
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-08T08:00:00"),
    weight: 72.3,
    createdAt: new Date("2024-11-08T08:00:00"),
    updatedAt: new Date("2024-11-08T08:00:00"),
  },
  {
    id: 3,
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-15T08:00:00"),
    weight: 72.0,
    createdAt: new Date("2024-11-15T08:00:00"),
    updatedAt: new Date("2024-11-15T08:00:00"),
  },
  {
    id: 4,
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-22T08:00:00"),
    weight: 71.8,
    createdAt: new Date("2024-11-22T08:00:00"),
    updatedAt: new Date("2024-11-22T08:00:00"),
  },
  {
    id: 5,
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-29T08:00:00"),
    weight: 71.5,
    createdAt: new Date("2024-11-29T08:00:00"),
    updatedAt: new Date("2024-11-29T08:00:00"),
  },
  {
    id: 6,
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-12-01T08:00:00"),
    weight: 71.3,
    createdAt: new Date("2024-12-01T08:00:00"),
    updatedAt: new Date("2024-12-01T08:00:00"),
  },
];

// =============================================================================
// 週間スケジュール
// =============================================================================

export const mockWeekSchedule: WeekSchedule[] = [
  {
    id: 1,
    userId: MOCK_USER_ID,
    dayOfWeek: 0, // 日曜
    menuId: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 2,
    userId: MOCK_USER_ID,
    dayOfWeek: 1, // 月曜
    menuId: 2,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 3,
    userId: MOCK_USER_ID,
    dayOfWeek: 3, // 水曜
    menuId: 3,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: 4,
    userId: MOCK_USER_ID,
    dayOfWeek: 5, // 金曜
    menuId: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
];

// =============================================================================
// ヘルパー関数（フロントエンド用派生データ生成）
// =============================================================================

/**
 * 種目に部位情報を付与
 */
export function getExerciseWithBodyParts(
  exerciseId: number,
): ExerciseWithBodyParts | undefined {
  const exercise = mockExercises.find((e) => e.id === exerciseId);
  if (!exercise) return undefined;

  const bodyPartIds = mockExerciseBodyParts
    .filter((ebp) => ebp.exerciseId === exerciseId)
    .map((ebp) => ebp.bodyPartId);

  const bodyParts = mockBodyParts.filter((bp) => bodyPartIds.includes(bp.id));

  return { ...exercise, bodyParts };
}

/**
 * 全種目に部位情報を付与
 */
export function getAllExercisesWithBodyParts(): ExerciseWithBodyParts[] {
  return mockExercises
    .map((e) => getExerciseWithBodyParts(e.id))
    .filter((e): e is ExerciseWithBodyParts => e !== undefined);
}

/**
 * メニューに種目リストを付与
 */
export function getMenuWithExercises(
  menuId: number | string,
): WorkoutMenuWithExercises | undefined {
  // URLパラメータは文字列で来る可能性があるため、数値に変換
  const menuIdNum = typeof menuId === "string" ? parseInt(menuId, 10) : menuId;
  if (Number.isNaN(menuIdNum)) return undefined;

  const menu = mockMenus.find((m) => m.id === menuIdNum);
  if (!menu) return undefined;

  const menuExercises = mockMenuExercises
    .filter((me) => me.menuId === menuIdNum)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const exercises = menuExercises
    .map((me) => getExerciseWithBodyParts(me.exerciseId))
    .filter((e): e is ExerciseWithBodyParts => e !== undefined);

  return { ...menu, exercises };
}

/**
 * 全メニューに種目リストを付与
 */
export function getAllMenusWithExercises(): WorkoutMenuWithExercises[] {
  return mockMenus
    .map((m) => getMenuWithExercises(m.id))
    .filter((m): m is WorkoutMenuWithExercises => m !== undefined);
}

/**
 * セッションに詳細情報を付与
 */
export function getSessionWithDetails(
  sessionId: number | string,
): WorkoutSessionWithDetails | undefined {
  // URLパラメータは文字列で来る可能性があるため、数値に変換
  const sessionIdNum =
    typeof sessionId === "string" ? parseInt(sessionId, 10) : sessionId;
  if (Number.isNaN(sessionIdNum)) return undefined;

  const session = mockSessions.find((s) => s.id === sessionIdNum);
  if (!session) return undefined;

  const menu = mockMenus.find((m) => m.id === session.menuId);
  if (!menu) return undefined;

  // このセッションに関連するログを取得（簡易実装）
  const exerciseLogs: ExerciseLogWithDetails[] = [];

  // menu の種目からログを生成
  const menuExercises = mockMenuExercises
    .filter((me) => me.menuId === session.menuId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // exerciseRecordIdの計算: セッションごとに連番を割り当て
  // session-001 (id: 1) の1番目の種目 → exerciseRecordId: 1
  // session-001 (id: 1) の2番目の種目 → exerciseRecordId: 2
  // session-002 (id: 2) の1番目の種目 → exerciseRecordId: 3
  let exerciseRecordIdCounter = 1;
  // session.idより小さいIDのセッションのみをカウント（自分自身は除外）
  const prevSessions = mockSessions.filter((s) => s.id < session.id);
  for (const prevSession of prevSessions) {
    const prevMenuExercises = mockMenuExercises.filter(
      (me) => me.menuId === prevSession.menuId,
    );
    exerciseRecordIdCounter += prevMenuExercises.length;
  }

  for (let i = 0; i < menuExercises.length; i++) {
    const me = menuExercises[i];
    const exercise = getExerciseWithBodyParts(me.exerciseId);
    if (!exercise) continue;

    // このセッション・種目のセットを取得
    const currentExerciseRecordId = exerciseRecordIdCounter + i;
    const sets = mockSets.filter(
      (s) => s.exerciseRecordId === currentExerciseRecordId,
    );

    exerciseLogs.push({
      id: currentExerciseRecordId,
      sessionId: session.id,
      exerciseId: me.exerciseId,
      exercise,
      sets,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  return { ...session, menu, exerciseLogs };
}
