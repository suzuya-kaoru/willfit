-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `avatar_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `idx_users_email`(`email`),
    INDEX `idx_users_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `body_parts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `name_en` VARCHAR(50) NOT NULL,
    `display_order` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_body_parts_display_order`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `form_note` TEXT NULL,
    `video_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_exercises_user_id`(`user_id`),
    INDEX `idx_exercises_user_id_deleted_at`(`user_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_body_parts` (
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `body_part_id` BIGINT UNSIGNED NOT NULL,

    INDEX `idx_exercise_body_parts_body_part_id`(`body_part_id`),
    PRIMARY KEY (`exercise_id`, `body_part_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_workout_templates_user_id`(`user_id`),
    INDEX `idx_workout_templates_user_id_deleted_at`(`user_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `template_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `display_order` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_template_exercises_template_id`(`template_id`),
    INDEX `idx_template_exercises_template_id_display_order`(`template_id`, `display_order`),
    UNIQUE INDEX `uk_template_exercises_template_id_exercise_id`(`template_id`, `exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `template_id` BIGINT UNSIGNED NOT NULL,
    `workout_session_id` BIGINT UNSIGNED NULL,
    `scheduled_task_id` BIGINT UNSIGNED NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,
    `condition_score` TINYINT UNSIGNED NOT NULL,
    `fatigue` TINYINT UNSIGNED NOT NULL,
    `note` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `workout_records_scheduled_task_id_key`(`scheduled_task_id`),
    INDEX `idx_workout_records_user_id`(`user_id`),
    INDEX `idx_workout_records_user_id_started_at`(`user_id`, `started_at`),
    INDEX `idx_workout_records_template_id`(`template_id`),
    INDEX `idx_workout_records_workout_session_id`(`workout_session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_record_exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `record_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_workout_record_exercises_record_id`(`record_id`),
    INDEX `idx_workout_record_exercises_exercise_id`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_record_sets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workout_record_exercise_id` BIGINT UNSIGNED NOT NULL,
    `set_number` INTEGER UNSIGNED NOT NULL,
    `weight` DECIMAL(5, 1) NOT NULL,
    `reps` INTEGER UNSIGNED NOT NULL,
    `completed` BOOLEAN NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_workout_record_sets_workout_record_exercise_id`(`workout_record_exercise_id`),
    INDEX `idx_workout_record_sets_workout_record_exercise_id_set_number`(`workout_record_exercise_id`, `set_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weight_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `recorded_at` DATETIME(3) NOT NULL,
    `weight` DECIMAL(5, 1) NOT NULL,
    `body_fat` DECIMAL(4, 1) NULL,
    `photo_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_weight_records_user_id`(`user_id`),
    INDEX `idx_weight_records_user_id_recorded_at`(`user_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `template_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_workout_sessions_user_id`(`user_id`),
    INDEX `idx_workout_sessions_user_deleted`(`user_id`, `deleted_at`),
    INDEX `idx_workout_sessions_template_id`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_session_exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workout_session_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `display_order` INTEGER UNSIGNED NOT NULL,
    `target_weight` DECIMAL(5, 1) NULL,
    `target_reps` INTEGER UNSIGNED NULL,
    `target_sets` INTEGER UNSIGNED NULL,
    `rest_seconds` SMALLINT UNSIGNED NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_workout_session_exercises_workout_session_id`(`workout_session_id`),
    UNIQUE INDEX `uk_workout_session_exercises_session_exercise`(`workout_session_id`, `exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_rules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `workout_session_id` BIGINT UNSIGNED NOT NULL,
    `rule_type` ENUM('weekly', 'interval', 'once') NOT NULL,
    `weekdays` TINYINT UNSIGNED NULL,
    `interval_days` SMALLINT UNSIGNED NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_schedule_rules_user_id`(`user_id`),
    INDEX `idx_schedule_rules_user_deleted`(`user_id`, `deleted_at`),
    INDEX `idx_schedule_rules_workout_session_id`(`workout_session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_tasks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `rule_id` BIGINT UNSIGNED NULL,
    `workout_session_id` BIGINT UNSIGNED NOT NULL,
    `scheduled_date` DATE NOT NULL,
    `status` ENUM('pending', 'completed', 'skipped', 'rescheduled') NOT NULL DEFAULT 'pending',
    `rescheduled_to` DATE NULL,
    `rescheduled_from` DATE NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_scheduled_tasks_user_date`(`user_id`, `scheduled_date`),
    INDEX `idx_scheduled_tasks_rule_id`(`rule_id`),
    INDEX `idx_scheduled_tasks_workout_session_id`(`workout_session_id`),
    UNIQUE INDEX `uk_scheduled_tasks_user_session_date`(`user_id`, `workout_session_id`, `scheduled_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_reminders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `workout_session_id` BIGINT UNSIGNED NOT NULL,
    `reminder_type` ENUM('before_scheduled', 'fixed_time') NOT NULL,
    `offset_minutes` SMALLINT UNSIGNED NULL,
    `fixed_time_of_day` TIME(0) NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_schedule_reminders_user_id`(`user_id`),
    INDEX `idx_schedule_reminders_workout_session_id`(`workout_session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_body_parts` ADD CONSTRAINT `exercise_body_parts_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_body_parts` ADD CONSTRAINT `exercise_body_parts_body_part_id_fkey` FOREIGN KEY (`body_part_id`) REFERENCES `body_parts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_templates` ADD CONSTRAINT `workout_templates_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_exercises` ADD CONSTRAINT `template_exercises_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_exercises` ADD CONSTRAINT `template_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_records` ADD CONSTRAINT `workout_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_records` ADD CONSTRAINT `workout_records_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_records` ADD CONSTRAINT `workout_records_workout_session_id_fkey` FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_records` ADD CONSTRAINT `workout_records_scheduled_task_id_fkey` FOREIGN KEY (`scheduled_task_id`) REFERENCES `scheduled_tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_record_exercises` ADD CONSTRAINT `workout_record_exercises_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `workout_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_record_exercises` ADD CONSTRAINT `workout_record_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_record_sets` ADD CONSTRAINT `workout_record_sets_workout_record_exercise_id_fkey` FOREIGN KEY (`workout_record_exercise_id`) REFERENCES `workout_record_exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weight_records` ADD CONSTRAINT `weight_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `workout_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_session_exercises` ADD CONSTRAINT `workout_session_exercises_workout_session_id_fkey` FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_session_exercises` ADD CONSTRAINT `workout_session_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_rules` ADD CONSTRAINT `schedule_rules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_rules` ADD CONSTRAINT `schedule_rules_workout_session_id_fkey` FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_tasks` ADD CONSTRAINT `scheduled_tasks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_tasks` ADD CONSTRAINT `scheduled_tasks_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `schedule_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduled_tasks` ADD CONSTRAINT `scheduled_tasks_workout_session_id_fkey` FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_reminders` ADD CONSTRAINT `schedule_reminders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_reminders` ADD CONSTRAINT `schedule_reminders_workout_session_id_fkey` FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
