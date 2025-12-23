/**
 * FitLog - 型定義
 *
 * 設計方針:
 * - 全エンティティで数値ID (BIGINT UNSIGNED AUTO_INCREMENT) を使用
 * - 全ユーザーデータに userId を付与
 * - 全エンティティに createdAt, updatedAt を付与
 * - 重要データは deletedAt で論理削除
 *
 * @see docs/DATA_MODEL.md
 */

// =============================================================================
// 共通基底型
// =============================================================================

/**
 * 全エンティティの基底型
 */
export interface BaseEntity {
  id: number; // BIGINT UNSIGNED AUTO_INCREMENT (MySQL)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 論理削除対応エンティティの基底型
 */
export interface SoftDeletable extends BaseEntity {
  deletedAt?: Date;
}

// =============================================================================
// マスタデータ
// =============================================================================

/**
 * ユーザー
 * @table users
 */
export interface User extends SoftDeletable {
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * 部位マスタ（共通マスタ）
 * @table body_parts
 */
export interface BodyPart extends BaseEntity {
  name: string; // 部位名（日本語）例: "胸"
  nameEn: string; // 部位名（英語）例: "chest"
  displayOrder: number; // 表示順序
}

// =============================================================================
// 種目関連
// =============================================================================

/**
 * 種目
 * @table exercises
 */
export interface Exercise extends SoftDeletable {
  userId: number; // FK → users.id
  name: string; // 種目名 例: "ベンチプレス"
  formNote?: string; // フォームのポイント
  videoUrl?: string; // 参考動画URL（汎用）
}

/**
 * 種目-部位 中間テーブル
 * @table exercise_body_parts
 */
export interface ExerciseBodyPart {
  exerciseId: number; // FK → exercises.id
  bodyPartId: number; // FK → body_parts.id
}

// =============================================================================
// メニュー関連
// =============================================================================

/**
 * トレーニングメニュー
 * @table workout_menus
 */
export interface WorkoutMenu extends SoftDeletable {
  userId: number; // FK → users.id
  name: string; // メニュー名 例: "Day1 胸・背中"
}

/**
 * メニュー-種目 中間テーブル
 * @table menu_exercises
 */
export interface MenuExercise extends BaseEntity {
  menuId: number; // FK → workout_menus.id
  exerciseId: number; // FK → exercises.id
  displayOrder: number; // 表示順序（1, 2, 3...）
}

// =============================================================================
// セッション関連
// =============================================================================

/**
 * トレーニング記録（ドメインでは Session と呼称）
 * @table workout_records
 */
export interface WorkoutSession extends BaseEntity {
  userId: number; // FK → users.id
  menuId: number; // FK → workout_menus.id
  startedAt: Date; // 開始日時
  endedAt?: Date; // 終了日時
  condition: number; // 体調（1-10）
  fatigue: number; // 疲労感（1-10）
  note: string; // メモ（ドメイン: session note）
}

/**
 * 種目ごとの記録
 * @table exercise_records
 */
export interface ExerciseLog extends BaseEntity {
  sessionId: number; // FK → workout_records.id
  exerciseId: number; // FK → exercises.id
}

/**
 * セットごとの記録
 * @table workout_set_records
 */
export interface WorkoutSet extends BaseEntity {
  exerciseRecordId: number; // FK → exercise_records.id
  setNumber: number; // セット番号（1, 2, 3...）
  weight: number; // 重量（kg）- 小数点1桁
  reps: number; // 回数
  completed: boolean; // 完了フラグ
}

// =============================================================================
// その他
// =============================================================================

/**
 * 体重記録
 * @table weight_records
 */
export interface WeightRecord extends BaseEntity {
  userId: number; // FK → users.id
  recordedAt: Date; // 記録日時
  weight: number; // 体重（kg）- 小数点1桁
}

/**
 * 週間スケジュール
 * @table week_schedules
 */
export interface WeekSchedule extends SoftDeletable {
  userId: number; // FK → users.id
  dayOfWeek: number; // 曜日（0=日曜, 1=月曜, ..., 6=土曜）
  menuId: number; // FK → workout_menus.id
}

/**
 * スケジュールチェック状態
 */
export type ScheduleCheckStatus = "completed" | "skipped";

/**
 * スケジュールの実行チェック（DBでは schedule_check_records）
 */
export interface ScheduleCheckRecord extends BaseEntity {
  userId: number; // FK → users.id
  weekScheduleId: number; // FK → week_schedules.id
  scheduledDate: Date; // 対象日（YYYY-MM-DD）
  status: ScheduleCheckStatus;
  checkedAt: Date; // チェック日時
}

/**
 * リマインド頻度
 */
export type ReminderFrequency = "daily" | "weekly" | "monthly";

/**
 * スケジュールリマインダー（DBでは schedule_reminders）
 */
export interface ScheduleReminder extends BaseEntity {
  userId: number; // FK → users.id
  weekScheduleId: number; // FK → week_schedules.id
  frequency: ReminderFrequency;
  timeOfDay: string; // "HH:mm"
  dayOfWeek?: number; // 0-6（weekly時のみ）
  dayOfMonth?: number; // 1-31（monthly時のみ）
  startDate: Date;
  endDate?: Date;
  timezone: string; // 例: "Asia/Tokyo"
  nextFireAt: Date;
  lastFiredAt?: Date;
  isEnabled: boolean;
}

// =============================================================================
// フロントエンド用派生型（API レスポンス / 表示用）
// =============================================================================

/**
 * 種目（部位情報付き）
 */
export interface ExerciseWithBodyParts extends Exercise {
  bodyParts: BodyPart[];
}

/**
 * メニュー（種目リスト付き）
 */
export interface WorkoutMenuWithExercises extends WorkoutMenu {
  exercises: ExerciseWithBodyParts[];
}

/**
 * セッション（メニュー・ログ付き）
 */
export interface WorkoutSessionWithDetails extends WorkoutSession {
  menu: WorkoutMenu;
  exerciseLogs: ExerciseLogWithDetails[];
}

/**
 * 種目ログ（種目情報・セット付き）
 */
export interface ExerciseLogWithDetails extends ExerciseLog {
  exercise: ExerciseWithBodyParts;
  sets: WorkoutSet[];
  previousRecord?: PreviousRecord;
}

/**
 * 前回記録（動的計算用）
 */
export interface PreviousRecord {
  sessionId: number;
  date: Date;
  sets: {
    weight: number;
    reps: number;
  }[];
}

// =============================================================================
// ユーティリティ型
// =============================================================================

/**
 * エンティティ作成時の入力型（id, createdAt, updatedAt を除外）
 */
export type CreateInput<T extends BaseEntity> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * エンティティ更新時の入力型（id, createdAt を除外、全フィールド任意）
 */
export type UpdateInput<T extends BaseEntity> = Partial<
  Omit<T, "id" | "createdAt">
>;
