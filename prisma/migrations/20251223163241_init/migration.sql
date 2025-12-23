-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `avatar_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL,
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
    `created_at` DATETIME(3) NOT NULL,
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
    `created_at` DATETIME(3) NOT NULL,
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

    INDEX `idx_exercise_body_parts_exercise_id`(`exercise_id`),
    INDEX `idx_exercise_body_parts_body_part_id`(`body_part_id`),
    PRIMARY KEY (`exercise_id`, `body_part_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_menus` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_workout_menus_user_id`(`user_id`),
    INDEX `idx_workout_menus_user_id_deleted_at`(`user_id`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `display_order` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_menu_exercises_menu_id`(`menu_id`),
    INDEX `idx_menu_exercises_menu_id_display_order`(`menu_id`, `display_order`),
    UNIQUE INDEX `uk_menu_exercises_menu_id_exercise_id`(`menu_id`, `exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,
    `condition_score` TINYINT UNSIGNED NOT NULL,
    `fatigue` TINYINT UNSIGNED NOT NULL,
    `note` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_workout_records_user_id`(`user_id`),
    INDEX `idx_workout_records_user_id_started_at`(`user_id`, `started_at`),
    INDEX `idx_workout_records_menu_id`(`menu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `session_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_exercise_records_session_id`(`session_id`),
    INDEX `idx_exercise_records_exercise_id`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_set_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exercise_record_id` BIGINT UNSIGNED NOT NULL,
    `set_number` INTEGER UNSIGNED NOT NULL,
    `weight` DECIMAL(5, 1) NOT NULL,
    `reps` INTEGER UNSIGNED NOT NULL,
    `completed` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_workout_set_records_exercise_record_id`(`exercise_record_id`),
    INDEX `idx_workout_set_records_exercise_record_id_set_number`(`exercise_record_id`, `set_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weight_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `recorded_at` DATETIME(3) NOT NULL,
    `weight` DECIMAL(5, 1) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_weight_records_user_id`(`user_id`),
    INDEX `idx_weight_records_user_id_recorded_at`(`user_id`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `week_schedules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `day_of_week` TINYINT UNSIGNED NOT NULL,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_week_schedules_user_id`(`user_id`),
    INDEX `idx_week_schedules_user_id_day_of_week`(`user_id`, `day_of_week`),
    INDEX `idx_week_schedules_user_id_deleted_at`(`user_id`, `deleted_at`),
    UNIQUE INDEX `uk_week_schedules_user_id_day_of_week`(`user_id`, `day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_check_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `week_schedule_id` BIGINT UNSIGNED NOT NULL,
    `scheduled_date` DATE NOT NULL,
    `status` ENUM('completed', 'skipped') NOT NULL,
    `checked_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_schedule_check_records_user_id`(`user_id`),
    INDEX `idx_schedule_check_records_user_id_scheduled_date`(`user_id`, `scheduled_date`),
    INDEX `idx_schedule_check_records_week_schedule_id`(`week_schedule_id`),
    UNIQUE INDEX `uk_schedule_check_records_user_schedule_date`(`user_id`, `week_schedule_id`, `scheduled_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_reminders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `week_schedule_id` BIGINT UNSIGNED NOT NULL,
    `frequency` ENUM('daily', 'weekly', 'monthly') NOT NULL,
    `time_of_day` TIME(0) NOT NULL,
    `day_of_week` TINYINT UNSIGNED NULL,
    `day_of_month` TINYINT UNSIGNED NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `next_fire_at` DATETIME(3) NOT NULL,
    `last_fired_at` DATETIME(3) NULL,
    `is_enabled` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_schedule_reminders_user_id`(`user_id`),
    INDEX `idx_schedule_reminders_user_id_next_fire_at`(`user_id`, `next_fire_at`),
    INDEX `idx_schedule_reminders_week_schedule_id`(`week_schedule_id`),
    UNIQUE INDEX `uk_schedule_reminders_user_id_week_schedule_id`(`user_id`, `week_schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_body_parts` ADD CONSTRAINT `exercise_body_parts_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_body_parts` ADD CONSTRAINT `exercise_body_parts_body_part_id_fkey` FOREIGN KEY (`body_part_id`) REFERENCES `body_parts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_menus` ADD CONSTRAINT `workout_menus_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_exercises` ADD CONSTRAINT `menu_exercises_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_exercises` ADD CONSTRAINT `menu_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_records` ADD CONSTRAINT `workout_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_records` ADD CONSTRAINT `workout_records_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_records` ADD CONSTRAINT `exercise_records_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `workout_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_records` ADD CONSTRAINT `exercise_records_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_set_records` ADD CONSTRAINT `workout_set_records_exercise_record_id_fkey` FOREIGN KEY (`exercise_record_id`) REFERENCES `exercise_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weight_records` ADD CONSTRAINT `weight_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `week_schedules` ADD CONSTRAINT `week_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `week_schedules` ADD CONSTRAINT `week_schedules_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_check_records` ADD CONSTRAINT `schedule_check_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_check_records` ADD CONSTRAINT `schedule_check_records_week_schedule_id_fkey` FOREIGN KEY (`week_schedule_id`) REFERENCES `week_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_reminders` ADD CONSTRAINT `schedule_reminders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_reminders` ADD CONSTRAINT `schedule_reminders_week_schedule_id_fkey` FOREIGN KEY (`week_schedule_id`) REFERENCES `week_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
