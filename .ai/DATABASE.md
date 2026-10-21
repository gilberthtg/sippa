# SIPPA Database Schema (v1.0)

**Last Updated:** 2026-10-12  
**Status:** Production Schema (after Phase 1-8 restructure)

## Overview

This document describes the production database schema for SIPPA after the Phase 1-8 restructure. Major changes include:
- Individual-based developer assignments (not team-based)
- Application master data management
- Developer role specialization (SA, TW, BE, FE, QA, DM)
- Business days SLA calculation (not calendar hours)
- Version management for RFC requests

## Core Tables

### users
- id (PK)
- name
- email (UNIQUE)
- password_hash
- role_id (FK → roles)
- **developer_role_id** (FK → developer_roles, NULLABLE, REQUIRED for developers)
- unit_id (FK → units)
- is_active
- created_at
- updated_at

**Constraints:**
- If role = DEVELOPER, developer_role_id MUST NOT be NULL
- 1 developer = 1 developer_role

### roles
- id (PK)
- code (UNIQUE: USER, ADMIN, DEVELOPER)
- name
- created_at
- updated_at

### developer_roles (NEW)
- id (PK)
- code (UNIQUE: SA, TW, BE, FE, QA, DM)
- name
  - SA: System Analyst
  - TW: Technical Writer
  - BE: Back End Developer
  - FE: Front End Developer
  - QA: Quality Assurance
  - DM: Data Management
- description
- is_active
- sort_order
- created_at
- updated_at

### units
- id (PK)
- code (UNIQUE)
- name
- is_active
- created_at
- updated_at

### request_applications (NEW)
**Purpose:** Master data for applications (auto-created from approved NEW_APPLICATION)
- id (PK)
- application_name (UNIQUE)
- description
- current_version (e.g., "1.2.3")
- created_by (FK → users)
- created_at
- updated_at

**Business Rules:**
- Created automatically when NEW_APPLICATION is approved
- current_version updated when RFC is completed
- Cannot be manually created (only through approval workflow)
- Source for RFC application dropdown

### requests
- id (PK)
- request_no (UNIQUE, auto-generated: RQ-YYYY-NNN)
- request_type (ENUM: NEW_APPLICATION, RFC)
- **application_id** (FK → request_applications, NULL for NEW_APP, REQUIRED for RFC)
- title (for NEW_APPLICATION)
- **requested_version** (for RFC, must be > current_version)
- description
- requester_id (FK → users)
- requester_unit_id (FK → units)
- urgency (ENUM: LOW, MEDIUM, HIGH)
- priority_id (FK → priorities, set by admin)
- **devti_urusan_id** (FK → devteam_units, NULLABLE)
- **technical_writer_id** (FK → users with developer_role=TW)
- **team_leader_id** (FK → users, any role)
- status (ENUM: SUBMITTED, IN_REVIEW, APPROVED, REJECTED, ONGOING, DONE, ON_HOLD)
- target_sla_hours
- actual_completion_hours
- sla_start_date
- sla_paused_at
- sla_paused_duration_hours
- on_hold_reason
- submitted_at
- approved_at
- rejected_at
- completed_at
- created_at
- updated_at

**Constraints:**
- NEW_APPLICATION: title NOT NULL, application_id NULL
- RFC: application_id NOT NULL, requested_version NOT NULL
- technical_writer_id must reference user with developer_role = TW

### request_team_assignments (RENAMED from request_assignments)
**Purpose:** Individual developer assignments with specific roles
- id (PK)
- request_id (FK → requests, CASCADE DELETE)
- assigned_user_id (FK → users with role=DEVELOPER)
- developer_role_id (FK → developer_roles)
- assigned_by (FK → users, admin)
- assigned_at
- unassigned_at (NULL for active assignments)
- notes
- created_at
- updated_at

**Business Rules:**
- Multiple developers can be assigned to one request
- Each assignment specifies the developer's role in this request
- Typical assignment: 3-5 developers (BE, FE, QA, etc.)
- Active assignments have unassigned_at = NULL

### request_status_histories
- id (PK)
- request_id (FK → requests, CASCADE DELETE)
- from_status
- to_status
- changed_by (FK → users)
- **actor_role** (USER, ADMIN, DEVELOPER)
- note
- **metadata** (JSON, for rejection reasons, etc.)
- created_at

### request_attachments
- id (PK)
- request_id (FK → requests, CASCADE DELETE)
- original_name
- storage_key
- mime_type
- size_bytes
- uploaded_by (FK → users)
- created_at

### request_progress
- id (PK)
- request_id (FK → requests, CASCADE DELETE)
- progress_percent (0-100)
- update_note
- updated_by (FK → users)
- created_at

### priorities
- id (PK)
- code (UNIQUE)
- name
- sort_order
- is_active
- created_at
- updated_at

### sla_policies
- id (PK)
- request_type (ENUM: NEW_APPLICATION, RFC)
- priority_id (FK → priorities)
- **target_business_days** (was target_hours)
- is_active
- created_at
- updated_at

**Business Days Calculation:**
- Mon-Fri only (exclude Sat, Sun)
- Exclude holidays from sla_holidays table
- Start: submitted_at
- End: completed_at or NOW()

### sla_holidays (NEW)
**Purpose:** Define holidays for business days calculation
- id (PK)
- holiday_date (DATE, UNIQUE)
- description
- is_active
- created_at

**Seed Data:** Indonesian national holidays (61 entries for 2024-2026)

### audit_logs
- id (PK)
- actor_user_id (NULLABLE for failed logins)
- actor_name
- module
- entity_type
- entity_id
- action
- before_data (JSON)
- after_data (JSON)
- ip_address
- user_agent
- created_at

### notifications
- id (PK)
- user_id (FK → users)
- type
- title
- message
- entity_type
- entity_id
- is_read
- created_at

## Deprecated Tables

The following tables were removed during Phase 1 restructure and are no longer part of the database:
- `teams` - Removed (replaced by individual assignments)
- `team_members` - Removed (no longer needed)
- `request_assignments` - Renamed to `request_team_assignments` with new structure

**Note:** These tables have been completely removed from the schema. All functionality now uses individual developer assignments through the `request_team_assignments` table.

## Indexes

### Performance Indexes
- requests: idx_request_type, idx_request_application, idx_request_requester, idx_request_status
- request_team_assignments: idx_assignment_request, idx_assignment_user, idx_assignment_role
- request_applications: idx_app_name, idx_app_created_by
- users: idx_users_role, idx_users_developer_role, idx_users_unit
- developer_roles: idx_dev_roles_active
- sla_holidays: idx_holiday_date, idx_holiday_active

### Unique Constraints
- users.email
- roles.code
- developer_roles.code
- units.code
- priorities.code
- requests.request_no
- request_applications.application_name
- sla_holidays.holiday_date

## Foreign Key Relationships

```
roles (1) ──< users (N)
developer_roles (1) ──< users (N)
units (1) ──< users (N)
users (1) ──< request_applications (N) [created_by]
users (1) ──< requests (N) [requester_id, technical_writer_id, team_leader_id]
devteam_units (1) ──< requests (N) [devti_urusan_id]
request_applications (1) ──< requests (N) [application_id]
requests (1) ──< request_team_assignments (N)
requests (1) ──< request_status_histories (N)
requests (1) ──< request_attachments (N)
requests (1) ──< request_progress (N)
users (1) ──< request_team_assignments (N) [assigned_user_id, assigned_by]
developer_roles (1) ──< request_team_assignments (N)
priorities (1) ──< requests (N)
priorities (1) ──< sla_policies (N)
```

## Reporting

### Laptri (Quarterly Report)
- Source: completed requests grouped by quarter
- Metrics: count by type, avg completion time, monthly trends
- **New:** Developer role distribution and involvement

### SLA Achievement Report
- Source: requests with target_sla_hours vs actual_completion_hours
- Calculation: **Business days** (Mon-Fri, exclude holidays)
- Metrics: total requests, met/exceeded, achievement rate, trends

### Developer Workload Report
- Source: request_team_assignments + requests
- Metrics: active assignments per developer, by role, by SLA status

## Migration History

- **Phase 1 (2026-10-06):** New tables (developer_roles, request_applications, sla_holidays, request_team_assignments)
- **Phase 1 (2026-10-06):** Updated users (developer_role_id), requests (application_id, requested_version, etc.)
- **Phase 1 (2026-10-06):** Updated sla_policies (target_hours → target_business_days)
- **Phase 7 (2026-10-08):** Data migration from old structure to new
- **Phase 7 (2026-10-08):** Removed teams, team_members, old request_assignments
- **2026-10-19:** `requests.devti_urusan` (varchar) → `requests.devti_urusan_id` (int FK → units)
- **2026-10-21:** `devteam_units` table created (DevTI Urusan master, FK on requests not yet moved)
- **2026-10-21:** `requests.devti_urusan_id` FK moved: units → devteam_units (migration 0005; old units-based values not present in devteam_units set to NULL)

## Database Statistics (Estimated)

### Storage Estimates
- requests: ~100 MB/year (10,000 requests × 10 KB avg)
- request_attachments: ~5 GB/year (10,000 requests × 2 files × 250 KB avg)
- request_team_assignments: ~5 MB/year (10,000 requests × 4 assignments × 128 bytes)
- audit_logs: ~50 MB/year (100,000 actions × 512 bytes)
- Total: ~5.2 GB/year

### Performance Considerations
- All foreign keys indexed
- Composite indexes on frequently filtered columns
- Date range indexes for reporting
- Business days calculation cached for common date ranges

---

## New Tables (Document Management)

### devteam_units (NEW)
- id (PK, int, auto)
- name (varchar 200, NOT NULL)
- is_active (boolean, default true)
- created_at
- updated_at

**Purpose:** Master data for DevTI Urusan (urusan pengembangan) — separate from organizational units.
**Seed Data:**
1. URUSAN PENGEMBANGAN PRODUK TI AKADEMIK
2. URUSAN PENGEMBANGAN PRODUK TI NON-AKADEMIK
3. URUSAN PENGEMBANGAN TI STRATEGIS
- id (PK, smallint, auto)
- name (varchar 200, UNIQUE)
- sort_order (smallint, default 0)
- is_active (boolean, default true)
- created_at, updated_at

### service_document_types
- id (PK, smallint, auto)
- request_type (ENUM: new_application, rfc)
- document_type_id (FK ? document_types)
- is_required (boolean, default true)
- sort_order (smallint, default 0)
- created_at
- UNIQUE(request_type, document_type_id)

### request_documents
- id (PK, bigint, auto)
- request_id (FK ? requests, CASCADE DELETE)
- document_type_id (FK ? document_types)
- original_name (varchar 255)
- storage_key (varchar 500, UNIQUE)
- mime_type (varchar 100)
- size_bytes (bigint)
- uploaded_by (FK ? users)
- uploaded_at (timestamp)
- UNIQUE(request_id, document_type_id) -- 1 file per type per request