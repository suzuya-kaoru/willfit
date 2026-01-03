/**
 * DAL内部マッパー関数 Barrel
 * ドメイン別マッパーファイルからの再エクスポート
 *
 * 構造:
 *   _internal/
 *   ├── body-part.mapper.ts
 *   ├── exercise.mapper.ts
 *   ├── template.mapper.ts
 *   ├── workout-record.mapper.ts
 *   ├── schedule.mapper.ts
 *   └── mappers.ts (このファイル - 再エクスポート)
 */

// BodyPart
export { mapBodyPart } from "./body-part.mapper";

// Exercise
export {
  type ExerciseWithBodyPartsRow,
  mapExercise,
  mapExerciseWithBodyParts,
} from "./exercise.mapper";
// Schedule
export {
  mapScheduledTask,
  mapScheduledTaskWithSession,
  mapScheduleReminder,
  mapScheduleRule,
  mapWorkoutSession,
  mapWorkoutSessionExercise,
  mapWorkoutSessionExerciseWithDetails,
  mapWorkoutSessionWithExercises,
  type ScheduledTaskRow,
  type ScheduledTaskWithSessionRow,
  type ScheduleReminderRow,
  type ScheduleRuleRow,
  type WorkoutSessionExerciseRow,
  type WorkoutSessionExerciseWithDetailsRow,
  type WorkoutSessionRow,
  type WorkoutSessionWithExercisesRow,
} from "./schedule.mapper";
// Template
export {
  mapTemplate,
  mapTemplateExercise,
  mapTemplateWithExercises,
  type WorkoutTemplateWithExercisesRow,
} from "./template.mapper";
// WorkoutRecord / WeightRecord
export * from "./weight-record.mapper";
export {
  mapWorkoutRecord,
  mapWorkoutRecordExercise,
  mapWorkoutRecordSet,
} from "./workout-record.mapper";
