-- Migration: Convert requests.devti_urusan (varchar) to requests.devti_urusan_id (int FK -> units)
-- Date: 2026-10-19
-- Reason: DevTI Urusan sekarang dipilih dari master units (option), bukan diketik manual.

-- Drop old column (no existing data to migrate per project state)
ALTER TABLE `requests`
DROP COLUMN `devti_urusan`;

-- Add new column
ALTER TABLE `requests`
ADD COLUMN `devti_urusan_id` int AFTER `requester_phone`;

-- Index for FK
ALTER TABLE `requests`
ADD INDEX `devti_urusan_id_idx` (`devti_urusan_id`);

-- Foreign key to units
ALTER TABLE `requests`
ADD CONSTRAINT `fk_requests_devti_urusan` FOREIGN KEY (`devti_urusan_id`) REFERENCES `units`(`id`);
