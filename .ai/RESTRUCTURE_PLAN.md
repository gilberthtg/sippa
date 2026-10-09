# SIPPA Restructure Plan

## Overview
Dokumen ini berisi rencana restrukturisasi database dan flow aplikasi SIPPA berdasarkan requirement baru yang mencakup perubahan struktur database, role developer yang lebih detail, dan flow aplikasi yang diperbarui.

## Implementation Status

### ✅ PHASE 1: Database Schema Restructuring (COMPLETE)
- Status: **COMPLETE** (2026-10-06)
- See: `.ai/PHASE_1_COMPLETE.md` for details

### ✅ PHASE 2: Flow Changes - Role User (COMPLETE)
- Status: **COMPLETE** (2026-10-07)
- Summary: Single-page request form with conditional rendering for NEW_APPLICATION and RFC
- Key Changes:
  - ✅ Single-page form (replaced 5-step wizard)
  - ✅ Conditional rendering based on request type
  - ✅ NEW_APPLICATION: Title input, auto-version "1.0.0"
  - ✅ RFC: Application dropdown, version validation (must be > current)
  - ✅ Real-time version validation with helpful error messages
  - ✅ Auto-suggest next version for RFC
  - ✅ Version validation utilities (parseVersion, compareVersions, validateVersionProgression)
  - ✅ Server-side validation and application lookup
- Files:
  - Created: `lib/utils/version.ts`, `components/requests/request-form-single.tsx`
  - Modified: `app/actions/requests.ts`, `lib/validations/request.ts`, `app/(user)/requests/new/page.tsx`
- See: `.ai/SESSION_LOG.md` (2026-10-07 entry) for full details

### 🔄 PHASE 3: Flow Changes - Role Admin (COMPLETE)
- Status: **COMPLETE** (2026-10-07)
- Summary: Enhanced assignment with developer roles, technical writer, team leader, and individual-based assignment
- Key Changes:
  - ✅ Team assignment dialog with DevTI Urusan, team leader, technical writer, and multiple developers
  - ✅ Application master auto-creation when NEW_APPLICATION approved
  - ✅ Dashboard metrics: "Belum Di-assign" and Developer Role Distribution
  - ✅ Comprehensive validation and notification system
- Files:
  - Created: team-assignment-dialog.tsx, developer-role-distribution-widget.tsx, checkbox.tsx
  - Modified: admin-requests.ts, request-admin-actions.tsx, dashboard components, notification templates
- See: `.ai/PHASE_3_COMPLETE.md` for full details

### ✅ PHASE 4: Flow Changes - Role Developer (COMPLETE)
- Status: **COMPLETE** (2026-10-07)
- Summary: Developer role-specific views and comprehensive team composition display
- Key Changes:
  - ✅ Developer role badge displayed prominently (dashboard, request list, request detail)
  - ✅ "My Role" column in request table showing developer's specific role
  - ✅ Full team composition visible (team leader, technical writer, peer developers)
  - ✅ Current user highlighted in team member list
  - ✅ Role color scheme and utilities (SA purple, TW blue, BE green, FE yellow, QA red, DM indigo)
  - ✅ TeamInfoCard component for unified team display
  - ✅ Enhanced server actions with role and team data
- Files:
  - Created: role-badge.ts, role-badge.tsx, team-info-card.tsx
  - Modified: developer-requests.ts, developer dashboard/table/list components, request detail page
- See: `.ai/PHASE_4_COMPLETE.md` for full details

### ✅ PHASE 5: Reporting Updates (COMPLETE)
- Status: **COMPLETE** (2026-10-07)
- See: `.ai/PHASE_5_COMPLETE.md` for details

### ✅ PHASE 6: Master Data Management (COMPLETE)
- Status: **COMPLETE** (2026-10-08)
- See: `.ai/PHASE_6_COMPLETE.md` for details

### ✅ PHASE 7: Data Migration Strategy (COMPLETE)
- Status: **COMPLETE** (2026-10-08)
- Summary: Comprehensive migration scripts and utilities for safe data transformation
- Key Changes:
  - ✅ Migration utilities library (version parsing, business days calculation, data validation)
  - ✅ Developer migration script (assign developer roles to existing developers)
  - ✅ Application migration script (create application master from NEW_APPLICATION)
  - ✅ Assignment migration script (convert team to individual assignments)
  - ✅ Rollback script (comprehensive rollback with auto-backup)
  - ✅ Migration guide (60-page documentation with step-by-step instructions)
  - ✅ Dry-run mode support on all scripts
  - ✅ Automated verification procedures
  - ✅ Emergency rollback procedures
- Files:
  - Created: migration.ts, phase7-migrate-developers.ts, phase7-migrate-applications.ts, phase7-migrate-assignments.ts, phase7-rollback.ts, MIGRATION_GUIDE.md
  - Total: 6 files, ~3,300 lines
- See: `.ai/PHASE_7_COMPLETE.md` for full details

## PHASE 1: Database Schema Restructuring

### 1.1 Perubahan Tabel Users & Roles

#### A. Tabel `roles` (Update)
Tetap dipertahankan dengan struktur:
- id
- code (USER, ADMIN, DEVELOPER)
- name
- created_at
- updated_at

#### B. Tabel `developer_roles` (NEW)
Tabel baru untuk role developer yang lebih spesifik:
- id
- code (SA, TW, BE, FE, QA, DM)
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

#### C. Tabel `users` (Update)
Tambahkan field untuk developer role:
- id
- name
- email
- password_hash
- role_id (FK → roles)
- **developer_role_id** (FK → developer_roles, NULLABLE, hanya diisi jika role = DEVELOPER)
- unit_id
- is_active
- created_at
- updated_at

**Business Rule:**
- Jika user.role_id = DEVELOPER, maka developer_role_id WAJIB diisi
- 1 developer hanya memiliki 1 developer_role

---

### 1.2 Perubahan Tabel Requests

#### A. Tabel `request_applications` (NEW)
Tabel master untuk menyimpan daftar aplikasi yang pernah diajukan (New Application):
- id
- application_name (UNIQUE)
- description
- current_version (versi terakhir yang disetujui)
- created_by (FK → users)
- created_at
- updated_at

**Purpose:** Digunakan sebagai referensi untuk RFC agar nama aplikasi konsisten

#### B. Tabel `requests` (Update Major)
Perubahan signifikan pada tabel requests:

**Fields yang dipertahankan:**
- id
- request_no (auto-generated)
- request_type (NEW_APPLICATION, RFC)
- requester_id (FK → users)
- requester_unit_id (FK → units)
- status
- submitted_at
- approved_at
- rejected_at
- completed_at
- created_at
- updated_at

**Fields baru:**
- **application_id** (FK → request_applications, NULLABLE)
  - NULL untuk NEW_APPLICATION (akan dibuat setelah approved)
  - REQUIRED untuk RFC (pilih dari existing applications)
- **title** (untuk NEW_APPLICATION)
- **requested_version** (untuk RFC)
  - Wajib diisi untuk RFC
  - Validasi: harus lebih besar dari current_version
- description (detail kebutuhan)
- urgency (LOW, MEDIUM, HIGH)
- priority_id (FK → priorities, diisi oleh admin)

**Fields untuk Admin Assignment:**
- **devti_urusan** (urusan DevTI yang handle request ini)
- **technical_writer_id** (FK → users with developer_role = TW)
- **team_leader_id** (FK → users, ketua tim yang dipilih admin)
- **status_pengajuan** (ENUM: DRAFT, SUBMITTED, VERIFICATION, APPROVED, REJECTED, IN_PROGRESS, COMPLETED)

**SLA Fields:**
- target_sla_hours (calculated from sla_policies)
- actual_completion_hours (calculated)
- sla_start_date (dimulai dari submitted_at)
- sla_pause_date (jika ada pause, for future use)

**Fields yang dihapus/diganti:**
- ~~title~~ → diganti dengan application_name (dari FK) atau title (untuk new app)
- ~~urgency~~ → tetap ada tapi dipisahkan dengan priority

---

### 1.3 Tabel Request Assignments (Update)

#### Tabel `request_team_assignments` (RENAME dari request_assignments)
Karena sekarang assignment dilakukan per individual dengan role spesifik:

- id
- request_id (FK → requests)
- assigned_user_id (FK → users with role = DEVELOPER)
- developer_role (FK → developer_roles)
- assigned_by (FK → users, admin yang assign)
- assigned_at
- unassigned_at (NULLABLE)
- notes
- created_at
- updated_at

**Business Rules:**
- Admin bisa assign beberapa developer dengan role berbeda untuk 1 request
- Minimum assignment: 1 BE atau 1 FE (tergantung jenis pekerjaan)
- Typical assignment: BE (1-2), FE (1-2), QA (1), dll
- Tidak ada team, assignment langsung ke individual dengan role spesifik

**Hapus tabel:**
- ~~teams~~ (tidak digunakan lagi)
- ~~team_members~~ (tidak digunakan lagi)

---

### 1.4 SLA Calculation (Business Days)

#### Tabel `sla_policies` (Update)
- id
- request_type (NEW_APPLICATION, RFC)
- priority_id (FK → priorities)
- **target_business_days** (ganti dari target_hours)
- is_active
- created_at
- updated_at

#### Tabel `sla_holidays` (NEW)
Untuk exclude weekend dan hari libur nasional:
- id
- holiday_date (DATE, UNIQUE)
- description (nama hari libur)
- is_active
- created_at

**SLA Calculation Logic:**
- Hitung hanya hari kerja (Senin - Jumat)
- Exclude Sabtu & Minggu
- Exclude tanggal di tabel `sla_holidays`
- Start: submitted_at
- End: completed_at atau NOW() (untuk ongoing)

---

### 1.5 Request Attachments (No Change)
Tetap seperti sekarang, tidak ada perubahan struktur.

---

### 1.6 Request Status History (Update)
Tambahkan field untuk track perubahan yang lebih detail:

- id
- request_id
- from_status
- to_status
- changed_by (FK → users)
- **actor_role** (USER, ADMIN, DEVELOPER)
- note
- metadata (JSON, untuk data tambahan seperti rejection reason)
- created_at

---

### 1.7 Audit Logs (No Major Change)
Struktur existing sudah baik, pertahankan.

---

### 1.8 Notifications (No Major Change)
Struktur existing sudah baik, pertahankan.

---

## PHASE 2: Flow Changes - Role User

### 2.1 Simplified Request Form (1 Page)

**Current:** Multi-step form
**New:** Single page dengan progressive disclosure

#### Form Structure:

**Section 1: Jenis Permintaan**
- Radio Button: New Application / RFC
- Conditional rendering based on selection

**Section 2: Informasi Aplikasi**

**Jika NEW APPLICATION:**
- Title/Nama Aplikasi (Text Input)
- Versi: Default "1.0.0" (Read-only, hidden)
- Description (Textarea)

**Jika RFC:**
- Pilih Aplikasi (Dropdown dari `request_applications`)
  - Show: application_name + current_version
- Versi Baru yang Diminta (Text Input dengan validasi)
  - Format: x.y.z (semantic versioning)
  - **Validation:** Must be greater than current_version
  - Error message: "Versi harus lebih besar dari versi saat ini (current: X.Y.Z)"
- Description (Textarea untuk perubahan yang diminta)

**Section 3: Detail Kebutuhan**
- Urgency (Dropdown: Low, Medium, High)
- Detail Kebutuhan (Rich Text Editor atau Textarea)

**Section 4: Lampiran**
- File Upload (Multiple, max 5 files)
- Preview uploaded files

**Section 5: Review**
- Summary semua data yang diinput
- Checkbox konfirmasi
- Button: Submit / Save as Draft

#### Validation Rules:
1. NEW APPLICATION:
   - Title required, min 3 characters
   - Description required, min 20 characters
   - Default version = "1.0.0" (auto-generated, not editable by user)

2. RFC:
   - Application selection required
   - Requested version required
   - **Version validation:**
     - Format: semantic versioning (x.y.z)
     - Must be greater than current_version of selected application
     - Example: If current = 1.2.3, allowed: 1.2.4, 1.3.0, 2.0.0
   - Description required

3. Both:
   - Urgency required
   - At least 1 file attachment recommended (not required)

---

### 2.2 Request Relationship Management

#### When NEW APPLICATION is Approved:
1. Create entry in `request_applications` table:
   - application_name = request.title
   - description = request.description
   - current_version = "1.0.0"
   - created_by = request.requester_id

2. Update `requests.application_id` = newly created application_id

#### When RFC is Completed:
1. Update `request_applications.current_version` = request.requested_version
2. Keep history in requests table (don't delete old records)

---

## PHASE 3: Flow Changes - Role Admin

### 3.1 Enhanced Request Management

#### When Request is Submitted (status: SUBMITTED)
Admin dapat melihat request baru dan melakukan tindakan:

**Actions Available:**
1. **Verify & Process:**
   - Set Priority (High, Medium, Low) - required
   - Set Status Pengajuan (Approved / Rejected) - required
   - If Rejected: Rejection reason (required)
   - If Approved: Proceed to assignment

2. **Assignment (Only after Approved):**
   
   **Form Assi gment:**
   
   a. **DevTI Urusan** (Text Input)
      - Urusan/divisi di DevTI yang handle
      - Example: "Pengembangan Aplikasi Internal"
   
   b. **Ketua Tim** (Dropdown)
      - Pilih dari semua users (any role)
      - Bisa admin, bisa user biasa, bisa developer
      - Role: Project coordinator/liaison
   
   c. **Technical Writer** (Dropdown)
      - Pilih dari users where role=DEVELOPER AND developer_role=TW
      - Required
   
   d. **Assign Team Members** (Multiple Selection)
      - Filter users: role=DEVELOPER
      - Show: Name, Developer Role (BE/FE/SA/QA/DM)
      - Checkboxes untuk select multiple
      - Required: At least 1 developer
      - Typical: 3-5 developers with different roles
   
   Example Assignment:
   ```
   ☑ Ahmad Nur (Backend Developer)
   ☑ Siti Aminah (Frontend Developer)
   ☑ Budi Santoso (Quality Assurance)
   ☐ Dewi Lestari (Data Management)
   ☑ Eko Prasetyo (System Analyst)
   ```

   e. **SLA Target** (Auto-calculated)
      - Based on: request_type + priority
      - Show: "Target: X hari kerja"
      - Start date: submitted_at
      - Calculation: business days only

3. **Submit Assignment:**
   - Create entries in `request_team_assignments` for each selected developer
   - Update request status to: IN_PROGRESS
   - Send notifications to:
     - Assigned developers
     - Technical writer
     - Team leader
     - Requester (FYI)

---

### 3.2 Admin Dashboard Updates

**Tambahan Metrics:**
- Pending Verification (status=SUBMITTED)
- Approved but Not Assigned
- In Progress by Priority
- **By Developer Role Distribution:**
  - Backend: X requests
  - Frontend: X requests
  - QA: X requests
  - etc.

---

### 3.3 Team & Assignment Management

**Remove:**
- Team Management page (tidak ada konsep team lagi)

**New:**
- **Developer Workload View:**
  - Table: Developer Name | Role | Active Assignments | SLA Status
  - Filter by: Developer Role, Unit
  - Sort by: Workload, Name
  - Purpose: Bantu admin distribute workload merata

---

## PHASE 4: Flow Changes - Role Developer

### 4.1 Developer Role Scope

**Important Changes:**
- Developer sekarang memiliki **developer_role** spesifik
- Assignment tidak lagi ke team, tapi ke individual dengan role
- 1 developer = 1 developer_role (tidak bisa multiple)

### 4.2 Developer Registration/Creation

**When Admin Creates Developer User:**
1. Select Role: Developer
2. **Required:** Select Developer Role (SA/TW/BE/FE/QA/DM)
3. Cannot proceed without selecting developer_role

**Database Constraint:**
- `users.developer_role_id` REQUIRED if `users.role_id = DEVELOPER`
- Enforce at application level AND database level (CHECK constraint)

### 4.3 Developer Dashboard

**Show:**
- My Assignments (only requests where user is assigned)
- Filter by: Status, Priority
- **Show my role in each request:**
  - Request #XXX | Application Name | **My Role: Backend Developer** | Status | SLA
- Group assignments by status

### 4.4 Developer Assignment Page

**Display:**
- Request details
- **Team Members on this Request:**
  - List all assigned developers with their roles
  - Example:
    ```
    Team:
    - Siti Aminah (Frontend Developer)
    - Ahmad Nur (Backend Developer) ← You
    - Budi Santoso (Quality Assurance)
    ```
- Progress update form (same as before)
- Can see updates from other team members

### 4.5 Developer Request Detail

**Additional Info:**
- Show assigned team with roles
- Show technical writer contact
- Show team leader contact
- My role badge prominently displayed

---

## PHASE 5: Reporting Updates

### 5.1 Laptri (Quarterly Report)

**Additional Breakdown:**
- Completed requests by request type
- Completion time analysis
- **New:** Most involved developer roles
  - Table: Role | Count | Avg Completion Time
  - Example: Backend Developer involved in 45 requests, avg 10 days

### 5.2 SLA Achievement Report

**Update Calculation:**
- Use **business days** instead of calendar days/hours
- Exclude weekends (Saturday, Sunday)
- Exclude holidays from `sla_holidays` table

**Show:**
- Target (business days)
- Actual (business days)
- Status: Met / Exceeded
- Trend by quarter

**Additional Metrics:**
- SLA achievement by priority
- SLA achievement by request type
- Average business days by developer role involved

---

## PHASE 6: Master Data Management

### 6.1 Developer Role Management

**New Admin Page:** `/admin/settings/developer-roles`

**Features:**
- CRUD developer roles (SA, TW, BE, FE, QA, DM)
- Each role:
  - Code (unique, 2-3 char)
  - Name
  - Description
  - Sort order
  - Active status

**Initial Seed Data:**
```sql
INSERT INTO developer_roles (code, name, description, sort_order, is_active) VALUES
('SA', 'System Analyst', 'Analyze system requirements and design solutions', 1, 1),
('TW', 'Technical Writer', 'Create technical documentation', 2, 1),
('BE', 'Back End Developer', 'Develop server-side logic and APIs', 3, 1),
('FE', 'Front End Developer', 'Develop user interface and client-side logic', 4, 1),
('QA', 'Quality Assurance', 'Test and ensure quality of applications', 5, 1),
('DM', 'Data Management', 'Manage database and data-related tasks', 6, 1);
```

### 6.2 Application Master Management

**New Admin Page:** `/admin/settings/applications`

**Features:**
- View all registered applications (from approved NEW_APPLICATION requests)
- Table: Application Name | Current Version | Created Date | Total RFCs
- Cannot manually add (only created from approved requests)
- Can view history (all requests related to this application)

### 6.3 SLA Holidays Management

**New Admin Page:** `/admin/settings/sla-holidays`

**Features:**
- CRUD holidays
- Calendar view
- Bulk import (CSV)
- Year view
- Quick add: National holidays preset

**Initial Seed:**
Common Indonesian national holidays

---

## PHASE 7: Data Migration Strategy

### 7.1 Migration Order

1. **Create new tables:**
   - developer_roles
   - request_applications
   - sla_holidays
   - request_team_assignments (new structure)

2. **Alter existing tables:**
   - users: Add developer_role_id
   - requests: Add new fields (application_id, requested_version, etc.)
   - sla_policies: Change target_hours to target_business_days

3. **Migrate existing data:**
   - Convert existing teams → individual assignments
   - Create request_applications from approved NEW_APPLICATION requests
   - Update SLA from hours to days

4. **Remove obsolete tables:**
   - teams
   - team_members

### 7.2 Developer Role Assignment Migration

**For existing developers:**
- Create migration script asking admin to assign developer_role
- Or: Set all existing developers to 'BE' (Backend) as default
- Or: Provide UI for bulk update

### 7.3 Request Type Migration

**For existing requests:**
- If request_type = 'NEW_APPLICATION' AND status = 'APPROVED' or 'COMPLETED':
  - Create entry in request_applications
  - Set application_id in requests
- If request_type = 'RFC':
  - Try to match application_name from title
  - Manual review may be needed

---

## PHASE 8: API & Server Actions Updates

### 8.1 New Server Actions Required

1. **Request Management:**
   - `getApplicationList()` - for RFC dropdown
   - `validateVersion(applicationId, requestedVersion)` - version validation
   - `createRequestWithVersion()` - unified create for both types

2. **Assignment:**
   - `getDevelopersByRole(roleCode)` - filter developers by role
   - `assignTeamToRequest(requestId, assignments[])` - batch assignment
   - `getTeamLeaderOptions()` - all users for ketua tim
   - `getTechnicalWriters()` - users with developer_role=TW

3. **Developer Workload:**
   - `getDeveloperWorkload()` - aggregate assignments per developer
   - `getDevelopersByWorkload()` - sorted by active assignments

4. **Reporting:**
   - `calculateBusinessDays(startDate, endDate)` - SLA calculation utility
   - `getLaptriByDeveloperRole()` - breakdown by role
   - `getSLAWithBusinessDays()` - updated SLA calculation

### 8.2 Updated Validations

**Version Validation Function:**
```typescript
function validateVersion(currentVersion: string, requestedVersion: string): boolean {
  const current = parseVersion(currentVersion); // "1.2.3" → [1,2,3]
  const requested = parseVersion(requestedVersion);
  
  // Compare major.minor.patch
  if (requested[0] > current[0]) return true; // major bump
  if (requested[0] === current[0] && requested[1] > current[1]) return true; // minor bump
  if (requested[0] === current[0] && requested[1] === current[1] && requested[2] > current[2]) return true; // patch bump
  
  return false; // requested <= current, INVALID
}
```

---

## PHASE 9: UI/UX Updates

### 9.1 User Request Form

- Single page layout
- Conditional sections based on request type
- Version dropdown for RFC (from applications)
- Version validation with real-time feedback
- Auto-suggest for application names

### 9.2 Admin Assignment Interface

**Design:**
```
┌─────────────────────────────────────┐
│ Request #RQ-2024-001                │
│ New Application: SIPPA HR           │
├─────────────────────────────────────┤
│ Priority: ◉ High ○ Medium ○ Low    │
│                                     │
│ DevTI Urusan:                      │
│ [________________________]          │
│                                     │
│ Ketua Tim:                         │
│ [Select User ▼]                    │
│                                     │
│ Technical Writer:                  │
│ [Select TW ▼]                      │
│                                     │
│ Assign Team Members:               │
│ ┌───────────────────────────────┐  │
│ │ ☐ Ahmad (BE)                  │  │
│ │ ☐ Siti (FE)                   │  │
│ │ ☐ Budi (QA)                   │  │
│ │ ☐ Dewi (SA)                   │  │
│ │ ☐ Eko (DM)                    │  │
│ └───────────────────────────────┘  │
│                                     │
│ SLA Target: 10 hari kerja         │
│ (Calculated from priority)         │
│                                     │
│ [Cancel] [Assign & Start]          │
└─────────────────────────────────────┘
```

### 9.3 Developer Dashboard

**Add Role Badge:**
```
┌──────────────────────────────────────┐
│ Welcome, Ahmad                       │
│ Role: Backend Developer 🔹          │
├──────────────────────────────────────┤
│ My Active Assignments: 3             │
│ ...                                  │
└──────────────────────────────────────┘
```

### 9.4 Request Detail - Team Section

```
Team Members:
─────────────────────────
👤 Siti Aminah
   Frontend Developer

👤 Ahmad Nur (You)
   Backend Developer

👤 Budi Santoso
   Quality Assurance

📝 Technical Writer:
   Dewi Lestari

👔 Team Leader:
   Pak Eko Prasetyo
```

---

## PHASE 10: Testing Strategy

### 10.1 Unit Tests

- Version validation logic
- Business days calculation (exclude weekends + holidays)
- Application master creation on approval

### 10.2 Integration Tests

- User submit NEW APPLICATION → Admin approve → Application master created
- User submit RFC → Validate version > current version
- Admin assign team → Notifications sent to all members
- Developer update progress → Status history recorded

### 10.3 End-to-End Tests

**Scenario 1: New Application Flow**
1. User submit new application "SIPPA Finance" v1.0.0
2. Admin verify, set priority, assign team (BE, FE, QA)
3. Developers update progress
4. QA marks as completed
5. Admin closes request
6. Application "SIPPA Finance" v1.0.0 masuk ke application master

**Scenario 2: RFC Flow**
1. User submit RFC for "SIPPA Finance" → v1.1.0
2. System validates v1.1.0 > v1.0.0 ✓
3. Admin assign team
4. Complete
5. Application master updated to v1.1.0

**Scenario 3: RFC Version Validation Fail**
1. User submit RFC for "SIPPA Finance" → v1.0.0
2. System validates v1.0.0 > v1.0.0 ✗
3. Show error: "Version must be greater than current version (1.0.0)"
4. User corrects to v1.0.1
5. Validation passes ✓

**Scenario 4: Admin Assignment**
1. Admin opens approved request
2. Set DevTI urusan, ketua tim, technical writer
3. Select 3 developers: BE, FE, QA
4. Assign
5. All 5 people receive notification
6. Request status → IN_PROGRESS

---

## PHASE 11: Documentation Updates

### 11.1 Update Existing Docs

**Files to update:**
- `.ai/DATABASE.md` - new schema
- `.ai/BUSINESS_RULES.md` - new flows
- `.ai/ARCHITECTURE.md` - new components
- `USER_GUIDE.md` - new form flow
- `ADMIN_GUIDE.md` - new assignment process
- `DEVELOPER_GUIDE.md` - developer role scope

### 11.2 New Documentation

**Create:**
- `DEVELOPER_ROLES.md` - penjelasan setiap role
- `VERSION_MANAGEMENT.md` - versioning rules
- `SLA_CALCULATION.md` - business days logic
- `MIGRATION_GUIDE.md` - how to migrate from old to new schema

---

## Summary of Major Changes

### Database:
1. ✅ Add `developer_roles` table
2. ✅ Add `request_applications` table for application master
3. ✅ Add `sla_holidays` table for business days calculation
4. ✅ Update `users` table with `developer_role_id`
5. ✅ Major update to `requests` table (application_id, requested_version, etc.)
6. ✅ Rename & restructure `request_assignments` → `request_team_assignments`
7. ✅ Remove `teams` and `team_members` tables
8. ✅ Update `sla_policies` to use business days

### Application Flow:
1. ✅ User form: Single page, conditional fields, version validation for RFC
2. ✅ Admin: Enhanced assignment with developer roles, ketua tim, technical writer
3. ✅ Developer: Role-specific scope, individual assignments
4. ✅ SLA: Business days calculation (exclude weekends + holidays)
5. ✅ Reporting: Include developer role metrics

### Master Data:
1. ✅ Developer Roles management
2. ✅ Application Master (auto-created from approved requests)
3. ✅ SLA Holidays management

---

## Implementation Phases Priority

### High Priority (Phase 1-4):
- Database restructuring
- User form changes
- Admin assignment flow
- Developer role implementation

### Medium Priority (Phase 5-7):
- Reporting updates
- Master data UI
- Data migration scripts

### Low Priority (Phase 8-11):
- API optimization
- Advanced testing
- Documentation updates
- Performance tuning

---

## Risk & Considerations

### 1. Version Validation Complexity
**Risk:** User confusion with semantic versioning
**Mitigation:** 
- Clear error messages
- Examples in tooltip
- Auto-suggestion for next version

### 2. Data Migration
**Risk:** Existing requests may not fit new structure
**Mitigation:**
- Careful mapping strategy
- Manual review for edge cases
- Backup before migration

### 3. Developer Role Assignment
**Risk:** Existing developers need role assignment
**Mitigation:**
- Provide admin UI for bulk update
- Default to 'BE' if not specified
- Gradual rollout

### 4. SLA Calculation Change
**Risk:** Historical SLA data in hours, new data in days
**Mitigation:**
- Keep old calculation for historical data
- Use new calculation for future requests
- Clear indicators in reports

---

## Next Steps

1. **Review & Approval:** Present this plan to stakeholders
2. **Schema Design:** Create detailed ERD with all relationships
3. **Migration Scripts:** Write SQL migration files
4. **Prototype:** Build core flows (request form, assignment)
5. **Testing:** Comprehensive testing with real scenarios
6. **Training:** Prepare training materials for users
7. **Deployment:** Staged rollout with rollback plan

---

## Open Questions & Decisions Needed

### [NEEDS_DECISION]

1. **Team Leader Role:**
   - Q: Apakah ketua tim harus punya akses khusus?
   - Q: Apakah ketua tim bisa update status request?
   - Current: Ketua tim hanya sebagai koordinator, tidak ada permission khusus

2. **Application Versioning:**
   - Q: Apakah enforce strict semantic versioning?
   - Q: Allow custom version format? (e.g., "2024.1.0")
   - Current: Enforce semantic versioning (x.y.z)

3. **Developer Workload Limit:**
   - Q: Apakah ada limit maksimal assignment per developer?
   - Q: Show warning jika developer sudah overloaded?
   - Current: No limit, admin discretion

4. **SLA Holidays:**
   - Q: Apakah perlu approval workflow untuk tambah holiday?
   - Q: Siapa yang bisa manage holidays?
   - Current: Only admin can manage

5. **Technical Writer Assignment:**
   - Q: Apakah TW wajib untuk semua requests?
   - Q: Atau optional tergantung complexity?
   - Current: Required for all requests

6. **Request Type:**
   - Q: Apakah ada request type lain selain NEW_APPLICATION dan RFC?
   - Q: Misalnya: BUG_FIX, ENHANCEMENT?
   - Current: Only NEW_APPLICATION and RFC

7. **Version History:**
   - Q: Apakah perlu halaman khusus untuk lihat version history per aplikasi?
   - Q: Tampilkan semua RFC yang pernah dilakukan?
   - Current: Can be viewed from requests list filtered by application

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-06  
**Status:** DRAFT - Waiting for Review
