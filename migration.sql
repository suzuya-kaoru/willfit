-- UTC Migration: Shift all DATETIME and TIME columns by -9 hours
-- This assumes the data was stored as JST (GMT+9) and we are converting to UTC (GMT+0)

SET SQL_SAFE_UPDATES = 0;

-- Users
UPDATE users SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE users SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
UPDATE users SET deleted_at = DATE_SUB(deleted_at, INTERVAL 9 HOUR) WHERE deleted_at IS NOT NULL;

-- BodyParts
UPDATE body_parts SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE body_parts SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- Exercises
UPDATE exercises SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE exercises SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
UPDATE exercises SET deleted_at = DATE_SUB(deleted_at, INTERVAL 9 HOUR) WHERE deleted_at IS NOT NULL;

-- WorkoutMenus
UPDATE workout_menus SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE workout_menus SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
UPDATE workout_menus SET deleted_at = DATE_SUB(deleted_at, INTERVAL 9 HOUR) WHERE deleted_at IS NOT NULL;

-- MenuExercises
UPDATE menu_exercises SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE menu_exercises SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- WorkoutSessions (Records)
UPDATE workout_records SET started_at = DATE_SUB(started_at, INTERVAL 9 HOUR);
UPDATE workout_records SET ended_at = DATE_SUB(ended_at, INTERVAL 9 HOUR) WHERE ended_at IS NOT NULL;
UPDATE workout_records SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE workout_records SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- ExerciseRecords
UPDATE exercise_records SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE exercise_records SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- WorkoutSets
UPDATE workout_set_records SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE workout_set_records SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- WeightRecords
UPDATE weight_records SET recorded_at = DATE_SUB(recorded_at, INTERVAL 9 HOUR);
UPDATE weight_records SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE weight_records SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- SessionPlans
UPDATE session_plans SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE session_plans SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
UPDATE session_plans SET deleted_at = DATE_SUB(deleted_at, INTERVAL 9 HOUR) WHERE deleted_at IS NOT NULL;

-- SessionPlanExercises
UPDATE session_plan_exercises SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE session_plan_exercises SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- ScheduleRules
UPDATE schedule_rules SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE schedule_rules SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
UPDATE schedule_rules SET deleted_at = DATE_SUB(deleted_at, INTERVAL 9 HOUR) WHERE deleted_at IS NOT NULL;

-- ScheduledTasks
UPDATE scheduled_tasks SET completed_at = DATE_SUB(completed_at, INTERVAL 9 HOUR) WHERE completed_at IS NOT NULL;
UPDATE scheduled_tasks SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE scheduled_tasks SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);

-- ScheduleReminders
UPDATE schedule_reminders SET created_at = DATE_SUB(created_at, INTERVAL 9 HOUR);
UPDATE schedule_reminders SET updated_at = DATE_SUB(updated_at, INTERVAL 9 HOUR);
-- fixed_time_of_day is TIME, we must handle wrap-around carefully
UPDATE schedule_reminders 
SET fixed_time_of_day = CAST(DATE_SUB(CONCAT('2000-01-01 ', fixed_time_of_day), INTERVAL 9 HOUR) AS TIME)
WHERE fixed_time_of_day IS NOT NULL;

SET SQL_SAFE_UPDATES = 1;
