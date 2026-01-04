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
// テンプレート関連（定義層）
// =============================================================================

/**
 * トレーニングテンプレート
 * @table workout_templates
 */
export interface WorkoutTemplate extends SoftDeletable {
  userId: number; // FK → users.id
  name: string; // テンプレート名 例: "Day1 胸・背中"
}

/**
 * テンプレート-種目 中間テーブル
 * @table workout_template_exercises
 */
export interface WorkoutTemplateExercise extends BaseEntity {
  templateId: number; // FK → workout_templates.id
  exerciseId: number; // FK → exercises.id
  displayOrder: number; // 表示順序（1, 2, 3...）
}

// =============================================================================
// 実績層（Record）
// =============================================================================

/**
 * トレーニング記録
 * @table workout_records
 */
export interface WorkoutRecord extends BaseEntity {
  userId: number; // FK → users.id
  templateId: number; // FK → workout_templates.id
  workoutSessionId?: number; // FK → workout_sessions.id（スケジュール機能）
  scheduledTaskId?: number; // FK → scheduled_tasks.id（スケジュール機能）
  startedAt: Date; // 開始日時
  endedAt?: Date; // 終了日時
  condition: number; // 体調（1-10）
  fatigue: number; // 疲労感（1-10）
  note: string; // メモ
}

/**
 * 種目ごとの記録
 * @table workout_record_exercises
 */
export interface WorkoutRecordExercise extends BaseEntity {
  recordId: number; // FK → workout_records.id
  exerciseId: number; // FK → exercises.id
}

/**
 * セットごとの記録
 * @table workout_record_sets
 */
export interface WorkoutRecordSet extends BaseEntity {
  workoutRecordExerciseId: number; // FK → workout_record_exercises.id
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
// スケジュール機能（WorkoutSession ベース）
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
 * ワークアウトセッション（計画層）
 * @table workout_sessions
 */
export interface WorkoutSession extends SoftDeletable {
  userId: number;
  templateId: number;
  name: string;
  description?: string;
}

/**
 * ワークアウトセッション種目詳細
 * @table workout_session_exercises
 */
export interface WorkoutSessionExercise extends BaseEntity {
  workoutSessionId: number;
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
  workoutSessionId: number;
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
  workoutSessionId: number;
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
  workoutSessionId: number;
  reminderType: ReminderType;
  offsetMinutes?: number;
  fixedTimeOfDay?: string; // "HH:mm"
  timezone: string;
  isEnabled: boolean;
}

// =============================================================================
// スケジュール機能 派生型
// =============================================================================

/**
 * ワークアウトセッション種目詳細（種目情報付き）
 */
export interface WorkoutSessionExerciseWithDetails
  extends WorkoutSessionExercise {
  exercise: ExerciseWithBodyParts;
}

/**
 * ワークアウトセッション（種目リスト付き）
 */
export interface WorkoutSessionWithExercises extends WorkoutSession {
  template: WorkoutTemplate;
  exercises: WorkoutSessionExerciseWithDetails[];
}

/**
 * ワークアウトセッション（ルール付き）
 */
export interface WorkoutSessionWithRules extends WorkoutSession {
  template: WorkoutTemplate;
  exercises: WorkoutSessionExerciseWithDetails[];
  scheduleRules: ScheduleRule[];
  reminders: ScheduleReminder[];
}

/**
 * スケジュールルール（セッション情報付き）
 */
export interface ScheduleRuleWithSession extends ScheduleRule {
  workoutSession: WorkoutSessionWithExercises;
}

/**
 * スケジュールタスク（セッション情報付き）
 */
export interface ScheduledTaskWithSession extends ScheduledTask {
  workoutSession: WorkoutSessionWithExercises;
  rule?: ScheduleRule;
}

/**
 * 計算済みタスク（特定日付のスケジュール情報）
 */
export interface CalculatedTask {
  taskId?: number; // ScheduledTask.id（未生成の場合はundefined）
  workoutSessionId: number;
  workoutSessionName: string;
  templateId: number;
  templateName: string;
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
 * テンプレート（種目リスト付き）
 */
export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: ExerciseWithBodyParts[];
}

/**
 * トレーニング記録（テンプレート・記録付き）
 */
export interface WorkoutRecordWithDetails extends WorkoutRecord {
  template: WorkoutTemplate;
  workoutRecordExercises: WorkoutRecordExerciseWithDetails[];
}

/**
 * 種目記録（種目情報・セット付き）
 */
export interface WorkoutRecordExerciseWithDetails
  extends WorkoutRecordExercise {
  exercise: ExerciseWithBodyParts;
  sets: WorkoutRecordSet[];
  previousRecord?: PreviousRecord;
}

/**
 * 前回記録（動的計算用）
 */
export interface PreviousRecord {
  recordId: number;
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

// =============================================================================
// 後方互換性エイリアス（移行期間中のみ使用）
// =============================================================================

/**
 * @deprecated Use WorkoutTemplate instead
 */
export type WorkoutMenu = WorkoutTemplate;

/**
 * @deprecated Use WorkoutTemplateExercise instead
 */
export type MenuExercise = WorkoutTemplateExercise;

/**
 * @deprecated Use WorkoutTemplateExercise instead
 */
export type TemplateExercise = WorkoutTemplateExercise;

/**
 * @deprecated Use WorkoutSession instead
 */
export type SessionPlan = WorkoutSession;

/**
 * @deprecated Use WorkoutSessionExercise instead
 */
export type SessionPlanExercise = WorkoutSessionExercise;

/**
 * @deprecated Use WorkoutSessionExerciseWithDetails instead
 */
export type SessionPlanExerciseWithDetails = WorkoutSessionExerciseWithDetails;

/**
 * @deprecated Use WorkoutSessionWithExercises instead
 */
export type SessionPlanWithExercises = WorkoutSessionWithExercises;

/**
 * @deprecated Use WorkoutSessionWithRules instead
 */
export type SessionPlanWithRules = WorkoutSessionWithRules;

/**
 * @deprecated Use ScheduledTaskWithSession instead
 */
export type ScheduledTaskWithPlan = ScheduledTaskWithSession;

/**
 * @deprecated Use WorkoutRecordExercise instead
 */
export type ExerciseRecord = WorkoutRecordExercise;

/**
 * @deprecated Use WorkoutRecordSet instead
 */
export type WorkoutSet = WorkoutRecordSet;

/**
 * @deprecated Use WorkoutTemplateWithExercises instead
 */
export type WorkoutMenuWithExercises = WorkoutTemplateWithExercises;

/**
 * @deprecated Use WorkoutRecordExerciseWithDetails instead
 */
export type ExerciseRecordWithDetails = WorkoutRecordExerciseWithDetails;
