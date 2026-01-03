/**
 * DAL (Data Access Layer) Barrel
 * 全ドメインの関数を再エクスポート
 *
 * Phase 2完了: 各ドメインファイルから直接import可能
 *   例: import { getExercisesWithBodyParts } from "@/lib/dal/exercise"
 */

// =============================================================================
// Domain Exports
// =============================================================================

// BodyPart
export { getBodyParts } from "./body-part";

// Exercise
export {
  type CreateExerciseParams,
  createExercise,
  deleteExercise,
  getExercisesWithBodyParts,
  getExercisesWithBodyPartsByIds,
  type UpdateExerciseParams,
  updateExercise,
} from "./exercise";
// Schedule subdomain
export {
  createScheduledTask,
  createScheduledTasks,
  createScheduleRule,
  createWorkoutSession,
  deleteFuturePendingTasks,
  deleteScheduledTask,
  deleteScheduleReminder,
  deleteScheduleRule,
  deleteWorkoutSession,
  getActiveScheduleRules,
  getScheduledTasksByDateRange,
  getScheduledTasksWithSessionByDateRange,
  getScheduleRuleById,
  getScheduleRulesByWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionWithDetails,
  rescheduleTask,
  updateScheduledTaskStatus,
  updateScheduleRule,
  updateWorkoutSession,
  upsertScheduledTask,
  upsertScheduleReminder,
} from "./schedule";
// Template
export {
  type CreateTemplateParams,
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  getTemplateExercisesByTemplateIds,
  getTemplates,
  getTemplatesByIds,
  getTemplatesWithExercises,
  getTemplateWithExercises,
  type UpdateTemplateParams,
  updateWorkoutTemplate,
} from "./template";
// WeightRecord
export {
  deleteWeightRecord,
  getWeightRecords,
  type SaveWeightRecordParams,
  upsertWeightRecord,
} from "./weight-record";
// WorkoutRecord
export {
  createWorkoutRecord,
  getMonthlyStats,
  getWorkoutRecordExercisesByRecordIds,
  getWorkoutRecordSetsByRecordExerciseIds,
  getWorkoutRecords,
  getWorkoutRecordsByDateRange,
  getWorkoutRecordsByTemplateIds,
  getWorkoutRecordWithDetails,
  type SaveWorkoutRecordParams,
  type UpdateWorkoutRecordParams,
  updateWorkoutRecord,
  type WorkoutRecordWithDetails,
} from "./workout-record";

// =============================================================================
// 後方互換性エイリアス（移行期間中のみ使用）
// export { new as old } 構文で重複importを回避
// =============================================================================

// Schedule aliases
export {
  createWorkoutSession as createSessionPlan,
  deleteWorkoutSession as deleteSessionPlan,
  getScheduledTasksWithSessionByDateRange as getScheduledTasksWithPlanByDateRange,
  getScheduleRulesByWorkoutSession as getScheduleRulesByPlan,
  getWorkoutSessions as getSessionPlans,
  getWorkoutSessionWithDetails as getSessionPlanWithDetails,
  updateWorkoutSession as updateSessionPlan,
} from "./schedule";
// Template aliases
export {
  createWorkoutTemplate as createWorkoutMenu,
  deleteWorkoutTemplate as deleteWorkoutMenu,
  getTemplateExercisesByTemplateIds as getMenuExercisesByMenuIds,
  getTemplates as getMenus,
  getTemplatesByIds as getMenusByIds,
  getTemplatesWithExercises as getMenusWithExercises,
  getTemplateWithExercises as getMenuWithExercises,
  updateWorkoutTemplate as updateWorkoutMenu,
} from "./template";
// WorkoutRecord aliases
export {
  getWorkoutRecordExercisesByRecordIds as getExerciseRecordsByRecordIds,
  getWorkoutRecordSetsByRecordExerciseIds as getWorkoutSetsByExerciseRecordIds,
  getWorkoutRecordsByTemplateIds as getWorkoutRecordsByMenuIds,
} from "./workout-record";
