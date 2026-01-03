/**
 * DAL (Data Access Layer) Barrel
 * 全ドメインの関数を再エクスポート
 *
 * Phase 1: このファイル経由でアクセス（バレルファイル）
 * Phase 2: 各ドメインファイルから直接import可能
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
  // ScheduledTask
  createScheduledTask,
  createScheduledTaskRaw,
  createScheduledTasks,
  // ScheduleRule
  createScheduleRule,
  // WorkoutSession
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
  // ScheduleReminder
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
// =============================================================================

import {
  createWorkoutSession,
  deleteWorkoutSession,
  getScheduledTasksWithSessionByDateRange,
  getScheduleRulesBySession,
  getWorkoutSessions,
  getWorkoutSessionWithDetails,
  updateWorkoutSession,
} from "./schedule";
import {
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  getTemplateExercisesByTemplateIds,
  getTemplates,
  getTemplatesByIds,
  getTemplatesWithExercises,
  getTemplateWithExercises,
  updateWorkoutTemplate,
} from "./template";
import {
  getWorkoutRecordExercisesByRecordIds,
  getWorkoutRecordSetsByExerciseIds,
  getWorkoutRecordsByTemplateIds,
} from "./workout-record";

/**
 * @deprecated Use getTemplateWithExercises instead
 */
export const getMenuWithExercises = getTemplateWithExercises;

/**
 * @deprecated Use getTemplatesWithExercises instead
 */
export const getMenusWithExercises = getTemplatesWithExercises;

/**
 * @deprecated Use getTemplates instead
 */
export const getMenus = getTemplates;

/**
 * @deprecated Use getTemplatesByIds instead
 */
export const getMenusByIds = getTemplatesByIds;

/**
 * @deprecated Use getTemplateExercisesByTemplateIds instead
 */
export const getMenuExercisesByMenuIds = getTemplateExercisesByTemplateIds;

/**
 * @deprecated Use getWorkoutRecordsByTemplateIds instead
 */
export const getWorkoutRecordsByMenuIds = getWorkoutRecordsByTemplateIds;

/**
 * @deprecated Use getWorkoutRecordExercisesByRecordIds instead
 */
export const getExerciseRecordsByRecordIds =
  getWorkoutRecordExercisesByRecordIds;

/**
 * @deprecated Use getWorkoutRecordSetsByExerciseIds instead
 */
export const getWorkoutSetsByExerciseRecordIds =
  getWorkoutRecordSetsByExerciseIds;

/**
 * @deprecated Use createWorkoutSession instead
 */
export const createSessionPlan = createWorkoutSession;

/**
 * @deprecated Use getWorkoutSessions instead
 */
export const getSessionPlans = getWorkoutSessions;

/**
 * @deprecated Use getWorkoutSessionWithDetails instead
 */
export const getSessionPlanWithDetails = getWorkoutSessionWithDetails;

/**
 * @deprecated Use updateWorkoutSession instead
 */
export const updateSessionPlan = updateWorkoutSession;

/**
 * @deprecated Use deleteWorkoutSession instead
 */
export const deleteSessionPlan = deleteWorkoutSession;

/**
 * @deprecated Use getScheduleRulesBySession instead
 */
export const getScheduleRulesByPlan = getScheduleRulesBySession;

/**
 * @deprecated Use getScheduledTasksWithSessionByDateRange instead
 */
export const getScheduledTasksWithPlanByDateRange =
  getScheduledTasksWithSessionByDateRange;

/**
 * @deprecated Use createWorkoutTemplate instead
 */
export const createWorkoutMenu = createWorkoutTemplate;

/**
 * @deprecated Use updateWorkoutTemplate instead
 */
export const updateWorkoutMenu = updateWorkoutTemplate;

/**
 * @deprecated Use deleteWorkoutTemplate instead
 */
export const deleteWorkoutMenu = deleteWorkoutTemplate;
