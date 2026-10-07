# SIPPA Implementation Phases

## Document Purpose
This document breaks down the restructuring plan into actionable implementation phases with specific tasks, timelines, and dependencies.

---

## Phase Overview

| Phase | Name | Duration | Dependencies | Priority |
|-------|------|----------|--------------|----------|
| 1 | Database Foundation | 3-4 days | None | CRITICAL |
| 2 | Core Models & Actions | 4-5 days | Phase 1 | CRITICAL |
| 3 | User Request Flow | 5-6 days | Phase 2 | HIGH |
| 4 | Admin Assignment Flow | 5-6 days | Phase 2, 3 | HIGH |
| 5 | Developer Workspace | 3-4 days | Phase 2, 4 | HIGH |
| 6 | Reporting Updates | 4-5 days | Phase 1-5 | MEDIUM |
| 7 | Master Data UI | 3-4 days | Phase 1 | MEDIUM |
| 8 | Data Migration | 2-3 days | Phase 1-7 | HIGH |
| 9 | Testing & QA | 5-7 days | Phase 1-8 | CRITICAL |
| 10 | Documentation & Deployment | 2-3 days | Phase 9 | HIGH |

**Total Estimated Duration:** 36-47 days (7-9 weeks)

---

## PHASE 1: Database Foundation (3-4 days)

### Objectives
- Create new database tables
- Add fields to existing tables
- Setup indexes and constraints
- Seed initial data

### Tasks

#### Day 1: Schema Design & SQL Scripts
- [ ] Create `developer_roles` table SQL
- [ ] Create `request_applications` table SQL
- [ ] Create `sla_holidays` table SQL
- [ ] Create `request_team_assignments` table SQL (new structure)
- [ ] Write ALTER statements for `users` table
  - Add `developer_role_id` column
  - Add foreign key constraint
  - Add CHECK constraint for developer role requirement
- [ ] Write ALTER statements for `requests` table
  - Add `application_id` column
  - Add `requested_version` column
  - Add `devti_urusan` column
  - Add `technical_writer_id` column
  - Add `team_leader_id` column
  - Add CHECK constraints for NEW_APPLICATION vs RFC

#### Day 2: Execute Database Changes
- [ ] Backup existing database
- [ ] Run CREATE TABLE scripts on development database
- [ ] Run ALTER TABLE scripts on development database
- [ ] Verify all constraints work correctly
- [ ] Test foreign key relationships
- [ ] Document any issues or adjustments needed

#### Day 3: Seed Data & Indexes
- [ ] Seed `developer_roles` table
  ```sql
  INSERT INTO developer_roles (code, name, description, sort_order) VALUES
  ('SA', 'System Analyst', '...', 1),
  ('TW', 'Technical Writer', '...', 2),
  ('BE', 'Back End Developer', '...', 3),
  ('FE', 'Front End Developer', '...', 4),
  ('QA', 'Quality Assurance', '...', 5),
  ('DM', 'Data Management', '...', 6);
  ```
- [ ] Seed `sla_holidays` with 2024 holidays
- [ ] Update `sla_policies` structure (add target_business_days)
- [ ] Create all necessary indexes
- [ ] Run EXPLAIN on common queries to verify index usage

#### Day 4: Drizzle ORM Schema Updates
- [ ] Update `lib/db/schema/developer-roles.ts` (new)
- [ ] Update `lib/db/schema/users.ts` (add developer_role_id)
- [ ] Update `lib/db/schema/requests.ts` (add new fields)
- [ ] Create `lib/db/schema/request-applications.ts` (new)
- [ ] Create `lib/db/schema/sla-holidays.ts` (new)
- [ ] Update `lib/db/schema/request-assignments.ts` (restructure)
- [ ] Generate TypeScript types from schema
- [ ] Test database connection with new schema

### Deliverables
- ✅ All new tables created
- ✅ Existing tables updated with new columns
- ✅ All constraints and indexes in place
- ✅ Seed data loaded
- ✅ Drizzle schemas updated
- ✅ TypeScript types generated

### Success Criteria
- Database migrations run without errors
- All foreign keys resolve correctly
- Seed queries insert data successfully
- TypeScript compiles without errors

---

## PHASE 2: Core Models & Actions (4-5 days)

### Objectives
- Create TypeScript types and interfaces
- Build server actions for new entities
- Implement version validation logic
- Setup business days calculation utility

### Tasks

#### Day 1: Types & Interfaces
- [ ] Create `types/developer-roles.ts`
  ```typescript
  export type DeveloperRole = {
    id: number;
    code: 'SA' | 'TW' | 'BE' | 'FE' | 'QA' | 'DM';
    name: string;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
  };
  ```
- [ ] Update `types/users.ts` (add developerRoleId)
- [ ] Update `types/requests.ts` (add new fields)
- [ ] Create `types/request-applications.ts`
- [ ] Create `types/request-assignments.ts` (new structure)
- [ ] Update all related DTOs and form schemas

#### Day 2: Server Actions - Developer Roles
- [ ] `app/actions/developer-roles.ts`
  - `getAllDeveloperRoles()`
  - `getDeveloperRoleByCode(code: string)`
  - `getActiveDeveloperRoles()`
  - `createDeveloperRole(data)` (admin only)
  - `updateDeveloperRole(id, data)` (admin only)
  - `toggleDeveloperRoleStatus(id)` (admin only)

#### Day 3: Server Actions - Request Applications
- [ ] `app/actions/request-applications.ts`
  - `getAllApplications()` - for dropdown
  - `getApplicationById(id)`
  - `getApplicationByName(name)`
  - `createApplicationFromRequest(request)` - internal use
  - `updateApplicationVersion(id, version)` - internal use
  - `getApplicationHistory(id)` - all related requests

#### Day 4: Server Actions - Version & SLA Utils
- [ ] `lib/utils/version-validation.ts`
  ```typescript
  export function parseVersion(version: string): number[] {
    // "1.2.3" → [1, 2, 3]
  }
  
  export function compareVersions(v1: string, v2: string): number {
    // Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
  }
  
  export function isVersionGreater(requested: string, current: string): boolean {
    return compareVersions(requested, current) > 0;
  }
  
  export function suggestNextVersion(current: string, type: 'major' | 'minor' | 'patch'): string {
    // "1.2.3" + patch → "1.2.4"
    // "1.2.3" + minor → "1.3.0"
    // "1.2.3" + major → "2.0.0"
  }
  ```

- [ ] `lib/utils/sla-calculation.ts`
  ```typescript
  export async function getHolidays(): Promise<Date[]> {
    // Fetch from sla_holidays table
  }
  
  export function isBusinessDay(date: Date, holidays: Date[]): boolean {
    // Check if date is weekday AND not holiday
  }
  
  export async function calculateBusinessDays(start: Date, end: Date): Promise<number> {
    // Count business days between two dates
  }
  
  export async function addBusinessDays(start: Date, days: number): Promise<Date> {
    // Add N business days to a date
  }
  ```

#### Day 5: Server Actions - Updated Request Actions
- [ ] Update `app/actions/requests.ts`
  - `createRequestWithApplication(data)` - unified for NEW_APP and RFC
    - Validate version if RFC
    - Create draft
  - `submitRequest(id)` - submit to admin
  - Update `getRequestById()` - include application data
  - Update `getRequestsByUserId()` - include application names
  
- [ ] `app/actions/admin-requests.ts` updates
  - `assignTeamToRequest(requestId, assignments)`
    ```typescript
    type Assignment = {
      userId: number;
      developerRoleId: number;
    };
    ```
  - `setRequestPriority(requestId, priorityId)`
  - `setDevTIUrusan(requestId, urusan)`
  - `approveRequestWithAssignment(requestId, assignmentData)`

### Deliverables
- ✅ Complete TypeScript type system
- ✅ Server actions for developer roles
- ✅ Server actions for request applications
- ✅ Version validation utilities
- ✅ SLA calculation utilities
- ✅ Updated request server actions

### Success Criteria
- All types compile without errors
- Server actions return correct data structures
- Version validation works correctly (unit tests pass)
- Business days calculation accurate (unit tests pass)

---

## PHASE 3: User Request Flow (5-6 days)

### Objectives
- Redesign request form to single page
- Implement NEW_APPLICATION and RFC flows
- Add version validation UI
- Update request list and detail pages

### Tasks

#### Day 1: Form Schema & Validation
- [ ] Update `lib/validations/request-schema.ts`
  ```typescript
  const newApplicationSchema = z.object({
    requestType: z.literal('NEW_APPLICATION'),
    title: z.string().min(3).max(255),
    description: z.string().min(20),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    // version auto-set to "1.0.0"
  });
  
  const rfcSchema = z.object({
    requestType: z.literal('RFC'),
    applicationId: z.number(),
    requestedVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    description: z.string().min(20),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  });
  
  const requestSchema = z.discriminatedUnion('requestType', [
    newApplicationSchema,
    rfcSchema,
  ]);
  ```

- [ ] Add async version validation
  ```typescript
  .refine(async (data) => {
    if (data.requestType === 'RFC') {
      const app = await getApplicationById(data.applicationId);
      return isVersionGreater(data.requestedVersion, app.currentVersion);
    }
    return true;
  }, "Version must be greater than current version")
  ```

#### Day 2: Request Form Component
- [ ] Create `components/requests/request-form-unified.tsx`
  - Radio button: NEW_APPLICATION vs RFC
  - Conditional sections based on selection
  - NEW_APPLICATION: title input
  - RFC: application dropdown + version input
  - Description textarea (rich text editor)
  - Urgency dropdown
  - File upload section
  - Review & confirm section
  - Real-time validation feedback

- [ ] Create `components/requests/version-input.tsx`
  - Format: x.y.z
  - Show current version
  - Validate on blur
  - Suggestion buttons (patch, minor, major)
  - Error message if version <= current

- [ ] Create `components/requests/application-selector.tsx`
  - Searchable dropdown
  - Show: application_name + current_version
  - Format: "SIPPA HR (v1.2.3)"

#### Day 3-4: Request Form Page
- [ ] Update `app/(user)/requests/new/page.tsx`
  - Server component to fetch applications list
  - Pass to client component
  - Handle form submission
  - Success redirect to request detail
  - Error handling with toast

- [ ] Create `components/requests/request-form-client.tsx`
  - React Hook Form integration
  - Zod validation
  - Conditional rendering
  - File upload handling
  - Real-time version validation
  - Loading states
  - Error states

#### Day 5: Request List Updates
- [ ] Update `app/(user)/requests/page.tsx`
  - Show application names for RFCs
  - Add filter by request type
  - Add filter by application (for RFC)

- [ ] Update `components/requests/request-list-client.tsx`
  - Display application name
  - Display requested version (for RFC)
  - Badge for request type

#### Day 6: Request Detail Updates
- [ ] Update `app/(user)/requests/[id]/page.tsx`
  - Fetch related application data
  - Show application info section
  - Show version history (for RFC)

- [ ] Create `components/requests/application-info-card.tsx`
  - Show application details
  - Show current version
  - Show version being requested (for RFC)
  - Show validation status

### Deliverables
- ✅ Single-page request form
- ✅ NEW_APPLICATION flow working
- ✅ RFC flow with version validation working
- ✅ Updated request list showing application names
- ✅ Updated request detail with application info

### Success Criteria
- User can create NEW_APPLICATION request
- User can create RFC request with version validation
- Version validation prevents invalid versions
- Form UX is intuitive and clear
- Error messages are helpful

---

## PHASE 4: Admin Assignment Flow (5-6 days)

### Objectives
- Build admin assignment interface
- Implement team assignment logic
- Setup notification system for assignments
- Create developer workload view

### Tasks

#### Day 1: Assignment Form Schema
- [ ] Create `lib/validations/assignment-schema.ts`
  ```typescript
  const assignmentSchema = z.object({
    devtiUrusan: z.string().min(3).max(255),
    teamLeaderId: z.number(),
    technicalWriterId: z.number(),
    developers: z.array(z.object({
      userId: z.number(),
      developerRoleId: z.number(),
    })).min(1, "At least one developer required"),
    priorityId: z.number(),
    notes: z.string().optional(),
  });
  
  // Validation: technicalWriterId must have developer_role = TW
  // Validation: developers must have role = DEVELOPER
  ```

#### Day 2: Assignment Components
- [ ] Create `components/admin/assignment-form.tsx`
  - DevTI Urusan text input
  - Team Leader dropdown (all users)
  - Technical Writer dropdown (filtered: developer_role = TW)
  - Priority selector
  - Developer multi-select with role badges
    - Group by developer role
    - Show workload indicator
    - Checkbox selection
  - SLA target display (auto-calculated)
  - Notes textarea
  - Submit button

- [ ] Create `components/admin/developer-selector.tsx`
  - Fetch developers with their current workload
  - Display: Name, Role, Active Assignments
  - Filter by developer role
  - Sort by workload
  - Multi-select checkboxes

- [ ] Create `components/admin/sla-target-display.tsx`
  - Calculate based on request_type + priority
  - Show: "Target: X business days"
  - Show start date
  - Show estimated completion date

#### Day 3: Admin Request Detail with Assignment
- [ ] Update `app/(admin)/admin/requests/[id]/page.tsx`
  - Add assignment section
  - Show assignment form if status = APPROVED
  - Show current assignment if already assigned
  - Allow reassignment / add more developers

- [ ] Create `components/admin/current-assignment-card.tsx`
  - List all assigned developers with roles
  - Show technical writer
  - Show team leader
  - Show DevTI urusan
  - Show SLA target vs current status
  - Button: Add more developers
  - Button: Unassign developer

#### Day 4: Assignment Server Actions
- [ ] Update `app/actions/admin-requests.ts`
  - `assignTeam(requestId, assignmentData)`
    - Validate all user IDs
    - Validate TW has correct role
    - Create multiple entries in request_team_assignments
    - Update request fields (devti_urusan, technical_writer_id, team_leader_id)
    - Update status to IN_PROGRESS
    - Create status history entry
    - Send notifications to all assigned users
    - Return success/error
  
  - `addDeveloperToRequest(requestId, userId, roleId, assignedBy)`
  - `removeDeveloperFromRequest(assignmentId, reason)`
  - `reassignDeveloper(assignmentId, newUserId, newRoleId)`

#### Day 5: Developer Workload View
- [ ] Create `app/(admin)/admin/developers/workload/page.tsx`
  - Table: Developer Name | Role | Unit | Active Assignments | SLA At Risk
  - Filter by developer role
  - Filter by unit
  - Sort by workload
  - Click to see developer's assignments

- [ ] Create server action `getDeveloperWorkload()`
  ```typescript
  type DeveloperWorkload = {
    userId: number;
    name: string;
    developerRole: string;
    unit: string;
    activeAssignments: number;
    slaAtRisk: number; // count of assignments near/exceeding SLA
    assignments: RequestSummary[];
  };
  ```

#### Day 6: Notifications for Assignment
- [ ] Update notification system
  - Send to assigned developers: "You have been assigned to [Request]"
  - Send to technical writer: "You are the TW for [Request]"
  - Send to team leader: "You are the team leader for [Request]"
  - Send to requester: "Your request has been assigned to the team"
  - Include direct links to request detail

### Deliverables
- ✅ Admin assignment form functional
- ✅ Team assignment creates correct database entries
- ✅ Developer workload view showing accurate data
- ✅ Notifications sent to all relevant parties
- ✅ Admin can view and modify assignments

### Success Criteria
- Admin can assign multiple developers with different roles
- Assignment validation prevents invalid assignments (non-TW as TW, etc.)
- All assigned users receive notifications
- Developer workload view helps with load balancing
- SLA target correctly calculated and displayed

---

## PHASE 5: Developer Workspace (3-4 days)

### Objectives
- Update developer dashboard to show role
- Update assignment views with role badges
- Show team members in request detail
- Enable role-specific features (future)

### Tasks

#### Day 1: Developer Dashboard Updates
- [ ] Update `app/(developer)/developer/dashboard/page.tsx`
  - Fetch developer's role from session
  - Display role badge prominently
  - Group assignments by status
  - Show "My Role" in each assignment card

- [ ] Create `components/developer/role-badge.tsx`
  - Color-coded badges for each role
  - SA: Blue
  - TW: Green
  - BE: Purple
  - FE: Orange
  - QA: Red
  - DM: Gray

#### Day 2: Assignment List Updates
- [ ] Update `app/(developer)/developer/assignments/page.tsx`
  - Show developer's role in each row
  - Filter by: My Role, Status, Priority
  - Sort by: SLA, Priority, Date

- [ ] Update `components/developer/assignment-list-client.tsx`
  - Add "My Role" column
  - Add role filter
  - Show SLA status indicator
  - Show team size indicator (e.g., "Team of 5")

#### Day 3: Request Detail - Team View
- [ ] Update `app/(developer)/developer/requests/[id]/page.tsx`
  - Fetch all team members for this request
  - Display team section

- [ ] Create `components/developer/team-members-card.tsx`
  ```
  Team Members (5):
  ─────────────────
  👤 Ahmad Nur (You)
     Backend Developer
  
  👤 Siti Aminah
     Frontend Developer
  
  👤 Budi Santoso
     Quality Assurance
  
  📝 Technical Writer:
     Dewi Lestari
  
  👔 Team Leader:
     Pak Eko
  ```
  - Highlight current user
  - Show contact info (email, phone if available)
  - Show online status (future feature)

#### Day 4: Role-Specific Features (Optional)
- [ ] Add role-specific hints/tips in UI
  - BE: "Focus on API and backend logic"
  - FE: "Focus on UI/UX implementation"
  - QA: "Ensure all features are tested"
  - etc.

- [ ] Add role-specific checklists (future feature)
  - BE: API endpoints, database changes, etc.
  - FE: UI components, responsiveness, etc.
  - QA: Test cases, bug reports, etc.

### Deliverables
- ✅ Developer dashboard shows role badge
- ✅ Assignment list shows developer's role
- ✅ Request detail shows full team with roles
- ✅ Role-based UI elements (badges, colors)

### Success Criteria
- Developers can easily see their role in each assignment
- Team composition is visible in request detail
- Role badges are consistent across all pages
- UI clearly differentiates between different roles

---

## PHASE 6: Reporting Updates (4-5 days)

### Objectives
- Update SLA calculation to use business days
- Add developer role metrics to Laptri
- Update SLA achievement report
- Add new report: Developer Workload History

### Tasks

#### Day 1: SLA Calculation Update
- [ ] Update `app/actions/reports.ts`
  - Modify `calculateSLAStatus()` to use business days
  - Fetch holidays from database
  - Update all SLA-related queries

- [ ] Test SLA calculation
  - Verify weekends excluded
  - Verify holidays excluded
  - Compare old vs new calculation on sample data

#### Day 2: Laptri Report Updates
- [ ] Update `app/actions/reports.ts` - `getLaptriReport()`
  - Add developer role breakdown
  - Query: Count of completed requests by developer role involved
  - Query: Avg completion time by developer role
  - Add to report data structure

- [ ] Update `app/(admin)/admin/reports/laptri/laptri-client.tsx`
  - Add new section: "Developer Role Distribution"
  - Table: Role | Count | Avg Completion Time
  - Chart: Bar chart of developer role involvement

#### Day 3: SLA Achievement Report Updates
- [ ] Update `app/actions/reports.ts` - `getSLAReport()`
  - Use business days calculation
  - Update all time-related fields
  - Add developer role correlation (optional)

- [ ] Update `app/(admin)/admin/reports/sla/sla-client.tsx`
  - Update labels: "hours" → "business days"
  - Update calculations display
  - Add note: "Business days exclude weekends and holidays"

#### Day 4: New Report - Developer Workload History
- [ ] Create `app/(admin)/admin/reports/developer-workload/page.tsx`
  - Date range selector
  - Filter by developer role
  - Table: Developer | Role | Completed | Avg Time | SLA Met %
  - Export to Excel

- [ ] Create server action `getDeveloperWorkloadHistory()`
  ```typescript
  type DeveloperWorkloadHistory = {
    userId: number;
    name: string;
    role: string;
    completedRequests: number;
    avgCompletionDays: number;
    slaMetPercentage: number;
    totalAssignments: number;
  };
  ```

#### Day 5: Excel Export Updates
- [ ] Update `lib/utils/excel-export.ts`
  - Add sheet for developer role breakdown
  - Update SLA sheet to show business days
  - Add developer workload sheet (new report)

### Deliverables
- ✅ SLA calculation uses business days
- ✅ Laptri includes developer role metrics
- ✅ SLA report updated with business days
- ✅ New developer workload report created
- ✅ Excel exports include new data

### Success Criteria
- SLA calculations accurate with business days
- Reports show correct developer role breakdown
- Excel exports include all new metrics
- Reports are performant (< 3 seconds load time)

---

## PHASE 7: Master Data UI (3-4 days)

### Objectives
- Create developer roles management page
- Create applications master view
- Create SLA holidays management page
- Add admin navigation links

### Tasks

#### Day 1: Developer Roles Management
- [ ] Create `app/(admin)/admin/settings/developer-roles/page.tsx`
  - List all developer roles
  - CRUD operations
  - Toggle active status
  - Reorder (sort_order)

- [ ] Create `components/admin/developer-role-form.tsx`
  - Code input (2-10 chars, uppercase)
  - Name input
  - Description textarea
  - Sort order number input
  - Active checkbox

#### Day 2: Applications Master View
- [ ] Create `app/(admin)/admin/settings/applications/page.tsx`
  - List all applications
  - Search by name
  - Sort by name, version, created date
  - View history (all related requests)
  - **Cannot** manually add/edit (read-only except for viewing)

- [ ] Create `components/admin/application-list.tsx`
  - Table: Name | Current Version | Created | Total Requests | Last Updated
  - Click → view application detail

- [ ] Create `app/(admin)/admin/settings/applications/[id]/page.tsx`
  - Application details
  - Version history (all RFC requests)
  - Timeline of version changes

#### Day 3: SLA Holidays Management
- [ ] Create `app/(admin)/admin/settings/sla-holidays/page.tsx`
  - Calendar view (optional, nice-to-have)
  - Table view: Date | Description | Active
  - CRUD operations
  - Bulk import from CSV
  - Quick add: Indonesian national holidays preset

- [ ] Create `components/admin/holiday-form.tsx`
  - Date picker
  - Description input
  - Active checkbox

- [ ] Create `components/admin/holiday-bulk-import.tsx`
  - CSV upload
  - Preview before import
  - Format: date,description (2024-01-01,New Year)

#### Day 4: Navigation & Integration
- [ ] Update `lib/config/navigation.ts`
  - Add "Developer Roles" link under Settings
  - Add "Applications" link under Settings
  - Add "SLA Holidays" link under Settings

- [ ] Update admin dashboard
  - Add quick stats: Total applications, Active developers by role

### Deliverables
- ✅ Developer roles management page
- ✅ Applications master view (read-only)
- ✅ SLA holidays management page
- ✅ All pages accessible from admin navigation

### Success Criteria
- Admin can manage developer roles
- Admin can view all applications and their histories
- Admin can manage SLA holidays
- All pages integrated into navigation

---

## PHASE 8: Data Migration (2-3 days)

### Objectives
- Migrate existing users to new structure
- Migrate existing requests to new structure
- Migrate team assignments to individual assignments
- Handle edge cases and data cleanup

### Tasks

#### Day 1: User Migration
- [ ] Create migration script: `scripts/migrate-users.ts`
  - Find all users with role = DEVELOPER
  - For each developer:
    - If team assignment exists, try to infer role from team name
    - Otherwise, show UI for admin to select developer_role
    - Update user record with developer_role_id
  - Verify: All developers have developer_role_id set
  - Generate report: Users migrated, missing data

- [ ] Run migration on development database
- [ ] Review and fix any issues
- [ ] Document migration steps

#### Day 2: Request & Application Migration
- [ ] Create migration script: `scripts/migrate-requests-applications.ts`
  - Find all NEW_APPLICATION requests with status APPROVED or COMPLETED
  - For each:
    - Create entry in request_applications
      - application_name = request.title
      - current_version = "1.0.0"
      - created_by = request.requester_id
    - Update request.application_id = newly created ID
  - Find all RFC requests
    - Try to match title with application_name
    - If match found, set application_id
    - If not found, flag for manual review
  - Generate report: Applications created, RFCs matched, orphaned RFCs

- [ ] Run migration on development database
- [ ] Manual review of flagged items
- [ ] Document edge cases

#### Day 3: Assignment Migration & Cleanup
- [ ] Create migration script: `scripts/migrate-assignments.ts`
  - Find all request_assignments (old structure)
  - For each assignment:
    - Find all team_members for that team
    - For each team member:
      - Create request_team_assignment entry
      - Set developer_role_id to user's developer_role_id
      - If user doesn't have developer_role_id, default to BE
      - Copy assigned_by, assigned_at
  - Verify: All active assignments migrated
  - Generate report: Assignments migrated, defaults used

- [ ] Drop old tables (backup first!)
  ```sql
  -- Backup
  CREATE TABLE teams_backup AS SELECT * FROM teams;
  CREATE TABLE team_members_backup AS SELECT * FROM team_members;
  CREATE TABLE request_assignments_backup AS SELECT * FROM request_assignments;
  
  -- Drop
  DROP TABLE IF EXISTS team_members;
  DROP TABLE IF EXISTS teams;
  DROP TABLE IF EXISTS request_assignments;
  ```

- [ ] Run full test suite on migrated database
- [ ] Generate final migration report

### Deliverables
- ✅ All users have correct developer_role_id (if developer)
- ✅ All approved NEW_APPLICATIONs have application master entries
- ✅ All RFCs linked to applications (or flagged for review)
- ✅ All team assignments converted to individual assignments
- ✅ Old tables backed up and removed
- ✅ Migration report documenting changes

### Success Criteria
- Zero data loss during migration
- All relationships preserved
- Application can run on migrated database
- All pages load without errors
- Reports show accurate data

---

## PHASE 9: Testing & QA (5-7 days)

### Objectives
- Comprehensive testing of all new features
- End-to-end scenario testing
- Performance testing
- Security testing
- Bug fixing

### Tasks

#### Day 1: Unit Testing
- [ ] Test version validation utilities
  - Valid versions accepted
  - Invalid versions rejected
  - Comparison logic correct
  - Suggestion function correct

- [ ] Test business days calculation
  - Weekends excluded
  - Holidays excluded
  - Edge cases (start/end on weekend, holiday)
  - Performance with large date ranges

- [ ] Test assignment validation
  - TW must have correct role
  - Developers must have role=DEVELOPER
  - Cannot assign twice with same role

#### Day 2-3: Integration Testing
- [ ] Test NEW_APPLICATION flow
  1. User creates NEW_APPLICATION
  2. Admin approves
  3. Application master created automatically
  4. Admin assigns team
  5. Developers see assignment
  6. Progress updates
  7. Request completed
  8. Reports show correct data

- [ ] Test RFC flow
  1. User selects application from dropdown
  2. User enters version > current version
  3. Validation passes
  4. Submit request
  5. Admin assigns team
  6. Request completed
  7. Application master version updated
  8. Next RFC shows new version as current

- [ ] Test invalid RFC flow
  1. User enters version <= current version
  2. Validation fails with clear message
  3. User corrects version
  4. Validation passes

#### Day 4: End-to-End Testing
- [ ] Admin workflow
  - View pending requests
  - Set priority
  - Assign team (multiple developers, TW, leader)
  - Check developer workload before assigning
  - Monitor progress
  - View reports

- [ ] Developer workflow
  - See role badge on dashboard
  - View assignments filtered by role
  - Open request, see team members
  - Update progress
  - Collaborate with team (comments, etc.)

- [ ] User workflow
  - Create NEW_APPLICATION
  - Track progress
  - Create RFC after first app completed
  - Version validation works

#### Day 5: Performance Testing
- [ ] Database query performance
  - Complex joins (requests + applications + assignments)
  - Report queries (1000+ requests)
  - Business days calculation (100+ dates)
  - Target: < 1 second for most queries

- [ ] Page load performance
  - Request list (50 items)
  - Request detail with team
  - Admin dashboard with stats
  - Reports with charts
  - Target: < 2 seconds initial load

- [ ] Load testing (optional)
  - Simulate 50 concurrent users
  - Monitor database connections
  - Check for bottlenecks

#### Day 6: Security Testing
- [ ] Authorization checks
  - User cannot access admin pages
  - Developer cannot access other developer's data (beyond team)
  - Admin can access all data

- [ ] Input validation
  - SQL injection prevention (Drizzle ORM should handle)
  - XSS prevention (Next.js should handle)
  - File upload validation

- [ ] Session management
  - Token expiration
  - Logout clears session
  - No sensitive data in client

#### Day 7: Bug Fixes & Regression Testing
- [ ] Fix all P0 (critical) bugs
- [ ] Fix all P1 (high priority) bugs
- [ ] Document P2 (medium) and P3 (low) bugs for future sprints
- [ ] Re-run all tests after fixes
- [ ] Final smoke test on staging environment

### Deliverables
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ End-to-end scenarios working
- ✅ Performance benchmarks met
- ✅ Security checks passed
- ✅ Critical bugs fixed
- ✅ Test report documenting results

### Success Criteria
- 100% unit test coverage for critical utilities
- All key user journeys work without errors
- Page loads meet performance targets
- No critical or high-severity bugs
- Security checks all passed

---

## PHASE 10: Documentation & Deployment (2-3 days)

### Objectives
- Update all documentation
- Create migration guide for production
- Deploy to staging
- Deploy to production
- Train users

### Tasks

#### Day 1: Documentation Updates
- [ ] Update `.ai/DATABASE.md` with new schema
- [ ] Update `.ai/BUSINESS_RULES.md` with new flows
- [ ] Update `.ai/ARCHITECTURE.md` with new components
- [ ] Update `USER_GUIDE.md`
  - New request form flow
  - Version validation explanation
  - RFC vs NEW_APPLICATION
- [ ] Update `ADMIN_GUIDE.md`
  - New assignment process
  - Developer workload view
  - Master data management
- [ ] Update `DEVELOPER_GUIDE.md`
  - Developer roles explanation
  - Team collaboration
  - Role-specific responsibilities
- [ ] Create `MIGRATION_GUIDE.md`
  - Step-by-step migration from old to new
  - Backup procedures
  - Rollback plan
  - Troubleshooting

#### Day 2: Staging Deployment
- [ ] Backup staging database
- [ ] Run database migrations on staging
- [ ] Run data migration scripts on staging
- [ ] Deploy application code to staging
- [ ] Smoke test on staging
- [ ] Invite stakeholders to test staging
- [ ] Fix any issues found

#### Day 3: Production Deployment
- [ ] Schedule deployment window (off-hours recommended)
- [ ] Announce maintenance window to users
- [ ] Backup production database (full backup)
- [ ] Run database migrations on production
- [ ] Run data migration scripts on production
- [ ] Deploy application code to production
- [ ] Run post-deployment checks
  - All pages load
  - Database connections working
  - No errors in logs
- [ ] Monitor for 1 hour after deployment
- [ ] Announce deployment complete

#### Training Materials (Optional)
- [ ] Create video walkthrough for users (10 min)
  - New request form
  - RFC flow with version validation
- [ ] Create video walkthrough for admins (15 min)
  - New assignment process
  - Developer workload management
- [ ] Create video walkthrough for developers (10 min)
  - Role badges and team view
- [ ] Schedule training sessions (optional)

### Deliverables
- ✅ All documentation updated
- ✅ Migration guide completed
- ✅ Staging deployment successful
- ✅ Production deployment successful
- ✅ Post-deployment monitoring complete
- ✅ Training materials created (optional)

### Success Criteria
- Documentation is clear and accurate
- Staging deployment works without issues
- Production deployment completes successfully
- No critical issues in first hour post-deployment
- Users can access and use the system

---

## Risk Management

### High-Risk Items

#### 1. Data Migration
**Risk:** Data loss or corruption during migration  
**Likelihood:** Medium  
**Impact:** Critical  
**Mitigation:**
- Full database backup before migration
- Test migration on copy of production data
- Dry-run on staging environment
- Manual verification of sample data
- Rollback plan ready

**Rollback Plan:**
1. Restore database from backup
2. Redeploy old application version
3. Verify system functionality
4. Investigate migration failure
5. Fix and retry

#### 2. Version Validation Complexity
**Risk:** User confusion with semantic versioning  
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Clear error messages
- Inline help text and tooltips
- Suggestion buttons (auto-suggest next version)
- Examples in placeholder
- Training materials

#### 3. Assignment Flow Changes
**Risk:** Admins struggle with new assignment process  
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- Thorough admin training
- Walkthrough video
- Step-by-step guide
- Helpdesk support during rollout
- Phased rollout (pilot group first)

#### 4. Performance Degradation
**Risk:** New queries slow down application  
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- Performance testing before deployment
- Database indexes on all foreign keys
- Query optimization (use EXPLAIN)
- Caching for frequently accessed data
- Database monitoring post-deployment

#### 5. Developer Adoption
**Risk:** Developers don't understand new role-based system  
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Clear role descriptions
- Training session for developers
- FAQ document
- Support channel (Slack/Teams)
- Gradual onboarding

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### Technical KPIs
- **Page Load Time:** < 2 seconds (95th percentile)
- **API Response Time:** < 500ms (average)
- **Database Query Time:** < 1 second (complex queries)
- **Uptime:** > 99.5%
- **Error Rate:** < 0.1%

#### User Adoption KPIs
- **Successful Request Submissions:** > 95% (without errors)
- **Admin Assignment Time:** < 5 minutes per request
- **User Training Completion:** > 80% of users
- **Support Tickets:** < 5 per week (first month)

#### Business KPIs
- **Request Processing Time:** Reduced by 20%
- **Assignment Accuracy:** > 95% (right developers with right roles)
- **SLA Achievement:** Improved by 10%
- **User Satisfaction:** > 4.0/5.0 (survey)

---

## Post-Deployment Plan

### Week 1: Intensive Monitoring
- [ ] Monitor application logs hourly
- [ ] Check database performance metrics
- [ ] Review user support tickets daily
- [ ] Fix P0 bugs immediately
- [ ] Schedule daily stand-ups with team

### Week 2-4: Standard Monitoring
- [ ] Daily log review
- [ ] Weekly performance report
- [ ] Track user adoption metrics
- [ ] Gather user feedback
- [ ] Address P1 bugs within 48 hours

### Month 2-3: Stabilization
- [ ] Weekly monitoring review
- [ ] Monthly stakeholder report
- [ ] Plan for Phase 2 enhancements
- [ ] Review success metrics
- [ ] Optimize based on usage patterns

---

## Appendix A: Checklist by Role

### Developer Checklist
- [ ] All database schema files created/updated
- [ ] All TypeScript types created/updated
- [ ] All server actions implemented
- [ ] All UI components created/updated
- [ ] All pages created/updated
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Code reviewed
- [ ] Documentation updated

### QA Checklist
- [ ] Test plan created
- [ ] Test cases documented
- [ ] Unit tests executed
- [ ] Integration tests executed
- [ ] End-to-end tests executed
- [ ] Performance tests executed
- [ ] Security tests executed
- [ ] Bug reports created
- [ ] Regression testing completed

### Admin Checklist
- [ ] Staging environment prepared
- [ ] Production backup completed
- [ ] Database migrations reviewed
- [ ] Data migration scripts reviewed
- [ ] Rollback plan documented
- [ ] Deployment schedule communicated
- [ ] Monitoring tools configured
- [ ] Support team briefed

### Documentation Writer Checklist
- [ ] User guide updated
- [ ] Admin guide updated
- [ ] Developer guide updated
- [ ] API documentation updated
- [ ] Migration guide created
- [ ] Changelog updated
- [ ] Training materials created
- [ ] FAQ updated

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-06  
**Status:** APPROVED - Ready for Implementation
