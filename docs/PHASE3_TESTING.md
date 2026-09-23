# Phase 3 Testing Checklist

## Test Environment
- **Server**: http://localhost:3000
- **Date**: 2026-09-23
- **Tester**: AI-assisted testing
- **Phase**: 3 - Admin Request Management

---

## Test Accounts

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | admin@sippa.local | password123 | /admin/dashboard |
| User | user@sippa.local | password123 | /dashboard |
| Developer | dev@sippa.local | password123 | /developer/dashboard |

---

## Test Cases

### 1. Admin Authentication & Authorization
**Status**: ⏳ PENDING

**Steps**:
- [ ] Login with admin account (admin@sippa.local / password123)
- [ ] Verify redirect to /admin/dashboard
- [ ] Check admin menu visible in sidebar
- [ ] Try accessing /requests (user route) - should work
- [ ] Logout and login as user
- [ ] Try accessing /admin/dashboard - should redirect/deny

**Expected Results**:
- Admin can access all admin routes
- Non-admin cannot access admin routes
- Role-based navigation displays correctly

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 2. Admin Dashboard - Stats Cards
**Status**: ⏳ PENDING

**Steps**:
- [ ] Login as admin
- [ ] Navigate to /admin/dashboard
- [ ] Check all 8 stat cards display
- [ ] Verify counts are numbers (not null/undefined)
- [ ] Click on "Butuh Verifikasi" card
- [ ] Verify redirects to /admin/requests?status=submitted

**Expected Results**:
- 8 cards display with icons and counts
- Cards are clickable
- Links filter requests correctly

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 3. Admin Dashboard - SLA Attention Widget
**Status**: ⏳ PENDING

**Steps**:
- [ ] Check SLA Attention widget displays
- [ ] If empty, create a request and set priority
- [ ] Wait or manually adjust submitted_at to trigger >80% SLA
- [ ] Verify widget shows progress percentage
- [ ] Check color coding (warning/destructive)
- [ ] Verify hours remaining/overdue calculation

**Expected Results**:
- Widget shows requests >80% SLA used
- Progress indicators accurate
- Color coding correct (warning/red)

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 4. Admin Dashboard - Recent Activity
**Status**: ⏳ PENDING

**Steps**:
- [ ] Check Recent Activity widget displays
- [ ] Verify shows last status changes
- [ ] Check format: Request No → Status → Status
- [ ] Verify actor name and relative time display
- [ ] Click on an activity item
- [ ] Verify navigates to request detail

**Expected Results**:
- Timeline shows recent changes
- Status transitions visible
- Links work correctly

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 5. Admin Request List - Basic View
**Status**: ⏳ PENDING

**Steps**:
- [ ] Navigate to /admin/requests
- [ ] Verify table displays all requests (not just admin's)
- [ ] Check columns: Request No, Type, Title, Requester, Status, Priority, Date, Actions
- [ ] Verify requests from different users visible
- [ ] Check pagination displays if >20 requests

**Expected Results**:
- All users' requests visible
- Table properly formatted
- Data displays correctly

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 6. Admin Request List - Status Filter
**Status**: ⏳ PENDING

**Steps**:
- [ ] Click "Status" filter dropdown
- [ ] Select "Diajukan" (submitted)
- [ ] Verify URL updates with ?status=submitted
- [ ] Check only submitted requests display
- [ ] Select multiple statuses (e.g., submitted, verification)
- [ ] Verify URL shows status=submitted,verification
- [ ] Check filter badge shows count (2)
- [ ] Click "Reset"
- [ ] Verify all filters cleared

**Expected Results**:
- Filter works correctly
- URL params update
- Multi-select works
- Reset clears all

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 7. Admin Request List - Priority & Type Filters
**Status**: ⏳ PENDING

**Steps**:
- [ ] Click "Priority" filter
- [ ] Select a priority (e.g., P1)
- [ ] Verify filtered correctly
- [ ] Click "Tipe" filter
- [ ] Select "New Application"
- [ ] Verify URL has type=new_application
- [ ] Combine with status filter
- [ ] Verify multiple filters work together

**Expected Results**:
- All filters work independently
- Filters can be combined
- Results accurate

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 8. Admin Request List - Search
**Status**: ⏳ PENDING

**Steps**:
- [ ] Type request number in search (e.g., REQ-20260923-001)
- [ ] Wait 500ms for debounce
- [ ] Verify request found
- [ ] Clear and search by title keyword
- [ ] Verify search works
- [ ] Search by requester name
- [ ] Verify search works
- [ ] Test with filters active
- [ ] Verify search + filters work together

**Expected Results**:
- Search debounced (500ms delay)
- Searches request number, title, requester
- Works with filters

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 9. Admin Request List - Pagination
**Status**: ⏳ PENDING

**Steps**:
- [ ] If <20 requests, create more or skip
- [ ] Check pagination controls display
- [ ] Click "Berikutnya" (Next)
- [ ] Verify page 2 loads
- [ ] Check URL has ?page=2
- [ ] Click page number directly
- [ ] Verify navigation works
- [ ] Click "Sebelumnya" (Previous)
- [ ] Verify back to page 1

**Expected Results**:
- Pagination works correctly
- URL params update
- 20 items per page

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 10. Admin Request Detail - View
**Status**: ⏳ PENDING

**Steps**:
- [ ] Click "Detail" on a request
- [ ] Verify navigates to /admin/requests/[id]
- [ ] Check request header displays (number, status, priority)
- [ ] Verify request info card shows all fields
- [ ] Check attachments section (if any)
- [ ] Verify timeline displays status history
- [ ] Check "Admin Actions" panel on right

**Expected Results**:
- All request data visible
- Layout: 2/3 left, 1/3 right
- Actions panel context-aware

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 11. Workflow - Verify Request
**Status**: ⏳ PENDING

**Prerequisites**: Need a request with status=SUBMITTED

**Steps**:
- [ ] Find/create a SUBMITTED request
- [ ] Open request detail as admin
- [ ] Check "Verifikasi Request" button visible
- [ ] Click "Verifikasi Request"
- [ ] Verify dialog opens
- [ ] Add optional note: "Dokumen lengkap"
- [ ] Click "Verifikasi"
- [ ] Check toast notification shows success
- [ ] Verify status changes to VERIFICATION
- [ ] Check timeline shows new entry with note

**Expected Results**:
- SUBMITTED → VERIFICATION
- Note recorded in history
- Toast shows success

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 12. Workflow - Approve Request
**Status**: ⏳ PENDING

**Prerequisites**: Need a request with status=VERIFICATION

**Steps**:
- [ ] Open a VERIFICATION request
- [ ] Check "Setujui" and "Tolak" buttons visible
- [ ] Click "Setujui"
- [ ] Verify dialog opens
- [ ] Add optional note: "Request disetujui"
- [ ] Click "Setujui"
- [ ] Check toast shows success
- [ ] Verify status changes to APPROVED
- [ ] Check approved_at timestamp set
- [ ] Verify timeline updated

**Expected Results**:
- VERIFICATION → APPROVED
- approved_at set
- History recorded

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 13. Workflow - Reject Request
**Status**: ⏳ PENDING

**Prerequisites**: Need a request with status=VERIFICATION

**Steps**:
- [ ] Open a VERIFICATION request
- [ ] Click "Tolak"
- [ ] Verify reject dialog opens with warning style
- [ ] Try clicking "Tolak Request" without reason
- [ ] Verify validation error (reason required)
- [ ] Enter reason: "Informasi tidak lengkap"
- [ ] Click "Tolak Request"
- [ ] Check toast shows success
- [ ] Verify status changes to REJECTED
- [ ] Check rejection_note saved
- [ ] Verify timeline shows reason

**Expected Results**:
- Reason is mandatory
- VERIFICATION → REJECTED
- Reason saved and displayed

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 14. Priority Assignment
**Status**: ⏳ PENDING

**Prerequisites**: Need an APPROVED request without priority

**Steps**:
- [ ] Open an APPROVED request
- [ ] Check Priority selector visible
- [ ] Select priority (e.g., P1 - Critical)
- [ ] Verify "Simpan Priority" button appears
- [ ] Click "Simpan Priority"
- [ ] Check toast shows success
- [ ] Verify priority badge updates in header
- [ ] Check target_sla_hours set (if sla_policies has data)
- [ ] Verify timeline shows priority change

**Expected Results**:
- Priority saved
- SLA calculated from policy
- History recorded

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 15. Change Priority on ASSIGNED Request
**Status**: ⏳ PENDING

**Prerequisites**: Need an ASSIGNED request with priority

**Steps**:
- [ ] Open an ASSIGNED request
- [ ] Check Priority selector still visible
- [ ] Change priority to different value
- [ ] Click "Simpan Priority"
- [ ] Verify priority updates
- [ ] Check SLA recalculated
- [ ] Verify history updated

**Expected Results**:
- Priority can be changed on ASSIGNED status
- SLA recalculated

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 16. Assign to Team Only
**Status**: ⏳ PENDING

**Prerequisites**: Need an APPROVED request

**Steps**:
- [ ] Open an APPROVED request
- [ ] Click "Assign Request"
- [ ] Verify dialog opens
- [ ] Select a team from dropdown
- [ ] Leave developer as "Tidak ada"
- [ ] Add note: "Tim Backend akan handle"
- [ ] Check preview shows team name
- [ ] Click "Assign"
- [ ] Verify toast shows success
- [ ] Check status changes to ASSIGNED
- [ ] Verify assignment info displays team name

**Expected Results**:
- Can assign team only
- APPROVED → ASSIGNED
- Assignment recorded

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 17. Assign to Developer Only
**Status**: ⏳ PENDING

**Prerequisites**: Need an APPROVED request

**Steps**:
- [ ] Open an APPROVED request
- [ ] Click "Assign Request"
- [ ] Leave team as "Tidak ada"
- [ ] Select a developer from dropdown
- [ ] Add note: "Developer berpengalaman"
- [ ] Check preview shows developer name
- [ ] Click "Assign"
- [ ] Verify success
- [ ] Check assignment shows developer

**Expected Results**:
- Can assign developer only
- Assignment recorded

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 18. Assign to Team + Developer
**Status**: ⏳ PENDING

**Prerequisites**: Need an APPROVED request

**Steps**:
- [ ] Open an APPROVED request
- [ ] Click "Assign Request"
- [ ] Select both team and developer
- [ ] Check preview shows both
- [ ] Click "Assign"
- [ ] Verify both saved
- [ ] Check timeline shows complete info

**Expected Results**:
- Can assign both team and developer
- Both recorded in assignment

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 19. Reassign Request
**Status**: ⏳ PENDING

**Prerequisites**: Need an ASSIGNED request

**Steps**:
- [ ] Open an ASSIGNED request with existing assignment
- [ ] Note current assignment (team/developer)
- [ ] Click "Assign Request" (if button available)
- [ ] OR check if priority selector allows status to go back
- [ ] Change assignment to different team/developer
- [ ] Verify old assignment unassigned (unassigned_at set)
- [ ] Verify new assignment created
- [ ] Check timeline shows reassignment

**Expected Results**:
- Can reassign requests
- Old assignment marked inactive
- New assignment created

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 20. Admin Actions - Context Awareness
**Status**: ⏳ PENDING

**Steps**:
- [ ] Open SUBMITTED request → Check only "Verifikasi" visible
- [ ] Open VERIFICATION request → Check "Setujui"/"Tolak" visible
- [ ] Open APPROVED request → Check "Priority" + "Assign" visible
- [ ] Open ASSIGNED request → Check only "Priority" visible
- [ ] Open IN_PROGRESS request → Check "Tidak ada aksi" message
- [ ] Open COMPLETED request → Check "Tidak ada aksi" message
- [ ] Open REJECTED request → Check "Tidak ada aksi" message

**Expected Results**:
- Actions panel shows only valid actions per status
- Clear messaging when no actions available

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 21. Authorization - Non-Admin Access
**Status**: ⏳ PENDING

**Steps**:
- [ ] Logout admin
- [ ] Login as user (user@sippa.local)
- [ ] Try navigating to /admin/dashboard
- [ ] Verify access denied or redirect
- [ ] Try /admin/requests
- [ ] Verify access denied
- [ ] Try /admin/requests/1 (direct URL)
- [ ] Verify access denied
- [ ] Check no admin menu in sidebar

**Expected Results**:
- User cannot access admin routes
- Proper error handling or redirect

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 22. Toast Notifications
**Status**: ⏳ PENDING

**Steps**:
- [ ] Perform verify action → Check success toast appears
- [ ] Perform approve action → Check success toast
- [ ] Perform reject action → Check success toast
- [ ] Try reject without reason → Check error toast
- [ ] Perform assign action → Check success toast
- [ ] Set priority → Check success toast
- [ ] Check toast position (top-right)
- [ ] Check toast auto-dismisses

**Expected Results**:
- Success toasts show for all actions
- Error toasts show for validation failures
- Toasts positioned correctly
- Auto-dismiss works

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 23. Responsive Design - Mobile
**Status**: ⏳ PENDING

**Steps**:
- [ ] Resize browser to mobile width (<768px)
- [ ] Check dashboard stats stack vertically
- [ ] Verify admin actions panel moves below content
- [ ] Check table scrolls horizontally
- [ ] Verify filters accessible
- [ ] Check dialogs fit screen
- [ ] Test navigation on mobile

**Expected Results**:
- Mobile responsive
- All features accessible
- No layout breaks

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 24. Status History Timeline
**Status**: ⏳ PENDING

**Steps**:
- [ ] Open a request that went through multiple transitions
- [ ] Check timeline shows all status changes
- [ ] Verify chronological order (oldest first or newest first)
- [ ] Check each entry shows:
  - [ ] From status → To status
  - [ ] Actor name
  - [ ] Timestamp
  - [ ] Note (if added)
- [ ] Verify notes display correctly

**Expected Results**:
- Complete history visible
- All fields present
- Formatted nicely

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 25. SLA Calculation
**Status**: ⏳ PENDING

**Prerequisites**: sla_policies table has data

**Steps**:
- [ ] Create/open a request
- [ ] Approve it
- [ ] Set priority (e.g., P1 for new_application)
- [ ] Check target_sla_hours field in request
- [ ] Verify it matches sla_policies table
- [ ] Query: SELECT * FROM sla_policies WHERE request_type='new_application' AND priority_id=1
- [ ] Compare target_hours with request.target_sla_hours

**Expected Results**:
- SLA calculated correctly from policy
- target_sla_hours populated

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

### 26. Error Handling
**Status**: ⏳ PENDING

**Steps**:
- [ ] Try accessing non-existent request ID (/admin/requests/99999)
- [ ] Verify error handling (not found message or redirect)
- [ ] Try invalid status transition (manually if possible)
- [ ] Try assigning without team or developer
- [ ] Verify validation error
- [ ] Test network error simulation (if possible)

**Expected Results**:
- Graceful error handling
- Clear error messages
- No app crashes

**Actual Results**:
- 

**Pass/Fail**: ⏳

---

## Summary

**Total Test Cases**: 26  
**Passed**: 0  
**Failed**: 0  
**Skipped**: 0  
**Pending**: 26  

**Overall Status**: ⏳ TESTING IN PROGRESS

---

## Issues Found

_None yet - testing pending_

---

## Notes

- Testing requires dev server running on http://localhost:3000
- Database must be seeded with test accounts
- Some tests require specific request states (create test data first)
- SLA calculation tests require sla_policies table data

---

**Testing Started**: 2026-09-23  
**Last Updated**: 2026-09-23 20:20 WIB  
**Tester**: Manual testing required
