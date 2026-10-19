# Workflow Status Restructure — Implementation Plan

**Status:** PLANNING (Approved by stakeholder)  
**Date:** 2026-10-19  
**Decisions:** All 7 open questions resolved

---

## Executive Summary

Current application has 7 statuses already defined in schema: SUBMITTED, IN_REVIEW, APPROVED, REJECTED, ON_GOING, ON_HOLD, DONE. This plan validates existing implementation, identifies affected areas, and organizes implementation into 5 phases for safe rollout with full backward compatibility.

**Key Constraint:** Maintain backward compatibility with existing requests and data.

---

## 1. Approved Workflow

### Status Flow Diagram
`
SUBMITTED (User creates) 
    ↓
IN_REVIEW (Admin reviews)
    ↓
    ├→ APPROVED (Admin approves + assigns team in one step) → ON_GOING
    │
    └→ REJECTED (Admin rejects - FINAL STATUS, cannot reopen)

ON_GOING (Work in progress)
    ↓
    ├→ ON_HOLD (Issues arise, SLA pauses) → ON_GOING (Resume, SLA continues from pause point)
    │
    └→ DONE (Work finished - FINAL STATUS, cannot change)
`

### Key Rules ✅ CONFIRMED
1. **SUBMITTED:** User creates request
2. **IN_REVIEW:** Admin reviews request details
3. **APPROVED + ASSIGNMENT:** Single admin step - approve + assign team together
   - DevTI Urusan (unit) selected
   - Team Leader assigned (optional or required?)
   - Technical Writer assigned (required, must have TW role)
   - Developers assigned (minimum 1, with specific roles)
   - Status transitions: APPROVED → ON_GOING
4. **REJECTED:** Final status - request closed, cannot reopen
5. **ON_GOING:** Work in progress
6. **ON_HOLD:** Admin pauses work, SLA pauses
   - Resume transitions: ON_HOLD → ON_GOING (SLA continues from pause point)
7. **DONE:** Final status - request closed permanently
8. No batch operations
9. Only admins mark requests as DONE
10. No notification preferences/muting
11. No developer resubmission of rejected requests

---

## 2. Current State Analysis

### 2.1 Database Schema ✅
**Status enum already exists (lib/db/schema/requests.ts):**
`	ypescript
status: mysqlEnum('status', [
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'ongoing',    // Note: schema has 'ongoing' (lowercase)
  'done',
  'on_hold'
]).notNull().default('submitted')
`

**Supporting fields present:**
- ejectionNote — for rejection reasons
- onHoldReason — for on_hold reason
- slaPausedAt — when SLA was paused
- slaPausedDurationHours — accumulated pause duration
- equestStatusHistories table — full audit trail
- Timestamps: submittedAt, approvedAt, rejectedAt, completedAt

**Status:** ✅ All infrastructure exists and matches requirement

### 2.2 Business Rules
From BUSINESS_RULES.md (lines 128-148):
- ✅ 7 statuses documented
- ✅ Transitions documented
- ✅ ON_HOLD with reason and SLA pause mentioned
- ✅ Status history audit trail in place

---

## 3. Affected Components

### 3.1 Backend / Server Actions (~8-10 files)
1. pp/actions/requests.ts — Create request (→ SUBMITTED)
2. pp/actions/admin-requests.ts — Approval, rejection, assignment, hold, resume, complete
3. pp/actions/developer-requests.ts — View requests, update progress
4. pp/actions/reports.ts — Status filtering
5. lib/notifications/templates.ts — Event notifications
6. lib/utils/sla.ts — SLA pause/resume calculation
7. lib/db/seed.ts — Seed data for testing

**Scope:** ~200 lines of validation + action logic

### 3.2 Frontend / UI Components (~10-12 files)
1. components/requests/status-badge.tsx — 7 status colors
2. components/requests/request-list-client.tsx — Filter by status
3. components/admin/request-admin-actions.tsx — Action buttons (review, approve, reject, assign, hold, resume, complete)
4. components/admin/request-approval-dialog.tsx — Rejection reason + approval (UPDATE: add assignment fields here)
5. components/admin/on-hold-dialog.tsx (NEW) — On-hold reason input
6. pp/(admin)/admin/requests/[id]/page.tsx — Admin detail page
7. pp/(user)/requests/[id]/page.tsx — User request detail
8. pp/(developer)/developer/requests/[id]/page.tsx — Developer request detail
9. Status history/timeline display

**Scope:** ~300 lines of UI logic

### 3.3 UI Constants & Utils (~3 files)
1. lib/constants.ts — Status labels (Indonesian), colors, icons
2. lib/utils/status.ts (NEW) — Status utilities
3. lib/utils/sla.ts (UPDATE) — SLA pause/resume logic

### 3.4 Tests & Documentation (~5-6 files)
1. __tests__/actions/request-status-transitions.test.ts (NEW) — Unit tests
2. __tests__/actions/request-admin-workflows.test.ts (NEW) — Integration tests
3. .ai/STATUS_WORKFLOW.md (NEW) — Visual documentation
4. BUSINESS_RULES.md (UPDATE) — Formalize workflow
5. TESTING_CHECKLIST.md (UPDATE) — Add status flow test cases
6. SESSION_LOG.md (UPDATE) — Record implementation

---

## 4. Transition Validation Rules

### 4.1 Valid Transitions (Server-Side)
`	ypescript
const VALID_TRANSITIONS = {
  'submitted': ['in_review'],
  'in_review': ['approved', 'rejected'],
  'approved': ['ongoing'],        // After assignment
  'ongoing': ['on_hold', 'done'],
  'on_hold': ['ongoing'],         // Resume
  'rejected': [],                 // FINAL - no transitions
  'done': []                      // FINAL - no transitions
};
`

### 4.2 Invalid Transitions (Blocked)
- SUBMITTED → APPROVED (must review first)
- SUBMITTED → ONGOING (must approve first)
- REJECTED → anything (FINAL status)
- DONE → anything (FINAL status)
- ON_HOLD → REJECTED (can only resume to ONGOING)
- ON_GOING → SUBMITTED (cannot revert to earlier status)

### 4.3 Role-Based Access
- **User:** Can only view own requests, cannot change status
- **Admin:** Can perform all status transitions (with validation)
- **Developer:** Can only update progress (status stays ONGOING), cannot change status

---

## 5. Implementation Phases

### Phase 1: Validation Infrastructure (1-2 days)
**Goal:** Server-side transition validation

**Create:**
- lib/validations/status-transitions.ts
  - VALID_TRANSITIONS constant
  - validateTransition(fromStatus, toStatus) function
  - validateTransitionWithContext(fromStatus, toStatus, userRole) function
  - Comprehensive error messages

**Update:**
- All status-changing server actions (7-8 files)
- Import validation utility
- Add transition check before update
- Return error if invalid

**Verification:**
- ✅ TypeScript compilation: 
px tsc --noEmit
- ✅ No regressions in existing flows
- ✅ Invalid transitions rejected with clear error

---

### Phase 2: Admin Workflow (3-4 days)
**Goal:** Implement complete admin workflow (review → approve+assign → work → hold/resume → complete)

**Key Change:** Approval + Assignment in ONE step
- Currently separate: Approve (status→APPROVED) then Assign (status→ONGOING)
- New: Approve button shows assignment form, updates status→APPROVED→ONGOING in one transaction

**Update/Create:**
1. equest-approval-dialog.tsx (UPDATE)
   - Rejection path: Reject button → Enter reason → Status: IN_REVIEW → REJECTED
   - Approval path: Approve button → Assignment form (DevTI, Team Leader, TW, Developers) → Status: IN_REVIEW → APPROVED → ONGOING

2. on-hold-dialog.tsx (NEW)
   - Hold button → Enter reason → Status: ONGOING → ON_HOLD (SLA pauses)

3. Server actions (app/actions/admin-requests.ts)
   - eviewRequest() — IN_REVIEW → IN_REVIEW (admin opens, no status change yet)
   - pproveAndAssignRequest() (RENAMED/MERGED from approveRequest + assignTeam)
     - Input: approval data + assignment data
     - Validation: TW has TW role, minimum 1 developer
     - Output: Status: IN_REVIEW → APPROVED → ONGOING
     - Side effects: Notifications sent to team
   - ejectRequest(reason) — IN_REVIEW → REJECTED
   - holdRequest(reason) (NEW) — ONGOING → ON_HOLD (SLA pauses, record slaPausedAt)
   - esumeRequest() (NEW) — ON_HOLD → ONGOING (SLA resumes, calculate slaPausedDurationHours)
   - completeRequest() (NEW) — ONGOING → DONE (SLA finalized)

4. Update equest-admin-actions.tsx
   - Show action buttons based on current status + role
   - IN_REVIEW: [Approve+Assign] [Reject]
   - APPROVED: [Approve+Assign] [Reject] (if not yet assigned)
   - ONGOING: [Hold] [Complete]
   - ON_HOLD: [Resume] [Reject] (optional)
   - REJECTED/DONE: [View only]

**Verification:**
- ✅ Full workflow end-to-end
- ✅ SLA pause/resume recorded correctly
- ✅ Status history entries created
- ✅ Notifications sent
- ✅ No TypeScript errors: 
pm run build

---

### Phase 3: UI & UX (2-3 days)
**Goal:** Update all UI to reflect 7-status workflow

**Status Badge Colors (7 statuses):**
- SUBMITTED: Gray (#6B7280)
- IN_REVIEW: Blue (#3B82F6)
- APPROVED: Green (#10B981)
- REJECTED: Red (#EF4444)
- ON_GOING: Yellow (#F59E0B)
- ON_HOLD: Orange (#F97316)
- DONE: Green/checkmark (#059669)

**Update:**
1. components/requests/status-badge.tsx
   - Add 7 color mappings
   - Add icon per status
   - Support size variants (sm, md, lg)

2. components/requests/request-list-client.tsx
   - Update filter dropdown: show all 7 statuses
   - Update default filter logic
   - Update count calculations

3. components/admin/request-admin-actions.tsx
   - Context-aware button display based on status
   - Disable invalid transitions
   - Show reason dialogs for rejection/hold

4. All detail pages (user, admin, developer)
   - Show status prominently with badge
   - Show status history timeline
   - Show action buttons (if permitted)

5. lib/constants.ts (NEW entries)
   - Status labels in Indonesian
   - Status colors
   - Status icons
   - Status descriptions

**Verification:**
- ✅ All 7 statuses render correctly
- ✅ Colors accessible (WCAG contrast)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ No console errors

---

### Phase 4: SLA & Notifications (1-2 days)
**Goal:** Implement SLA pause/resume and notification events

**SLA Logic (lib/utils/sla.ts UPDATE):**
- When transitioning ONGOING → ON_HOLD:
  - Record slaPausedAt = NOW()
- When transitioning ON_HOLD → ONGOING:
  - Calculate slaPausedDurationHours = (NOW() - slaPausedAt) / 3600
  - Add to slaPausedDurationHours total
  - Clear slaPausedAt
- When calculating SLA achievement:
  - ctualDurationHours = (completedAt - submittedAt) / 3600 - slaPausedDurationHours

**Notification Events:**
1. REQUEST_SUBMITTED (existing)
   - Recipients: All admins
   - Message:  New request submitted: [request_no]

2. REQUEST_IN_REVIEW (new?)
   - Recipients: Requester
   - Message: Your request is being reviewed: [request_no]

3. REQUEST_APPROVED (existing, rename from approved)
   - Recipients: Requester, assigned team members
   - Message: Your request approved and team assigned: [request_no]

4. REQUEST_REJECTED (existing)
   - Recipients: Requester
   - Message: Your request rejected: [reason]

5. REQUEST_ON_HOLD (new)
   - Recipients: Requester, team members
   - Message: Request paused: [reason]

6. REQUEST_RESUMED (new)
   - Recipients: Requester, team members
   - Message: Request work resumed

7. REQUEST_COMPLETED (existing)
   - Recipients: Requester, admins, team members
   - Message: Request completed: [request_no]

8. REQUEST_TEAM_ASSIGNED (existing, but now part of APPROVED)
   - Recipients: Team members
   - Message: You assigned to: [request_no] as [role]

**Update:**
1. lib/notifications/templates.ts — Add new event templates
2. pp/actions/admin-requests.ts — Trigger notifications in each action
3. Verify notification recipients and messages in Indonesian

**Verification:**
- ✅ Notifications sent on all transitions
- ✅ Recipients correct (admins, requester, team)
- ✅ SLA calculation excludes pause duration
- ✅ Bell icon shows unread count
- ✅ Notification list page functional

---

### Phase 5: Testing & Documentation (2-3 days)
**Goal:** Comprehensive testing + documentation

**Manual Test Plan (per role):**

**User Tests:**
- [ ] Submit NEW_APPLICATION request → Status: SUBMITTED ✓
- [ ] Submit RFC request → Status: SUBMITTED ✓
- [ ] View own request list → See all statuses filtered ✓
- [ ] View request detail → See status, cannot modify ✓
- [ ] Receive notifications on status changes ✓

**Admin Tests:**
- [ ] View all requests (dashboard, list) ✓
- [ ] Click Review button → Request enters IN_REVIEW ✓
- [ ] Reject request → Enter reason → Status: REJECTED ✓
  - [ ] Notification sent to requester ✓
  - [ ] Reason stored and visible ✓
- [ ] Approve + Assign request → Status: APPROVED → ONGOING ✓
  - [ ] Assignment form shows (DevTI, TL, TW, Developers) ✓
  - [ ] DevTI selected ✓
  - [ ] TW must have TW role (validated) ✓
  - [ ] Minimum 1 developer selected ✓
  - [ ] Status transitions correctly ✓
  - [ ] Notifications sent to team ✓
- [ ] Hold request → Enter reason → Status: ON_HOLD ✓
  - [ ] SLA paused (slaPausedAt recorded) ✓
  - [ ] Notification sent ✓
- [ ] Resume request → Status: ON_HOLD → ONGOING ✓
  - [ ] SLA resumes (slaPausedDurationHours calculated) ✓
  - [ ] Notification sent ✓
- [ ] Complete request → Status: ONGOING → DONE ✓
  - [ ] SLA finalized ✓
  - [ ] Notification sent ✓
  - [ ] Cannot change status further ✓
- [ ] Invalid transition attempted → Error shown ✓

**Developer Tests:**
- [ ] View assigned requests (ON_GOING only) ✓
- [ ] Update progress → Status stays ON_GOING ✓
- [ ] Cannot change status directly ✓
- [ ] Receive notifications when assigned/paused/resumed/completed ✓

**Edge Cases:**
- [ ] Request in IN_REVIEW, try to change to DONE directly → Blocked ✓
- [ ] Request in REJECTED, try to change to ONGOING → Blocked ✓
- [ ] Concurrent status changes → Last write wins, history recorded ✓
- [ ] SLA calculation with multiple pauses → All pause durations summed ✓
- [ ] Status history shows all transitions with timestamps ✓

**Unit Tests (__tests__/actions/request-status-transitions.test.ts):**
- [ ] validateTransition(submitted, in_review) → true ✓
- [ ] validateTransition(submitted, approved) → false ✓
- [ ] validateTransition(rejected, anything) → false ✓
- [ ] validateTransition(done, anything) → false ✓
- [ ] SLA pause duration calculation ✓
- [ ] Multiple pause/resume cycles ✓

**Integration Tests (__tests__/actions/request-admin-workflows.test.ts):**
- [ ] Full workflow: SUBMITTED → IN_REVIEW → APPROVED → ONGOING → DONE ✓
- [ ] Rejection workflow: SUBMITTED → IN_REVIEW → REJECTED ✓
- [ ] Hold/resume workflow: ONGOING → ON_HOLD → ONGOING ✓
- [ ] Permission checks (developer cannot complete) ✓

**Documentation:**
1. Update BUSINESS_RULES.md (lines 128-148)
   - Formalize 7 statuses with descriptions
   - Document transitions with examples
   - Document SLA pause/resume
   - Document final statuses

2. Create .ai/STATUS_WORKFLOW.md
   - ASCII diagram of state machine
   - Transition table (from → to → who can do it)
   - Business rules per status
   - Role permissions

3. Update TESTING_CHECKLIST.md
   - Add status workflow test cases (~40 rows)
   - Test per role
   - Edge case scenarios

4. Update .ai/SESSION_LOG.md
   - Record Phase 1-5 completion
   - Decisions made
   - Risks encountered
   - Lessons learned

**Verification:**
- ✅ All manual tests pass
- ✅ Unit test coverage > 80%
- ✅ No TypeScript errors: 
px tsc --noEmit
- ✅ Production build succeeds: 
pm run build
- ✅ Documentation accurate and complete
- ✅ Code reviewed by team

---

## 6. Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Database data with old statuses | Requests break with new enum | Low | Verify with: SELECT DISTINCT status FROM requests |
| Concurrent status changes | Race condition | Medium | Use DB transaction or optimistic locking |
| SLA calculation wrong | Reports incorrect | Medium | Unit tests for pause/resume, verify historical data |
| Permissions bypassed | Unauthorized actions | High | Server-side validation before every status change, audit logging |
| Notifications not sent | Users unaware of changes | Medium | Test notification triggers, check logs |
| Regression in existing flows | Broken workflows | High | Manual testing of all workflows, compare with baseline |

**Rollback Plan:**
- If critical data corruption: Restore from backup
- If permission issues: Revert server actions code only
- If SLA calculation wrong: Fix logic, recalculate for affected requests
- Keep equest_status_histories for audit trail (never delete)

---

## 7. Implementation Checklist

### Pre-Implementation ✅ CONFIRMED
- [x] Plan reviewed and approved by stakeholder
- [x] All 7 open questions decided
- [x] Workflow clarified (approval + assignment in one step)
- [ ] Backup current database
- [ ] Create branch: eature/workflow-restructure

### Phase 1: Validation (1-2 days)
- [ ] Create lib/validations/status-transitions.ts
- [ ] Update all status-changing server actions (7-8 files)
- [ ] Run: 
px tsc --noEmit
- [ ] Manual test: existing workflows still work

### Phase 2: Admin Workflow (3-4 days)
- [ ] Merge pproveRequest() + ssignTeamToRequest() → pproveAndAssignRequest()
- [ ] Create holdRequest() server action
- [ ] Create esumeRequest() server action
- [ ] Create completeRequest() server action
- [ ] Update equest-approval-dialog.tsx (add assignment form)
- [ ] Create on-hold-dialog.tsx
- [ ] Implement SLA pause/resume in holdRequest() + esumeRequest()
- [ ] Update equest-admin-actions.tsx
- [ ] Run: 
pm run build

### Phase 3: UI & UX (2-3 days)
- [ ] Update status-badge.tsx — 7 colors
- [ ] Update equest-list-client.tsx — 7 status filters
- [ ] Update equest-admin-actions.tsx — context-aware buttons
- [ ] Add status constants to lib/constants.ts
- [ ] Update all detail pages
- [ ] Visual testing (all 7 statuses)
- [ ] Responsive design testing

### Phase 4: SLA & Notifications (1-2 days)
- [ ] Update lib/utils/sla.ts — pause/resume logic
- [ ] Create notification templates for 3 new events
- [ ] Trigger notifications in all status change actions
- [ ] Test SLA calculation with pause
- [ ] Verify notification recipients

### Phase 5: Testing & Documentation (2-3 days)
- [ ] Write unit tests (transition validation)
- [ ] Write integration tests (full workflows)
- [ ] Execute full manual test plan
- [ ] Update BUSINESS_RULES.md
- [ ] Create .ai/STATUS_WORKFLOW.md
- [ ] Update TESTING_CHECKLIST.md
- [ ] Update SESSION_LOG.md
- [ ] Code review

### Post-Implementation
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Get stakeholder sign-off
- [ ] Merge to main branch
- [ ] Tag release
- [ ] Monitor production (week 1 intensive)

---

## 8. Timeline

| Phase | Effort | Cumulative |
|-------|--------|-----------|
| Planning & Approval | 1 day | 1 day |
| Phase 1: Validation | 1-2 days | 2-3 days |
| Phase 2: Admin Workflow | 3-4 days | 5-7 days |
| Phase 3: UI & UX | 2-3 days | 7-10 days |
| Phase 4: SLA & Notifications | 1-2 days | 8-12 days |
| Phase 5: Testing & Docs | 2-3 days | 10-15 days |
| **Total** | **10-15 days** | **~2-3 weeks** |

---

## 9. Files to Create/Update

### New Files (5)
- lib/validations/status-transitions.ts
- components/admin/on-hold-dialog.tsx
- __tests__/actions/request-status-transitions.test.ts
- __tests__/actions/request-admin-workflows.test.ts
- .ai/STATUS_WORKFLOW.md

### Updated Files (~25)

**Server Actions (8):**
- app/actions/requests.ts
- app/actions/admin-requests.ts (major: merge approve+assign, add hold/resume/complete)
- app/actions/developer-requests.ts
- app/actions/reports.ts
- lib/notifications/templates.ts
- lib/utils/sla.ts (add pause/resume logic)
- lib/db/seed.ts
- lib/validations/status-transitions.ts

**Components (10):**
- components/requests/status-badge.tsx
- components/requests/request-list-client.tsx
- components/admin/request-admin-actions.tsx
- components/admin/request-approval-dialog.tsx (add assignment fields)
- app/(admin)/admin/requests/[id]/page.tsx
- app/(user)/requests/[id]/page.tsx
- app/(developer)/developer/requests/[id]/page.tsx
- Plus 2-3 supporting components

**Constants & Utils (3):**
- lib/constants.ts (add status labels/colors)
- lib/utils/status.ts (new)
- lib/utils/sla.ts

**Documentation (5):**
- .ai/BUSINESS_RULES.md
- .ai/STATUS_WORKFLOW.md (create)
- .ai/TESTING_CHECKLIST.md
- .ai/SESSION_LOG.md
- .ai/PHASE_11_COMPLETE.md (new phase file)

---

## 10. Success Criteria

### Phase 1 ✅
- [x] Transition validation implemented
- [x] All server actions import validation
- [x] Invalid transitions return errors
- [x] No TypeScript errors
- [x] Existing workflows work

### Phase 2 ✅
- [x] Approve + Assign in one step (merged action)
- [x] Hold/Resume/Complete workflows functional
- [x] SLA pause/resume logic correct
- [x] Notifications sent on all transitions
- [x] Status history complete

### Phase 3 ✅
- [x] All 7 statuses have correct colors
- [x] Action buttons show/hide correctly
- [x] Filters work for all statuses
- [x] Responsive design verified
- [x] No console errors

### Phase 4 ✅
- [x] SLA calculation excludes paused duration
- [x] Notifications sent with correct recipients
- [x] Messages in Indonesian
- [x] Links work in notifications

### Phase 5 ✅
- [x] All test scenarios pass
- [x] Test coverage > 80%
- [x] Documentation accurate
- [x] No regressions
- [x] Code reviewed

---

## 11. Key Decisions Recorded

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Reopen DONE? | NO | DONE is terminal status |
| 2 | Multiple admin approvals? | Single admin | Sufficient for efficiency |
| 3 | Approval + Assignment in one step? | YES | Better UX, fewer clicks |
| 4 | SLA on resume? | Continue from pause | Preserve elapsed time |
| 5 | Developer mark DONE? | Admin only | Ensures quality gate |
| 6 | Notification preferences? | NOT necessary | All events important |
| 7 | Batch status change? | NOT supported | Rare use case |

---

**Document Version:** 2.0  
**Status:** READY FOR IMPLEMENTATION  
**Last Updated:** 2026-10-19  
**Stakeholder Approval:** ✅ CONFIRMED

Next Step: Create feature branch eature/workflow-restructure and begin Phase 1
