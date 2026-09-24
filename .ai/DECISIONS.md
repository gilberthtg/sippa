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
