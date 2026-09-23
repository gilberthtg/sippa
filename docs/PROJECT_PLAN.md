# SiPPA — Project Implementation Plan

## 1. Product baseline
SiPPA is a web information system for submitting, recording, managing, tracking, and reporting application-development requests handled by DevTI.

Version 1.0 scope:
- Request Baru
- DevTI Request
- Laptri
- Pencapaian SLA

Actors:
- User
- Admin
- Developer

## 2. Recommended stack
- Next.js + TypeScript
- MySQL
- Drizzle ORM + mysql2
- Tailwind CSS + shadcn/ui
- Zod + React Hook Form
- Authentication provider/mechanism: [NEEDS_DECISION]
- Object/file storage: [NEEDS_DECISION]
- Notifications: [NEEDS_DECISION]

## 3. UX plan
### User
Dashboard → New Request → Review → Submit → Track timeline.

### Admin
Dashboard → Verification queue → Detail → Approve/Reject → Priority → Assign → Monitor.

### Developer
Dashboard → Assigned queue → Detail → Update progress → Complete.

Every request detail page should contain:
- request summary
- current status
- status timeline
- requester/unit
- priority/urgency
- attachments
- assignment
- progress
- SLA information
- audit history for authorized roles

## 4. Implementation phases

### Phase 0 — Foundation & AI Context
Acceptance:
- Next.js project boots locally.
- `AGENTS.md` and `.ai/*` exist.
- Env template exists.
- Lint/typecheck are runnable.

### Phase 1 — Design system & application shell
Acceptance:
- Soft green design tokens.
- Responsive sidebar/topbar.
- Common button, input, select, badge, table, modal, toast, empty/loading/error states.
- Role-aware navigation.

### Phase 2 — Authentication & authorization
Acceptance:
- Login/logout.
- Session handling.
- Role-based access for User/Admin/Developer.
- Server-side authorization for every protected mutation/read.

### Phase 3 — Request Baru
Acceptance:
- Select New Application or RFC.
- Enter required details.
- Upload evidence.
- Review before submit.
- Generate request number.
- Record initial status/history.

### Phase 4 — DevTI Request workflow
Acceptance:
- User can list/detail own requests.
- Admin can list/filter/search all requests.
- Admin can verify and approve/reject.
- Admin can set priority and assign team/developer.
- Every transition is recorded.

### Phase 5 — Developer workspace
Acceptance:
- Developer sees assigned requests.
- Developer updates progress and notes.
- Completion transition is explicit.
- Completion timestamp is stored.

### Phase 6 — Laptri & SLA
Acceptance:
- Laptri filter by quarter/year.
- Completed-request recap is generated from stored data.
- SLA report shows target vs actual duration per request.
- SLA summary totals can be filtered by period/type/priority [subject to finalized rules].

### Phase 7 — Audit, notification, hardening
Acceptance:
- Important mutations audited.
- Notification hooks available [provider pending].
- File validation/security checks.
- Error handling and observability baseline.

### Phase 8 — Testing & release
Acceptance:
- Unit tests for business rules.
- Integration tests for request workflow.
- Permission tests for each role.
- Basic E2E path: submit → verify → approve → assign → progress → complete → report.
- Production environment configuration documented.

## 5. Database migration order
1. roles, users, units
2. priorities, teams, team_members
3. requests
4. request_status_histories
5. request_attachments
6. request_assignments
7. request_progress
8. sla_policies
9. audit_logs

## 6. Key design decisions to settle before coding workflow logic
- Authentication/SSO
- Master data source
- SLA timing rules (calendar/business hours, pause/resume)
- Priority rules
- File storage limits and provider
- Notification channels
- Whether rejected requests can be resubmitted/reopened

## 7. Development rule for AI
Never implement missing requirements by guessing. Put unresolved items in `[NEEDS_DECISION]`, ask only when necessary, and update the `.ai` documentation whenever a decision is made.
