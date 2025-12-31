-- CreateTable
CREATE TABLE `schedule_routines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `routine_type` ENUM('weekly', 'interval') NOT NULL,
    `weekdays` TINYINT UNSIGNED NULL,
    `interval_days` SMALLINT UNSIGNED NULL,
    `start_date` DATE NULL,
    `is_enabled` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `idx_schedule_routines_user_id`(`user_id`),
    INDEX `idx_schedule_routines_user_deleted`(`user_id`, `deleted_at`),
    UNIQUE INDEX `uk_schedule_routines_user_menu`(`user_id`, `menu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_schedules` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `routine_id` BIGINT UNSIGNED NOT NULL,
    `scheduled_date` DATE NOT NULL,
    `status` ENUM('pending', 'completed', 'skipped', 'rescheduled') NOT NULL DEFAULT 'pending',
    `rescheduled_to` DATE NULL,
    `rescheduled_from` DATE NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_daily_schedules_user_date`(`user_id`, `scheduled_date`),
    UNIQUE INDEX `uk_daily_schedules_user_routine_date`(`user_id`, `routine_id`, `scheduled_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_routine_reminders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `routine_id` BIGINT UNSIGNED NOT NULL,
    `frequency` ENUM('daily', 'weekly', 'monthly') NOT NULL,
    `time_of_day` TIME(0) NOT NULL,
    `day_of_week` TINYINT UNSIGNED NULL,
    `day_of_month` TINYINT UNSIGNED NULL,
    `start_date` DATE NOT NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `next_fire_at` DATETIME(3) NOT NULL,
    `is_enabled` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_schedule_routine_reminders_user`(`user_id`),
    UNIQUE INDEX `schedule_routine_reminders_routine_id_key`(`routine_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schedule_routines` ADD CONSTRAINT `schedule_routines_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_routines` ADD CONSTRAINT `schedule_routines_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_schedules` ADD CONSTRAINT `daily_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_schedules` ADD CONSTRAINT `daily_schedules_routine_id_fkey` FOREIGN KEY (`routine_id`) REFERENCES `schedule_routines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_routine_reminders` ADD CONSTRAINT `schedule_routine_reminders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_routine_reminders` ADD CONSTRAINT `schedule_routine_reminders_routine_id_fkey` FOREIGN KEY (`routine_id`) REFERENCES `schedule_routines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
