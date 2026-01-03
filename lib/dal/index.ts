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
  createManyScheduledTasks,
  createScheduledTask,
  createScheduledTaskRaw,
  createScheduledTasks,
  createScheduleRule,
  createWorkoutSession,
  deleteFuturePendingTasks,
  deleteFuturePendingTasksByRule,
  deleteScheduledTask,
  deleteScheduleReminder,
  deleteScheduleRule,
  deleteWorkoutSession,
  findScheduledTask,
  findScheduledTasksForDates,
  getActiveScheduleRules,
  getAllActiveRulesForCron,
  getScheduledTasksByDateRange,
  getScheduledTasksWithSessionByDateRange,
  getScheduleRuleById,
  getScheduleRulesBySession,
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
  createOrUpdateWeightRecord,
  deleteWeightRecord,
  getWeightRecords,
  type SaveWeightRecordParams,
} from "./weight-record";
// WorkoutRecord
export {
  createWorkoutRecord,
  getMonthlyStats,
  getWorkoutRecordExercisesByRecordIds,
  getWorkoutRecordSetsByExerciseIds,
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
  getScheduleRulesBySession as getScheduleRulesByPlan,
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
  getWorkoutRecordSetsByExerciseIds as getWorkoutSetsByExerciseRecordIds,
  getWorkoutRecordsByTemplateIds as getWorkoutRecordsByMenuIds,
} from "./workout-record";
