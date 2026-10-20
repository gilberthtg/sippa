# SIPPA Request Status Workflow

**Last Updated:** 2026-10-20
**Source of truth:** ADR-0017, ADR-0018, `lib/validations/status-transitions.ts`, `lib/db/schema/requests.ts`

This document is the visual reference for the 7-status request workflow
(`WORKFLOW_RESTRUCTURE_PLAN.md` Phase 1-4 implementation).

---

## 1. State Machine Diagram

```
SUBMITTED (user creates request)
    ↓ verifyRequest (admin)
IN_REVIEW (admin reviews completeness)
    ↓                            ↓
approveRequest                rejectRequest (reject with reason)
    ↓                            ↓
APPROVED (waiting for team)   REJECTED ──resubmission──▶ SUBMITTED
    ↓                                (user resubmits, review restarts)
assignTeamToRequest (admin)
    ↓
ONGOING (work in progress)
    ↓                    ↓
pauseRequest          completeRequest → DONE (FINAL)
(reason, SLA pauses)      (SLA finalized)
    ↓
ON_HOLD
    ↓ resumeRequest (SLA continues)
ONGOING
```

Key characteristics:
- DONE is **FINAL** — no transitions out (server-side blocked).
- REJECTED allows only **one** transition: requester/admin resubmission → SUBMITTED.
- Hold/resume may cycle any number of times; every pause window is logged in
  status history and its business-day hours are accumulated.
- Approve and team assignment are **separate steps** in the current implementation:
  `IN_REVIEW → APPROVED` (approveRequest), then `APPROVED → ONGOING`
  (assignTeamToRequest). Status APPROVED is a real intermediate state
  ("approved, waiting for team assignment") visible on the admin detail page.

---

## 2. Transition Table

Validated by `validateTransitionWithContext()` before every status write in
server actions.

| From | To | Allowed Roles | Server Action | Input Required | Side Effects |
|------|----|--------------|---------------|----------------|--------------|
| `submitted` | `in_review` | admin | `verifyRequest` | optional note | history, audit, notify requester |
| `in_review` | `approved` | admin | `approveRequest` | optional note | history, audit, notify requester; NEW_APPLICATION auto-creates `request_applications` entry (version 1.0.0) |
| `in_review` | `rejected` | admin | `rejectRequest` | reason (required) | rejectionNote stored, history, audit, notify requester incl. reason |
| `approved` | `ongoing` | admin | `assignTeamToRequest` | DevTI urusan unit, team leader, TW (TW role required), ≥1 developer | request_team_assignments rows (unassigns previous), history, audit, notify each developer + TL/TW/requester |
| `ongoing` | `on_hold` | admin, developer (assigned) | `pauseRequest` | reason (min 10 chars) | status history incl. reason, slaPausedAt = now, audit, notify requester + team |
| `on_hold` | `ongoing` | admin, developer (assigned) | `resumeRequest` | optional note | pause business-hours accumulated into slaPausedDurationHours, slaPausedAt cleared, history, audit, notify requester + team |
| `ongoing` | `done` | admin | `completeRequest` (admin path) | optional note | completedAt, actualDurationHours = business hours − pauses, slaMet persisted, history, audit, notify requester + team + admins |
| `ongoing` | `done` | developer | `completeRequest` (`app/actions/developer-requests.ts`) | progress/contact | same SLA persistence via shared calculation |
| `rejected` | `submitted` | user (requester), admin | resubmission | — | restart review cycle from SUBMITTED |
| `done` | *(none)* | — | — | — | FINAL status, all transitions blocked |

Blocked examples (error surfaced in Indonesian):
- `submitted → approved | ongoing | done` (chain must be followed)
- `in_review → ongoing | done` (must approve first)
- `on_hold → rejected | done` (only resume to ongoing)
- `ongoing → submitted | in_review | approved` (cannot revert)
- `done → *` (final)

---

## 3. Role Permissions Summary

| Capability | User | Admin | Developer |
|-----------|------|-------|-----------|
| Create request (→ SUBMITTED) | ✅ | — | — |
| Verify (SUBMITTED → IN_REVIEW) | — | ✅ | — |
| Approve (IN_REVIEW → APPROVED) | — | ✅ | — |
| Reject (IN_REVIEW → REJECTED) | — | ✅ | — |
| Assign team (APPROVED → ONGOING) | — | ✅ | — |
| Hold / Resume (ONGOING ↔ ON_HOLD) | — | ✅ | ✅ (if assigned to the request — dev assignment, team leader, or technical writer) |
| Complete (ONGOING → DONE) | — | ✅ | ✅ (developer path exists — see discrepancy note) |
| Resubmit (REJECTED → SUBMITTED) | ✅ (own request) | ✅ | — |
| Update progress (status stays ONGOING) | — | — | ✅ |

**Discrepancy note:** The original plan (WORKFLOW_RESTRUCTURE_PLAN.md decision #5)
specified "Admin only" for marking DONE. The implemented code provides both an
admin path and a developer path for completion (shared SLA calculation since
Phase 4). Recorded as an open question in SESSION_LOG — not changed silently.

---

## 4. Rules per Status

| Status | Label (UI) | Badge | Required UI Actions | Rules |
|--------|-----------|-------|--------------------|-------|
| `submitted` | Diajukan | gray (clock) | ADMIN: Verifikasi | Created by user via single-page form |
| `in_review` | Sedang Ditinjau | blue (eye) | ADMIN: Setujui, Tolak | Verify completeness before approval |
| `approved` | Disetujui | green (check-circle) | ADMIN: Assign Tim (+ priority) | Priority settable here/ONGOING; NEW_APPLICATION auto-creates application master |
| `rejected` | Ditolak | red (x-circle) | — | Reason stored in `rejection_note`; only resubmit possible |
| `ongoing` | Sedang Berlangsung | amber (play) | ADMIN: Tahan, Selesaikan, Priority; DEV: Tahan, Selesaikan | Team assigned; developer progress updates |
| `on_hold` | Ditangguhkan | orange (pause-circle) | ADMIN/DEV: Lanjutkan | Reason required (≥10 chars); SLA paused (slaPausedAt) |
| `done` | Selesai | emerald (check-circle-2) | — | FINAL; actualDurationHours + slaMet persisted |

`STATUS_CONFIG` / `STATUS_LABELS` / `STATUS_DESCRIPTIONS` live in `lib/constants.ts`
(colors per the approved Phase 3 spec). Badge size variants: sm / md / lg.

---

## 5. SLA Interaction

Measured in **business-day hours**: 1 business day (Mon-Fri, excluding
`sla_holidays`) = 24h. Consistent with `targetSlaHours = targetBusinessDays * 24`.

- Start: `submitted_at`
- Pause (ON_HOLD): `sla_paused_at` recorded; reason required and stored
- Resume: pause window converted to business-day hours, accumulated in
  `sla_paused_duration_hours` (coarse-grained, per cycle also logged in history)
- Complete: `actual_duration_hours = businessHours(submitted → completed) −
  slaPausedDurationHours` (bounded ≥ 0); `sla_met = actual ≤ target`
- Dashboard SLA At-Risk widget subtracts accumulated pause hours from elapsed
  time before computing usage percentage

See `lib/utils/sla.ts` and ADR-0018 for details and tests
(`__tests__/lib/sla.test.ts`).

---

## 6. Automation Coverage

| Suite | File | Coverage |
|-------|------|----------|
| Unit (transitions) | `__tests__/actions/request-status-transitions.test.ts` | Full transition matrix, final statuses, role permission matrix, helper functions, Indonesian error messages |
| Integration (actions) | `__tests__/actions/request-admin-workflows.test.ts` | verify/approve/reject/assign/hold/resume/complete happy paths + permission checks + validation errors + full workflow history sequence + notification triggers |
| Unit (SLA) | `__tests__/lib/sla.test.ts` | Business hours, holiday exclusion, pause windows, accumulation, evaluateSla |

Run: `npx jest` (5 suites, 202 tests green as of Phase 5).
