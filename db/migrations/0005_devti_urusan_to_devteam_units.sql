-- Migration: Point requests.devti_urusan_id FK to devteam_units
-- Purpose: DevTI Urusan handled by dedicated devteam_units table (previously referenced units)
-- Date: 2026-10-21
-- Note: Forward-only. Existing values not present in devteam_units are set to NULL to keep
--       the new FK valid (devti_urusan_id is NULLABLE, no business mapping units->devteam_units).

-- 1. Null out values that don't exist in devteam_units (old units-based ids)
UPDATE `requests` r
LEFT JOIN `devteam_units` d ON d.id = r.devti_urusan_id
SET r.devti_urusan_id = NULL
WHERE r.devti_urusan_id IS NOT NULL AND d.id IS NULL;

-- 2. Drop the old FK constraint to units.
--    Constraint name varies by environment: drizzle-kit generates
--    `requests_devti_urusan_id_units_id_fk`; manual run of 0002 uses `fk_requests_devti_urusan`.
--    Adjust the name below to match the target environment.
ALTER TABLE `requests`
DROP FOREIGN KEY `requests_devti_urusan_id_units_id_fk`;

-- 3. Add new FK to devteam_units (reuses existing index devti_urusan_id_idx)
ALTER TABLE `requests`
ADD CONSTRAINT `fk_requests_devti_urusan_devteam`
FOREIGN KEY (`devti_urusan_id`) REFERENCES `devteam_units`(`id`);
