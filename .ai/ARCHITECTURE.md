# SIPPA Architecture

## Proposed application architecture
- Next.js App Router
- TypeScript
- Server Components by default; Client Components only where interaction requires them
- Route Handlers / Server Actions for application APIs and mutations as appropriate
- ORM: Drizzle ORM
- MySQL via mysql2
- Form validation: Zod
- Form state: React Hook Form
- UI: Tailwind CSS 4 + shadcn/ui (base-ui primitives)

## High-level layers
1. UI / route layer
2. Application use-cases / services
3. Domain validation and business rules
4. Data access / repository layer
5. MySQL
6. File storage / notifications (integration points)

## Principles
- Role-based authorization is enforced server-side; hiding a button is not authorization.
- Validate every mutation on the server.
- Keep request workflow transitions explicit and auditable.
- Keep reporting queries separated from transactional mutations where useful.
- Prefer reusable domain components over duplicated page-specific logic.

## Main feature modules
- auth
- dashboard
- requests
- assignments
- progress
- reports
- sla
- users/roles
- audit
- attachments
- notifications

## Component Architecture

### Directory Structure
```
components/
  ui/                    # shadcn/ui primitives (base-ui components)
    button.tsx
    checkbox.tsx         # NEW (Phase 3)
    input.tsx
    card.tsx
    dialog.tsx
    dropdown-menu.tsx
    avatar.tsx
    breadcrumb.tsx
    skeleton.tsx
    alert.tsx
    separator.tsx
    popover.tsx
    scroll-area.tsx
    badge.tsx
    label.tsx
    select.tsx
    table.tsx
    tabs.tsx
    textarea.tsx
    toast.tsx
    
  layout/               # Application shell components
    app-shell.tsx       # Main layout wrapper with sidebar + topnav
    top-nav.tsx         # Top navigation bar
    sidebar.tsx         # Desktop sidebar navigation (Phase 1)
    mobile-nav.tsx      # Mobile drawer navigation (Phase 1)
    user-menu.tsx       # User dropdown menu with logout
    page-header.tsx     # Page title and action bar
    page-container.tsx  # Standard page wrapper with padding
    
  shared/               # Application-wide reusable components
    empty-state.tsx     # No data placeholder
    error-state.tsx     # Error display with retry
    loading-state.tsx   # Loading spinner with message
    confirm-dialog.tsx  # Confirmation modal for destructive actions
    
  requests/             # Domain-specific components
    status-badge.tsx
    priority-badge.tsx
    sla-badge.tsx
    request-form-single.tsx           # NEW (Phase 2) - Single-page form
    application-selector.tsx          # NEW (Phase 2) - RFC application dropdown
    version-input.tsx                 # NEW (Phase 2) - Version validation input
    request-list-client.tsx           # UPDATED (Phase 2) - Application column
    team-info-card.tsx                # NEW (Phase 4) - Team composition display
    
  admin/                # Admin-specific components
    team-assignment-dialog.tsx        # NEW (Phase 3) - Team assignment UI
    developer-role-distribution-widget.tsx  # NEW (Phase 3) - Dashboard widget
    request-admin-actions.tsx         # UPDATED (Phase 3) - Assignment actions
    
  developer/            # Developer-specific components
    role-badge.tsx                    # NEW (Phase 4) - Developer role badge
    developer-request-table.tsx       # UPDATED (Phase 4) - "My Role" column
    assignment-list-client.tsx        # UPDATED (Phase 4) - Role display
    
  settings/             # Settings/Master data components
    master-data/
      master-data-dialog.tsx          # UPDATED (Phase 6) - Deprecated teams
      master-data-table.tsx           # UPDATED (Phase 6) - Deprecated teams
    sla-policies/
      create-sla-policy-dialog.tsx    # UPDATED (Phase 1) - Business days
      edit-sla-policy-dialog.tsx      # UPDATED (Phase 1) - Business days
      sla-policy-table.tsx            # UPDATED (Phase 1) - Business days display
    developer-roles/                  # NEW (Phase 6)
      developer-role-form.tsx
      developer-role-table.tsx
    sla-holidays/                     # NEW (Phase 6)
      sla-holiday-form.tsx
      sla-holiday-table.tsx
      holiday-bulk-import.tsx
```

### Component Principles
- **UI primitives** are unchanged from shadcn/ui, use base-ui React primitives
- **Layout components** handle application shell and navigation
- **Shared components** are domain-agnostic, reusable across features
- **Feature components** are specific to business domains (requests, reports, etc.)
- **Phase 2-4 additions:** Single-page form, team assignment, role badges, team composition
- **Phase 6 additions:** Developer roles management, SLA holidays management

### State Management
- Server state: React Server Components (default)
- Client state: React hooks (useState, useReducer)
- Forms: React Hook Form + Zod validation
- No global state library needed for v1.0

### Key Component Changes (Phase 1-8)

#### Phase 2: User Request Flow
- **request-form-single.tsx:** Single-page form with conditional rendering
  - NEW_APPLICATION: shows title input, auto-sets version "1.0.0"
  - RFC: shows application dropdown + version input
  - Real-time version validation
- **application-selector.tsx:** Dropdown populated from request_applications
- **version-input.tsx:** Semantic version input with validation and auto-suggest

#### Phase 3: Admin Assignment Flow
- **team-assignment-dialog.tsx:** Complex assignment UI
  - DevTI Urusan text input
  - Team Leader dropdown (all users)
  - Technical Writer dropdown (filtered to TW role)
  - Developer multi-select with role badges
  - SLA target display
- **developer-role-distribution-widget.tsx:** Dashboard widget showing role distribution
- **request-admin-actions.tsx:** Updated with team assignment button

#### Phase 4: Developer Workspace
- **role-badge.tsx:** Color-coded badges for developer roles (SA, TW, BE, FE, QA, DM)
- **team-info-card.tsx:** Displays full team composition
  - Team Leader
  - Technical Writer
  - All assigned developers with roles
  - Current user highlighted
- **developer-request-table.tsx:** Added "My Role" column
- **assignment-list-client.tsx:** Shows developer's role in each assignment

#### Phase 6: Master Data Management
- **developer-roles:** CRUD components for managing SA, TW, BE, FE, QA, DM
- **sla-holidays:** CRUD components for holiday calendar management
- **Applications:** Read-only view of application masters (auto-created from NEW_APPLICATION)
- **Teams (deprecated):** Shows deprecation notice, replaced by individual assignments

## Navigation Architecture

### Centralized Configuration
- Navigation menu defined in `lib/config/navigation.ts`
- Role-based filtering via `getNavigationForRole(role)`
- Menu items include: label, href, icon, roles[]
- Sections support optional titles for grouping

### Role-Based Menus
- **User**: Dashboard, Request Baru, DevTI Request
- **Admin**: Dashboard, DevTI Request, Laptri, Pencapaian SLA, Settings
- **Developer**: Dashboard, My Assignment, DevTI Request

### Active State
- Uses `usePathname()` to detect current route
- Active items styled with primary background
- Includes `aria-current="page"` for accessibility

## Suggested route map
- `/login` - Authentication (auth layout)
- `/` - Landing/redirect based on role
- `/dashboard` - User dashboard (user layout)
- `/requests/new` - Submit new request (user layout)
- `/requests` - User request list (user layout)
- `/requests/[id]` - Request detail (user layout)
- `/admin/dashboard` - Admin dashboard (admin layout)
- `/admin/requests` - Admin request list (admin layout)
- `/admin/requests/[id]` - Admin request detail (admin layout)
- `/admin/reports/laptri` - Quarterly report (admin layout)
- `/admin/reports/sla` - SLA report (admin layout)
- `/admin/settings` - Settings (admin layout)
- `/developer/dashboard` - Developer dashboard (developer layout)
- `/developer/assignments` - Developer assignments (developer layout)
- `/developer/requests` - Developer request list (developer layout)

## Layout Structure

### Role-Based Layouts
Each role has its own layout wrapper:
- `app/(user)/layout.tsx` - Wraps user pages with AppShell
- `app/(admin)/layout.tsx` - Wraps admin pages with AppShell
- `app/(developer)/layout.tsx` - Wraps developer pages with AppShell
- `app/(auth)/layout.tsx` - No shell, centered form layout

### AppShell Props
```typescript
<AppShell 
  user={session.user}
  role={role}
  breadcrumbs={[...]}  // optional
>
  {children}
</AppShell>
```

## Suggested project structure
```text
app/
  (auth)/
    login/
  (user)/
    dashboard/
    requests/
      new/            # Single-page form (Phase 2)
      [id]/           # Request detail with team view
  (admin)/
    admin/
      dashboard/      # Updated metrics (Phase 3)
      requests/       # Enhanced with assignment (Phase 3)
        [id]/         # Team assignment dialog
      reports/
        laptri/       # Developer role distribution (Phase 5)
        sla/          # Business days calculation (Phase 5)
      settings/
        applications/ # NEW (Phase 6) - Read-only application master
        developer-roles/  # NEW (Phase 6) - Developer role CRUD
        sla-holidays/     # NEW (Phase 6) - Holiday calendar CRUD
        priorities/
        units/
        users/
        teams/        # DEPRECATED (Phase 1) - Shows deprecation notice
  (developer)/
    developer/
      dashboard/      # Role badge (Phase 4)
      assignments/    # "My Role" column (Phase 4)
      requests/       # Team composition view (Phase 4)
        [id]/

components/
  ui/                 # shadcn/ui primitives + checkbox (Phase 3)
  layout/             # Application shell
  shared/             # Reusable components
  requests/           # Request-specific (form, selectors, badges, team card)
  admin/              # Admin-specific (assignment dialog, widgets)
  developer/          # Developer-specific (role badge, tables)
  settings/           # Master data management

lib/
  config/
    navigation.ts
  db/
    schema/
      users.ts            # UPDATED (Phase 1) - developer_role_id
      requests.ts         # UPDATED (Phase 1) - application_id, requested_version, etc.
      developer-roles.ts  # NEW (Phase 1)
      request-applications.ts  # NEW (Phase 1)
      sla-holidays.ts     # NEW (Phase 1)
      request-team-assignments.ts  # NEW (Phase 1) - Replaced request_assignments
      sla.ts              # UPDATED (Phase 1) - target_business_days
      index.ts
    migrations/
      0001_restructure_phase1.sql  # Phase 1 schema changes
      seeds/
        001_developer_roles.sql
        002_sla_holidays.sql
    seed.ts             # UPDATED (Phase 1) - New seed data
    
  utils/
    version.ts          # NEW (Phase 2) - Version validation utilities
    migration.ts        # NEW (Phase 7) - Migration utilities
    role-badge.ts       # NEW (Phase 4) - Role color utilities
    
  validations/
    request.ts          # UPDATED (Phase 2) - Discriminated union for NEW_APP/RFC
    assignment.ts       # NEW (Phase 3) - Team assignment validation
    
  permissions/        # Role-based access control
  constants.ts
  utils.ts

types/
  users.ts            # UPDATED - DeveloperRole
  requests.ts         # UPDATED - Application, RequestedVersion
  request-applications.ts  # NEW
  developer-roles.ts  # NEW
  request-assignments.ts   # UPDATED - RequestTeamAssignment

.ai/                  # AI context files
  ARCHITECTURE.md     # This file
  DATABASE.md         # Phase 1-8 schema
  BUSINESS_RULES.md   # Phase 2-4 flows
  DECISIONS.md        # ADR-0013 to ADR-0016 (Phase 2-3)
  PHASE_*_COMPLETE.md # Phase completion summaries
  RESTRUCTURE_*.md    # Restructure planning docs

db/                   # Root-level migrations (Drizzle)
  migrations/
```

## Server Actions & API Structure

### Request Management (`app/actions/requests.ts`)
**Updated in Phase 2:**
- `createRequest(data)` - Unified for NEW_APPLICATION and RFC
  - Validates version for RFC
  - Links to application for RFC
  - Auto-sets version "1.0.0" for NEW_APPLICATION
- `getRequestById(id)` - Includes application data
- `getRequestsByUserId()` - Includes application names
- Version validation before submission

**Key Changes:**
- Discriminated union validation (NEW_APPLICATION vs RFC)
- Application lookup and version comparison
- Real-time version progression validation

### Admin Request Management (`app/actions/admin-requests.ts`)
**Updated in Phase 3:**
- `assignTeamToRequest(requestId, assignmentData)` - Batch assignment
  - Accepts: devtiUrusan, teamLeaderId, technicalWriterId, developers[]
  - Validates: TW role, developer roles, minimum 1 developer
  - Creates multiple request_team_assignments entries
  - Updates request fields (devti_urusan, technical_writer_id, team_leader_id)
  - Changes status to IN_PROGRESS
  - Sends notifications to all team members
- `approveRequest(id)` - Creates application master for NEW_APPLICATION
- `getDeveloperWorkload()` - Shows active assignments per developer

**Key Changes:**
- Team assignment replaces single developer assignment
- Application master auto-creation on NEW_APPLICATION approval
- Developer workload aggregation for assignment decisions

### Developer Request Management (`app/actions/developer-requests.ts`)
**Updated in Phase 4:**
- `getAssignedRequests(userId)` - Includes developer's role in each assignment
- `getRequestTeamMembers(requestId)` - Full team composition
  - Returns: teamLeader, technicalWriter, developers[] with roles
  - Highlights current user

**Key Changes:**
- Role-specific data in assignment queries
- Team composition queries for collaboration view

### Developer Roles Management (`app/actions/developer-roles.ts`)
**New in Phase 6:**
- `getAllDeveloperRoles()` - For dropdowns
- `getActiveDeveloperRoles()` - Active only
- `createDeveloperRole(data)` - Admin only
- `updateDeveloperRole(id, data)` - Admin only
- `toggleDeveloperRoleStatus(id)` - Admin only

### Request Applications (`app/actions/request-applications.ts`)
**New in Phase 2:**
- `getAllApplications()` - For RFC dropdown
- `getApplicationById(id)` - With current version
- `createApplicationFromRequest(request)` - Internal, called on approval
- `updateApplicationVersion(id, version)` - Internal, called on RFC completion
- `getApplicationHistory(id)` - All requests for this application

### SLA Holidays Management (`app/actions/sla-holidays.ts`)
**New in Phase 6:**
- `getAllHolidays()` - For business days calculation
- `getHolidaysByYear(year)` - Year filter
- `createHoliday(data)` - Admin only
- `updateHoliday(id, data)` - Admin only
- `deleteHoliday(id)` - Admin only
- `bulkImportHolidays(csvData)` - CSV import

### Utility Functions

#### Version Validation (`lib/utils/version.ts`)
**New in Phase 2:**
```typescript
parseVersion(version: string): number[]
// "1.2.3" → [1, 2, 3]

compareVersions(v1: string, v2: string): number
// Returns: -1 (v1 < v2), 0 (equal), 1 (v1 > v2)

validateVersionProgression(requested: string, current: string): { valid: boolean, error?: string }
// Validates requested > current with error message

suggestNextVersion(current: string, bump: 'patch' | 'minor' | 'major'): string
// Auto-suggest next version
```

#### Business Days Calculation (`lib/utils/migration.ts`)
**New in Phase 5/7:**
```typescript
isWeekend(date: Date): boolean
// Check if Saturday or Sunday

isHoliday(date: Date, holidays: Date[]): boolean
// Check against sla_holidays

calculateBusinessDays(start: Date, end: Date, holidays: Date[]): number
// Count business days between dates

addBusinessDays(start: Date, days: number, holidays: Date[]): Date
// Add N business days to date
```

#### Role Badge Utilities (`lib/utils/role-badge.ts`)
**New in Phase 4:**
```typescript
getRoleBadgeColor(roleCode: string): string
// Returns Tailwind color class for role badge
// SA: purple, TW: blue, BE: green, FE: yellow, QA: red, DM: indigo
```

## Data Flow (Phase 1-8 Integration)

### NEW_APPLICATION Flow
1. **User submits** (app/(user)/requests/new/page.tsx)
   - Single-page form (request-form-single.tsx)
   - Title, description, urgency, attachments
   - Version auto-set to "1.0.0"

2. **Server Action** (createRequest)
   - Validates form data (Zod schema)
   - Creates request record
   - Status: SUBMITTED

3. **Admin approves** (app/(admin)/admin/requests/[id]/page.tsx)
   - Sets priority
   - Clicks approve
   - **Application master auto-created** (createApplicationFromRequest)
     - application_name = request.title
     - current_version = "1.0.0"
   - request.application_id linked

4. **Admin assigns team** (team-assignment-dialog.tsx)
   - DevTI Urusan
   - Team Leader (any user)
   - Technical Writer (TW role only)
   - Developers with roles (multi-select)
   - assignTeamToRequest server action
   - Creates multiple request_team_assignments
   - Status: IN_PROGRESS
   - Notifications sent

5. **Developers work** (app/(developer)/developer/requests/[id]/page.tsx)
   - View role badge
   - See team composition (team-info-card.tsx)
   - Update progress
   - Collaborate with team

6. **Request completed**
   - Status: COMPLETED
   - Available in reports

### RFC Flow
1. **User submits** (app/(user)/requests/new/page.tsx)
   - Single-page form (request-form-single.tsx)
   - Select application (application-selector.tsx)
   - Enter requested version (version-input.tsx)
   - **Real-time validation:** version > current_version
   - Description, urgency, attachments

2. **Server Action** (createRequest)
   - Validates form data
   - **Validates version progression** (validateVersionProgression)
   - Fetches current_version from request_applications
   - Ensures requested > current
   - Creates request record with application_id
   - Status: SUBMITTED

3. **Admin flow** (same as NEW_APPLICATION)
   - Approve
   - Assign team
   - Status: IN_PROGRESS

4. **Developers work** (same as NEW_APPLICATION)

5. **Request completed**
   - Status: COMPLETED
   - **Application master updated:** current_version = requested_version
   - Available in reports
   - Next RFC will see updated current_version


## Phase 1-8 Restructure Summary

### Phase 1: Database Foundation ✅
- Added developer_roles table (6 roles: SA, TW, BE, FE, QA, DM)
- Added request_applications table (application master)
- Added sla_holidays table (61 holidays for 2024-2026)
- Added request_team_assignments table (individual assignments)
- Updated users table (developer_role_id)
- Updated requests table (application_id, requested_version, etc.)
- Updated sla_policies (target_hours → target_business_days)
- Removed teams, team_members tables

### Phase 2: User Request Flow ✅
- Single-page form (replaced multi-step wizard)
- Conditional rendering (NEW_APPLICATION vs RFC)
- Version validation utilities (parse, compare, validate, suggest)
- Real-time version validation on RFC form
- Application selector dropdown
- Server-side version validation before submission

### Phase 3: Admin Assignment Flow ✅
- Team assignment dialog (DevTI Urusan, Team Leader, TW, Developers)
- Developer multi-select with role badges
- Application master auto-creation on NEW_APPLICATION approval
- Dashboard metrics (Belum Di-assign, Developer Role Distribution)
- Developer workload view for assignment decisions
- Batch assignment notifications

### Phase 4: Developer Workspace ✅
- Developer role badges (color-coded by role)
- "My Role" column in assignments table
- Team composition card (Team Leader, TW, peer developers)
- Current user highlighting in team list
- Role-specific views and data

### Phase 5: Reporting Updates ✅
- Business days SLA calculation (Mon-Fri, exclude holidays)
- Developer role distribution in Laptri report
- Updated SLA report with business days
- Excel exports with new metrics

### Phase 6: Master Data Management ✅
- Developer roles CRUD (admin only)
- Applications master view (read-only, auto-created)
- SLA holidays CRUD with CSV import
- Teams page shows deprecation notice

### Phase 7: Data Migration ✅
- Migration scripts for developers, applications, assignments
- Rollback script for emergency recovery
- Verification procedures and dry-run mode
- Migration guide documentation (60 pages)

### Phase 8: Testing & Documentation ✅
- Comprehensive testing checklist (200+ test cases)
- Unit tests for version validation (24 tests, 96% coverage)
- Unit tests for business days calculation (49 tests, 82% coverage)
- Code quality fixes (teams deprecation, SLA business days)
- Phase 8 completion documentation

### Phase 9: Testing & QA (IN PROGRESS)
- Day 1 complete: Unit testing infrastructure
- Remaining: Integration testing, E2E testing, performance, security

### Phase 10: Documentation & Deployment (IN PROGRESS)
- DATABASE.md updated ✅
- BUSINESS_RULES.md updated ✅
- ARCHITECTURE.md updated ✅
- Remaining: USER_GUIDE.md, ADMIN_GUIDE.md, DEVELOPER_GUIDE.md, MIGRATION_GUIDE.md

---

## Technology Stack (Confirmed)

### Core
- **Framework:** Next.js 15.0.4 (App Router)
- **Language:** TypeScript 5.7.3
- **Database:** MySQL 8.0+
- **ORM:** Drizzle ORM 0.38.3
- **Auth:** NextAuth.js 5.0.0-beta.25

### UI & Styling
- **CSS Framework:** Tailwind CSS 4.0.1
- **Components:** shadcn/ui (base-ui primitives)
- **Form Management:** React Hook Form 7.54.2
- **Validation:** Zod 3.24.1

### Testing (Phase 9)
- **Framework:** Jest 29.7.0
- **React Testing:** @testing-library/react 16.1.0
- **Coverage:** 73 tests, 96% for version utils, 82% for migration utils

### Utilities
- **Date Handling:** date-fns 4.1.0
- **Excel Export:** xlsx 0.18.5
- **Charts:** Recharts 2.15.0

### Development
- **Linting:** ESLint 9.18.0
- **Type Checking:** TypeScript strict mode
- **Build:** Next.js built-in compiler (SWC)

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-12  
**Status:** Production-ready (Phase 1-8 complete, Phase 9-10 in progress)
