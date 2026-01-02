/**
 * WillFit - 型定義
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
  sessionPlanId?: number; // FK → session_plans.id（新スケジュール機能）
  scheduledTaskId?: number; // FK → scheduled_tasks.id（新スケジュール機能）
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
export interface ExerciseRecord extends BaseEntity {
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
  note?: string; // メモ
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
  bodyFat?: number; // 体脂肪率（%）- 小数点1桁
  photoUrl?: string; // 写真URL
}

// =============================================================================
// ルーティンスケジュール機能
// =============================================================================

/**
 * ルーティンタイプ
 */
export type RoutineType = "weekly" | "interval";

// =============================================================================
// 新スケジュール機能（SessionPlan ベース）
// =============================================================================

/**
 * スケジュールルールタイプ
 */
export type ScheduleRuleType = "weekly" | "interval" | "once";

/**
 * スケジュールタスクステータス
 */
export type ScheduledTaskStatus =
  | "pending"
  | "completed"
  | "skipped"
  | "rescheduled";

/**
 * リマインダータイプ
 */
export type ReminderType = "before_scheduled" | "fixed_time";

/**
 * セッションプラン
 * @table session_plans
 */
export interface SessionPlan extends SoftDeletable {
  userId: number;
  menuId: number;
  name: string;
  description?: string;
}

/**
 * セッションプラン種目詳細
 * @table session_plan_exercises
 */
export interface SessionPlanExercise extends BaseEntity {
  sessionPlanId: number;
  exerciseId: number;
  displayOrder: number;
  targetWeight?: number;
  targetReps?: number;
  targetSets?: number;
  restSeconds?: number;
  note?: string;
}

/**
 * スケジュールルール
 * @table schedule_rules
 */
export interface ScheduleRule extends SoftDeletable {
  userId: number;
  sessionPlanId: number;
  ruleType: ScheduleRuleType;
  weekdays?: number; // ビットマスク (日=1, 月=2, 火=4, 水=8, 木=16, 金=32, 土=64)
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
  isEnabled: boolean;
}

/**
 * スケジュールタスク
 * @table scheduled_tasks
 */
export interface ScheduledTask extends BaseEntity {
  userId: number;
  ruleId?: number; // NULL = 手動追加
  sessionPlanId: number;
  scheduledDate: Date;
  status: ScheduledTaskStatus;
  rescheduledTo?: Date;
  rescheduledFrom?: Date;
  completedAt?: Date;
}

/**
 * スケジュールリマインダー
 * @table schedule_reminders
 */
export interface ScheduleReminder extends BaseEntity {
  userId: number;
  sessionPlanId: number;
  reminderType: ReminderType;
  offsetMinutes?: number;
  fixedTimeOfDay?: string; // "HH:mm"
  timezone: string;
  isEnabled: boolean;
}

// =============================================================================
// 新スケジュール機能 派生型
// =============================================================================

/**
 * セッションプラン種目詳細（種目情報付き）
 */
export interface SessionPlanExerciseWithDetails extends SessionPlanExercise {
  exercise: ExerciseWithBodyParts;
}

/**
 * セッションプラン（種目リスト付き）
 */
export interface SessionPlanWithExercises extends SessionPlan {
  menu: WorkoutMenu;
  exercises: SessionPlanExerciseWithDetails[];
}

/**
 * セッションプラン（ルール付き）
 */
export interface SessionPlanWithRules extends SessionPlan {
  menu: WorkoutMenu;
  exercises: SessionPlanExerciseWithDetails[];
  scheduleRules: ScheduleRule[];
  reminders: ScheduleReminder[];
}

/**
 * スケジュールルール（プラン情報付き）
 */
export interface ScheduleRuleWithPlan extends ScheduleRule {
  sessionPlan: SessionPlanWithExercises;
}

/**
 * スケジュールタスク（プラン情報付き）
 */
export interface ScheduledTaskWithPlan extends ScheduledTask {
  sessionPlan: SessionPlanWithExercises;
  rule?: ScheduleRule;
}

/**
 * 計算済みタスク（特定日付のスケジュール情報 - 新版）
 */
export interface CalculatedTask {
  taskId?: number; // ScheduledTask.id（未生成の場合はundefined）
  sessionPlanId: number;
  sessionPlanName: string;
  menuId: number;
  menuName: string;
  ruleId?: number;
  ruleType?: ScheduleRuleType;
  weekdays?: number[];
  intervalDays?: number;
  scheduledTask?: ScheduledTask;
  isFromReschedule: boolean;
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
 * セッション（メニュー・記録付き）
 */
export interface WorkoutSessionWithDetails extends WorkoutSession {
  menu: WorkoutMenu;
  exerciseRecords: ExerciseRecordWithDetails[];
}

/**
 * 種目記録（種目情報・セット付き）
 */
export interface ExerciseRecordWithDetails extends ExerciseRecord {
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
