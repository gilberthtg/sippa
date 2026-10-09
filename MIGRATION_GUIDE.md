# SIPPA Phase 7 Migration Guide

**Version:** 1.0  
**Date:** 2026-10-08  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Scripts](#migration-scripts)
4. [Pre-Migration Checklist](#pre-migration-checklist)
5. [Migration Process](#migration-process)
6. [Verification](#verification)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Overview

Phase 7 migration transforms SIPPA from team-based assignments to individual-based assignments with specific developer roles. This guide provides step-by-step instructions for safely migrating existing data to the new schema.

### What Changes?

**Before (Team-based):**
- Requests assigned to teams
- Teams contain multiple members
- Generic "developer" role

**After (Individual-based):**
- Requests assigned to individuals with specific roles
- 6 specific developer roles: SA, TW, BE, FE, QA, DM
- Application master for version management
- Business days SLA calculation

### Migration Scope

1. **Developer Roles:** Assign specific roles (BE, FE, QA, etc.) to existing developers
2. **Application Master:** Create application entries from approved NEW_APPLICATION requests
3. **Individual Assignments:** Convert team-based assignments to individual-based
4. **Data Integrity:** Preserve all historical data and relationships

---

## Prerequisites

### System Requirements

- **Node.js:** v18 or higher
- **MySQL:** v8.0 or higher
- **Disk Space:** At least 2GB free (for backups)
- **Permissions:** Database admin access
- **Time:** Estimated 30-60 minutes for full migration

### Before You Start

- [ ] **Backup database completely** (mandatory!)
- [ ] **Stop application server** (prevent concurrent writes)
- [ ] **Notify users** of maintenance window
- [ ] **Test on staging environment** first
- [ ] **Verify Phase 1 schema changes** are applied
- [ ] **Confirm developer_roles table** is seeded with 6 roles

---

## Migration Scripts

### Available Scripts

| Script | Purpose | Dry Run Support |
|--------|---------|-----------------|
| `phase7-migrate-developers.ts` | Assign developer roles | ✅ Yes |
| `phase7-migrate-applications.ts` | Create application master | ✅ Yes |
| `phase7-migrate-assignments.ts` | Convert to individual assignments | ✅ Yes |
| `phase7-rollback.ts` | Rollback all changes | ✅ Yes |

### Script Location

All scripts are located in: `lib/db/migrations/`

### Running Scripts

#### Using TSX (Recommended)

```bash
# Dry run (test without making changes)
npx tsx lib/db/migrations/phase7-migrate-developers.ts --dry-run

# Verbose output
npx tsx lib/db/migrations/phase7-migrate-developers.ts --verbose

# Production run
npx tsx lib/db/migrations/phase7-migrate-developers.ts
```

#### Using npm scripts (if configured)

```bash
npm run migrate:developers -- --dry-run
npm run migrate:applications -- --dry-run
npm run migrate:assignments -- --dry-run
```

---

## Pre-Migration Checklist

### 1. Database Backup

**Critical:** Always backup before migration!

```bash
# Full database backup
mysqldump -u root -p sippa > sippa_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file exists and has reasonable size
ls -lh sippa_backup_*.sql
```

### 2. Verify Current State

```sql
-- Check developer_roles table exists and has 6 roles
SELECT * FROM developer_roles;

-- Check request_applications table exists
SHOW TABLES LIKE 'request_applications';

-- Check request_team_assignments table exists
SHOW TABLES LIKE 'request_team_assignments';

-- Count developers needing role assignment
SELECT COUNT(*) FROM users u
JOIN roles r ON r.id = u.role_id
WHERE r.code = 'DEVELOPER'
AND u.developer_role_id IS NULL;

-- Count NEW_APPLICATION requests needing application_id
SELECT COUNT(*) FROM requests
WHERE request_type = 'NEW_APPLICATION'
AND status IN ('APPROVED', 'IN_PROGRESS', 'COMPLETED')
AND application_id IS NULL;
```

### 3. Test on Staging

**Always test migration on staging environment first!**

1. Copy production database to staging
2. Run all migration scripts with `--dry-run`
3. Review output logs carefully
4. Run actual migration on staging
5. Verify data integrity
6. Test application functionality
7. Only proceed to production if staging is successful

---

## Migration Process

### Step 1: Migrate Developer Roles (15 minutes)

**Purpose:** Assign specific developer roles to all existing developers

**Command:**

```bash
# Dry run first (recommended)
npx tsx lib/db/migrations/phase7-migrate-developers.ts --dry-run --verbose

# Review output, then run for real
npx tsx lib/db/migrations/phase7-migrate-developers.ts --verbose
```

**Expected Output:**

```
============================================================
SIPPA Phase 7 Migration: Assign Developer Roles
============================================================
[INFO] Step 1: Fetching default developer role...
[SUCCESS] ✓ Default role: Back End Developer (BE)
[INFO] Step 2: Loading all developer roles...
[INFO] Step 3: Finding developers needing role assignment...
[INFO] Found 15 developers needing role assignment
[INFO] Step 4: Assigning developer roles...
[VERBOSE] User 5 (Ahmad Backend) → Back End Developer (BE)
[VERBOSE] User 8 (Siti Frontend) → Back End Developer (BE)
...
============================================================
Migration Summary:
  Total developers processed: 15
  Total developers updated: 15
  Errors: 0
[SUCCESS] ✓ Migration completed successfully!
============================================================
```

**What it does:**

- Finds all developers (role = DEVELOPER) without developer_role_id
- Assigns default role (BE - Backend Developer) to each
- You can customize mapping logic in `determineDeveloperRole()` function
- Updates users.developer_role_id field

**Customization (optional):**

Edit `phase7-migrate-developers.ts` and modify the `determineDeveloperRole()` function:

```typescript
function determineDeveloperRole(user: any): string | null {
  // Custom logic based on email
  if (user.email.includes('backend')) return 'BE';
  if (user.email.includes('frontend')) return 'FE';
  if (user.email.includes('qa')) return 'QA';
  
  // Custom logic based on name
  const name = user.name.toLowerCase();
  if (name.includes('analyst')) return 'SA';
  if (name.includes('writer')) return 'TW';
  
  // Return null to use default (BE)
  return null;
}
```

### Step 2: Migrate Applications (20 minutes)

**Purpose:** Create application master entries from approved NEW_APPLICATION requests

**Command:**

```bash
# Dry run first
npx tsx lib/db/migrations/phase7-migrate-applications.ts --dry-run --verbose

# Run for real
npx tsx lib/db/migrations/phase7-migrate-applications.ts --verbose

# Optional: Link RFC requests to applications
npx tsx lib/db/migrations/phase7-migrate-applications.ts --link-rfc --verbose
```

**Expected Output:**

```
============================================================
SIPPA Phase 7 Migration: Create Application Master Entries
============================================================
[INFO] Step 1: Finding NEW_APPLICATION requests needing migration...
[INFO] Found 45 NEW_APPLICATION requests to migrate
[INFO] Step 2: Loading existing application names...
[INFO] Step 3: Creating application master entries...
[VERBOSE] Request RQ-2024-001: "Aplikasi SIPPA HR" → "SIPPA HR"
[VERBOSE] Request RQ-2024-005: "Sistem Absensi Online" → "Absensi Online"
...
============================================================
Migration Summary:
  Total requests processed: 45
  Applications created: 45
  Requests updated: 45
  Errors: 0
[SUCCESS] ✓ Migration completed successfully!
============================================================
```

**What it does:**

- Finds approved NEW_APPLICATION requests without application_id
- Extracts clean application name from request title
- Ensures uniqueness (adds "(1)", "(2)" if duplicate)
- Creates entry in request_applications table
- Sets default version to "1.0.0"
- Updates request with application_id

**Optional RFC Linking:**

The `--link-rfc` flag attempts to automatically link existing RFC requests to applications by matching titles. This is a best-effort match and may need manual review.

```bash
npx tsx lib/db/migrations/phase7-migrate-applications.ts --link-rfc
```

### Step 3: Migrate Assignments (25 minutes)

**Purpose:** Convert team-based assignments to individual-based assignments

**Command:**

```bash
# Dry run first
npx tsx lib/db/migrations/phase7-migrate-assignments.ts --dry-run --verbose

# Run for real
npx tsx lib/db/migrations/phase7-migrate-assignments.ts --verbose
```

**Expected Output:**

```
============================================================
SIPPA Phase 7 Migration: Convert Team to Individual Assignments
============================================================
[INFO] Step 1: Checking for old table structure...
[SUCCESS] ✓ Old tables found - proceeding with migration
[INFO] Step 2: Checking if migration already complete...
[INFO] Step 3: Loading old request assignments...
[INFO] Found 120 old team assignments to migrate
[INFO] Step 4: Converting team assignments to individual assignments...
[VERBOSE] Request 15: Converting 3 team members to individual assignments
[VERBOSE] Request 18: Converting 5 team members to individual assignments
...
============================================================
Migration Summary:
  Old team assignments processed: 120
  New individual assignments created: 480
  Errors: 0
[SUCCESS] ✓ Migration completed successfully!

Next steps:
  1. Verify data in request_team_assignments table
  2. Test application functionality with new structure
  3. Once verified, old tables can be dropped:
     - DROP TABLE request_assignments;
     - DROP TABLE team_members;
     - DROP TABLE teams;
============================================================
```

**What it does:**

- Checks if old tables (teams, team_members, request_assignments) exist
- For each old team assignment, creates individual assignments for each team member
- Preserves assignment metadata (assigned_by, assigned_at, notes)
- Links to developer_role_id from users table
- Creates entries in request_team_assignments table

**Important Notes:**

- Old tables are NOT deleted automatically (safety)
- If old tables don't exist, migration is skipped (already migrated or fresh install)
- If request_team_assignments already has data, migration is skipped

---

## Verification

### Automated Verification

Run the verification script after all migrations:

```bash
npx tsx lib/db/migrations/phase7-migrate-assignments.ts --verify
```

**Expected Output:**

```
============================================================
Verifying Migration Results
============================================================
✓ Found 480 individual assignments
✓ All developers have developer_role_id assigned
✓ All approved NEW_APPLICATION requests have application_id
============================================================
[SUCCESS] ✓ All verification checks passed!
============================================================
```

### Manual Verification

#### 1. Developer Roles

```sql
-- All developers should have developer_role_id
SELECT u.id, u.name, u.email, dr.name as role_name
FROM users u
JOIN roles r ON r.id = u.role_id
LEFT JOIN developer_roles dr ON dr.id = u.developer_role_id
WHERE r.code = 'DEVELOPER';

-- Should return 0 rows
SELECT COUNT(*) as developers_without_role
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE r.code = 'DEVELOPER'
AND u.developer_role_id IS NULL;
```

#### 2. Application Master

```sql
-- Check created applications
SELECT * FROM request_applications ORDER BY created_at DESC;

-- Verify NEW_APPLICATION requests have application_id
SELECT r.id, r.request_no, r.title, r.application_id, ra.application_name
FROM requests r
LEFT JOIN request_applications ra ON ra.id = r.application_id
WHERE r.request_type = 'NEW_APPLICATION'
AND r.status IN ('APPROVED', 'IN_PROGRESS', 'COMPLETED');

-- Should return 0 rows
SELECT COUNT(*) as requests_without_app_id
FROM requests
WHERE request_type = 'NEW_APPLICATION'
AND status IN ('APPROVED', 'IN_PROGRESS', 'COMPLETED')
AND application_id IS NULL;
```

#### 3. Individual Assignments

```sql
-- Check new assignments
SELECT rta.*, u.name, dr.name as role_name
FROM request_team_assignments rta
JOIN users u ON u.id = rta.assigned_user_id
LEFT JOIN developer_roles dr ON dr.id = rta.developer_role_id
LIMIT 20;

-- Compare counts: old vs new
SELECT 
  (SELECT COUNT(*) FROM request_assignments) as old_team_assignments,
  (SELECT COUNT(*) FROM request_team_assignments) as new_individual_assignments;

-- Individual assignments should be >= team assignments
-- (each team member becomes an individual assignment)
```

#### 4. Data Integrity Checks

```sql
-- Check foreign key integrity
SELECT rta.id, rta.request_id
FROM request_team_assignments rta
LEFT JOIN requests r ON r.id = rta.request_id
WHERE r.id IS NULL;
-- Should return 0 rows (no orphaned assignments)

SELECT rta.id, rta.assigned_user_id
FROM request_team_assignments rta
LEFT JOIN users u ON u.id = rta.assigned_user_id
WHERE u.id IS NULL;
-- Should return 0 rows (no orphaned user references)
```

### Application Testing

After migration, test these workflows:

- [ ] Admin can view all requests with assignments
- [ ] Admin can assign developers to requests (new assignment UI)
- [ ] Developer can view assigned requests in dashboard
- [ ] Developer dashboard shows role badge
- [ ] Request detail shows team members with roles
- [ ] User can submit NEW_APPLICATION (version defaults to 1.0.0)
- [ ] User can submit RFC (application dropdown works, version validation works)
- [ ] Reports (Laptri, SLA) still function correctly

---

## Rollback Procedure

### When to Rollback

Rollback if:
- Migration completed with errors
- Data integrity checks fail
- Application functionality breaks
- Business critical issue discovered

### Rollback Process

**WARNING:** Rollback will DELETE migrated data. Ensure backup exists!

```bash
# Dry run to see what will be rolled back
npx tsx lib/db/migrations/phase7-rollback.ts --dry-run

# Run rollback (requires double confirmation)
npx tsx lib/db/migrations/phase7-rollback.ts
```

**Interactive Prompts:**

```
[DANGER] ⚠️  WARNING: This will DELETE migrated data!
[WARN] This action will:
  1. Delete all entries in request_team_assignments
  2. Delete all entries in request_applications
  3. Clear developer_role_id from all users
  4. Clear application_id from all requests

Are you sure you want to proceed? (yes/no): yes
Type "yes" again to confirm this destructive action (yes/no): yes

[INFO] Creating backup of migrated data...
[SUCCESS] ✓ Backup created with prefix: sippa_backup_2026-10-08T10-30-00
...
```

**What Rollback Does:**

1. Creates backup tables (unless `--no-backup` specified)
2. Deletes all request_team_assignments
3. Deletes all request_applications
4. Clears developer_role_id from users
5. Clears application_id from requests

**After Rollback:**

- Old tables (teams, team_members, request_assignments) remain intact
- Application will work with old structure
- You can fix issues and re-run migration

### Rollback Options

```bash
# Skip confirmation prompts (dangerous!)
npx tsx lib/db/migrations/phase7-rollback.ts --no-confirm

# Skip backup creation (not recommended)
npx tsx lib/db/migrations/phase7-rollback.ts --no-backup

# Dry run (recommended first)
npx tsx lib/db/migrations/phase7-rollback.ts --dry-run
```

---

## Troubleshooting

### Issue 1: "Default developer role 'BE' not found"

**Cause:** developer_roles table not seeded

**Solution:**

```bash
# Check if developer_roles table has data
mysql -u root -p sippa -e "SELECT * FROM developer_roles;"

# If empty, run seed
mysql -u root -p sippa < lib/db/seeds/001_developer_roles.sql
```

### Issue 2: "Old tables not found"

**Cause:** Running assignment migration on fresh install or already migrated system

**Solution:** This is expected. Migration will skip automatically. No action needed.

### Issue 3: Migration hangs or times out

**Cause:** Large dataset or slow database

**Solution:**

```bash
# Increase batch size in script
# Edit migration file and change batchSize: 100 to batchSize: 500

# Or run on database with better resources
```

### Issue 4: Duplicate application names

**Cause:** Multiple requests with same title

**Solution:** Script handles this automatically by appending "(1)", "(2)", etc. Manual review recommended:

```sql
SELECT * FROM request_applications
WHERE application_name LIKE '%(%';
```

### Issue 5: Some developers still missing developer_role_id

**Cause:** New developers added after migration

**Solution:** Re-run developer migration (safe to run multiple times):

```bash
npx tsx lib/db/migrations/phase7-migrate-developers.ts
```

### Issue 6: RFC requests not linked to applications

**Cause:** Automatic matching failed due to title differences

**Solution:** Manual linking required:

```sql
-- Find RFC requests without application_id
SELECT id, request_no, title FROM requests
WHERE request_type = 'RFC'
AND application_id IS NULL;

-- Manually link (example)
UPDATE requests
SET application_id = (SELECT id FROM request_applications WHERE application_name = 'SIPPA HR')
WHERE id = 123;
```

---

## FAQ

### Q: Can I run migrations multiple times?

**A:** Yes, all migrations are designed to be idempotent (safe to re-run). They skip data that's already migrated.

### Q: How long does migration take?

**A:** Depends on data volume:
- Small (< 100 requests): 10-15 minutes
- Medium (100-500 requests): 30-45 minutes
- Large (> 500 requests): 1-2 hours

### Q: Will migration affect current users?

**A:** Yes, application should be in maintenance mode during migration to prevent concurrent writes.

### Q: Can I customize developer role assignment logic?

**A:** Yes, edit `determineDeveloperRole()` function in `phase7-migrate-developers.ts`.

### Q: What if I have custom fields in old tables?

**A:** Migration only handles standard fields. Custom fields need manual migration or custom scripts.

### Q: Should I delete old tables after migration?

**A:** Not immediately. Keep for at least 2 weeks after successful production migration. Then:

```sql
-- After verifying everything works
DROP TABLE request_assignments;
DROP TABLE team_members;
DROP TABLE teams;
```

### Q: What if migration fails halfway?

**A:** Rollback, fix the issue, and re-run. All migrations support resuming from where they left off.

### Q: How do I customize default developer role?

**A:** Edit `DEFAULT_CONFIG` in `phase7-migrate-developers.ts`:

```typescript
const DEFAULT_CONFIG = {
  ...
  defaultDeveloperRoleCode: 'SA', // Change from 'BE' to 'SA' or other role
  ...
};
```

### Q: Can I migrate specific requests only?

**A:** Not directly. You'll need to modify scripts to add WHERE clauses filtering by request ID, date range, etc.

---

## Post-Migration Tasks

### Immediate (Week 1)

- [ ] Monitor application logs for errors
- [ ] Check user feedback
- [ ] Verify all critical workflows work
- [ ] Keep database backups for quick rollback if needed

### Short-term (Week 2-4)

- [ ] Review unlinked RFC requests and manually link
- [ ] Verify developer role assignments are correct
- [ ] Adjust any incorrectly assigned roles via Admin UI
- [ ] Update any custom reports or queries

### Long-term (After 1 month)

- [ ] Drop old tables (teams, team_members, request_assignments)
- [ ] Remove old code references to team-based structure
- [ ] Update documentation
- [ ] Archive migration scripts for future reference

---

## Support

If you encounter issues not covered in this guide:

1. Check application logs: `logs/sippa.log`
2. Review migration script output
3. Verify database state with SQL queries
4. Contact development team with:
   - Migration script output
   - Error messages
   - Database state (table counts, sample data)
   - Steps to reproduce

---

## Appendix: Quick Command Reference

```bash
# Full migration sequence (dry run)
npx tsx lib/db/migrations/phase7-migrate-developers.ts --dry-run
npx tsx lib/db/migrations/phase7-migrate-applications.ts --dry-run
npx tsx lib/db/migrations/phase7-migrate-assignments.ts --dry-run

# Full migration sequence (production)
npx tsx lib/db/migrations/phase7-migrate-developers.ts --verbose
npx tsx lib/db/migrations/phase7-migrate-applications.ts --verbose
npx tsx lib/db/migrations/phase7-migrate-assignments.ts --verbose

# Verification
npx tsx lib/db/migrations/phase7-migrate-assignments.ts --verify

# Rollback (if needed)
npx tsx lib/db/migrations/phase7-rollback.ts --dry-run
npx tsx lib/db/migrations/phase7-rollback.ts

# Backup database
mysqldump -u root -p sippa > backup.sql

# Restore database
mysql -u root -p sippa < backup.sql
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-08  
**Prepared by:** SIPPA Development Team

