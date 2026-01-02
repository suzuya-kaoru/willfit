-- Phase 2: 完全マイグレーション（FK + インデックス名変更）
-- 実行順序: FK削除 → Index削除 → 新Index作成 → 新FK作成

SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- template_exercises (旧 menu_exercises)
-- ========================================
-- 旧FK削除
ALTER TABLE template_exercises DROP FOREIGN KEY menu_exercises_menu_id_fkey;
ALTER TABLE template_exercises DROP FOREIGN KEY menu_exercises_exercise_id_fkey;
-- 旧Index削除
DROP INDEX uk_menu_exercises_menu_id_exercise_id ON template_exercises;
-- 新Index作成
CREATE INDEX idx_template_exercises_template_id ON template_exercises (template_id);
CREATE INDEX idx_template_exercises_template_id_display_order ON template_exercises (template_id, display_order);
CREATE UNIQUE INDEX uk_template_exercises_template_id_exercise_id ON template_exercises (template_id, exercise_id);
-- 新FK作成
ALTER TABLE template_exercises ADD CONSTRAINT template_exercises_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE template_exercises ADD CONSTRAINT template_exercises_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- workout_templates (旧 workout_menus)
-- ========================================
-- 旧FK削除
ALTER TABLE workout_templates DROP FOREIGN KEY workout_menus_user_id_fkey;
-- 旧Index削除
DROP INDEX idx_workout_menus_user_id ON workout_templates;
DROP INDEX idx_workout_menus_user_id_deleted_at ON workout_templates;
-- 新Index作成
CREATE INDEX idx_workout_templates_user_id ON workout_templates (user_id);
CREATE INDEX idx_workout_templates_user_id_deleted_at ON workout_templates (user_id, deleted_at);
-- 新FK作成
ALTER TABLE workout_templates ADD CONSTRAINT workout_templates_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- workout_sessions (旧 session_plans)
-- ========================================
-- 旧FK削除
ALTER TABLE workout_sessions DROP FOREIGN KEY session_plans_user_id_fkey;
ALTER TABLE workout_sessions DROP FOREIGN KEY session_plans_menu_id_fkey;
-- 旧Index削除
DROP INDEX idx_session_plans_user_id ON workout_sessions;
DROP INDEX idx_session_plans_user_deleted ON workout_sessions;
DROP INDEX idx_session_plans_menu_id ON workout_sessions;
-- 新Index作成
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions (user_id);
CREATE INDEX idx_workout_sessions_user_deleted ON workout_sessions (user_id, deleted_at);
CREATE INDEX idx_workout_sessions_template_id ON workout_sessions (template_id);
-- 新FK作成
ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE workout_sessions ADD CONSTRAINT workout_sessions_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ========================================
-- workout_session_exercises (旧 session_plan_exercises)
-- ========================================
-- 旧FK削除
ALTER TABLE workout_session_exercises DROP FOREIGN KEY session_plan_exercises_session_plan_id_fkey;
ALTER TABLE workout_session_exercises DROP FOREIGN KEY session_plan_exercises_exercise_id_fkey;
-- 旧Index削除
DROP INDEX idx_session_plan_exercises_plan_id ON workout_session_exercises;
DROP INDEX uk_session_plan_exercises_plan_exercise ON workout_session_exercises;
-- 新Index作成
CREATE INDEX idx_workout_session_exercises_session_id ON workout_session_exercises (workout_session_id);
CREATE UNIQUE INDEX uk_workout_session_exercises_session_exercise ON workout_session_exercises (workout_session_id, exercise_id);
-- 新FK作成
ALTER TABLE workout_session_exercises ADD CONSTRAINT workout_session_exercises_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE workout_session_exercises ADD CONSTRAINT workout_session_exercises_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- workout_record_exercises (旧 exercise_records)
-- ========================================
-- 旧FK削除
ALTER TABLE workout_record_exercises DROP FOREIGN KEY exercise_records_session_id_fkey;
ALTER TABLE workout_record_exercises DROP FOREIGN KEY exercise_records_exercise_id_fkey;
-- 旧Index削除
DROP INDEX idx_exercise_records_session_id ON workout_record_exercises;
DROP INDEX idx_exercise_records_exercise_id ON workout_record_exercises;
-- 新Index作成
CREATE INDEX idx_workout_record_exercises_record_id ON workout_record_exercises (record_id);
CREATE INDEX idx_workout_record_exercises_exercise_id ON workout_record_exercises (exercise_id);
-- 新FK作成
ALTER TABLE workout_record_exercises ADD CONSTRAINT workout_record_exercises_record_id_fkey 
    FOREIGN KEY (record_id) REFERENCES workout_records(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE workout_record_exercises ADD CONSTRAINT workout_record_exercises_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ========================================
-- workout_record_sets (旧 workout_set_records)
-- ========================================
-- 旧FK削除
ALTER TABLE workout_record_sets DROP FOREIGN KEY workout_set_records_exercise_record_id_fkey;
-- 旧Index削除
DROP INDEX idx_workout_set_records_exercise_record_id ON workout_record_sets;
DROP INDEX idx_workout_set_records_exercise_record_id_set_number ON workout_record_sets;
-- 新Index作成
CREATE INDEX idx_workout_record_sets_exercise_id ON workout_record_sets (workout_record_exercise_id);
CREATE INDEX idx_workout_record_sets_exercise_id_set_number ON workout_record_sets (workout_record_exercise_id, set_number);
-- 新FK作成
ALTER TABLE workout_record_sets ADD CONSTRAINT workout_record_sets_workout_record_exercise_id_fkey 
    FOREIGN KEY (workout_record_exercise_id) REFERENCES workout_record_exercises(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- workout_records
-- ========================================
-- 旧FK削除
ALTER TABLE workout_records DROP FOREIGN KEY workout_records_menu_id_fkey;
ALTER TABLE workout_records DROP FOREIGN KEY workout_records_session_plan_id_fkey;
-- 旧Index削除
DROP INDEX idx_workout_records_menu_id ON workout_records;
DROP INDEX idx_workout_records_session_plan_id ON workout_records;
-- 新Index作成
CREATE INDEX idx_workout_records_template_id ON workout_records (template_id);
CREATE INDEX idx_workout_records_workout_session_id ON workout_records (workout_session_id);
-- 新FK作成
ALTER TABLE workout_records ADD CONSTRAINT workout_records_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE workout_records ADD CONSTRAINT workout_records_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- schedule_rules
-- ========================================
-- 旧FK削除
ALTER TABLE schedule_rules DROP FOREIGN KEY schedule_rules_session_plan_id_fkey;
-- 旧Index削除
DROP INDEX idx_schedule_rules_session_plan_id ON schedule_rules;
-- 新Index作成
CREATE INDEX idx_schedule_rules_workout_session_id ON schedule_rules (workout_session_id);
-- 新FK作成
ALTER TABLE schedule_rules ADD CONSTRAINT schedule_rules_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- scheduled_tasks
-- ========================================
-- 旧FK削除
ALTER TABLE scheduled_tasks DROP FOREIGN KEY scheduled_tasks_session_plan_id_fkey;
-- 旧Index削除
DROP INDEX idx_scheduled_tasks_session_plan_id ON scheduled_tasks;
DROP INDEX uk_scheduled_tasks_user_plan_date ON scheduled_tasks;
-- 新Index作成
CREATE INDEX idx_scheduled_tasks_workout_session_id ON scheduled_tasks (workout_session_id);
CREATE UNIQUE INDEX uk_scheduled_tasks_user_session_date ON scheduled_tasks (user_id, workout_session_id, scheduled_date);
-- 新FK作成
ALTER TABLE scheduled_tasks ADD CONSTRAINT scheduled_tasks_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- schedule_reminders
-- ========================================
-- 旧FK削除
ALTER TABLE schedule_reminders DROP FOREIGN KEY schedule_reminders_session_plan_id_fkey;
-- 旧Index削除
DROP INDEX idx_schedule_reminders_session_plan_id ON schedule_reminders;
-- 新Index作成
CREATE INDEX idx_schedule_reminders_workout_session_id ON schedule_reminders (workout_session_id);
-- 新FK作成
ALTER TABLE schedule_reminders ADD CONSTRAINT schedule_reminders_workout_session_id_fkey 
    FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
