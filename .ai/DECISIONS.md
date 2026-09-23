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

## Open Decisions
- Notification provider (deferred to v1.1)
- Priority calculation rules (manual admin decision for v1.0)
- User & unit master source (internal database for v1.0)
- Exact SLA target hours per request type + priority
- Laptri exact layout and data points
- User management UI in v1.0 scope
