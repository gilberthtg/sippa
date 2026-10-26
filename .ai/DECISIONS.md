# SIPPA Architecture & Product Decisions

Format:

## ADR-0001 — Initial technical baseline
- Status: Confirmed
- Date: 2026-09-23
- Decision: Next.js + TypeScript + MySQL; Drizzle, Zod, React Hook Form, Tailwind, shadcn/ui
- Reason: Fits a modern web application with clear validation, reusable UI, and relational workflow data.
- Alternatives considered: Various ORMs (Prisma, TypeORM), UI libraries (Material-UI, Ant Design)

## ADR-0002 — Authentication mechanism
- Status: Confirmed
- Date: 2026-09-23
- Decision: NextAuth.js with credential provider (email/password)
- Reason: Built for Next.js, supports multiple providers, widely adopted, good documentation
- Impact: Internal user management required, password hashing with bcrypt
- Alternatives considered: Clerk, Custom implementation

## ADR-0003 — File storage location
- Status: Confirmed
- Date: 2026-09-23
- Decision: Local filesystem storage for attachments
- Reason: Simple for MVP, no external dependencies, sufficient for initial deployment
- Impact: Files stored in /uploads directory (gitignored), scalable to cloud storage later via abstraction layer
- Alternatives considered: AWS S3, Azure Blob, Google Cloud Storage
- Future: Can migrate to cloud storage when scale requires

## ADR-0004 — SLA calculation method
- Status: Confirmed
- Date: 2026-09-23
- Decision: Calendar days 24/7 (no business hour logic)
- Reason: Simple implementation for MVP, clear calculation, no timezone complexity
- Impact: SLA calculated as total hours between submitted_at and completed_at
- Alternatives considered: Business days only, Business hours only
- Future: Can add business-hour logic in v1.1 if needed

## ADR-0005 — SLA start point
- Status: Confirmed
- Date: 2026-09-23
- Decision: SLA starts from submitted_at timestamp
- Reason: Measures total time from user perspective, encourages fast admin response
- Impact: Admin processing time included in SLA
- Alternatives considered: Start from approved_at

## ADR-0006 — Reporting Library Choice
- Status: Confirmed
- Date: 2026-09-23
- Decision: Recharts for chart visualization with abstraction layer
- Reason: React-friendly, good Next.js SSR support, widely adopted
- Impact: Chart components wrapped in abstraction layer (lib/utils/chart-adapter.tsx) allowing library replacement without affecting business logic
- Alternatives considered: Chart.js, Victory, Nivo
- Future: Library can be swapped by rewriting adapter layer only

## ADR-0007 — Report Date Defaults
- Status: Confirmed
- Date: 2026-09-23
- Decision: Both Laptri and SLA reports default to current year with flexible filters
- Reason: Most relevant time period for quarterly and annual reporting
- Impact: Users can override with custom date ranges or specific quarters
- Alternatives considered: Last 30 days, Last quarter, All time

## ADR-0008 — Report Metrics Scope
- Status: Confirmed
- Date: 2026-09-23
- Decision: Include average completion time by type/priority and month-over-month trends; exclude developer performance metrics
- Reason: Focus on organizational metrics, avoid individual performance tracking in v1.0
- Impact: Reports show aggregate data only, no per-developer breakdowns
- Deferred: Developer performance metrics (v1.1+)
- Alternatives considered: Full developer performance dashboard

## ADR-0009 — Excel Export Format
- Status: Confirmed
- Date: 2026-09-23
- Decision: Summary data + raw tables, no embedded charts
- Reason: Simpler implementation, sufficient for v1.0, standard business reporting format
- Impact: Excel files contain 3 sheets: Summary, Monthly Trend, Details
- Alternatives considered: Chart embedding, PDF export
- Future: PDF export and chart embedding can be added in v1.1

## ADR-0010 — Seed Data Strategy
- Status: Confirmed
- Date: 2026-09-23
- Update: 2026-10-21 — seed contents replaced with 5 real user requests (renumbered ids 181-185 → 1-5; devtiUrusanId old units id 10 → 2 per ADR-0020) including their full documents/progress/status-histories/assignments and an extra application master (id 7). See SESSION_LOG 2026-10-21.
- Decision: Development-only seed with 20-30 diverse requests
- Reason: Comprehensive testing coverage without production data mixing
- Impact: Seed script includes 8 SLA policies and 25 completed requests spanning all quarters of 2026
- Data distribution: Multiple types, priorities, units, quarters, SLA results

## ADR-0011 — In-App Notifications
- Status: Confirmed
- Date: 2026-09-24
- Decision: Implement in-app notifications with a bell icon and polling, deferring email/push
- Reason: Lightweight implementation for v1 that fulfills the requirement without external dependencies
- Impact: Client polls every 30s. Channel abstraction (`NotificationChannel`) allows plugging in email later.

## ADR-0012 — Audit Logging Strategy
- Status: Confirmed
- Date: 2026-09-24
- Decision: Write audit logs inline during server actions (fire-and-forget), capturing IP/UA and sanitizing secrets
- Reason: Provides required security trail without blocking business logic or requiring a message queue
- Impact: `audit_logs` table schema expanded with `module`. `actorUserId` made nullable to support failed login tracking.

## Open Decisions
- Notification provider (deferred to v1.1)
- Priority calculation rules (manual admin decision for v1.0)
- User & unit master source (internal database for v1.0)
- User management UI in v1.0 scope
- Developer performance metrics in reports (deferred to v1.1+)


## ADR-0013 — Single-Page Request Form with Conditional Rendering
- Status: Confirmed
- Date: 2026-10-07
- Decision: Replace multi-step wizard with single-page form using conditional rendering based on request type
- Reason: Simplifies user flow, reduces clicks, provides immediate context for all required fields
- Impact:
  - User submits request in single page (was 5 steps, now 1 scrollable page)
  - NEW_APPLICATION shows title input, auto-sets version to "1.0.0"
  - RFC shows application dropdown and version input with real-time validation
  - Conditional validation using Zod discriminated union ensures type safety
- Alternatives considered: Keep multi-step wizard, use tabs, use collapsible sections
- Benefits: Faster submission, better overview, easier to review before submit

## ADR-0014 — Semantic Versioning for Application Versions
- Status: Confirmed
- Date: 2026-10-07
- Decision: Enforce strict semantic versioning (x.y.z) format for all application versions
- Reason: Industry standard, clear progression rules, prevents version confusion
- Impact:
  - NEW_APPLICATION: Auto-set to "1.0.0" (not editable by user)
  - RFC: Must provide version in x.y.z format, must be greater than current version
  - Version validation: Client-side (real-time feedback) + Server-side (data integrity)
  - Version comparison: Major → Minor → Patch hierarchy
- Validation rules:
  - Format: Exactly 3 numbers separated by dots (e.g., "1.2.3")
  - Each part must be non-negative integer
  - Requested version must be > current version for RFC
- Alternatives considered: Date-based versioning (2024.1.0), custom format, no validation
- Future: Can add pre-release tags (1.0.0-beta) in v1.1 if needed

## ADR-0015 — Application Master Created from Approved NEW_APPLICATION
- Status: Confirmed
- Date: 2026-10-07
- Decision: Automatically create entry in request_applications table when NEW_APPLICATION request is approved
- Reason: Maintains single source of truth, ensures application list is accurate, enables RFC workflow
- Impact:
  - Admin approval of NEW_APPLICATION triggers request_applications entry creation
  - applicationName = request.title, currentVersion = "1.0.0"
  - RFC requests can only reference applications in request_applications table
  - When RFC completed, update request_applications.currentVersion to requested_version
- Deferred: Implementation of auto-creation logic (to be done in Plan 3 - Admin flow)
- Related: This decision enables the version management and RFC workflow in Plan 2

## ADR-0016 — Version Validation at Multiple Layers
- Status: Confirmed
- Date: 2026-10-07
- Decision: Validate version at 3 layers - client-side (UX), schema (type), server (data integrity)
- Reason: Defense in depth, best user experience, prevents invalid data in database
- Implementation:
  1. **Client-side (Real-time)**: validateVersionProgression() on input change
     - Immediate feedback with helpful error messages
     - Prevents form submission if invalid
  2. **Schema validation (Zod)**: isValidVersion() refine check
     - Type-safe validation during form parsing
     - Returns structured error for display
  3. **Server-side (Before DB insert)**: validateVersionProgression() + application lookup
     - Final check before database write
     - Compares against current version from database (source of truth)
     - Prevents race conditions or stale client data
- Alternatives considered: Server-only validation, client-only validation
- Benefits: Best UX (immediate feedback), data integrity (server validation), type safety (schema)

## ADR-0017 � Request Status Workflow Restructure
- Status: Confirmed
- Date: 2026-10-19
- Decision: Replace status workflow with SUBMITTED, IN_REVIEW, APPROVED, REJECTED, ONGOING, DONE, ON_HOLD. Consolidate ASSIGNED+IN_PROGRESS into ONGOING. Add ON_HOLD with reason and SLA pause. Allow rejected request resubmission.
- Impact: Database enum migration, server-side transition validation, new pause/resume actions, notification events.

## ADR-0018 — SLA Pause/Resume Calculation & Notification Recipients
- Status: Confirmed
- Date: 2026-10-20
- Decision:
  1. SLA actual duration measured in **business-day hours**: 1 business day (Mon-Fri) = 24 hours, excluding `sla_holidays` — consistent with `targetSlaHours = targetBusinessDays * 24` used at priority assignment.
  2. On-hold pauses: each pause cycle's duration is computed in business-day hours at resume time (`slaPausedAt` → resume) and **accumulated** into `slaPausedDurationHours`. Precision beyond day granularity is not required per stakeholder. Each pause cycle is logged individually in `request_status_histories` with its reason (given at pause time) in `note` + `metadata`.
  3. Final completion formula: `actualDurationHours = businessHours(submitted → completed) − slaPausedDurationHours` (bounded ≥ 0); `slaMet = actualDurationHours ≤ targetSlaHours` (null when no target).
  4. Notification recipients: REQUEST_IN_REVIEW → requester only (new event `request_in_review`); REQUEST_ON_HOLD, REQUEST_RESUMED, REQUEST_COMPLETED → requester + team members (active assignments + team leader + technical writer) + admins.
- Reason: Stakeholder confirmed business-hours/holidays accounting, keeping pause accumulation coarse-grained; unify admin and developer completion SLA in one utility (`lib/utils/sla.ts`).
- Impact: No schema change (fields already existed). `completeRequest()` (admin + developer paths) now persists `actualDurationHours` + `slaMet`. Dashboard SLA At-Risk widget excludes pause hours from usage percentage. `verifyRequest()` now notifies the requester and records correct `fromStatus` history.

## ADR-0019 — Test Infrastructure for Workflow Tests
- Status: Confirmed
- Date: 2026-10-20
- Decision: Implement workflow tests with jest + mocked drizzle DB (`__/tests__/actions/__helpers__/mock-db.ts`) instead of a live DB/testcontainers. DB interactions rely on a FIFO select-queue keyed by table; updates/inserts are recorded for assertions. Server actions remain the integration boundary (auth, audit, notifications, SLA utils are module mocks).
- Reason: Fast, dependency-free CI tests covering transition validation wiring, permission gating, notification triggers and history writes of `admin-requests.ts` / `request-hold.ts` without a running MySQL instance.
- Impact: `jest.config.js` gains `testPathIgnorePatterns: ['/node_modules/', '/__helpers__/']`. New suites: `__tests__/actions/request-status-transitions.test.ts` (transition matrix) and `__tests__/actions/request-admin-workflows.test.ts` (action flows, 202 total tests with previous suites). Select-queue tests are order-sensitive: any action query-order change requires updating queues.

## ADR-0020 — DevTI Urusan references devteam_units (not units)
- Status: Confirmed
- Date: 2026-10-21
- Decision: `requests.devti_urusan_id` FK moved from `units` to `devteam_units`. Admin team-assignment dialog, `assignTeamToRequest` validation, request detail fetch (admin + developer) and seed data now use `devteam_units` (via new `getDevteamUnits()` action); `units` remains the requester organizational unit master. Values not present in `devteam_units` are set to NULL by migration 0005 (column is NULLABLE; no invented units→urusan mapping).
- Reason: DevTI Urusan is a DevTI-specific urusan master (`URUSAN PENGEMBANGAN ...`), not an organizational unit of the requester; reusing `units` conflated the two masters (completes the plan from the devteam_units master-data session).
- Impact: Migration `db/migrations/0005_devti_urusan_to_devteam_units.sql` (forward-only; FK constraint name differs per environment — drizzle-kit name used locally). `lib/db/schema/requests.ts` now imports `devteam_units`. Seed requests carry `devtiUrusanId` cycling 1-3.

## ADR-0021 — Priority required before APPROVED → ONGOING (team assignment)
- Status: Confirmed
- Date: 2026-10-24
- Decision: A request must have Priority set (requests.priority_id NOT NULL) before an admin can assign a team and transition status to ONGOING. Enforced at three layers per confirmed option:
  1. **UI nudge:** `request-admin-actions.tsx` — "Assign Tim" button is disabled while `priorityId` is null (APPROVED status), with inline hint "Atur Priority terlebih dahulu sebelum assign tim."
  2. **Dialog validation:** `team-assignment-dialog.tsx` receives `priorityId` prop and rejects submission first ("Priority harus diatur sebelum assign tim").
  3. **Server-side:** `assignTeamToRequest` (app/actions/admin-requests.ts) checks `request.priorityId` after the request lookup and before the transition validation; returns "Priority harus diatur sebelum tim dapat di-assign" without writing to DB.
- Reason: Priority drives SLA policy selection (target business days) and reporting; an ONGOING request without priority has no SLA target. User confirmed: priority is required (block assignment) and the button must be disabled until set.
- Impact: No schema change (priority_id already nullable). request-admin-workflows.test.ts: `baseRequest` sets `priorityId: 1`; new test asserts the null-priority block. Mock fixtures updated to queue `devteamUnits` (stale from ADR-0020) and expect 'DevTI Urusan tidak ditemukan' — this repaired 10 pre-existing failing tests in the suite (baseline was 10 failed at HEAD before both changes).

## ADR-0022 — Team Leader restricted to SA role; developer assignment excludes SA/TW
- Status: Confirmed
- Date: 2026-10-24
- Decision: In the admin team-assignment flow: (1) Team Leader selection is strictly restricted to users with `developer_role_code = 'SA'` (System Analyst) — previously any active user was eligible; (2) the developer assignment list excludes roles SA and TW (SA users are team-leader candidates, TW users are the technical writer).
- Reason: Stakeholder-confirmed clarification (user chose "restrict strictly" for team lead and "show all but filter non-SA/non-TW" for developers). SA = requirements analysis/design role, natural team-lead candidate; TW is already dedicated to the Technical Writer field (BUSINESS_RULES Team Assignment Rules), so offering SA/TW in the developer multi-select was redundant.
- Impact: `getTeamLeaderOptions()` (app/actions/admin-requests.ts) now inner-joins `developer_roles` filtered to code = 'SA' (active users only); `getDevelopersByRole()` without `roleCode` excludes SA/TW (filter applied in-memory alongside existing roleCode filter — `getTechnicalWriters()` path with `roleCode='TW'` is unaffected). UI hints + empty state updated in `components/admin/team-assignment-dialog.tsx`. No DB/schema change; server-side `assignTeamToRequest` validation unchanged (TW role + min-1-developer rules already enforced).

## ADR-0023 — Server Actions Body Size Limit
- Status: Confirmed
- Date: 2026-10-26
- Decision: Configure Next.js Server Actions `bodySizeLimit: '15mb'` in `next.config.ts`.
- Reason: Default Next.js body size limit for Server Actions is 1MB. Document upload action (`uploadRequestDocument`) accepts files up to 10MB (`FILE_UPLOAD.MAX_FILE_SIZE`). A 15MB limit accommodates the 10MB payload plus multipart boundary and metadata overhead.
- Impact: Resolves 413 error (Body exceeded 1 MB limit) on document uploads.

