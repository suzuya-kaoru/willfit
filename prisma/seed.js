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

const now = new Date("2025-12-31T09:00:00+09:00");
const daysAgo = (days) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date;
};

const USER_ID = 1;

const users = [
  {
    id: USER_ID,
    email: "demo@example.com",
    name: "Demo User",
    avatarUrl: null,
    createdAt: daysAgo(300),
    updatedAt: daysAgo(7),
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

const workoutMenus = [
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

const menuExercises = [
  {
    id: 1,
    menuId: 1,
    exerciseId: 1,
    displayOrder: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 2,
    menuId: 1,
    exerciseId: 2,
    displayOrder: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 3,
    menuId: 2,
    exerciseId: 3,
    displayOrder: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 4,
    menuId: 2,
    exerciseId: 4,
    displayOrder: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 5,
    menuId: 3,
    exerciseId: 5,
    displayOrder: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
  {
    id: 6,
    menuId: 3,
    exerciseId: 6,
    displayOrder: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
  },
];

const workoutSessions = [
  {
    id: 1,
    userId: USER_ID,
    menuId: 1,
    startedAt: new Date("2025-12-01T10:00:00"),
    endedAt: new Date("2025-12-01T11:30:00"),
    condition: 8,
    fatigue: 6,
    note: "ベンチプレスの手首の角度に注意。今日は調子が良かった。",
    createdAt: new Date("2025-12-01T11:30:00"),
    updatedAt: new Date("2025-12-01T11:30:00"),
  },
  {
    id: 2,
    userId: USER_ID,
    menuId: 2,
    startedAt: new Date("2025-11-29T09:00:00"),
    endedAt: new Date("2025-11-29T10:15:00"),
    condition: 7,
    fatigue: 8,
    note: "脚の疲労が強かった。次回はウォームアップを長めに。",
    createdAt: new Date("2025-11-29T10:15:00"),
    updatedAt: new Date("2025-11-29T10:15:00"),
  },
];

function buildExerciseRecords(sessions, menuEntries) {
  const menuMap = new Map();
  for (const entry of menuEntries) {
    const list = menuMap.get(entry.menuId) ?? [];
    list.push(entry);
    menuMap.set(entry.menuId, list);
  }
  for (const list of menuMap.values()) {
    list.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const sortedSessions = [...sessions].sort((a, b) => a.id - b.id);
  const records = [];
  let recordId = 1;

  for (const session of sortedSessions) {
    const entries = menuMap.get(session.menuId) ?? [];
    for (const entry of entries) {
      records.push({
        id: recordId,
        sessionId: session.id,
        exerciseId: entry.exerciseId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      });
      recordId += 1;
    }
  }

  return records;
}

const exerciseRecords = buildExerciseRecords(workoutSessions, menuExercises);

const workoutSets = [
  {
    id: 1,
    exerciseRecordId: 1,
    setNumber: 1,
    weight: 60,
    reps: 10,
    completed: true,
    createdAt: new Date("2025-12-01T10:15:00"),
    updatedAt: new Date("2025-12-01T10:15:00"),
  },
  {
    id: 2,
    exerciseRecordId: 1,
    setNumber: 2,
    weight: 60,
    reps: 10,
    completed: true,
    createdAt: new Date("2025-12-01T10:20:00"),
    updatedAt: new Date("2025-12-01T10:20:00"),
  },
  {
    id: 3,
    exerciseRecordId: 1,
    setNumber: 3,
    weight: 60,
    reps: 8,
    completed: true,
    createdAt: new Date("2025-12-01T10:25:00"),
    updatedAt: new Date("2025-12-01T10:25:00"),
  },
  {
    id: 4,
    exerciseRecordId: 2,
    setNumber: 1,
    weight: 50,
    reps: 12,
    completed: true,
    createdAt: new Date("2025-12-01T10:40:00"),
    updatedAt: new Date("2025-12-01T10:40:00"),
  },
  {
    id: 5,
    exerciseRecordId: 2,
    setNumber: 2,
    weight: 50,
    reps: 10,
    completed: true,
    createdAt: new Date("2025-12-01T10:45:00"),
    updatedAt: new Date("2025-12-01T10:45:00"),
  },
  {
    id: 6,
    exerciseRecordId: 3,
    setNumber: 1,
    weight: 80,
    reps: 8,
    completed: true,
    createdAt: new Date("2025-11-29T09:15:00"),
    updatedAt: new Date("2025-11-29T09:15:00"),
  },
  {
    id: 7,
    exerciseRecordId: 3,
    setNumber: 2,
    weight: 80,
    reps: 8,
    completed: true,
    createdAt: new Date("2025-11-29T09:20:00"),
    updatedAt: new Date("2025-11-29T09:20:00"),
  },
];

const weightRecords = [
  {
    id: 1,
    userId: USER_ID,
    recordedAt: new Date("2025-11-01T08:00:00"),
    weight: 72.5,
    createdAt: new Date("2025-11-01T08:00:00"),
    updatedAt: new Date("2025-11-01T08:00:00"),
  },
  {
    id: 2,
    userId: USER_ID,
    recordedAt: new Date("2025-11-08T08:00:00"),
    weight: 72.3,
    createdAt: new Date("2025-11-08T08:00:00"),
    updatedAt: new Date("2025-11-08T08:00:00"),
  },
  {
    id: 3,
    userId: USER_ID,
    recordedAt: new Date("2025-11-15T08:00:00"),
    weight: 72.0,
    createdAt: new Date("2025-11-15T08:00:00"),
    updatedAt: new Date("2025-11-15T08:00:00"),
  },
  {
    id: 4,
    userId: USER_ID,
    recordedAt: new Date("2025-11-22T08:00:00"),
    weight: 71.8,
    createdAt: new Date("2025-11-22T08:00:00"),
    updatedAt: new Date("2025-11-22T08:00:00"),
  },
  {
    id: 5,
    userId: USER_ID,
    recordedAt: new Date("2025-11-29T08:00:00"),
    weight: 71.5,
    createdAt: new Date("2025-11-29T08:00:00"),
    updatedAt: new Date("2025-11-29T08:00:00"),
  },
  {
    id: 6,
    userId: USER_ID,
    recordedAt: new Date("2025-12-01T08:00:00"),
    weight: 71.3,
    createdAt: new Date("2025-12-01T08:00:00"),
    updatedAt: new Date("2025-12-01T08:00:00"),
  },
];

const weekSchedules = [
  {
    id: 1,
    userId: USER_ID,
    dayOfWeek: 0,
    menuId: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
  {
    id: 2,
    userId: USER_ID,
    dayOfWeek: 1,
    menuId: 2,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
  {
    id: 3,
    userId: USER_ID,
    dayOfWeek: 3,
    menuId: 3,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
  {
    id: 4,
    userId: USER_ID,
    dayOfWeek: 5,
    menuId: 1,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    deletedAt: null,
  },
];

async function resetDatabase() {
  await prisma.workoutSet.deleteMany();
  await prisma.exerciseRecord.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.scheduleCheckRecord.deleteMany();
  await prisma.scheduleReminder.deleteMany();
  await prisma.weekSchedule.deleteMany();
  await prisma.menuExercise.deleteMany();
  await prisma.exerciseBodyPart.deleteMany();
  await prisma.weightRecord.deleteMany();
  await prisma.workoutMenu.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.bodyPart.deleteMany();
  await prisma.user.deleteMany();
}

async function seed() {
  await resetDatabase();

  await prisma.user.createMany({ data: users });
  await prisma.bodyPart.createMany({ data: bodyParts });
  await prisma.exercise.createMany({ data: exercises });
  await prisma.exerciseBodyPart.createMany({ data: exerciseBodyParts });
  await prisma.workoutMenu.createMany({ data: workoutMenus });
  await prisma.menuExercise.createMany({ data: menuExercises });
  await prisma.workoutSession.createMany({ data: workoutSessions });
  await prisma.exerciseRecord.createMany({ data: exerciseRecords });
  await prisma.workoutSet.createMany({ data: workoutSets });
  await prisma.weightRecord.createMany({ data: weightRecords });
  await prisma.weekSchedule.createMany({ data: weekSchedules });
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
