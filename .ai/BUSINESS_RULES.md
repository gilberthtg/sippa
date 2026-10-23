# SIPPA Business Rules (v1.0)

**Last Updated:** 2026-10-23  
**Status:** Production Rules (after Phase 1-8 restructure)

## Workflow Baseline

### NEW_APPLICATION Flow
1. User creates NEW_APPLICATION request with title and description
2. Admin verifies completeness → Approves or Rejects
3. **If Approved:**
   - Application master entry auto-created in `request_applications` (version 1.0.0)
   - Admin sets priority, DevTI urusan
   - Admin assigns: Team Leader, Technical Writer, Developers (with specific roles)
4. Developers work and update progress
5. Request completed → data available for Laptri and SLA reporting

### RFC Flow
1. User selects existing application from dropdown
2. User enters requested version (must be > current_version)
3. Real-time validation ensures version progression
4. Admin verifies completeness → Approves or Rejects
5. **If Approved:**
   - Admin sets priority, DevTI urusan
   - Admin assigns: Team Leader, Technical Writer, Developers (with specific roles)
6. Developers work and update progress
7. Request completed → Application master `current_version` updated to requested version

## Request Types

### NEW_APPLICATION
**Purpose:** Request for entirely new application  
**Version:** Auto-set to "1.0.0" (not editable by user)  
**Fields Required:**
- Title (application name)
- Description (requirements)
- Urgency (LOW, MEDIUM, HIGH)
- Dokumen Permintaan Aplikasi (optional upload)

**On Approval:**
- Entry created in `request_applications` table
- `application_name` = request.title
- `current_version` = "1.0.0"
- `request.application_id` linked to new application

### RFC (Request for Change)
**Purpose:** Request changes/enhancements to existing application  
**Version:** User must specify, validated > current_version  
**Fields Required:**
- Application selection (from dropdown)
- Requested version (semantic versioning x.y.z)
- Description (changes requested)
- Urgency (LOW, MEDIUM, HIGH)
- Dokumen Permintaan Aplikasi (optional upload)

**Validation Rules:**
- Application must exist in `request_applications`
- Requested version format: x.y.z (semantic versioning)
- Requested version MUST be > current_version
  - Example: If current = 1.2.3, valid: 1.2.4, 1.3.0, 2.0.0
  - Example: If current = 1.2.3, invalid: 1.2.3, 1.2.0, 1.0.0
- Real-time validation on form input
- Server-side validation before submission

**On Completion:**
- Application master `current_version` updated to `requested_version`
- Subsequent RFC requests see updated version as current

## Roles

### User
- Create NEW_APPLICATION or RFC requests
- Fill single-page form (not multi-step wizard)
- Select request type with conditional rendering
- For RFC: select application and enter version
- Upload Dokumen Permintaan Aplikasi (optional, 1 file, 10 MB)
- View own request list and status only
- Track progress and team assignment
- Receive notifications on status changes

### Admin
- View all requests and details
- Verify request completeness
- **Approve** or **Reject** requests with reason
- Set priority (High, Medium, Low)
- Set DevTI Urusan (division handling request)
- **Assign team:**
  - Select Team Leader (must have developer_role = SA)
  - Select Technical Writer (must have developer_role = TW)
  - Select multiple Developers with specific roles (BE, FE, QA, DM)
- View developer workload before assignment
- Edit permitted request data
- View Laptri (quarterly reports) with developer role distribution
- View SLA achievement reports (business days)
- Export reports to Excel
- Manage master data (developer roles, applications, SLA holidays, priorities, units, users)

**Assignment Rules:**
- Minimum 1 developer required
- Technical Writer MUST have developer_role = TW (validated)
- Team Leader MUST have developer_role = SA (System Analyst) (validated, ADR-0022)
- Developer assignments exclude SA and TW roles (SA → team leader, TW → technical writer)
- Typical assignment: 3-5 developers with different roles
- Can view developer workload before assigning

### Developer
- View assigned requests only (where user is assigned)
- See developer role badge (SA, TW, BE, FE, QA, DM)
- See "My Role" in each assignment
- View full team composition (team leader, technical writer, peer developers)
- Current user highlighted in team list
- Update work progress with notes (Team Lead or Admin only; peer developers cannot update)
- Complete request / mark DONE (Team Lead or Admin only; peer developers cannot mark done)
- Collaborate with team members
- Receive notifications on new assignments

**Developer Roles:**
1. **SA (System Analyst):** Analyze requirements and design solutions
2. **TW (Technical Writer):** Create technical documentation and user guides
3. **BE (Back End Developer):** Develop server-side logic and APIs
4. **FE (Front End Developer):** Develop user interface and client-side logic
5. **QA (Quality Assurance):** Test and ensure quality of applications
6. **DM (Data Management):** Manage database and data-related tasks

**Developer Constraints:**
- 1 developer = 1 developer_role (cannot have multiple)
- Developer role assigned by admin when user is created/updated
- Role displayed prominently in all views

## Status Flow

### Status Values
1. **SUBMITTED** - User submitted request
2. **IN_REVIEW** - Admin reviewing
3. **APPROVED** - Admin approved, ready for assignment
4. **REJECTED** - Admin rejected with reason
5. **ONGOING** - Team assigned, work in progress
6. **ON_HOLD** - Work paused (requires reason)
7. **DONE** - Work finished, request closed

### Workflow Diagram
```
SUBMITTED (user creates)
    ↓
IN_REVIEW (admin verifies completeness)
    ↓
    ├→ APPROVED (admin approves) → ONGOING (admin assigns team)
    │
    └→ REJECTED (admin rejects with reason) → SUBMITTED (requester resubmits)

ONGOING (work in progress)
    ↓
    ├→ ON_HOLD (hold with reason, SLA pauses) → ONGOING (resume, SLA continues)
    │
    └→ DONE (work finished - FINAL STATUS, cannot change)
```

### Status Transitions (validated server-side)
All transitions are validated before update via `validateTransitionWithContext()`
(`lib/validations/status-transitions.ts`). Invalid transitions return an Indonesian
error message and never write to the database.

| # | Transition | Role | Notes |
|---|-----------|------|-------|
| 1 | `SUBMITTED → IN_REVIEW` | Admin | Verify completeness (verifyRequest) |
| 2 | `IN_REVIEW → APPROVED` | Admin | Approve (approveRequest); NEW_APPLICATION auto-creates application master |
| 3 | `IN_REVIEW → REJECTED` | Admin | Requires reason (rejectRequest); stored in rejectionNote |
| 4 | `APPROVED → ONGOING` | Admin | Team assignment (assignTeamToRequest); min 1 developer, TW must have TW role; **priority wajib diatur dulu (priority_id NOT NULL)** — server-side validation + "Assign Tim" button disabled until priority set |
| 5 | `ONGOING → ON_HOLD` | Admin or assigned team | Requires reason (min 10 chars); sets slaPausedAt |
| 6 | `ON_HOLD → ONGOING` | Admin or assigned team | Resume; accumulates paused business-day hours |
| 7 | `ONGOING → DONE` | Admin or Team Lead | Complete (completeRequest) — hanya dapat dilakukan oleh Admin atau Team Lead |
| 8 | `REJECTED → SUBMITTED` | User (requester) or Admin | Resubmission of rejected request |
| 9 | `DONE → *(none)*` | — | DONE is FINAL, no transitions out |

**Blocked transitions** (examples):
- SUBMITTED → APPROVED / ONGOING / DONE (must follow the chain)
- IN_REVIEW → ONGOING / DONE (must approve/assign first)
- ON_HOLD → REJECTED / DONE (can only resume to ONGOING)
- ONGOING → SUBMITTED / IN_REVIEW / APPROVED (cannot revert)
- DONE → anything (final)

### Final Statuses
- **DONE** is a terminal status — no transitions out, validated and blocked server-side.
- **REJECTED** allows only one transition: resubmission (`REJECTED → SUBMITTED`) once,
  which restarts the review cycle from the beginning.

### Status History
- All transitions recorded in `request_status_histories`
- Includes: from_status, to_status, changed_by, changed_by_name, actor_role, note, metadata
- Metadata stores rejection reasons, hold reasons, resume timestamps, pause durations, etc.

## SLA Calculation

### Business Days Method
- **Calculation:** Mon-Fri only (exclude weekends)
- **Holidays:** Exclude dates from `sla_holidays` table
- **Start Point:** submitted_at timestamp
- **End Point:** completed_at timestamp (or NOW for ongoing)
- **Formula:** Count business days between start and end

### Pause (ON_HOLD) Exclusion
- When request is paused (ONGOING → ON_HOLD): `sla_paused_at` is recorded, reason is required and stored (`on_hold_reason`) and logged in status history
- When request is resumed (ON_HOLD → ONGOING): pause duration in business-day hours is accumulated into `sla_paused_duration_hours`; multiple pause cycles sum up, each cycle logged in status history
- Completion formula: `actual_duration_hours = business hours (submitted_at → completed_at) − sla_paused_duration_hours` (bounded ≥ 0)
- `actual_duration_hours` and `sla_met` are persisted at completion (both admin and developer completion paths)

### SLA Targets
Defined in `sla_policies` table:
- request_type (NEW_APPLICATION or RFC)
- priority_id (High, Medium, Low)
- target_business_days (e.g., 5, 10, 15 days)

**Example Policies:**
- NEW_APPLICATION + High Priority = 10 business days
- NEW_APPLICATION + Medium Priority = 15 business days
- NEW_APPLICATION + Low Priority = 20 business days
- RFC + High Priority = 5 business days
- RFC + Medium Priority = 10 business days
- RFC + Low Priority = 15 business days

### SLA Status
- **Met:** actual ≤ target
- **Exceeded:** actual > target
- Displayed on admin dashboard with SLA At Risk count

## Team Assignment Rules

### Team Leader
- **MUST** have `developer_role = SA` (System Analyst) (ADR-0022)
- Serves as project coordinator/liaison
- Selected by admin from filtered dropdown (only shows SA users)
- Not required to have specific permissions
- Optional field (can be NULL)

### Technical Writer
- **MUST** have `developer_role = TW`
- Required for all requests
- Selected by admin from filtered dropdown (only shows TW users)
- Validation enforced at application and database level
- Responsible for documentation

### Developer Assignments
- **Minimum:** 1 developer required
- **Typical:** 3-5 developers with different roles
- Each assignment specifies:
  - assigned_user_id (the developer)
  - developer_role_id (role in this request: BE, FE, QA, DM — SA and TW are not assignable, ADR-0022)
  - assigned_by (admin who made assignment)
  - assigned_at (timestamp)
  - notes (optional assignment notes)
- Multiple developers can have same role (e.g., 2 BE developers)
- One developer can be assigned with different roles (not recommended)
- Active assignments have `unassigned_at = NULL`

### DevTI Urusan
- Selection from `devteam_units` master (FK: requests.devti_urusan_id), separate from organizational units
- Example: "URUSAN PENGEMBANGAN PRODUK TI AKADEMIK"
- Set by admin during assignment
- Required field

### Assignment Process
1. Admin approves request
2. Admin sets Priority (required — assignment is blocked until priority is set)
3. Admin clicks "Assign Team"
4. Admin fills assignment form:
   - DevTI Urusan (dropdown: from devteam_units master)
   - Team Leader (dropdown: only SA role)
   - Technical Writer (dropdown: only TW role)
   - Developers (multi-select with role badges)
5. Admin submits assignment
6. Entries created in `request_team_assignments`
7. Request status → ONGOING
8. Notifications sent to:
   - All assigned developers
   - Technical writer
   - Team leader
   - Requester (FYI)

## Reporting

### Laptri (Quarterly Report)
- Groups completed requests by quarter
- Metrics:
  - Quarterly counts by request type
  - Average completion time by type and priority
  - Monthly trends
  - **Developer role distribution** (NEW: involvement by role)
- Filters: year, quarter, request type
- Exportable to Excel with summary and detail sheets
- Charts: quarterly trends, type breakdown, role distribution

### SLA Achievement Report
- Compares actual vs target SLA (business days)
- Metrics:
  - Total requests
  - Met count and percentage
  - Exceeded count and percentage
  - Average completion time
  - Monthly trends
  - SLA achievement rate trend
- Filters: year, request type, priority, SLA status (met/exceeded)
- Exportable to Excel with summary and detail sheets
- Charts: achievement rate, monthly trends, type breakdown

### Developer Workload Report (Admin View)
- Shows active assignments per developer
- Metrics:
  - Developer name and role
  - Active assignments count
  - Requests by priority
  - SLA At Risk count
- Helps admin balance workload during assignment
- Filter by: developer role, unit
- Sort by: workload, name

## Notification Events

In-app notifications are triggered automatically on the following transitions:

| Event | Trigger | Recipients | Message |
|-------|---------|------------|---------|
| `REQUEST_SUBMITTED` | User submits request | All active admins | "[requester] mengajukan permintaan \"[title]\"" |
| `REQUEST_IN_REVIEW` | Admin verifies (SUBMITTED → IN_REVIEW) | Requester | "Permintaan \"[title]\" sedang ditinjau oleh admin" |
| `REQUEST_APPROVED` | Admin approves | Requester | "Permintaan \"[title]\" telah disetujui" |
| `REQUEST_REJECTED` | Admin rejects | Requester | "Permintaan \"[title]\" ditolak. Alasan: [reason]" |
| `TEAM_ASSIGNED` / `DEVELOPER_ASSIGNED` | Admin assigns team | Assigned developers + team leader + technical writer + requester | "Anda ditugaskan / Ditunjuk sebagai Ketua Tim / Technical Writer" |
| `PROGRESS_UPDATED` | Developer updates progress | Requester | "Progress [percent]%: [note]" |
| `REQUEST_ON_HOLD` | Hold (ONGOING → ON_HOLD) | Requester + team members + admins | "Permintaan \"[title]\" ditahan. Alasan: [reason]" |
| `REQUEST_RESUMED` | Resume (ON_HOLD → ONGOING) | Requester + team members + admins | "Permintaan \"[title]\" dilanjutkan kembali" |
| `REQUEST_COMPLETED` | Complete (ONGOING → DONE) | Requester + team members + all active admins | "Permintaan \"[title]\" telah diselesaikan" |

**Team members recipients** (per ADR-0018): active `request_team_assignments` rows
plus team leader and technical writer (even if those are not regular developers).

**Notification System:**
- In-app only (v1.0)
- Polling every 30 seconds
- Bell icon with unread count
- Notification list page (all roles)
- Mark as read functionality
- Notifications persist until marked read
- Direct links to entity (request detail)

## Version Management

### Semantic Versioning
**Format:** x.y.z (e.g., 1.2.3)
- **x = Major:** Breaking changes, incompatible updates
- **y = Minor:** New features, backward compatible
- **z = Patch:** Bug fixes, minor improvements

**Validation Rules:**
1. Format must be exactly x.y.z (3 numbers separated by dots)
2. Each part must be non-negative integer
3. For RFC: requested_version > current_version

**Validation Layers:**
1. **Client-side:** Real-time validation on input change
   - Immediate feedback with error message
   - Prevents form submission if invalid
2. **Schema validation:** Zod schema with refine check
   - Type-safe validation during form parsing
3. **Server-side:** Final check before database insert
   - Compares against database current_version
   - Prevents race conditions

**Version Progression Examples:**
- Current: 1.0.0 → Valid: 1.0.1, 1.1.0, 2.0.0
- Current: 1.2.3 → Valid: 1.2.4, 1.3.0, 2.0.0
- Current: 1.2.3 → Invalid: 1.2.3, 1.2.0, 1.0.0, 0.9.0

**Auto-Suggestion:**
- Patch bump: 1.2.3 → 1.2.4 (default)
- Minor bump: 1.2.3 → 1.3.0
- Major bump: 1.2.3 → 2.0.0

### Application Master Management
- Created automatically from approved NEW_APPLICATION
- Cannot be manually created/edited
- current_version updated when RFC completed
- View-only page for admins (application list and history)
- History shows all requests related to application

## Form Validation

### NEW_APPLICATION Form
- Title: required, min 3 chars, max 255 chars
- Description: required, min 20 chars
- Urgency: required (LOW, MEDIUM, HIGH)
- Version: auto-set to "1.0.0" (not editable)
- Dokumen Permintaan Aplikasi: optional, 1 file, 10 MB

### RFC Form
- Application: required (dropdown from request_applications)
- Requested Version: required, format x.y.z, must be > current
- Description: required, min 20 chars
- Urgency: required (LOW, MEDIUM, HIGH)
- Dokumen Permintaan Aplikasi: optional, 1 file, 10 MB

### File Upload Validation
- **Uploaded Document:** Only "Dokumen Permintaan Aplikasi" (single file, optional) — dokumen pendukung upload was removed
- **Allowed Types:** .pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg
- **Max Size:** 10 MB per file
- **Max Count:** 1 file per request
- **Validation:** MIME type check (server-side)

### Document Checklist Upload Permission (request detail page)
- Only Admin, Team Leader of the request, and Technical Writer of the request can upload/delete documents on the request detail page document checklist
- Everyone else (requester, peer developers) can only view and download documents
- Enforced in UI (`canUpload` prop on `RequestDocumentsSection`) and server-side (`uploadRequestDocument` rejects developers that are not Team Leader or TW of the request)
- **Status lock:** upload/delete is blocked when the request status is DONE (final) or REJECTED — enforced server-side in `uploadRequestDocument`/`deleteRequestDocument` (via `isDocumentEditingLocked()` in `lib/validations/status-transitions.ts`) and in the UI (`canUpload` prop on admin/developer detail pages). Ongoing work statuses (SUBMITTED, IN_REVIEW, APPROVED, ONGOING, ON_HOLD) allow document edits.

## Deferred Requirements (v1.1+)

### Developer Performance Metrics
- Individual completion rates
- Workload distribution analysis
- Quality metrics (bugs, rework)
- Time tracking per developer

### Advanced Reporting
- Custom date ranges beyond year filter
- PDF export for reports
- Chart embedding in Excel exports
- Scheduled report generation (email)
- Dashboard widgets customization

### Enhanced Features
- Email notifications (currently in-app only)
- Push notifications (mobile)
- File preview before download
- Drag-and-drop file upload
- Rich text editor for descriptions
- Comment threads on requests
- @mention team members
- Request templates for common types

## Explicitly Unresolved

**Do not guess rules for these scenarios (mark as [NEEDS_DECISION]):**
- Reopening a rejected request
- Reopening a completed request
- Approval by multiple admins (require 2+ approvals?)
- Priority calculation algorithm (auto-set based on criteria?)
- SLA pause/resume rules (pause during holidays?)
- Developer/team workload limits (max assignments per developer?)
- Reassignment rules (can admin reassign mid-progress?)
- Progress threshold for completion (must reach 100%?)
- Technical Writer role requirement level (required for all or optional?)
- Team Leader permissions (can they approve? assign others?)
- Version branching (support v1.x and v2.x in parallel?)
- Application retirement/archival process

## Data Integrity Rules

### Database Constraints
1. **users.developer_role_id:** Required if role = DEVELOPER
2. **requests.application_id:** NULL for NEW_APP, NOT NULL for RFC
3. **requests.title:** NOT NULL for NEW_APP, NULL for RFC
4. **requests.requested_version:** NULL for NEW_APP, NOT NULL for RFC
5. **requests.technical_writer_id:** Must reference user with developer_role = TW
6. **request_team_assignments.assigned_user_id:** Must have role = DEVELOPER
7. **sla_holidays.holiday_date:** UNIQUE (no duplicate holidays)
8. **request_applications.application_name:** UNIQUE (no duplicate names)

### Application-Level Validation
1. RFC version must be greater than application current_version
2. One developer can only have one developer_role
3. Team assignment requires minimum 1 developer
4. Technical Writer must have developer_role = TW
5. File uploads validate MIME type and size
6. Request number auto-generated (RQ-YYYY-NNN format)
7. Status transitions follow defined flow
8. Audit logs sanitize sensitive data (passwords, tokens)
9. Notifications sent transactionally with status changes
10. SLA calculation excludes weekends and holidays from sla_holidays table

---

**Document Version:** 1.0  
**Last Reviewed:** 2026-10-12  
**Next Review:** After v1.1 planning
