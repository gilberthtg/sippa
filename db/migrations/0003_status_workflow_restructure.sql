-- Migration: Request status workflow restructure
-- Maps old statuses to new canonical statuses:
--   submitted -> submitted
--   verification -> in_review
--   approved -> approved
--   rejected -> rejected
--   assigned -> ongoing
--   in_progress -> ongoing
--   completed -> done
-- Adds SLA pause tracking columns and on_hold_reason.

-- Step 1: Add new columns for SLA pause tracking and on-hold reason
ALTER TABLE `requests`
  ADD COLUMN `sla_paused_at` timestamp NULL AFTER `sla_met`,
  ADD COLUMN `sla_paused_duration_hours` int NOT NULL DEFAULT 0 AFTER `sla_paused_at`,
  ADD COLUMN `on_hold_reason` text AFTER `completion_note`;

-- Step 2: Migrate status enum values.
-- MySQL: modify enum column. First update data, then alter column type.
UPDATE `requests` SET `status` = 'ongoing' WHERE `status` IN ('assigned', 'in_progress');
UPDATE `requests` SET `status` = 'in_review' WHERE `status` = 'verification';
UPDATE `requests` SET `status` = 'done' WHERE `status` = 'completed';

ALTER TABLE `requests`
  MODIFY COLUMN `status` ENUM('submitted','in_review','approved','rejected','ongoing','done','on_hold') NOT NULL DEFAULT 'submitted';

-- Step 3: Backfill status history audit entries documenting the migration.
-- (Optional) Insert a history row for each request whose status changed.
INSERT INTO `request_status_histories` (`request_id`, `from_status`, `to_status`, `changed_by`, `changed_by_name`, `actor_role`, `note`, `created_at`)
SELECT r.id, 'verification', 'in_review', 1, 'System Migration', 'SYSTEM', 'Status migrated: verification -> in_review', NOW()
FROM `requests` r WHERE r.status = 'in_review';

-- Step 4: Verify counts (manual check)
-- SELECT status, COUNT(*) FROM requests GROUP BY status;
