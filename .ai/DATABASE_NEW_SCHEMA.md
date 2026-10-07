# SIPPA New Database Schema

## Overview
This document describes the new database schema for SIPPA after restructuring. All changes are based on the requirements in RESTRUCTURE_PLAN.md.

---

## Entity Relationship Diagram (Text Format)

```
┌─────────────────┐         ┌──────────────────┐
│     roles       │────────<│      users       │
│                 │    1:N  │                  │
│ - id (PK)       │         │ - id (PK)        │
│ - code          │         │ - name           │
│ - name          │         │ - email          │
└─────────────────┘         │ - password_hash  │
                            │ - role_id (FK)   │
┌─────────────────┐         │ - developer_role_id (FK) │
│ developer_roles │────────<│ - unit_id (FK)   │
│                 │    1:N  │ - is_active      │
│ - id (PK)       │         │ - created_at     │
│ - code          │         │ - updated_at     │
│ - name          │         └──────────────────┘
│ - description   │                  │
│ - is_active     │                  │ 1:N
│ - sort_order    │                  ▼
└─────────────────┘         ┌──────────────────────────┐
                            │  request_applications    │
┌─────────────────┐         │                          │
│     units       │         │ - id (PK)                │
│                 │         │ - application_name       │
│ - id (PK)       │         │ - description            │
│ - code          │         │ - current_version        │
│ - name          │         │ - created_by (FK→users)  │
│ - is_active     │         │ - created_at             │
└─────────────────┘         │ - updated_at             │
       │ 1:N                └──────────────────────────┘
       ▼                              │ 1:N
┌──────────────────┐                 ▼
│    requests      │◄────────────────┘
│                  │
│ - id (PK)        │
│ - request_no     │
│ - request_type   │
│ - application_id (FK→request_applications, NULLABLE) │
│ - title          │
│ - requested_version │
│ - description    │
│ - requester_id (FK→users) │
│ - requester_unit_id (FK→units) │
│ - urgency        │
│ - priority_id (FK→priorities) │
│ - devti_urusan   │
│ - technical_writer_id (FK→users) │
│ - team_leader_id (FK→users) │
│ - status_pengajuan │
│ - target_sla_hours │
│ - actual_completion_hours │
│ - sla_start_date │
│ - submitted_at   │
│ - approved_at    │
│ - rejected_at    │
│ - completed_at   │
│ - created_at     │
│ - updated_at     │
└──────────────────┘
       │ 1:N
       ▼
┌───────────────────────────────┐
│ request_team_assignments      │
│                               │
│ - id (PK)                     │
│ - request_id (FK→requests)    │
│ - assigned_user_id (FK→users) │
│ - developer_role_id (FK→developer_roles) │
│ - assigned_by (FK→users)      │
│ - assigned_at                 │
│ - unassigned_at               │
│ - notes                       │
│ - created_at                  │
│ - updated_at                  │
└───────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐
│  sla_policies   │         │  sla_holidays    │
│                 │         │                  │
│ - id (PK)       │         │ - id (PK)        │
│ - request_type  │         │ - holiday_date   │
│ - priority_id   │         │ - description    │
│ - target_business_days │  │ - is_active      │
│ - is_active     │         │ - created_at     │
│ - created_at    │         └──────────────────┘
│ - updated_at    │
└─────────────────┘
```

---

## Table Definitions

### 1. roles
**Purpose:** Define user roles (USER, ADMIN, DEVELOPER)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Role code (USER, ADMIN, DEVELOPER) |
| name | VARCHAR(100) | NOT NULL | Display name |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_roles_code (code)

**Seed Data:**
```sql
INSERT INTO roles (code, name) VALUES
('USER', 'Regular User'),
('ADMIN', 'Administrator'),
('DEVELOPER', 'Developer');
```

---

### 2. developer_roles (NEW)
**Purpose:** Define specific developer roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| code | VARCHAR(10) | UNIQUE, NOT NULL | Role code (SA, TW, BE, FE, QA, DM) |
| name | VARCHAR(100) | NOT NULL | Display name |
| description | TEXT | NULLABLE | Role description |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| sort_order | INT | DEFAULT 0 | Display order |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_dev_roles_code (code)
- KEY idx_dev_roles_active (is_active, sort_order)

**Seed Data:**
```sql
INSERT INTO developer_roles (code, name, description, sort_order, is_active) VALUES
('SA', 'System Analyst', 'Analyze system requirements and design solutions', 1, TRUE),
('TW', 'Technical Writer', 'Create technical documentation and user guides', 2, TRUE),
('BE', 'Back End Developer', 'Develop server-side logic and APIs', 3, TRUE),
('FE', 'Front End Developer', 'Develop user interface and client-side logic', 4, TRUE),
('QA', 'Quality Assurance', 'Test and ensure quality of applications', 5, TRUE),
('DM', 'Data Management', 'Manage database and data-related tasks', 6, TRUE);
```

---

### 3. units
**Purpose:** Organizational units

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Unit code |
| name | VARCHAR(200) | NOT NULL | Unit name |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_units_code (code)
- KEY idx_units_active (is_active)

---

### 4. users (UPDATED)
**Purpose:** System users with enhanced developer role support

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(200) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| role_id | INT | FK→roles, NOT NULL | User role |
| **developer_role_id** | INT | **FK→developer_roles, NULLABLE** | **Developer role (required if role=DEVELOPER)** |
| unit_id | INT | FK→units, NOT NULL | Organizational unit |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Constraints:**
- FOREIGN KEY (role_id) REFERENCES roles(id)
- **FOREIGN KEY (developer_role_id) REFERENCES developer_roles(id)**
- FOREIGN KEY (unit_id) REFERENCES units(id)
- **CHECK:** If role_id = (SELECT id FROM roles WHERE code='DEVELOPER'), then developer_role_id IS NOT NULL

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_users_email (email)
- KEY idx_users_role (role_id)
- **KEY idx_users_developer_role (developer_role_id)**
- KEY idx_users_unit (unit_id)
- KEY idx_users_active (is_active)

**Business Rules:**
1. Developer users MUST have developer_role_id set
2. Non-developer users MUST have developer_role_id = NULL
3. 1 developer = 1 developer_role (cannot have multiple roles)

---

### 5. request_applications (NEW)
**Purpose:** Master data for applications (created from approved NEW_APPLICATION requests)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| application_name | VARCHAR(255) | UNIQUE, NOT NULL | Application name |
| description | TEXT | NULLABLE | Application description |
| current_version | VARCHAR(50) | NOT NULL | Current version (e.g., "1.2.3") |
| created_by | INT | FK→users, NOT NULL | User who created (requester of first NEW_APPLICATION) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Constraints:**
- FOREIGN KEY (created_by) REFERENCES users(id)

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_app_name (application_name)
- KEY idx_app_created_by (created_by)

**Business Rules:**
1. Created automatically when NEW_APPLICATION request is approved
2. current_version updated when RFC request is completed
3. Cannot be manually created (only through approval workflow)
4. Serves as dropdown source for RFC applications

---

### 6. priorities
**Purpose:** Request priorities (existing, no change)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Priority code |
| name | VARCHAR(100) | NOT NULL | Display name |
| sort_order | INT | DEFAULT 0 | Display order |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_priorities_code (code)
- KEY idx_priorities_active (is_active, sort_order)

---

### 7. requests (MAJOR UPDATE)
**Purpose:** Core request management with enhanced fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| request_no | VARCHAR(50) | UNIQUE, NOT NULL | Generated request number (e.g., RQ-2024-001) |
| request_type | ENUM | NOT NULL | 'NEW_APPLICATION' or 'RFC' |
| **application_id** | INT | **FK→request_applications, NULLABLE** | **Linked application (NULL for NEW_APP, REQUIRED for RFC)** |
| title | VARCHAR(255) | NULLABLE | Application title (for NEW_APPLICATION) |
| **requested_version** | VARCHAR(50) | **NULLABLE** | **Requested version (REQUIRED for RFC)** |
| description | TEXT | NOT NULL | Detailed description |
| requester_id | INT | FK→users, NOT NULL | User who submitted |
| requester_unit_id | INT | FK→units, NOT NULL | Requester's unit |
| urgency | ENUM | NOT NULL | 'LOW', 'MEDIUM', 'HIGH' |
| priority_id | INT | FK→priorities, NULLABLE | Priority set by admin |
| **devti_urusan** | VARCHAR(255) | **NULLABLE** | **DevTI urusan/division** |
| **technical_writer_id** | INT | **FK→users, NULLABLE** | **Assigned technical writer** |
| **team_leader_id** | INT | **FK→users, NULLABLE** | **Team leader assigned by admin** |
| status_pengajuan | ENUM | NOT NULL | Status (SUBMITTED, VERIFICATION, APPROVED, REJECTED, IN_PROGRESS, COMPLETED) |
| target_sla_hours | INT | NULLABLE | Target SLA in hours (from sla_policies) |
| actual_completion_hours | INT | NULLABLE | Actual time taken (calculated) |
| sla_start_date | TIMESTAMP | NULLABLE | SLA calculation start point |
| submitted_at | TIMESTAMP | NULLABLE | When request was submitted |
| approved_at | TIMESTAMP | NULLABLE | When request was approved |
| rejected_at | TIMESTAMP | NULLABLE | When request was rejected |
| completed_at | TIMESTAMP | NULLABLE | When request was completed |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Constraints:**
- FOREIGN KEY (requester_id) REFERENCES users(id)
- FOREIGN KEY (requester_unit_id) REFERENCES units(id)
- FOREIGN KEY (priority_id) REFERENCES priorities(id)
- **FOREIGN KEY (application_id) REFERENCES request_applications(id)**
- **FOREIGN KEY (technical_writer_id) REFERENCES users(id)**
- **FOREIGN KEY (team_leader_id) REFERENCES users(id)**
- **CHECK:** If request_type = 'NEW_APPLICATION', title IS NOT NULL AND application_id IS NULL
- **CHECK:** If request_type = 'RFC', application_id IS NOT NULL AND requested_version IS NOT NULL

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_request_no (request_no)
- KEY idx_request_type (request_type)
- **KEY idx_request_application (application_id)**
- KEY idx_request_requester (requester_id)
- KEY idx_request_unit (requester_unit_id)
- KEY idx_request_status (status_pengajuan)
- KEY idx_request_priority (priority_id)
- **KEY idx_request_tw (technical_writer_id)**
- **KEY idx_request_leader (team_leader_id)**
- KEY idx_request_dates (submitted_at, approved_at, completed_at)

**Business Rules:**
1. NEW_APPLICATION: title required, application_id NULL, version defaults to "1.0.0"
2. RFC: application_id required, requested_version required, title NULL
3. requested_version must be > application.current_version (validated at app level)
4. technical_writer_id must reference user with developer_role = TW
5. SLA calculation starts from submitted_at

---

### 8. request_team_assignments (RENAMED & RESTRUCTURED)
**Purpose:** Track individual developer assignments with specific roles

**Old name:** request_assignments  
**New name:** request_team_assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| request_id | INT | FK→requests, NOT NULL | Request being assigned |
| assigned_user_id | INT | FK→users, NOT NULL | Developer assigned (must be role=DEVELOPER) |
| developer_role_id | INT | FK→developer_roles, NOT NULL | Role of developer in this assignment |
| assigned_by | INT | FK→users, NOT NULL | Admin who made assignment |
| assigned_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When assignment was made |
| unassigned_at | TIMESTAMP | NULLABLE | When assignment was removed (if any) |
| notes | TEXT | NULLABLE | Assignment notes |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Constraints:**
- FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
- FOREIGN KEY (assigned_user_id) REFERENCES users(id)
- FOREIGN KEY (developer_role_id) REFERENCES developer_roles(id)
- FOREIGN KEY (assigned_by) REFERENCES users(id)
- UNIQUE KEY idx_assignment_unique (request_id, assigned_user_id, developer_role_id, unassigned_at) WHERE unassigned_at IS NULL

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_assignment_request (request_id)
- KEY idx_assignment_user (assigned_user_id)
- KEY idx_assignment_role (developer_role_id)
- KEY idx_assignment_active (request_id, unassigned_at) -- for active assignments

**Business Rules:**
1. assigned_user_id must have role = DEVELOPER
2. One developer can be assigned multiple times with different roles (not recommended but allowed)
3. Active assignments have unassigned_at = NULL
4. Multiple developers can be assigned to same request
5. Typical assignment: 3-5 developers with different roles (BE, FE, QA, etc.)

---

### 9. request_attachments (NO CHANGE)
**Purpose:** Store request attachments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| request_id | INT | FK→requests, NOT NULL | Associated request |
| original_name | VARCHAR(255) | NOT NULL | Original filename |
| storage_key | VARCHAR(500) | NOT NULL | Storage path/key |
| mime_type | VARCHAR(100) | NOT NULL | File MIME type |
| size_bytes | BIGINT | NOT NULL | File size in bytes |
| uploaded_by | INT | FK→users, NOT NULL | User who uploaded |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

**Constraints:**
- FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
- FOREIGN KEY (uploaded_by) REFERENCES users(id)

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_attachment_request (request_id)
- KEY idx_attachment_uploader (uploaded_by)

---

### 10. request_status_histories (MINOR UPDATE)
**Purpose:** Track status changes with actor role

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| request_id | INT | FK→requests, NOT NULL | Associated request |
| from_status | VARCHAR(50) | NULLABLE | Previous status |
| to_status | VARCHAR(50) | NOT NULL | New status |
| changed_by | INT | FK→users, NOT NULL | User who made change |
| **actor_role** | **VARCHAR(20)** | **NOT NULL** | **Role of actor (USER, ADMIN, DEVELOPER)** |
| note | TEXT | NULLABLE | Change notes |
| **metadata** | **JSON** | **NULLABLE** | **Additional data (e.g., rejection reason)** |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When change occurred |

**Constraints:**
- FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
- FOREIGN KEY (changed_by) REFERENCES users(id)

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_history_request (request_id, created_at)
- KEY idx_history_user (changed_by)
- **KEY idx_history_status (to_status)**

---

### 11. request_progress (NO CHANGE)
**Purpose:** Track progress updates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| request_id | INT | FK→requests, NOT NULL | Associated request |
| progress_percent | INT | DEFAULT 0 | Progress percentage (0-100) |
| update_note | TEXT | NOT NULL | Progress note |
| updated_by | INT | FK→users, NOT NULL | User who updated |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Update timestamp |

**Constraints:**
- FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
- FOREIGN KEY (updated_by) REFERENCES users(id)
- CHECK (progress_percent >= 0 AND progress_percent <= 100)

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_progress_request (request_id, created_at)
- KEY idx_progress_user (updated_by)

---

### 12. sla_policies (UPDATED)
**Purpose:** Define SLA targets by request type and priority

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| request_type | ENUM | NOT NULL | 'NEW_APPLICATION' or 'RFC' |
| priority_id | INT | FK→priorities, NOT NULL | Priority level |
| **target_business_days** | **INT** | **NOT NULL** | **Target in business days (was target_hours)** |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

**Constraints:**
- FOREIGN KEY (priority_id) REFERENCES priorities(id)
- UNIQUE KEY idx_sla_unique (request_type, priority_id, is_active) WHERE is_active = TRUE

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_sla_type_priority (request_type, priority_id)
- KEY idx_sla_active (is_active)

**Seed Data Example:**
```sql
-- Assuming priority IDs: 1=High, 2=Medium, 3=Low
INSERT INTO sla_policies (request_type, priority_id, target_business_days, is_active) VALUES
('NEW_APPLICATION', 1, 10, TRUE), -- High: 10 business days
('NEW_APPLICATION', 2, 15, TRUE), -- Medium: 15 business days
('NEW_APPLICATION', 3, 20, TRUE), -- Low: 20 business days
('RFC', 1, 5, TRUE),              -- High: 5 business days
('RFC', 2, 10, TRUE),             -- Medium: 10 business days
('RFC', 3, 15, TRUE);             -- Low: 15 business days
```

---

### 13. sla_holidays (NEW)
**Purpose:** Define holidays for business days calculation

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| holiday_date | DATE | UNIQUE, NOT NULL | Holiday date |
| description | VARCHAR(255) | NOT NULL | Holiday name |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_holiday_date (holiday_date)
- KEY idx_holiday_active (is_active, holiday_date)

**Seed Data Example (Indonesian National Holidays 2024):**
```sql
INSERT INTO sla_holidays (holiday_date, description, is_active) VALUES
('2024-01-01', 'Tahun Baru 2024', TRUE),
('2024-02-08', 'Isra Mikraj', TRUE),
('2024-02-10', 'Tahun Baru Imlek 2575', TRUE),
('2024-03-11', 'Hari Suci Nyepi', TRUE),
('2024-03-29', 'Wafat Isa Almasih', TRUE),
('2024-04-10', 'Hari Raya Idul Fitri', TRUE),
('2024-04-11', 'Hari Raya Idul Fitri', TRUE),
('2024-05-01', 'Hari Buruh Internasional', TRUE),
('2024-05-09', 'Kenaikan Isa Almasih', TRUE),
('2024-05-23', 'Hari Raya Waisak', TRUE),
('2024-06-01', 'Hari Lahir Pancasila', TRUE),
('2024-06-17', 'Hari Raya Idul Adha', TRUE),
('2024-07-07', 'Tahun Baru Islam 1446', TRUE),
('2024-08-17', 'Hari Kemerdekaan RI', TRUE),
('2024-09-16', 'Maulid Nabi Muhammad', TRUE),
('2024-12-25', 'Hari Raya Natal', TRUE);
```

---

### 14. notifications (NO CHANGE)
**Purpose:** In-app notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| user_id | INT | FK→users, NOT NULL | Recipient |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| entity_type | VARCHAR(50) | NULLABLE | Related entity type (e.g., 'request') |
| entity_id | INT | NULLABLE | Related entity ID |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Constraints:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_notification_user (user_id, is_read, created_at)
- KEY idx_notification_entity (entity_type, entity_id)

---

### 15. audit_logs (NO CHANGE)
**Purpose:** Audit trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Primary key |
| actor_user_id | INT | FK→users, NULLABLE | User who performed action |
| actor_name | VARCHAR(255) | NOT NULL | Actor name (for failed logins) |
| module | VARCHAR(100) | NOT NULL | Module name |
| entity_type | VARCHAR(100) | NULLABLE | Entity type |
| entity_id | INT | NULLABLE | Entity ID |
| action | VARCHAR(100) | NOT NULL | Action performed |
| before_data | JSON | NULLABLE | Data before change |
| after_data | JSON | NULLABLE | Data after change |
| ip_address | VARCHAR(45) | NULLABLE | IP address |
| user_agent | TEXT | NULLABLE | User agent |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

**Constraints:**
- FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL

**Indexes:**
- PRIMARY KEY (id)
- KEY idx_audit_user (actor_user_id)
- KEY idx_audit_module (module)
- KEY idx_audit_entity (entity_type, entity_id)
- KEY idx_audit_action (action)
- KEY idx_audit_date (created_at)

---

## Removed Tables

### teams (REMOVED)
**Reason:** No longer using team concept; assignments are individual-based

### team_members (REMOVED)
**Reason:** Related to teams table, no longer needed

---

## Migration Strategy

### Phase 1: Create New Tables
```sql
CREATE TABLE developer_roles (...);
CREATE TABLE request_applications (...);
CREATE TABLE sla_holidays (...);
CREATE TABLE request_team_assignments_new (...); -- temp name
```

### Phase 2: Alter Existing Tables
```sql
ALTER TABLE users ADD COLUMN developer_role_id INT NULLABLE;
ALTER TABLE users ADD CONSTRAINT fk_users_developer_role 
  FOREIGN KEY (developer_role_id) REFERENCES developer_roles(id);

ALTER TABLE requests ADD COLUMN application_id INT NULLABLE;
ALTER TABLE requests ADD COLUMN requested_version VARCHAR(50) NULLABLE;
ALTER TABLE requests ADD COLUMN devti_urusan VARCHAR(255) NULLABLE;
ALTER TABLE requests ADD COLUMN technical_writer_id INT NULLABLE;
ALTER TABLE requests ADD COLUMN team_leader_id INT NULLABLE;
-- ... add other new columns

ALTER TABLE sla_policies ADD COLUMN target_business_days INT NOT NULL DEFAULT 0;
-- After data migration, remove old target_hours column
```

### Phase 3: Data Migration
```sql
-- Migrate existing NEW_APPLICATION requests to request_applications
INSERT INTO request_applications (application_name, description, current_version, created_by, created_at)
SELECT title, description, '1.0.0', requester_id, created_at
FROM requests
WHERE request_type = 'NEW_APPLICATION' 
  AND status_pengajuan IN ('APPROVED', 'COMPLETED')
  AND title IS NOT NULL;

-- Update requests with application_id
UPDATE requests r
INNER JOIN request_applications ra ON ra.application_name = r.title
SET r.application_id = ra.id
WHERE r.request_type = 'NEW_APPLICATION';

-- Migrate team assignments to individual assignments
-- This requires manual review or admin UI for mapping
-- Default: Assign all team members as BE (Backend) role
INSERT INTO request_team_assignments_new 
  (request_id, assigned_user_id, developer_role_id, assigned_by, assigned_at)
SELECT 
  ra.request_id,
  tm.user_id,
  (SELECT id FROM developer_roles WHERE code = 'BE'), -- default to BE
  ra.assigned_by,
  ra.assigned_at
FROM request_assignments ra
INNER JOIN team_members tm ON tm.team_id = ra.team_id
WHERE ra.unassigned_at IS NULL;

-- Convert SLA hours to business days (approximation: 8 hours = 1 day)
UPDATE sla_policies
SET target_business_days = CEIL(target_hours / 8);
```

### Phase 4: Cleanup
```sql
-- Drop old tables
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS request_assignments; -- after renaming new one

-- Rename new assignment table
RENAME TABLE request_team_assignments_new TO request_team_assignments;
```

---

## Business Days Calculation

### Pseudo-code for SLA Calculation

```typescript
function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let businessDays = 0;
  let currentDate = new Date(startDate);
  
  // Fetch holidays from database
  const holidays = await getHolidays(); // ['2024-01-01', '2024-08-17', ...]
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0=Sunday, 6=Saturday
    const dateString = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    
    // Count if: not weekend AND not holiday
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
      businessDays++;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
}

// Usage
const submitted = new Date('2024-01-10'); // Wednesday
const completed = new Date('2024-01-15'); // Monday
const businessDays = calculateBusinessDays(submitted, completed); 
// Result: 4 days (Wed, Thu, Fri, Mon - excluding weekend)
```

---

## Validation Rules Summary

### User Level
1. Developer must have developer_role_id set
2. Non-developer must have developer_role_id = NULL
3. Email must be unique

### Request Level
1. NEW_APPLICATION:
   - title required
   - application_id = NULL
   - requested_version = NULL (internally set to "1.0.0")
   
2. RFC:
   - application_id required
   - requested_version required
   - requested_version > application.current_version
   - title = NULL

3. Version format: Semantic versioning (x.y.z)

### Assignment Level
1. assigned_user_id must be a developer (role = DEVELOPER)
2. developer_role_id must match user's developer_role_id (or can differ for flexibility)
3. Cannot assign same user with same role multiple times (unless previous assignment is unassigned)
4. technical_writer_id must be user with developer_role = TW

### SLA Level
1. Holidays must not overlap
2. Business days exclude: weekends + holidays
3. SLA starts from submitted_at
4. Target calculated from sla_policies based on request_type + priority

---

## Indexes Strategy

### Performance Considerations
1. **Frequent Joins:**
   - Foreign keys automatically indexed
   - Add composite indexes for common join patterns

2. **Common Filters:**
   - status_pengajuan (requests)
   - is_active (multiple tables)
   - created_at / submitted_at (date range queries)

3. **Search Operations:**
   - email (users) - already unique
   - request_no (requests) - already unique
   - application_name (request_applications) - already unique

4. **Reporting Queries:**
   - Composite index on requests: (status_pengajuan, completed_at)
   - Index on request_team_assignments: (request_id, unassigned_at)

---

## Storage Estimates

### Assumptions
- 1000 requests per year
- Average 5 developers per request
- Average 3 attachments per request
- Average 10 status changes per request
- Average 5 progress updates per request

### Estimated Row Counts (per year)
- requests: 1,000
- request_team_assignments: 5,000 (5 per request)
- request_attachments: 3,000 (3 per request)
- request_status_histories: 10,000 (10 per request)
- request_progress: 5,000 (5 per request)
- notifications: ~20,000 (multiple per status change)
- audit_logs: ~30,000 (all mutations logged)

### Total Storage (rough estimate per year)
- Main tables: ~50 MB
- Indexes: ~20 MB
- Audit/History: ~30 MB
- **Total: ~100 MB per year**

After 5 years: ~500 MB (very manageable)

---

## Security Considerations

1. **Password Storage:**
   - Use bcrypt with salt
   - Min 10 rounds
   - Never store plain passwords

2. **Sensitive Data:**
   - Audit logs: Exclude password_hash
   - API responses: Never return password_hash

3. **Access Control:**
   - Enforce at application level
   - Database constraints as backup
   - Row-level security for requests (user sees only own requests)

4. **Audit Trail:**
   - All mutations logged
   - Include IP + User Agent
   - Sanitize before storing

---

## Backup & Recovery

1. **Daily Backups:**
   - Full database dump
   - Retention: 30 days

2. **Critical Tables:**
   - requests
   - request_attachments
   - audit_logs

3. **Recovery Point Objective (RPO):** 1 day
4. **Recovery Time Objective (RTO):** 4 hours

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-06  
**Status:** DRAFT - For Review
