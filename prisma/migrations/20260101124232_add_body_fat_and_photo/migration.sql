/*
  Warnings:

  - You are about to drop the `schedule_check_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedule_reminders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `week_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `schedule_check_records` DROP FOREIGN KEY `schedule_check_records_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_check_records` DROP FOREIGN KEY `schedule_check_records_week_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_reminders` DROP FOREIGN KEY `schedule_reminders_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `schedule_reminders` DROP FOREIGN KEY `schedule_reminders_week_schedule_id_fkey`;

-- DropForeignKey
ALTER TABLE `week_schedules` DROP FOREIGN KEY `week_schedules_menu_id_fkey`;

-- DropForeignKey
ALTER TABLE `week_schedules` DROP FOREIGN KEY `week_schedules_user_id_fkey`;

-- AlterTable
ALTER TABLE `body_parts` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `exercise_records` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `exercises` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `menu_exercises` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `schedule_routine_reminders` MODIFY `is_enabled` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `schedule_routines` MODIFY `is_enabled` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `users` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `weight_records` ADD COLUMN `body_fat` DECIMAL(4, 1) NULL,
    ADD COLUMN `photo_url` VARCHAR(500) NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `workout_menus` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `workout_records` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `workout_set_records` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `schedule_check_records`;

-- DropTable
DROP TABLE `schedule_reminders`;

-- DropTable
DROP TABLE `week_schedules`;
