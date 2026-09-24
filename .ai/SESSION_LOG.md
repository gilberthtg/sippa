# SiPPA AI Session Log

## Template
### YYYY-MM-DD — Session title
- Goal:
- Changes made:
- Files changed:
- Decisions:
- Tests/checks:
- Open questions:
- Next recommended step:

## 2026-09-24 — Phase 7 COMPLETE: Audit, Notification, Hardening
- Goal: Implement Phase 7 requirements (Audit, Notifications, Hardening)
- Changes made:
  - **Notifications (In-App)**:
    - Created `notifications` table
    - Added `NotificationBell` component with 30s polling
    - Added `/notifications` pages for all three roles
    - Trigger notifications on key request transitions (submitted, approved, rejected, assigned, progress, completed)
  - **Audit Logging**:
    - Added `module` column to `audit_logs` and made `actorUserId` nullable
    - Created `logAudit` utility that sanitizes passwords/secrets and captures IP/UA
    - Instrumented all ~22 server mutations (requests, master data, sla, users)
    - Added login success/failure auditing
    - Built Admin Audit Logs viewer (`/admin/settings/audit-logs`) with advanced filters and JSON diff dialog
  - **Security Hardening**:
    - Added server-side file validation (MIME, size, count) to `createRequest`
    - Fixed download API access control (allow admin/developer)
    - Added security headers (X-Frame-Options, X-Content-Type-Options) via `next.config.ts`
    - Added explicit `error.tsx` and `not-found.tsx` for all route groups
- Files changed: ~25 new files, ~17 modified files
- Decisions:
  - ADR-0011: Use in-app notifications only for v1 (polling), abstracting channels for future email/push
  - ADR-0012: Audit logs capture IP/UA from headers, strip sensitive fields, use nullable actor for failed logins
- Tests/checks:
  - ✅ TypeScript: PASSED (`npx tsc --noEmit`)
  - ✅ Build: SUCCESS
  - ✅ Schema pushed to MySQL
- Next recommended step: **End-to-End Testing / Phase 8**
