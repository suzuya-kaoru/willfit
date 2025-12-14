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
    id: "bp-001",
    name: "胸",
    nameEn: "chest",
    displayOrder: 1,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-002",
    name: "背中",
    nameEn: "back",
    displayOrder: 2,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-003",
    name: "肩",
    nameEn: "shoulder",
    displayOrder: 3,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-004",
    name: "二頭筋",
    nameEn: "biceps",
    displayOrder: 4,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-005",
    name: "三頭筋",
    nameEn: "triceps",
    displayOrder: 5,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-006",
    name: "脚",
    nameEn: "legs",
    displayOrder: 6,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-007",
    name: "大臀筋",
    nameEn: "glutes",
    displayOrder: 7,
    createdAt: mockDate(365),
    updatedAt: mockDate(365),
  },
  {
    id: "bp-008",
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

const MOCK_USER_ID = "user-001";

export const mockExercises: Exercise[] = [
  {
    id: "ex-001",
    userId: MOCK_USER_ID,
    name: "ベンチプレス",
    formNote: "肩甲骨を寄せ、手首を真っ直ぐに保つ。足は床にしっかりつける。",
    youtubeUrl: "https://youtube.com/watch?v=example1",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: "ex-002",
    userId: MOCK_USER_ID,
    name: "ラットプルダウン",
    formNote: "胸を張り、肘を体の横に引く。反動を使わない。",
    youtubeUrl: "https://youtube.com/watch?v=example2",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: "ex-003",
    userId: MOCK_USER_ID,
    name: "スクワット",
    formNote: "膝がつま先より前に出ないように。背中は真っ直ぐ。",
    youtubeUrl: "https://youtube.com/watch?v=example3",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: "ex-004",
    userId: MOCK_USER_ID,
    name: "ショルダープレス",
    formNote: "肘は体の少し前方に。首を縮めない。",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: "ex-005",
    userId: MOCK_USER_ID,
    name: "デッドリフト",
    formNote: "腰を丸めない。バーは体に近い位置をキープ。",
    createdAt: mockDate(100),
    updatedAt: mockDate(100),
  },
  {
    id: "ex-006",
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
  { exerciseId: "ex-001", bodyPartId: "bp-001" },
  { exerciseId: "ex-001", bodyPartId: "bp-005" },
  // ラットプルダウン → 背中, 二頭筋
  { exerciseId: "ex-002", bodyPartId: "bp-002" },
  { exerciseId: "ex-002", bodyPartId: "bp-004" },
  // スクワット → 脚, 大臀筋
  { exerciseId: "ex-003", bodyPartId: "bp-006" },
  { exerciseId: "ex-003", bodyPartId: "bp-007" },
  // ショルダープレス → 肩
  { exerciseId: "ex-004", bodyPartId: "bp-003" },
  // デッドリフト → 背中, 脚, 大臀筋
  { exerciseId: "ex-005", bodyPartId: "bp-002" },
  { exerciseId: "ex-005", bodyPartId: "bp-006" },
  { exerciseId: "ex-005", bodyPartId: "bp-007" },
  // ダンベルカール → 二頭筋
  { exerciseId: "ex-006", bodyPartId: "bp-004" },
];

// =============================================================================
// メニュー
// =============================================================================

export const mockMenus: WorkoutMenu[] = [
  {
    id: "menu-001",
    userId: MOCK_USER_ID,
    name: "Day1 胸・背中",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "menu-002",
    userId: MOCK_USER_ID,
    name: "Day2 脚・肩",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "menu-003",
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
    id: "me-001",
    menuId: "menu-001",
    exerciseId: "ex-001",
    displayOrder: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "me-002",
    menuId: "menu-001",
    exerciseId: "ex-002",
    displayOrder: 2,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  // Day2 脚・肩 → スクワット, ショルダープレス
  {
    id: "me-003",
    menuId: "menu-002",
    exerciseId: "ex-003",
    displayOrder: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "me-004",
    menuId: "menu-002",
    exerciseId: "ex-004",
    displayOrder: 2,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  // Day3 背中・腕 → デッドリフト, ダンベルカール
  {
    id: "me-005",
    menuId: "menu-003",
    exerciseId: "ex-005",
    displayOrder: 1,
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "me-006",
    menuId: "menu-003",
    exerciseId: "ex-006",
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
    id: "session-001",
    userId: MOCK_USER_ID,
    menuId: "menu-001",
    startedAt: new Date("2024-12-01T10:00:00"),
    endedAt: new Date("2024-12-01T11:30:00"),
    condition: 8,
    fatigue: 6,
    note: "ベンチプレスの手首の角度に注意。今日は調子が良かった。",
    createdAt: new Date("2024-12-01T11:30:00"),
    updatedAt: new Date("2024-12-01T11:30:00"),
  },
  {
    id: "session-002",
    userId: MOCK_USER_ID,
    menuId: "menu-002",
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
export const mockSets: WorkoutSet[] = [
  // session-001, ベンチプレス
  {
    id: "set-001",
    exerciseLogId: "log-001",
    setNumber: 1,
    weight: 60,
    reps: 10,
    completed: true,
    createdAt: new Date("2024-12-01T10:15:00"),
    updatedAt: new Date("2024-12-01T10:15:00"),
  },
  {
    id: "set-002",
    exerciseLogId: "log-001",
    setNumber: 2,
    weight: 60,
    reps: 10,
    completed: true,
    createdAt: new Date("2024-12-01T10:20:00"),
    updatedAt: new Date("2024-12-01T10:20:00"),
  },
  {
    id: "set-003",
    exerciseLogId: "log-001",
    setNumber: 3,
    weight: 60,
    reps: 8,
    completed: true,
    createdAt: new Date("2024-12-01T10:25:00"),
    updatedAt: new Date("2024-12-01T10:25:00"),
  },
  // session-001, ラットプルダウン
  {
    id: "set-004",
    exerciseLogId: "log-002",
    setNumber: 1,
    weight: 50,
    reps: 12,
    completed: true,
    createdAt: new Date("2024-12-01T10:40:00"),
    updatedAt: new Date("2024-12-01T10:40:00"),
  },
  {
    id: "set-005",
    exerciseLogId: "log-002",
    setNumber: 2,
    weight: 50,
    reps: 10,
    completed: true,
    createdAt: new Date("2024-12-01T10:45:00"),
    updatedAt: new Date("2024-12-01T10:45:00"),
  },
  // session-002, スクワット
  {
    id: "set-006",
    exerciseLogId: "log-003",
    setNumber: 1,
    weight: 80,
    reps: 8,
    completed: true,
    createdAt: new Date("2024-11-29T09:15:00"),
    updatedAt: new Date("2024-11-29T09:15:00"),
  },
  {
    id: "set-007",
    exerciseLogId: "log-003",
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
    id: "wr-001",
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-01T08:00:00"),
    weight: 72.5,
    createdAt: new Date("2024-11-01T08:00:00"),
    updatedAt: new Date("2024-11-01T08:00:00"),
  },
  {
    id: "wr-002",
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-08T08:00:00"),
    weight: 72.3,
    createdAt: new Date("2024-11-08T08:00:00"),
    updatedAt: new Date("2024-11-08T08:00:00"),
  },
  {
    id: "wr-003",
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-15T08:00:00"),
    weight: 72.0,
    createdAt: new Date("2024-11-15T08:00:00"),
    updatedAt: new Date("2024-11-15T08:00:00"),
  },
  {
    id: "wr-004",
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-22T08:00:00"),
    weight: 71.8,
    createdAt: new Date("2024-11-22T08:00:00"),
    updatedAt: new Date("2024-11-22T08:00:00"),
  },
  {
    id: "wr-005",
    userId: MOCK_USER_ID,
    recordedAt: new Date("2024-11-29T08:00:00"),
    weight: 71.5,
    createdAt: new Date("2024-11-29T08:00:00"),
    updatedAt: new Date("2024-11-29T08:00:00"),
  },
  {
    id: "wr-006",
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
    id: "ws-001",
    userId: MOCK_USER_ID,
    dayOfWeek: 0, // 日曜
    menuId: "menu-001",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "ws-002",
    userId: MOCK_USER_ID,
    dayOfWeek: 1, // 月曜
    menuId: "menu-002",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "ws-003",
    userId: MOCK_USER_ID,
    dayOfWeek: 3, // 水曜
    menuId: "menu-003",
    createdAt: mockDate(90),
    updatedAt: mockDate(90),
  },
  {
    id: "ws-004",
    userId: MOCK_USER_ID,
    dayOfWeek: 5, // 金曜
    menuId: "menu-001",
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
  exerciseId: string,
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
  menuId: string,
): WorkoutMenuWithExercises | undefined {
  const menu = mockMenus.find((m) => m.id === menuId);
  if (!menu) return undefined;

  const menuExercises = mockMenuExercises
    .filter((me) => me.menuId === menuId)
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
  sessionId: string,
): WorkoutSessionWithDetails | undefined {
  const session = mockSessions.find((s) => s.id === sessionId);
  if (!session) return undefined;

  const menu = mockMenus.find((m) => m.id === session.menuId);
  if (!menu) return undefined;

  // このセッションに関連するログを取得（簡易実装）
  const exerciseLogs: ExerciseLogWithDetails[] = [];

  // menu の種目からログを生成
  const menuExercises = mockMenuExercises
    .filter((me) => me.menuId === session.menuId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  for (const me of menuExercises) {
    const exercise = getExerciseWithBodyParts(me.exerciseId);
    if (!exercise) continue;

    // このセッション・種目のセットを取得
    const logId = `log-${sessionId}-${me.exerciseId}`;
    const sets = mockSets.filter((s) => s.exerciseLogId.startsWith("log-"));

    exerciseLogs.push({
      id: logId,
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
