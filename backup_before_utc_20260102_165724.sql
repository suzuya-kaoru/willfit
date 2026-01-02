-- MySQL dump 10.13  Distrib 8.4.7, for Linux (aarch64)
--
-- Host: localhost    Database: willfit
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `body_parts`
--

DROP TABLE IF EXISTS `body_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `body_parts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int unsigned NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_body_parts_display_order` (`display_order`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `body_parts`
--

LOCK TABLES `body_parts` WRITE;
/*!40000 ALTER TABLE `body_parts` DISABLE KEYS */;
INSERT INTO `body_parts` VALUES (1,'胸','chest',1,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(2,'背中','back',2,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(3,'肩','shoulder',3,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(4,'二頭筋','biceps',4,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(5,'三頭筋','triceps',5,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(6,'脚','legs',6,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(7,'大臀筋','glutes',7,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000'),(8,'腹筋','abs',8,'2025-03-06 00:00:00.000','2025-03-06 00:00:00.000');
/*!40000 ALTER TABLE `body_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_schedules`
--

DROP TABLE IF EXISTS `daily_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_schedules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `routine_id` bigint unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `status` enum('pending','completed','skipped','rescheduled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rescheduled_to` date DEFAULT NULL,
  `rescheduled_from` date DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_daily_schedules_user_routine_date` (`user_id`,`routine_id`,`scheduled_date`),
  KEY `idx_daily_schedules_user_date` (`user_id`,`scheduled_date`),
  KEY `daily_schedules_routine_id_fkey` (`routine_id`),
  CONSTRAINT `daily_schedules_routine_id_fkey` FOREIGN KEY (`routine_id`) REFERENCES `schedule_routines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `daily_schedules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_schedules`
--

LOCK TABLES `daily_schedules` WRITE;
/*!40000 ALTER TABLE `daily_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_body_parts`
--

DROP TABLE IF EXISTS `exercise_body_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_body_parts` (
  `exercise_id` bigint unsigned NOT NULL,
  `body_part_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`exercise_id`,`body_part_id`),
  KEY `idx_exercise_body_parts_body_part_id` (`body_part_id`),
  CONSTRAINT `exercise_body_parts_body_part_id_fkey` FOREIGN KEY (`body_part_id`) REFERENCES `body_parts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `exercise_body_parts_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_body_parts`
--

LOCK TABLES `exercise_body_parts` WRITE;
/*!40000 ALTER TABLE `exercise_body_parts` DISABLE KEYS */;
INSERT INTO `exercise_body_parts` VALUES (1,1),(2,2),(5,2),(4,3),(2,4),(6,4),(1,5),(3,6),(5,6),(3,7),(5,7);
/*!40000 ALTER TABLE `exercise_body_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_records`
--

DROP TABLE IF EXISTS `exercise_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` bigint unsigned NOT NULL,
  `exercise_id` bigint unsigned NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exercise_records_session_id` (`session_id`),
  KEY `idx_exercise_records_exercise_id` (`exercise_id`),
  CONSTRAINT `exercise_records_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `exercise_records_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `workout_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_records`
--

LOCK TABLES `exercise_records` WRITE;
/*!40000 ALTER TABLE `exercise_records` DISABLE KEYS */;
INSERT INTO `exercise_records` VALUES (1,1,1,'2025-12-01 02:30:00.000','2025-12-01 02:30:00.000'),(2,1,2,'2025-12-01 02:30:00.000','2025-12-01 02:30:00.000'),(3,2,3,'2025-11-29 01:15:00.000','2025-11-29 01:15:00.000'),(4,2,4,'2025-11-29 01:15:00.000','2025-11-29 01:15:00.000'),(5,3,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755'),(6,3,2,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755');
/*!40000 ALTER TABLE `exercise_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercises` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form_note` text COLLATE utf8mb4_unicode_ci,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_exercises_user_id` (`user_id`),
  KEY `idx_exercises_user_id_deleted_at` (`user_id`,`deleted_at`),
  CONSTRAINT `exercises_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercises`
--

LOCK TABLES `exercises` WRITE;
/*!40000 ALTER TABLE `exercises` DISABLE KEYS */;
INSERT INTO `exercises` VALUES (1,1,'ベンチプレス','肩甲骨を寄せ、手首を真っ直ぐに保つ。足は床にしっかりつける。','https://youtube.com/watch?v=example1','2025-09-22 00:00:00.000','2025-09-22 00:00:00.000',NULL),(2,1,'ラットプルダウン','胸を張り、肘を体の横に引く。反動を使わない。','https://youtube.com/watch?v=example2','2025-09-22 00:00:00.000','2025-09-22 00:00:00.000',NULL),(3,1,'スクワット','膝がつま先より前に出ないように。背中は真っ直ぐ。','https://youtube.com/watch?v=example3','2025-09-22 00:00:00.000','2025-09-22 00:00:00.000',NULL),(4,1,'ショルダープレス','肘は体の少し前方に。首を縮めない。',NULL,'2025-09-22 00:00:00.000','2025-09-22 00:00:00.000',NULL),(5,1,'デッドリフト','腰を丸めない。バーは体に近い位置をキープ。',NULL,'2025-09-22 00:00:00.000','2025-09-22 00:00:00.000',NULL),(6,1,'ダンベルカール','肘は固定。反動を使わずコントロール。',NULL,'2025-09-22 00:00:00.000','2025-09-22 00:00:00.000',NULL);
/*!40000 ALTER TABLE `exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_exercises`
--

DROP TABLE IF EXISTS `menu_exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_exercises` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `menu_id` bigint unsigned NOT NULL,
  `exercise_id` bigint unsigned NOT NULL,
  `display_order` int unsigned NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_exercises_menu_id_exercise_id` (`menu_id`,`exercise_id`),
  KEY `idx_menu_exercises_menu_id` (`menu_id`),
  KEY `idx_menu_exercises_menu_id_display_order` (`menu_id`,`display_order`),
  KEY `menu_exercises_exercise_id_fkey` (`exercise_id`),
  CONSTRAINT `menu_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `menu_exercises_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_exercises`
--

LOCK TABLES `menu_exercises` WRITE;
/*!40000 ALTER TABLE `menu_exercises` DISABLE KEYS */;
INSERT INTO `menu_exercises` VALUES (1,1,1,1,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000'),(2,1,2,2,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000'),(3,2,3,1,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000'),(4,2,4,2,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000'),(5,3,5,1,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000'),(6,3,6,2,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000');
/*!40000 ALTER TABLE `menu_exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_reminders`
--

DROP TABLE IF EXISTS `schedule_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `session_plan_id` bigint unsigned NOT NULL,
  `reminder_type` enum('before_scheduled','fixed_time') COLLATE utf8mb4_unicode_ci NOT NULL,
  `offset_minutes` smallint unsigned DEFAULT NULL,
  `fixed_time_of_day` time DEFAULT NULL,
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_reminders_user_id` (`user_id`),
  KEY `idx_schedule_reminders_session_plan_id` (`session_plan_id`),
  CONSTRAINT `schedule_reminders_session_plan_id_fkey` FOREIGN KEY (`session_plan_id`) REFERENCES `session_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `schedule_reminders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_reminders`
--

LOCK TABLES `schedule_reminders` WRITE;
/*!40000 ALTER TABLE `schedule_reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_routine_reminders`
--

DROP TABLE IF EXISTS `schedule_routine_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_routine_reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `routine_id` bigint unsigned NOT NULL,
  `frequency` enum('daily','weekly','monthly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_of_day` time NOT NULL,
  `day_of_week` tinyint unsigned DEFAULT NULL,
  `day_of_month` tinyint unsigned DEFAULT NULL,
  `start_date` date NOT NULL,
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `next_fire_at` datetime(3) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `schedule_routine_reminders_routine_id_key` (`routine_id`),
  KEY `idx_schedule_routine_reminders_user` (`user_id`),
  CONSTRAINT `schedule_routine_reminders_routine_id_fkey` FOREIGN KEY (`routine_id`) REFERENCES `schedule_routines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `schedule_routine_reminders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_routine_reminders`
--

LOCK TABLES `schedule_routine_reminders` WRITE;
/*!40000 ALTER TABLE `schedule_routine_reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_routine_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_routines`
--

DROP TABLE IF EXISTS `schedule_routines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_routines` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `menu_id` bigint unsigned NOT NULL,
  `routine_type` enum('weekly','interval') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekdays` tinyint unsigned DEFAULT NULL,
  `interval_days` smallint unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_schedule_routines_user_menu` (`user_id`,`menu_id`),
  KEY `idx_schedule_routines_user_id` (`user_id`),
  KEY `idx_schedule_routines_user_deleted` (`user_id`,`deleted_at`),
  KEY `schedule_routines_menu_id_fkey` (`menu_id`),
  CONSTRAINT `schedule_routines_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `schedule_routines_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_routines`
--

LOCK TABLES `schedule_routines` WRITE;
/*!40000 ALTER TABLE `schedule_routines` DISABLE KEYS */;
INSERT INTO `schedule_routines` VALUES (1,1,1,'weekly',33,NULL,NULL,1,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000',NULL),(2,1,2,'weekly',2,NULL,NULL,1,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000',NULL),(3,1,3,'weekly',8,NULL,NULL,1,'2025-10-02 00:00:00.000','2025-10-02 00:00:00.000',NULL);
/*!40000 ALTER TABLE `schedule_routines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_rules`
--

DROP TABLE IF EXISTS `schedule_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_rules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `session_plan_id` bigint unsigned NOT NULL,
  `rule_type` enum('weekly','interval','once') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekdays` tinyint unsigned DEFAULT NULL,
  `interval_days` smallint unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_rules_user_id` (`user_id`),
  KEY `idx_schedule_rules_user_deleted` (`user_id`,`deleted_at`),
  KEY `idx_schedule_rules_session_plan_id` (`session_plan_id`),
  CONSTRAINT `schedule_rules_session_plan_id_fkey` FOREIGN KEY (`session_plan_id`) REFERENCES `session_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `schedule_rules_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_rules`
--

LOCK TABLES `schedule_rules` WRITE;
/*!40000 ALTER TABLE `schedule_rules` DISABLE KEYS */;
INSERT INTO `schedule_rules` VALUES (1,1,1,'interval',NULL,3,'2026-01-02',NULL,1,'2026-01-01 15:54:28.770','2026-01-01 15:54:28.770',NULL);
/*!40000 ALTER TABLE `schedule_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduled_tasks`
--

DROP TABLE IF EXISTS `scheduled_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduled_tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `rule_id` bigint unsigned DEFAULT NULL,
  `session_plan_id` bigint unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `status` enum('pending','completed','skipped','rescheduled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rescheduled_to` date DEFAULT NULL,
  `rescheduled_from` date DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scheduled_tasks_user_plan_date` (`user_id`,`session_plan_id`,`scheduled_date`),
  KEY `idx_scheduled_tasks_user_date` (`user_id`,`scheduled_date`),
  KEY `idx_scheduled_tasks_rule_id` (`rule_id`),
  KEY `idx_scheduled_tasks_session_plan_id` (`session_plan_id`),
  CONSTRAINT `scheduled_tasks_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `schedule_rules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `scheduled_tasks_session_plan_id_fkey` FOREIGN KEY (`session_plan_id`) REFERENCES `session_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `scheduled_tasks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduled_tasks`
--

LOCK TABLES `scheduled_tasks` WRITE;
/*!40000 ALTER TABLE `scheduled_tasks` DISABLE KEYS */;
INSERT INTO `scheduled_tasks` VALUES (1,1,1,1,'2026-01-02','completed',NULL,NULL,'2026-01-01 15:54:59.759','2026-01-01 15:54:28.786','2026-01-01 15:54:59.759'),(2,1,1,1,'2026-01-05','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(3,1,1,1,'2026-01-08','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(4,1,1,1,'2026-01-11','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(5,1,1,1,'2026-01-14','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(6,1,1,1,'2026-01-17','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(7,1,1,1,'2026-01-20','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(8,1,1,1,'2026-01-23','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(9,1,1,1,'2026-01-26','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(10,1,1,1,'2026-01-29','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(11,1,1,1,'2026-02-01','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(12,1,1,1,'2026-02-04','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(13,1,1,1,'2026-02-07','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(14,1,1,1,'2026-02-10','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(15,1,1,1,'2026-02-13','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(16,1,1,1,'2026-02-16','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(17,1,1,1,'2026-02-19','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(18,1,1,1,'2026-02-22','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(19,1,1,1,'2026-02-25','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(20,1,1,1,'2026-02-28','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(21,1,1,1,'2026-03-03','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(22,1,1,1,'2026-03-06','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(23,1,1,1,'2026-03-09','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(24,1,1,1,'2026-03-12','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(25,1,1,1,'2026-03-15','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(26,1,1,1,'2026-03-18','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(27,1,1,1,'2026-03-21','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(28,1,1,1,'2026-03-24','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(29,1,1,1,'2026-03-27','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(30,1,1,1,'2026-03-30','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786'),(31,1,1,1,'2026-04-02','pending',NULL,NULL,NULL,'2026-01-01 15:54:28.786','2026-01-01 15:54:28.786');
/*!40000 ALTER TABLE `scheduled_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_plan_exercises`
--

DROP TABLE IF EXISTS `session_plan_exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_plan_exercises` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_plan_id` bigint unsigned NOT NULL,
  `exercise_id` bigint unsigned NOT NULL,
  `display_order` int unsigned NOT NULL,
  `target_weight` decimal(5,1) DEFAULT NULL,
  `target_reps` int unsigned DEFAULT NULL,
  `target_sets` int unsigned DEFAULT NULL,
  `rest_seconds` smallint unsigned DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_plan_exercises_plan_exercise` (`session_plan_id`,`exercise_id`),
  KEY `idx_session_plan_exercises_plan_id` (`session_plan_id`),
  KEY `session_plan_exercises_exercise_id_fkey` (`exercise_id`),
  CONSTRAINT `session_plan_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `session_plan_exercises_session_plan_id_fkey` FOREIGN KEY (`session_plan_id`) REFERENCES `session_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_plan_exercises`
--

LOCK TABLES `session_plan_exercises` WRITE;
/*!40000 ALTER TABLE `session_plan_exercises` DISABLE KEYS */;
INSERT INTO `session_plan_exercises` VALUES (3,1,1,1,0.0,10,3,60,NULL,'2026-01-01 15:54:11.981','2026-01-01 15:54:11.981'),(4,1,2,2,0.0,10,3,60,NULL,'2026-01-01 15:54:11.981','2026-01-01 15:54:11.981');
/*!40000 ALTER TABLE `session_plan_exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_plans`
--

DROP TABLE IF EXISTS `session_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `menu_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_session_plans_user_id` (`user_id`),
  KEY `idx_session_plans_user_deleted` (`user_id`,`deleted_at`),
  KEY `idx_session_plans_menu_id` (`menu_id`),
  CONSTRAINT `session_plans_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `session_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_plans`
--

LOCK TABLES `session_plans` WRITE;
/*!40000 ALTER TABLE `session_plans` DISABLE KEYS */;
INSERT INTO `session_plans` VALUES (1,1,1,'テスト 胸・背中','テスト','2026-01-01 15:53:59.738','2026-01-01 15:54:11.981',NULL);
/*!40000 ALTER TABLE `session_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'demo@example.com','Demo User',NULL,'2025-03-06 00:00:00.000','2025-12-24 00:00:00.000',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `weight_records`
--

DROP TABLE IF EXISTS `weight_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weight_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `recorded_at` datetime(3) NOT NULL,
  `weight` decimal(5,1) NOT NULL,
  `body_fat` decimal(4,1) DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_weight_records_user_id` (`user_id`),
  KEY `idx_weight_records_user_id_recorded_at` (`user_id`,`recorded_at`),
  CONSTRAINT `weight_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `weight_records`
--

LOCK TABLES `weight_records` WRITE;
/*!40000 ALTER TABLE `weight_records` DISABLE KEYS */;
INSERT INTO `weight_records` VALUES (1,1,'2025-10-31 23:00:00.000',72.5,NULL,NULL,'2025-10-31 23:00:00.000','2025-10-31 23:00:00.000'),(2,1,'2025-11-07 23:00:00.000',72.3,NULL,NULL,'2025-11-07 23:00:00.000','2025-11-07 23:00:00.000'),(3,1,'2025-11-14 23:00:00.000',72.0,NULL,NULL,'2025-11-14 23:00:00.000','2025-11-14 23:00:00.000'),(4,1,'2025-11-21 23:00:00.000',71.8,NULL,NULL,'2025-11-21 23:00:00.000','2025-11-21 23:00:00.000'),(5,1,'2025-11-28 23:00:00.000',71.5,NULL,NULL,'2025-11-28 23:00:00.000','2025-11-28 23:00:00.000'),(6,1,'2025-11-30 23:00:00.000',71.3,NULL,NULL,'2025-11-30 23:00:00.000','2025-11-30 23:00:00.000'),(7,1,'2026-01-02 03:10:06.614',73.3,20.0,NULL,'2026-01-02 01:59:45.198','2026-01-02 03:10:06.675');
/*!40000 ALTER TABLE `weight_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_menus`
--

DROP TABLE IF EXISTS `workout_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_menus` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_workout_menus_user_id` (`user_id`),
  KEY `idx_workout_menus_user_id_deleted_at` (`user_id`,`deleted_at`),
  CONSTRAINT `workout_menus_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_menus`
--

LOCK TABLES `workout_menus` WRITE;
/*!40000 ALTER TABLE `workout_menus` DISABLE KEYS */;
INSERT INTO `workout_menus` VALUES (1,1,'Day1 胸・背中','2025-10-02 00:00:00.000','2025-10-02 00:00:00.000',NULL),(2,1,'Day2 脚・肩','2025-10-02 00:00:00.000','2025-10-02 00:00:00.000',NULL),(3,1,'Day3 背中・腕','2025-10-02 00:00:00.000','2025-10-02 00:00:00.000',NULL);
/*!40000 ALTER TABLE `workout_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_records`
--

DROP TABLE IF EXISTS `workout_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `menu_id` bigint unsigned NOT NULL,
  `session_plan_id` bigint unsigned DEFAULT NULL,
  `scheduled_task_id` bigint unsigned DEFAULT NULL,
  `started_at` datetime(3) NOT NULL,
  `ended_at` datetime(3) DEFAULT NULL,
  `condition_score` tinyint unsigned NOT NULL,
  `fatigue` tinyint unsigned NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `workout_records_scheduled_task_id_key` (`scheduled_task_id`),
  KEY `idx_workout_records_user_id` (`user_id`),
  KEY `idx_workout_records_user_id_started_at` (`user_id`,`started_at`),
  KEY `idx_workout_records_menu_id` (`menu_id`),
  KEY `idx_workout_records_session_plan_id` (`session_plan_id`),
  CONSTRAINT `workout_records_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `workout_menus` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `workout_records_scheduled_task_id_fkey` FOREIGN KEY (`scheduled_task_id`) REFERENCES `scheduled_tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workout_records_session_plan_id_fkey` FOREIGN KEY (`session_plan_id`) REFERENCES `session_plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `workout_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_records`
--

LOCK TABLES `workout_records` WRITE;
/*!40000 ALTER TABLE `workout_records` DISABLE KEYS */;
INSERT INTO `workout_records` VALUES (1,1,1,NULL,NULL,'2025-12-01 01:00:00.000','2025-12-01 02:30:00.000',8,6,'ベンチプレスの手首の角度に注意。今日は調子が良かった。','2025-12-01 02:30:00.000','2025-12-01 02:30:00.000'),(2,1,2,NULL,NULL,'2025-11-29 00:00:00.000','2025-11-29 01:15:00.000',7,8,'脚の疲労が強かった。次回はウォームアップを長めに。','2025-11-29 01:15:00.000','2025-11-29 01:15:00.000'),(3,1,1,NULL,1,'2026-01-01 15:54:49.750','2026-01-01 15:54:59.682',7,5,'','2026-01-01 15:54:59.755','2026-01-01 15:54:59.755');
/*!40000 ALTER TABLE `workout_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workout_set_records`
--

DROP TABLE IF EXISTS `workout_set_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_set_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `exercise_record_id` bigint unsigned NOT NULL,
  `set_number` int unsigned NOT NULL,
  `weight` decimal(5,1) NOT NULL,
  `reps` int unsigned NOT NULL,
  `completed` tinyint(1) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_workout_set_records_exercise_record_id` (`exercise_record_id`),
  KEY `idx_workout_set_records_exercise_record_id_set_number` (`exercise_record_id`,`set_number`),
  CONSTRAINT `workout_set_records_exercise_record_id_fkey` FOREIGN KEY (`exercise_record_id`) REFERENCES `exercise_records` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workout_set_records`
--

LOCK TABLES `workout_set_records` WRITE;
/*!40000 ALTER TABLE `workout_set_records` DISABLE KEYS */;
INSERT INTO `workout_set_records` VALUES (1,1,1,60.0,10,1,'2025-12-01 01:15:00.000','2025-12-01 01:15:00.000'),(2,1,2,60.0,10,1,'2025-12-01 01:20:00.000','2025-12-01 01:20:00.000'),(3,1,3,60.0,8,1,'2025-12-01 01:25:00.000','2025-12-01 01:25:00.000'),(4,2,1,50.0,12,1,'2025-12-01 01:40:00.000','2025-12-01 01:40:00.000'),(5,2,2,50.0,10,1,'2025-12-01 01:45:00.000','2025-12-01 01:45:00.000'),(6,3,1,80.0,8,1,'2025-11-29 00:15:00.000','2025-11-29 00:15:00.000'),(7,3,2,80.0,8,1,'2025-11-29 00:20:00.000','2025-11-29 00:20:00.000'),(8,5,1,0.0,0,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755'),(9,5,2,0.0,0,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755'),(10,5,3,0.0,0,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755'),(11,6,1,0.0,0,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755'),(12,6,2,0.0,0,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755'),(13,6,3,0.0,0,1,'2026-01-01 15:54:59.755','2026-01-01 15:54:59.755');
/*!40000 ALTER TABLE `workout_set_records` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-02 16:57:25
