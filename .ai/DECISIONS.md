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
