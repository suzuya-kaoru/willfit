const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("@prisma/client");

function getDatabaseUrl() {
  const url = process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("PRISMA_DATABASE_URL or DATABASE_URL is not set.");
  }
  return url;
}

function buildMariaDbConfig() {
  const url = new URL(getDatabaseUrl());
  const host = url.hostname;
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, "");
  const port = url.port ? Number(url.port) : undefined;

  if (!host) {
    throw new Error("Database host is not set.");
  }
  if (!user) {
    throw new Error("Database user is not set.");
  }
  if (!database) {
    throw new Error("Database name is not set.");
  }
  if (url.port && Number.isNaN(port)) {
    throw new Error("Database port is invalid.");
  }

  return {
    host,
    user,
    password,
    database,
    port,
  };
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(buildMariaDbConfig()),
});

// ========================================
// ヘルパー関数
// ========================================
const now = new Date("2026-01-03T09:00:00+09:00");

const daysAgo = (days) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date;
};

// JST日付からDate生成（テスト観点: UTC境界）
const jst = (dateStr, timeStr = "09:00:00") =>
  new Date(`${dateStr}T${timeStr}+09:00`);

// UTC深夜境界テスト用（JST 00:00 = UTC 前日15:00）
const jstMidnight = (dateStr) => jst(dateStr, "00:00:00");
const jstBeforeMidnight = (dateStr) => jst(dateStr, "23:59:59");

const USER_ID = 1;
const TEST_USER_ID = 2;

const users = [
  {
    id: USER_ID,
    email: "demo@example.com",
    name: "Demo User",
    avatarUrl: null,
    createdAt: daysAgo(730), // 約2年前から
    updatedAt: daysAgo(1),
    deletedAt: null,
  },
  {
    id: TEST_USER_ID,
    email: "test-boundary@example.com",
    name: "境界値テスト用ユーザー",
    avatarUrl: null,
    createdAt: jst("2024-01-01"),
    updatedAt: jst("2026-01-03"),
    deletedAt: null,
  },
];

const bodyParts = [
  {
    id: 1,
    name: "胸",
    nameEn: "chest",
    displayOrder: 1,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 2,
    name: "背中",
    nameEn: "back",
    displayOrder: 2,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 3,
    name: "肩",
    nameEn: "shoulder",
    displayOrder: 3,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 4,
    name: "二頭筋",
    nameEn: "biceps",
    displayOrder: 4,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 5,
    name: "三頭筋",
    nameEn: "triceps",
    displayOrder: 5,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 6,
    name: "脚",
    nameEn: "legs",
    displayOrder: 6,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 7,
    name: "大臀筋",
    nameEn: "glutes",
    displayOrder: 7,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
  {
    id: 8,
    name: "腹筋",
    nameEn: "abs",
    displayOrder: 8,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(300),
  },
];

const exercises = [
  {
    id: 1,
    userId: USER_ID,
    name: "ベンチプレス",
    formNote: "肩甲骨を寄せ、手首を真っ直ぐに保つ。足は床にしっかりつける。",
    videoUrl: "https://youtube.com/watch?v=example1",
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
    deletedAt: null,
  },
  {
    id: 2,
    userId: USER_ID,
    name: "ラットプルダウン",
    formNote: "胸を張り、肘を体の横に引く。反動を使わない。",
    videoUrl: "https://youtube.com/watch?v=example2",
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
    deletedAt: null,
  },
  {
    id: 3,
    userId: USER_ID,
    name: "スクワット",
    formNote: "膝がつま先より前に出ないように。背中は真っ直ぐ。",
    videoUrl: "https://youtube.com/watch?v=example3",
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
    deletedAt: null,
  },
  {
    id: 4,
    userId: USER_ID,
    name: "ショルダープレス",
    formNote: "肘は体の少し前方に。首を縮めない。",
    videoUrl: null,
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
    deletedAt: null,
  },
  {
    id: 5,
    userId: USER_ID,
    name: "デッドリフト",
    formNote: "腰を丸めない。バーは体に近い位置をキープ。",
    videoUrl: null,
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
    deletedAt: null,
  },
  {
    id: 6,
    userId: USER_ID,
    name: "ダンベルカール",
    formNote: "肘は固定。反動を使わずコントロール。",
    videoUrl: null,
    createdAt: daysAgo(100),
    updatedAt: daysAgo(100),
    deletedAt: null,
  },
];

const exerciseBodyParts = [
  { exerciseId: 1, bodyPartId: 1 },
  { exerciseId: 1, bodyPartId: 5 },
  { exerciseId: 2, bodyPartId: 2 },
  { exerciseId: 2, bodyPartId: 4 },
  { exerciseId: 3, bodyPartId: 6 },
  { exerciseId: 3, bodyPartId: 7 },
  { exerciseId: 4, bodyPartId: 3 },
  { exerciseId: 5, bodyPartId: 2 },
  { exerciseId: 5, bodyPartId: 6 },
  { exerciseId: 5, bodyPartId: 7 },
  { exerciseId: 6, bodyPartId: 4 },
];

// WorkoutTemplate (旧 WorkoutMenu)
const workoutTemplates = [
  {
    id: 1,
    userId: USER_ID,
    name: "Day1 胸・背中",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
  {
    id: 2,
    userId: USER_ID,
    name: "Day2 脚・肩",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
  {
    id: 3,
    userId: USER_ID,
    name: "Day3 背中・腕",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
];

// WorkoutTemplateExercise (旧 MenuExercise)
const workoutTemplateExercises = [
  {
    id: 1,
    templateId: 1,
    exerciseId: 1,
    displayOrder: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 2,
    templateId: 1,
    exerciseId: 2,
    displayOrder: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 3,
    templateId: 2,
    exerciseId: 3,
    displayOrder: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 4,
    templateId: 2,
    exerciseId: 4,
    displayOrder: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 5,
    templateId: 3,
    exerciseId: 5,
    displayOrder: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 6,
    templateId: 3,
    exerciseId: 6,
    displayOrder: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
];

// WorkoutRecord (実際のワークアウト記録) - テスト観点がわかるnote付き
const workoutRecords = [
  // === 2024年 ===
  // うるう年テスト
  {
    id: 1,
    userId: TEST_USER_ID,
    templateId: 1,
    startedAt: jst("2024-02-29", "10:00:00"),
    endedAt: jst("2024-02-29", "11:30:00"),
    condition: 8,
    fatigue: 5,
    note: "【日付境界_うるう年】2024-02-29のワークアウト",
    createdAt: jst("2024-02-29"),
    updatedAt: jst("2024-02-29"),
  },

  // 月末月初境界
  {
    id: 2,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2024-01-31", "18:00:00"),
    endedAt: jst("2024-01-31", "19:30:00"),
    condition: 7,
    fatigue: 6,
    note: "【日付境界_月末】1月最終日",
    createdAt: jst("2024-01-31"),
    updatedAt: jst("2024-01-31"),
  },
  {
    id: 3,
    userId: USER_ID,
    templateId: 2,
    startedAt: jst("2024-02-01", "09:00:00"),
    endedAt: jst("2024-02-01", "10:15:00"),
    condition: 8,
    fatigue: 4,
    note: "【日付境界_月初】2月初日",
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
  },

  // 通常データ 2024
  {
    id: 4,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2024-03-15", "10:00:00"),
    endedAt: jst("2024-03-15", "11:30:00"),
    condition: 8,
    fatigue: 6,
    note: "通常トレーニング",
    createdAt: jst("2024-03-15"),
    updatedAt: jst("2024-03-15"),
  },
  {
    id: 5,
    userId: USER_ID,
    templateId: 2,
    startedAt: jst("2024-04-10", "09:00:00"),
    endedAt: jst("2024-04-10", "10:30:00"),
    condition: 7,
    fatigue: 7,
    note: "脚の日",
    createdAt: jst("2024-04-10"),
    updatedAt: jst("2024-04-10"),
  },
  {
    id: 6,
    userId: USER_ID,
    templateId: 3,
    startedAt: jst("2024-05-20", "14:00:00"),
    endedAt: jst("2024-05-20", "15:30:00"),
    condition: 9,
    fatigue: 5,
    note: "背中の調子よし",
    createdAt: jst("2024-05-20"),
    updatedAt: jst("2024-05-20"),
  },

  // 体調スコア境界値テスト
  {
    id: 7,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2024-06-15", "10:00:00"),
    endedAt: jst("2024-06-15", "11:00:00"),
    condition: 1,
    fatigue: 10,
    note: "【ワークアウト_体調最低】condition=1, fatigue=10",
    createdAt: jst("2024-06-15"),
    updatedAt: jst("2024-06-15"),
  },
  {
    id: 8,
    userId: USER_ID,
    templateId: 2,
    startedAt: jst("2024-07-20", "08:00:00"),
    endedAt: jst("2024-07-20", "10:00:00"),
    condition: 10,
    fatigue: 1,
    note: "【ワークアウト_体調最高】condition=10, fatigue=1",
    createdAt: jst("2024-07-20"),
    updatedAt: jst("2024-07-20"),
  },

  // 年末年始跨ぎ
  {
    id: 9,
    userId: TEST_USER_ID,
    templateId: 1,
    startedAt: jst("2024-12-31", "22:00:00"),
    endedAt: jstBeforeMidnight("2024-12-31"),
    condition: 7,
    fatigue: 5,
    note: "【日付境界_年末】大晦日深夜トレ",
    createdAt: jst("2024-12-31"),
    updatedAt: jst("2024-12-31"),
  },

  // === 2025年 ===
  // 年始
  {
    id: 10,
    userId: TEST_USER_ID,
    templateId: 2,
    startedAt: jstMidnight("2025-01-01"),
    endedAt: jst("2025-01-01", "01:30:00"),
    condition: 6,
    fatigue: 4,
    note: "【日付境界_年始】元旦深夜0時スタート",
    createdAt: jst("2025-01-01"),
    updatedAt: jst("2025-01-01"),
  },

  // 途中終了テスト（endedAt = null）
  {
    id: 11,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2025-02-10", "10:00:00"),
    endedAt: null,
    condition: 5,
    fatigue: 8,
    note: "【ワークアウト_途中終了】endedAt=null",
    createdAt: jst("2025-02-10"),
    updatedAt: jst("2025-02-10"),
  },

  // 空ノート
  {
    id: 12,
    userId: USER_ID,
    templateId: 2,
    startedAt: jst("2025-03-05", "09:00:00"),
    endedAt: jst("2025-03-05", "10:30:00"),
    condition: 7,
    fatigue: 6,
    note: "",
    createdAt: jst("2025-03-05"),
    updatedAt: jst("2025-03-05"),
  },

  // UTC境界テスト
  {
    id: 13,
    userId: TEST_USER_ID,
    templateId: 1,
    startedAt: jstMidnight("2025-06-15"),
    endedAt: jst("2025-06-15", "01:00:00"),
    condition: 6,
    fatigue: 5,
    note: "【UTC境界_深夜0時】JST 00:00 = UTC前日15:00",
    createdAt: jst("2025-06-15"),
    updatedAt: jst("2025-06-15"),
  },
  {
    id: 14,
    userId: TEST_USER_ID,
    templateId: 2,
    startedAt: jstBeforeMidnight("2025-06-20"),
    endedAt: jst("2025-06-21", "00:30:00"),
    condition: 7,
    fatigue: 6,
    note: "【UTC境界_日跨ぎ】23:59:59→翌日0:30終了",
    createdAt: jst("2025-06-21"),
    updatedAt: jst("2025-06-21"),
  },

  // 通常データ 2025
  {
    id: 15,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2025-08-10", "10:00:00"),
    endedAt: jst("2025-08-10", "11:30:00"),
    condition: 8,
    fatigue: 6,
    note: "夏トレーニング",
    createdAt: jst("2025-08-10"),
    updatedAt: jst("2025-08-10"),
  },
  {
    id: 16,
    userId: USER_ID,
    templateId: 2,
    startedAt: jst("2025-09-15", "09:00:00"),
    endedAt: jst("2025-09-15", "10:30:00"),
    condition: 7,
    fatigue: 7,
    note: "秋の脚トレ",
    createdAt: jst("2025-09-15"),
    updatedAt: jst("2025-09-15"),
  },
  {
    id: 17,
    userId: USER_ID,
    templateId: 3,
    startedAt: jst("2025-10-20", "14:00:00"),
    endedAt: jst("2025-10-20", "15:30:00"),
    condition: 9,
    fatigue: 5,
    note: "デッドリフト新記録",
    createdAt: jst("2025-10-20"),
    updatedAt: jst("2025-10-20"),
  },
  {
    id: 18,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2025-11-29", "09:00:00"),
    endedAt: jst("2025-11-29", "10:15:00"),
    condition: 7,
    fatigue: 8,
    note: "脚の疲労が強かった",
    createdAt: jst("2025-11-29"),
    updatedAt: jst("2025-11-29"),
  },
  {
    id: 19,
    userId: USER_ID,
    templateId: 1,
    startedAt: jst("2025-12-01", "10:00:00"),
    endedAt: jst("2025-12-01", "11:30:00"),
    condition: 8,
    fatigue: 6,
    note: "ベンチプレスの手首の角度に注意",
    createdAt: jst("2025-12-01"),
    updatedAt: jst("2025-12-01"),
  },

  // === 2026年（現在まで） ===
  {
    id: 20,
    userId: USER_ID,
    templateId: 2,
    startedAt: jst("2026-01-02", "10:00:00"),
    endedAt: jst("2026-01-02", "11:30:00"),
    condition: 7,
    fatigue: 5,
    note: "新年初トレ",
    createdAt: jst("2026-01-02"),
    updatedAt: jst("2026-01-02"),
  },
];

function buildWorkoutRecordExercises(records, templateEntries) {
  const templateMap = new Map();
  for (const entry of templateEntries) {
    const list = templateMap.get(entry.templateId) ?? [];
    list.push(entry);
    templateMap.set(entry.templateId, list);
  }
  for (const list of templateMap.values()) {
    list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const sortedRecords = [...records].sort((a, b) => a.id - b.id);
  const exercises = [];
  let exerciseId = 1;

  for (const record of sortedRecords) {
    const entries = templateMap.get(record.templateId) ?? [];
    for (const entry of entries) {
      exercises.push({
        id: exerciseId,
        recordId: record.id,
        exerciseId: entry.exerciseId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
      exerciseId += 1;
    }
  }

  return exercises;
}

const workoutRecordExercises = buildWorkoutRecordExercises(
  workoutRecords,
  workoutTemplateExercises,
);

// WorkoutRecordSet - プロトレーニー観点のリアルなデータ生成
// 漸進性過負荷: 2024年初期から2026年にかけて徐々に重量UP
// セット間バリエーション: 最初のセットは軽め（ウォームアップ後）、メインセットで重量UP、最終セットは疲労
// 日によるコンディション差: recordId（日付）に応じた変動
function buildWorkoutRecordSets(workoutRecordExercises, workoutRecords) {
  const sets = [];
  let setId = 1;

  // recordIdから日付を取得するマップ
  const recordDateMap = new Map(workoutRecords.map((r) => [r.id, r.createdAt]));

  // 種目ごとの基準重量（2024年初期）と2年間での成長率
  const exerciseConfig = {
    1: { baseWeight: 60, growthRate: 1.25, name: "ベンチプレス" }, // 60kg → 75kg
    2: { baseWeight: 50, growthRate: 1.2, name: "ラットプルダウン" }, // 50kg → 60kg
    3: { baseWeight: 80, growthRate: 1.3, name: "スクワット" }, // 80kg → 104kg
    4: { baseWeight: 25, growthRate: 1.2, name: "ショルダープレス" }, // 25kg → 30kg
    5: { baseWeight: 100, growthRate: 1.35, name: "デッドリフト" }, // 100kg → 135kg
    6: { baseWeight: 12, growthRate: 1.25, name: "ダンベルカール" }, // 12kg → 15kg
  };

  // 2024年1月1日を基準日とする
  const baseDate = new Date("2024-01-01T00:00:00+09:00");
  const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;

  for (const recordExercise of workoutRecordExercises) {
    const config = exerciseConfig[recordExercise.exerciseId] ?? {
      baseWeight: 50,
      growthRate: 1.2,
    };
    const recordDate = recordDateMap.get(recordExercise.recordId) ?? new Date();

    // 経過時間に基づく成長係数（0〜1の範囲、2年で最大成長）
    const elapsedMs = recordDate.getTime() - baseDate.getTime();
    const progressRatio = Math.min(1, Math.max(0, elapsedMs / twoYearsMs));

    // 現在の最大重量（漸進性過負荷）
    const currentMaxWeight =
      config.baseWeight * (1 + (config.growthRate - 1) * progressRatio);

    // 日によるコンディション差（±5%）
    const dayVariation = 0.95 + (recordExercise.recordId % 10) / 100;

    // プロトレーニーのセット構成: ウォームアップ→メイン→追い込み
    const setPatterns = [
      { ratio: 0.75, reps: 12 }, // Set1: ウォームアップ後の軽めのセット
      { ratio: 0.85, reps: 10 }, // Set2: メインセット1
      { ratio: 0.9, reps: 8 }, // Set3: メインセット2（少し重め）
      { ratio: 0.95, reps: 6 }, // Set4: 追い込みセット（オプション）
    ];

    // 3〜4セット（日によって変動）
    const numSets = 3 + (recordExercise.recordId % 3 === 0 ? 1 : 0);

    for (let i = 0; i < numSets && i < setPatterns.length; i++) {
      const pattern = setPatterns[i];
      // 重量を2.5kg刻みで丸める（リアルなプレート構成）
      const rawWeight = currentMaxWeight * pattern.ratio * dayVariation;
      const weight = Math.round(rawWeight / 2.5) * 2.5;

      // レップ数も日によって±1変動
      const repsVariation = (recordExercise.recordId % 3) - 1;
      const reps = Math.max(4, pattern.reps + repsVariation);

      sets.push({
        id: setId,
        workoutRecordExerciseId: recordExercise.id,
        setNumber: i + 1,
        weight: weight,
        reps: reps,
        completed: true,
        createdAt: recordExercise.createdAt,
        updatedAt: recordExercise.updatedAt,
      });
      setId++;
    }
  }

  return sets;
}

const workoutRecordSets = buildWorkoutRecordSets(
  workoutRecordExercises,
  workoutRecords,
);

// プロトレーニーの体重・体脂肪推移
// 2024年: 増量期（バルク）スタート 75kg/18% → 82kg/17%
// 2025年前半: 増量期ピーク 82-83kg/18%
// 2025年後半: 減量期（カット） 83kg → 75kg/10%
// 2026年: 維持期→次の増量準備
const weightRecords = [
  // === 2024年 増量期スタート ===
  {
    id: 1,
    userId: USER_ID,
    recordedAt: jst("2024-01-05", "07:00:00"),
    weight: 75.0,
    bodyFat: 18.0,
    createdAt: jst("2024-01-05"),
    updatedAt: jst("2024-01-05"),
  },
  {
    id: 2,
    userId: USER_ID,
    recordedAt: jst("2024-01-15", "07:00:00"),
    weight: 75.3,
    bodyFat: 17.8,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 3,
    userId: USER_ID,
    recordedAt: jst("2024-01-31", "07:00:00"),
    weight: 75.8,
    bodyFat: 17.5,
    createdAt: jst("2024-01-31"),
    updatedAt: jst("2024-01-31"),
  },
  {
    id: 4,
    userId: USER_ID,
    recordedAt: jst("2024-02-01", "07:00:00"),
    weight: 75.9,
    bodyFat: 17.4,
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
  },
  {
    id: 5,
    userId: USER_ID,
    recordedAt: jst("2024-02-15", "07:00:00"),
    weight: 76.4,
    bodyFat: 17.0,
    createdAt: jst("2024-02-15"),
    updatedAt: jst("2024-02-15"),
  },
  // うるう年境界テスト
  {
    id: 6,
    userId: TEST_USER_ID,
    recordedAt: jst("2024-02-29", "07:00:00"),
    weight: 76.8,
    bodyFat: 16.8,
    createdAt: jst("2024-02-29"),
    updatedAt: jst("2024-02-29"),
  },
  {
    id: 7,
    userId: USER_ID,
    recordedAt: jst("2024-03-10", "07:00:00"),
    weight: 77.2,
    bodyFat: 16.5,
    createdAt: jst("2024-03-10"),
    updatedAt: jst("2024-03-10"),
  },
  {
    id: 8,
    userId: USER_ID,
    recordedAt: jst("2024-04-05", "07:00:00"),
    weight: 77.8,
    bodyFat: 16.2,
    createdAt: jst("2024-04-05"),
    updatedAt: jst("2024-04-05"),
  },
  {
    id: 9,
    userId: USER_ID,
    recordedAt: jst("2024-05-01", "07:00:00"),
    weight: 78.3,
    bodyFat: 15.8,
    createdAt: jst("2024-05-01"),
    updatedAt: jst("2024-05-01"),
  },
  {
    id: 10,
    userId: USER_ID,
    recordedAt: jst("2024-06-01", "07:00:00"),
    weight: 78.8,
    bodyFat: 15.5,
    createdAt: jst("2024-06-01"),
    updatedAt: jst("2024-06-01"),
  },
  {
    id: 11,
    userId: USER_ID,
    recordedAt: jst("2024-07-01", "07:00:00"),
    weight: 79.2,
    bodyFat: 15.2,
    createdAt: jst("2024-07-01"),
    updatedAt: jst("2024-07-01"),
  },
  {
    id: 12,
    userId: USER_ID,
    recordedAt: jst("2024-08-01", "07:00:00"),
    weight: 79.8,
    bodyFat: 15.5,
    createdAt: jst("2024-08-01"),
    updatedAt: jst("2024-08-01"),
  },
  {
    id: 13,
    userId: USER_ID,
    recordedAt: jst("2024-09-01", "07:00:00"),
    weight: 80.2,
    bodyFat: 15.8,
    createdAt: jst("2024-09-01"),
    updatedAt: jst("2024-09-01"),
  },
  {
    id: 14,
    userId: USER_ID,
    recordedAt: jst("2024-10-01", "07:00:00"),
    weight: 80.8,
    bodyFat: 16.2,
    createdAt: jst("2024-10-01"),
    updatedAt: jst("2024-10-01"),
  },
  {
    id: 15,
    userId: USER_ID,
    recordedAt: jst("2024-11-01", "07:00:00"),
    weight: 81.2,
    bodyFat: 16.5,
    createdAt: jst("2024-11-01"),
    updatedAt: jst("2024-11-01"),
  },
  {
    id: 16,
    userId: USER_ID,
    recordedAt: jst("2024-12-01", "07:00:00"),
    weight: 81.5,
    bodyFat: 16.8,
    createdAt: jst("2024-12-01"),
    updatedAt: jst("2024-12-01"),
  },
  // 年末年始境界テスト
  {
    id: 17,
    userId: TEST_USER_ID,
    recordedAt: jstBeforeMidnight("2024-12-31"),
    weight: 82.0,
    bodyFat: 17.0,
    createdAt: jst("2024-12-31"),
    updatedAt: jst("2024-12-31"),
  },
  {
    id: 18,
    userId: TEST_USER_ID,
    recordedAt: jstMidnight("2025-01-01"),
    weight: 82.3,
    bodyFat: 17.2,
    createdAt: jst("2025-01-01"),
    updatedAt: jst("2025-01-01"),
  },
  // === 2025年 増量期ピーク→減量期 ===
  {
    id: 19,
    userId: USER_ID,
    recordedAt: jst("2025-01-15", "07:00:00"),
    weight: 82.5,
    bodyFat: 17.5,
    createdAt: jst("2025-01-15"),
    updatedAt: jst("2025-01-15"),
  },
  {
    id: 20,
    userId: USER_ID,
    recordedAt: jst("2025-02-01", "07:00:00"),
    weight: 82.8,
    bodyFat: 17.8,
    createdAt: jst("2025-02-01"),
    updatedAt: jst("2025-02-01"),
  },
  {
    id: 21,
    userId: USER_ID,
    recordedAt: jst("2025-03-01", "07:00:00"),
    weight: 83.0,
    bodyFat: 18.0,
    createdAt: jst("2025-03-01"),
    updatedAt: jst("2025-03-01"),
  },
  // 減量期スタート
  {
    id: 22,
    userId: USER_ID,
    recordedAt: jst("2025-04-01", "07:00:00"),
    weight: 81.5,
    bodyFat: 16.5,
    createdAt: jst("2025-04-01"),
    updatedAt: jst("2025-04-01"),
  },
  {
    id: 23,
    userId: USER_ID,
    recordedAt: jst("2025-05-01", "07:00:00"),
    weight: 79.8,
    bodyFat: 14.8,
    createdAt: jst("2025-05-01"),
    updatedAt: jst("2025-05-01"),
  },
  // UTC境界テスト
  {
    id: 24,
    userId: TEST_USER_ID,
    recordedAt: jstMidnight("2025-06-15"),
    weight: 78.2,
    bodyFat: 13.0,
    createdAt: jst("2025-06-15"),
    updatedAt: jst("2025-06-15"),
  },
  {
    id: 25,
    userId: USER_ID,
    recordedAt: jst("2025-07-01", "07:00:00"),
    weight: 77.0,
    bodyFat: 12.0,
    createdAt: jst("2025-07-01"),
    updatedAt: jst("2025-07-01"),
  },
  {
    id: 26,
    userId: USER_ID,
    recordedAt: jst("2025-08-01", "07:00:00"),
    weight: 76.2,
    bodyFat: 11.2,
    createdAt: jst("2025-08-01"),
    updatedAt: jst("2025-08-01"),
  },
  {
    id: 27,
    userId: USER_ID,
    recordedAt: jst("2025-09-01", "07:00:00"),
    weight: 75.5,
    bodyFat: 10.5,
    createdAt: jst("2025-09-01"),
    updatedAt: jst("2025-09-01"),
  },
  // 減量期終了→維持期
  {
    id: 28,
    userId: USER_ID,
    recordedAt: jst("2025-10-01", "07:00:00"),
    weight: 75.0,
    bodyFat: 10.0,
    createdAt: jst("2025-10-01"),
    updatedAt: jst("2025-10-01"),
  },
  {
    id: 29,
    userId: USER_ID,
    recordedAt: jst("2025-11-01", "07:00:00"),
    weight: 75.8,
    bodyFat: 11.0,
    createdAt: jst("2025-11-01"),
    updatedAt: jst("2025-11-01"),
  },
  {
    id: 30,
    userId: USER_ID,
    recordedAt: jst("2025-11-15", "07:00:00"),
    weight: 76.2,
    bodyFat: 11.5,
    createdAt: jst("2025-11-15"),
    updatedAt: jst("2025-11-15"),
  },
  {
    id: 31,
    userId: USER_ID,
    recordedAt: jst("2025-12-01", "07:00:00"),
    weight: 76.5,
    bodyFat: 12.0,
    createdAt: jst("2025-12-01"),
    updatedAt: jst("2025-12-01"),
  },
  {
    id: 32,
    userId: USER_ID,
    recordedAt: jst("2025-12-15", "07:00:00"),
    weight: 77.0,
    bodyFat: 12.5,
    createdAt: jst("2025-12-15"),
    updatedAt: jst("2025-12-15"),
  },
  // === 2026年 維持期 ===
  {
    id: 33,
    userId: USER_ID,
    recordedAt: jst("2026-01-01", "08:00:00"),
    weight: 77.5,
    bodyFat: 13.0,
    createdAt: jst("2026-01-01"),
    updatedAt: jst("2026-01-01"),
  },
  {
    id: 34,
    userId: USER_ID,
    recordedAt: jst("2026-01-02", "08:00:00"),
    weight: 77.3,
    bodyFat: 12.8,
    createdAt: jst("2026-01-02"),
    updatedAt: jst("2026-01-02"),
  },
];

// ========================================
// スケジュール機能テストデータ
// ========================================

// WorkoutSession（テスト観点がわかる名前）
const workoutSessions = [
  {
    id: 1,
    userId: USER_ID,
    templateId: 1,
    name: "週間ルール_胸背中",
    description: "スケジュール機能: weeklyルールテスト用",
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
    deletedAt: null,
  },
  {
    id: 2,
    userId: USER_ID,
    templateId: 2,
    name: "インターバル_脚肩",
    description: "スケジュール機能: intervalルールテスト用（3日間隔）",
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
    deletedAt: null,
  },
  {
    id: 3,
    userId: USER_ID,
    templateId: 3,
    name: "単発_背中腕",
    description: "スケジュール機能: onceルールテスト用",
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
    deletedAt: null,
  },
  {
    id: 4,
    userId: TEST_USER_ID,
    templateId: 1,
    name: "UTC境界_深夜トレ",
    description: "UTC境界テスト: JST深夜0時付近のスケジュール",
    createdAt: jstMidnight("2024-03-01"),
    updatedAt: jstMidnight("2024-03-01"),
    deletedAt: null,
  },
  {
    id: 5,
    userId: TEST_USER_ID,
    templateId: 2,
    name: "日付境界_うるう年",
    description: "日付境界テスト: 2024年うるう年（02-29存在）",
    createdAt: jst("2024-02-29"),
    updatedAt: jst("2024-02-29"),
    deletedAt: null,
  },
  {
    id: 6,
    userId: TEST_USER_ID,
    templateId: 3,
    name: "日付境界_年末年始",
    description: "日付境界テスト: 年末年始跨ぎ検証",
    createdAt: jst("2024-12-31"),
    updatedAt: jst("2025-01-01"),
    deletedAt: null,
  },
  {
    id: 7,
    userId: USER_ID,
    templateId: 1,
    name: "削除済み_アーカイブ",
    description: "論理削除テスト用",
    createdAt: jst("2024-06-01"),
    updatedAt: jst("2024-06-15"),
    deletedAt: jst("2024-06-15"),
  },
];

// WorkoutSessionExercise
const workoutSessionExercises = [
  {
    id: 1,
    workoutSessionId: 1,
    exerciseId: 1,
    displayOrder: 1,
    targetWeight: 60.0,
    targetReps: 10,
    targetSets: 3,
    restSeconds: 90,
    note: null,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 2,
    workoutSessionId: 1,
    exerciseId: 2,
    displayOrder: 2,
    targetWeight: 50.0,
    targetReps: 12,
    targetSets: 3,
    restSeconds: 60,
    note: null,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 3,
    workoutSessionId: 2,
    exerciseId: 3,
    displayOrder: 1,
    targetWeight: 80.0,
    targetReps: 8,
    targetSets: 4,
    restSeconds: 120,
    note: null,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 4,
    workoutSessionId: 2,
    exerciseId: 4,
    displayOrder: 2,
    targetWeight: 30.0,
    targetReps: 10,
    targetSets: 3,
    restSeconds: 60,
    note: null,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 5,
    workoutSessionId: 3,
    exerciseId: 5,
    displayOrder: 1,
    targetWeight: 100.0,
    targetReps: 5,
    targetSets: 5,
    restSeconds: 180,
    note: null,
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
  },
  {
    id: 6,
    workoutSessionId: 3,
    exerciseId: 6,
    displayOrder: 2,
    targetWeight: 15.0,
    targetReps: 12,
    targetSets: 3,
    restSeconds: 45,
    note: null,
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
  },
  {
    id: 7,
    workoutSessionId: 4,
    exerciseId: 1,
    displayOrder: 1,
    targetWeight: 55.0,
    targetReps: 10,
    targetSets: 3,
    restSeconds: 90,
    note: "UTC境界テスト",
    createdAt: jstMidnight("2024-03-01"),
    updatedAt: jstMidnight("2024-03-01"),
  },
  {
    id: 8,
    workoutSessionId: 5,
    exerciseId: 3,
    displayOrder: 1,
    targetWeight: 70.0,
    targetReps: 10,
    targetSets: 3,
    restSeconds: 90,
    note: "うるう年テスト",
    createdAt: jst("2024-02-29"),
    updatedAt: jst("2024-02-29"),
  },
  {
    id: 9,
    workoutSessionId: 6,
    exerciseId: 5,
    displayOrder: 1,
    targetWeight: 90.0,
    targetReps: 6,
    targetSets: 4,
    restSeconds: 120,
    note: "年末年始テスト",
    createdAt: jst("2024-12-31"),
    updatedAt: jst("2025-01-01"),
  },
];

// ScheduleRule
const scheduleRules = [
  // weekly: 月水金 = 2+8+32 = 42
  {
    id: 1,
    userId: USER_ID,
    workoutSessionId: 1,
    ruleType: "weekly",
    weekdays: 42,
    intervalDays: null,
    startDate: null,
    endDate: null,
    isEnabled: true,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
    deletedAt: null,
  },
  // weekly: 毎日 = 127
  {
    id: 2,
    userId: TEST_USER_ID,
    workoutSessionId: 4,
    ruleType: "weekly",
    weekdays: 127,
    intervalDays: null,
    startDate: null,
    endDate: null,
    isEnabled: true,
    createdAt: jst("2024-03-01"),
    updatedAt: jst("2024-03-01"),
    deletedAt: null,
  },
  // weekly: 週末のみ = 日+土 = 1+64 = 65
  {
    id: 3,
    userId: USER_ID,
    workoutSessionId: 2,
    ruleType: "weekly",
    weekdays: 65,
    intervalDays: null,
    startDate: null,
    endDate: null,
    isEnabled: true,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
    deletedAt: null,
  },
  // interval: 3日間隔
  {
    id: 4,
    userId: USER_ID,
    workoutSessionId: 2,
    ruleType: "interval",
    weekdays: null,
    intervalDays: 3,
    startDate: jst("2024-02-01"),
    endDate: null,
    isEnabled: true,
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
    deletedAt: null,
  },
  // once: 単発
  {
    id: 5,
    userId: USER_ID,
    workoutSessionId: 3,
    ruleType: "once",
    weekdays: null,
    intervalDays: null,
    startDate: jst("2024-02-15"),
    endDate: null,
    isEnabled: true,
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-02-01"),
    deletedAt: null,
  },
  // うるう年境界
  {
    id: 6,
    userId: TEST_USER_ID,
    workoutSessionId: 5,
    ruleType: "once",
    weekdays: null,
    intervalDays: null,
    startDate: jst("2024-02-29"),
    endDate: null,
    isEnabled: true,
    createdAt: jst("2024-02-29"),
    updatedAt: jst("2024-02-29"),
    deletedAt: null,
  },
  // 年末年始跨ぎ (開始12/30, 終了1/5)
  {
    id: 7,
    userId: TEST_USER_ID,
    workoutSessionId: 6,
    ruleType: "interval",
    weekdays: null,
    intervalDays: 2,
    startDate: jst("2024-12-30"),
    endDate: jst("2025-01-05"),
    isEnabled: true,
    createdAt: jst("2024-12-30"),
    updatedAt: jst("2024-12-30"),
    deletedAt: null,
  },
  // 無効化済み
  {
    id: 8,
    userId: USER_ID,
    workoutSessionId: 1,
    ruleType: "weekly",
    weekdays: 42,
    intervalDays: null,
    startDate: null,
    endDate: null,
    isEnabled: false,
    createdAt: jst("2024-03-01"),
    updatedAt: jst("2024-06-01"),
    deletedAt: null,
  },
];

// ScheduledTask - 各種ステータスのテストデータ
const scheduledTasks = [
  // pending (未完了)
  {
    id: 1,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2026-01-06"),
    status: "pending",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: null,
    createdAt: jst("2026-01-03"),
    updatedAt: jst("2026-01-03"),
  },
  {
    id: 2,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2026-01-08"),
    status: "pending",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: null,
    createdAt: jst("2026-01-03"),
    updatedAt: jst("2026-01-03"),
  },
  // completed (完了)
  {
    id: 3,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2025-12-29"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jst("2025-12-29", "11:30:00"),
    createdAt: jst("2025-12-20"),
    updatedAt: jst("2025-12-29"),
  },
  {
    id: 4,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2025-12-31"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jstBeforeMidnight("2025-12-31"),
    createdAt: jst("2025-12-20"),
    updatedAt: jst("2025-12-31"),
  },
  // skipped (スキップ)
  {
    id: 5,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2025-12-25"),
    status: "skipped",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: null,
    createdAt: jst("2025-12-20"),
    updatedAt: jst("2025-12-25"),
  },
  // rescheduled (振替)
  {
    id: 6,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2025-12-27"),
    status: "rescheduled",
    rescheduledTo: jst("2025-12-28"),
    rescheduledFrom: null,
    completedAt: null,
    createdAt: jst("2025-12-20"),
    updatedAt: jst("2025-12-27"),
  },
  {
    id: 7,
    userId: USER_ID,
    ruleId: 1,
    workoutSessionId: 1,
    scheduledDate: jst("2025-12-28"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: jst("2025-12-27"),
    completedAt: jst("2025-12-28", "10:00:00"),
    createdAt: jst("2025-12-27"),
    updatedAt: jst("2025-12-28"),
  },
  // UTC境界テスト: JST深夜0時
  {
    id: 8,
    userId: TEST_USER_ID,
    ruleId: 2,
    workoutSessionId: 4,
    scheduledDate: jstMidnight("2025-06-15"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jst("2025-06-15", "00:45:00"),
    createdAt: jst("2025-06-01"),
    updatedAt: jst("2025-06-15"),
  },
  // うるう年境界
  {
    id: 9,
    userId: TEST_USER_ID,
    ruleId: 6,
    workoutSessionId: 5,
    scheduledDate: jst("2024-02-29"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jst("2024-02-29", "18:00:00"),
    createdAt: jst("2024-02-29"),
    updatedAt: jst("2024-02-29"),
  },
  // 年末年始跨ぎ
  {
    id: 10,
    userId: TEST_USER_ID,
    ruleId: 7,
    workoutSessionId: 6,
    scheduledDate: jst("2024-12-30"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jst("2024-12-30", "10:00:00"),
    createdAt: jst("2024-12-30"),
    updatedAt: jst("2024-12-30"),
  },
  {
    id: 11,
    userId: TEST_USER_ID,
    ruleId: 7,
    workoutSessionId: 6,
    scheduledDate: jst("2025-01-01"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jst("2025-01-01", "10:00:00"),
    createdAt: jst("2024-12-30"),
    updatedAt: jst("2025-01-01"),
  },
  {
    id: 12,
    userId: TEST_USER_ID,
    ruleId: 7,
    workoutSessionId: 6,
    scheduledDate: jst("2025-01-03"),
    status: "completed",
    rescheduledTo: null,
    rescheduledFrom: null,
    completedAt: jst("2025-01-03", "10:00:00"),
    createdAt: jst("2024-12-30"),
    updatedAt: jst("2025-01-03"),
  },
];

// ScheduleReminder
const scheduleReminders = [
  {
    id: 1,
    userId: USER_ID,
    workoutSessionId: 1,
    reminderType: "before_scheduled",
    offsetMinutes: 30,
    fixedTimeOfDay: null,
    timezone: "Asia/Tokyo",
    isEnabled: true,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 2,
    userId: USER_ID,
    workoutSessionId: 2,
    reminderType: "fixed_time",
    offsetMinutes: null,
    fixedTimeOfDay: new Date("1970-01-01T08:00:00Z"),
    timezone: "Asia/Tokyo",
    isEnabled: true,
    createdAt: jst("2024-01-15"),
    updatedAt: jst("2024-01-15"),
  },
  {
    id: 3,
    userId: TEST_USER_ID,
    workoutSessionId: 4,
    reminderType: "before_scheduled",
    offsetMinutes: 60,
    fixedTimeOfDay: null,
    timezone: "Asia/Tokyo",
    isEnabled: true,
    createdAt: jst("2024-03-01"),
    updatedAt: jst("2024-03-01"),
  },
  {
    id: 4,
    userId: USER_ID,
    workoutSessionId: 1,
    reminderType: "fixed_time",
    offsetMinutes: null,
    fixedTimeOfDay: new Date("1970-01-01T23:00:00Z"),
    timezone: "Asia/Tokyo",
    isEnabled: false,
    createdAt: jst("2024-02-01"),
    updatedAt: jst("2024-06-01"),
  },
];

async function resetDatabase() {
  // Delete in reverse order of dependency
  await prisma.workoutRecordSet.deleteMany();
  await prisma.workoutRecordExercise.deleteMany();
  await prisma.workoutRecord.deleteMany();
  await prisma.scheduledTask.deleteMany();
  await prisma.scheduleRule.deleteMany();
  await prisma.scheduleReminder.deleteMany();
  await prisma.workoutSessionExercise.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.workoutTemplateExercise.deleteMany();
  await prisma.exerciseBodyPart.deleteMany();
  await prisma.weightRecord.deleteMany();
  await prisma.workoutTemplate.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.bodyPart.deleteMany();
  await prisma.user.deleteMany();
}

async function seed() {
  await resetDatabase();

  // 基本データ
  await prisma.user.createMany({ data: users });
  await prisma.bodyPart.createMany({ data: bodyParts });
  await prisma.exercise.createMany({ data: exercises });
  await prisma.exerciseBodyPart.createMany({ data: exerciseBodyParts });
  await prisma.workoutTemplate.createMany({ data: workoutTemplates });
  await prisma.workoutTemplateExercise.createMany({
    data: workoutTemplateExercises,
  });

  // ワークアウト記録
  await prisma.workoutRecord.createMany({ data: workoutRecords });
  await prisma.workoutRecordExercise.createMany({
    data: workoutRecordExercises,
  });
  await prisma.workoutRecordSet.createMany({ data: workoutRecordSets });
  await prisma.weightRecord.createMany({ data: weightRecords });

  // スケジュール機能
  await prisma.workoutSession.createMany({ data: workoutSessions });
  await prisma.workoutSessionExercise.createMany({
    data: workoutSessionExercises,
  });
  await prisma.scheduleRule.createMany({ data: scheduleRules });
  await prisma.scheduledTask.createMany({ data: scheduledTasks });
  await prisma.scheduleReminder.createMany({ data: scheduleReminders });
}

seed()
  .then(() => {
    console.log("Prisma seed completed.");
  })
  .catch((error) => {
    console.error("Prisma seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
