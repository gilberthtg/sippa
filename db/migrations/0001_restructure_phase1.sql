-- Phase 1: Database Restructure - SIPPA
-- Migration: Add new tables and update existing tables for NEW_APPLICATION and RFC flow

-- Step 1: Create developer_roles table
CREATE TABLE IF NOT EXISTS `developer_roles` (
  `id` smallint AUTO_INCREMENT PRIMARY KEY,
  `code` varchar(10) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `description` text,
  `is_active` boolean NOT NULL DEFAULT true,
  `sort_order` smallint NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `code_idx` (`code`),
  INDEX `is_active_idx` (`is_active`),
  INDEX `sort_order_idx` (`sort_order`)
);

-- Step 2: Create request_applications table
CREATE TABLE IF NOT EXISTS `request_applications` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `application_name` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `current_version` varchar(50) NOT NULL DEFAULT '1.0.0',
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `application_name_idx` (`application_name`),
  INDEX `created_by_idx` (`created_by`),
  INDEX `current_version_idx` (`current_version`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);

-- Step 3: Create sla_holidays table
CREATE TABLE IF NOT EXISTS `sla_holidays` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `holiday_date` date NOT NULL UNIQUE,
  `description` varchar(255) NOT NULL,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `holiday_date_idx` (`holiday_date`),
  INDEX `is_active_idx` (`is_active`)
);

-- Step 4: Add developer_role_id to users table
ALTER TABLE `users` 
ADD COLUMN `developer_role_id` smallint AFTER `unit_id`;

ALTER TABLE `users`
ADD INDEX `developer_role_id_idx` (`developer_role_id`);

ALTER TABLE `users`
ADD CONSTRAINT `fk_users_developer_role` FOREIGN KEY (`developer_role_id`) REFERENCES `developer_roles`(`id`);

-- Step 5: Add new columns to requests table
ALTER TABLE `requests`
ADD COLUMN `application_id` int AFTER `request_type`;

ALTER TABLE `requests`
ADD COLUMN `requested_version` varchar(50) AFTER `application_id`;

ALTER TABLE `requests`
ADD COLUMN `devti_urusan` varchar(255) AFTER `requester_phone`;

ALTER TABLE `requests`
ADD COLUMN `technical_writer_id` int AFTER `devti_urusan`;

ALTER TABLE `requests`
ADD COLUMN `team_leader_id` int AFTER `technical_writer_id`;

-- Add indexes for new columns in requests
ALTER TABLE `requests`
ADD INDEX `application_id_idx` (`application_id`);

ALTER TABLE `requests`
ADD INDEX `technical_writer_id_idx` (`technical_writer_id`);

ALTER TABLE `requests`
ADD INDEX `team_leader_id_idx` (`team_leader_id`);

-- Add foreign keys for new columns in requests
ALTER TABLE `requests`
ADD CONSTRAINT `fk_requests_application` FOREIGN KEY (`application_id`) REFERENCES `request_applications`(`id`);

ALTER TABLE `requests`
ADD CONSTRAINT `fk_requests_technical_writer` FOREIGN KEY (`technical_writer_id`) REFERENCES `users`(`id`);

ALTER TABLE `requests`
ADD CONSTRAINT `fk_requests_team_leader` FOREIGN KEY (`team_leader_id`) REFERENCES `users`(`id`);

-- Step 6: Add new columns to request_status_histories
ALTER TABLE `request_status_histories`
ADD COLUMN `actor_role` varchar(50) AFTER `changed_by_name`;

ALTER TABLE `request_status_histories`
ADD COLUMN `metadata` text AFTER `note`;

-- Step 7: Update sla_policies - rename column
ALTER TABLE `sla_policies`
CHANGE COLUMN `target_hours` `target_business_days` int NOT NULL;

-- Step 8: Create request_team_assignments table (new structure)
CREATE TABLE IF NOT EXISTS `request_team_assignments` (
  `id` bigint AUTO_INCREMENT PRIMARY KEY,
  `request_id` bigint NOT NULL,
  `assigned_user_id` int NOT NULL,
  `developer_role_id` smallint NOT NULL,
  `assigned_by` int NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unassigned_at` timestamp NULL,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `request_id_idx` (`request_id`),
  INDEX `assigned_user_id_idx` (`assigned_user_id`),
  INDEX `developer_role_id_idx` (`developer_role_id`),
  INDEX `assigned_by_idx` (`assigned_by`),
  INDEX `active_assignments_idx` (`request_id`, `unassigned_at`),
  FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`),
  FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`developer_role_id`) REFERENCES `developer_roles`(`id`),
  FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`)
);

-- Step 9: Drop obsolete tables (teams, team_members, old request_assignments)
-- Note: This will be done after data migration in Phase 8
-- For now, we keep them to preserve existing data

-- DROP TABLE IF EXISTS `team_members`;
-- DROP TABLE IF EXISTS `request_assignments`;
-- DROP TABLE IF EXISTS `teams`;
