# SiPPA Testing Checklist - Phase 8

Comprehensive manual testing checklist for v1.0 release.

---

## 📋 Test Environment Setup

- [ ] Database seeded with test data (`npm run db:seed`)
- [ ] Development server running (`npm run dev`)
- [ ] Browser console open for error checking
- [ ] Multiple browsers available (Chrome, Firefox, Safari)
- [ ] Mobile device or responsive testing tools ready

**Test Accounts:**
- Admin: `admin@example.com` / `admin123`
- Developer: `dev1@example.com` / `dev123`
- User: `user1@example.com` / `user123`

---

## 🔐 Authentication Tests

### Login
- [ ] Login with valid admin credentials
- [ ] Login with valid developer credentials
- [ ] Login with valid user credentials
- [ ] Login with invalid email shows error
- [ ] Login with invalid password shows error
- [ ] Login with inactive user fails
- [ ] Session persists after page refresh
- [ ] Session persists after browser close/reopen

### Logout
- [ ] Logout button visible in user menu
- [ ] Clicking logout redirects to login page
- [ ] After logout, cannot access protected pages
- [ ] After logout, login again works

### Session Management
- [ ] Session timeout handled gracefully (if configured)
- [ ] Accessing protected route without login redirects to login
- [ ] After login, redirects to intended page

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 👤 User Role Tests

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Pending Requests section shows user's submitted requests
- [ ] In Progress Requests section shows active requests
- [ ] Recently Completed section shows last 5 completed
- [ ] Recent Activity shows latest updates
- [ ] Quick stats cards display correct counts
- [ ] All numbers accurate against database

### Submit Request (Request Baru)

**New Application:**
- [ ] Click "Request Baru" opens form
- [ ] Request type selector works
- [ ] Select "New Application"
- [ ] Title field validation (min 5, max 200 chars)
- [ ] Description field validation (min 20, max 5000 chars)
- [ ] Urgency selector works (Low, Medium, High, Critical)
- [ ] Can upload PDF file
- [ ] Can upload DOC/DOCX file
- [ ] Can upload XLS/XLSX file
- [ ] Can upload JPG/PNG image
- [ ] Can upload ZIP file
- [ ] Can upload up to 5 files total
- [ ] Cannot upload 6th file (shows error)
- [ ] Cannot upload file > 10MB (shows error)
- [ ] Cannot upload .exe or .bat file (shows error)
- [ ] Can remove uploaded file before submit
- [ ] Submit button disabled until all required fields filled
- [ ] Submit shows loading state
- [ ] Success message displays after submit
- [ ] New request appears in DevTI Request list
- [ ] Request number generated (REQ-2026-XXX format)
- [ ] Status is "SUBMITTED"
- [ ] Notification appears for admin

**RFC:**
- [ ] Select "RFC" as request type
- [ ] All same validations as New Application
- [ ] Submit RFC request successfully
- [ ] RFC badge shows in request list

**Form Validation:**
- [ ] Title too short shows validation error
- [ ] Title too long shows validation error
- [ ] Description too short shows validation error
- [ ] Missing required field prevents submit
- [ ] Error messages clear and helpful
- [ ] Validation errors shown in red
- [ ] Form preserves input on validation error

### View Requests (DevTI Request)
- [ ] Request list loads with user's requests only
- [ ] Table shows: Request No, Type, Title, Status, Priority, Submitted, Updated
- [ ] Request numbers are clickable links
- [ ] Status badges colored correctly
- [ ] Priority badges show after admin assignment
- [ ] Search by title works
- [ ] Search by request number works
- [ ] Filter by status (All, Submitted, Approved, etc.) works
- [ ] Filter by type (New Application, RFC) works
- [ ] Date range filter works
- [ ] Sort by column header works
- [ ] Pagination works (if > 10 requests)
- [ ] Empty state shows if no requests

### View Request Detail
- [ ] Click request opens detail page
- [ ] Request information section complete
- [ ] Request number, type badge, title displayed
- [ ] Description shows full text
- [ ] Requester name and unit visible
- [ ] Status and priority badges shown
- [ ] Timeline shows submission event
- [ ] Timeline shows all status changes with timestamps
- [ ] Attachments section lists uploaded files
- [ ] Click attachment filename downloads file
- [ ] Downloaded file opens correctly
- [ ] Progress section appears after assignment (if applicable)
- [ ] Progress percentage and notes visible
- [ ] Breadcrumb navigation works
- [ ] Back button returns to list

### Notifications
- [ ] Bell icon shows unread count badge
- [ ] Click bell opens notification dropdown
- [ ] Recent 5 notifications shown in dropdown
- [ ] Click "View All" opens notifications page
- [ ] Notifications page shows all notifications
- [ ] Filter by "All", "Unread", "Read" works
- [ ] Click notification marks as read
- [ ] Unread notifications bold
- [ ] Read notifications normal weight
- [ ] "Mark all as read" button works
- [ ] Badge count updates after marking read
- [ ] Notification links to related request work

**Notification Events (verify received):**
- [ ] Request submitted confirmation
- [ ] Request approved notification
- [ ] Request rejected notification
- [ ] Progress updated notification
- [ ] Request completed notification

### Responsive Design (User)
- [ ] Dashboard mobile layout works
- [ ] Request form mobile layout works
- [ ] Request list mobile layout (horizontal scroll)
- [ ] Sidebar hidden on mobile, hamburger menu works
- [ ] Navigation drawer opens/closes on mobile
- [ ] All buttons tappable on mobile
- [ ] No horizontal scroll issues

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 👔 Admin Role Tests

### Dashboard
- [ ] Admin dashboard loads
- [ ] Incoming Queue card shows new submissions
- [ ] Verification Queue card shows under review
- [ ] Approved but Unassigned card shows count
- [ ] In Progress card shows active requests
- [ ] SLA Attention card shows at-risk requests
- [ ] Quick stats accurate
- [ ] Click queue card navigates to filtered request list
- [ ] Charts render correctly

### View All Requests
- [ ] Request list shows ALL requests (all users)
- [ ] Can see requests from multiple users
- [ ] Search across all requests works
- [ ] Filter by status works
- [ ] Filter by type works
- [ ] Filter by priority works
- [ ] Filter by date range works
- [ ] Can see requester name in list
- [ ] Export button present (if implemented)

### Approve Request
- [ ] Open request with SUBMITTED status
- [ ] "Approve" button visible
- [ ] Click Approve opens confirmation
- [ ] Confirm approval succeeds
- [ ] Status changes to APPROVED
- [ ] Timeline shows approval event with admin name
- [ ] Requester receives approval notification
- [ ] Request moves to "Approved but Unassigned" queue
- [ ] Admin notification created

### Reject Request
- [ ] Open request with SUBMITTED status
- [ ] "Reject" button visible
- [ ] Click Reject opens dialog
- [ ] Rejection reason field required
- [ ] Cannot submit empty reason
- [ ] Enter rejection reason: "Duplicate of REQ-2026-005"
- [ ] Confirm rejection succeeds
- [ ] Status changes to REJECTED
- [ ] Timeline shows rejection with reason
- [ ] Requester receives rejection notification with reason
- [ ] Request removed from active queues

### Set Priority
- [ ] Open approved request
- [ ] "Set Priority" or "Edit" button visible
- [ ] Click opens priority selector
- [ ] Can select: Low, Medium, High, Critical
- [ ] Select "High"
- [ ] Save priority
- [ ] Priority badge updates
- [ ] Target SLA hours assigned based on policy
- [ ] Timeline shows priority set event

### Assign to Developer
- [ ] Open approved request with priority set
- [ ] "Assign" button visible
- [ ] Click opens assignment dialog
- [ ] Can select "Team" or "Developer" tab
- [ ] Developer list shows only active developers
- [ ] Team list shows only active teams
- [ ] Select developer "Dev User 1"
- [ ] Confirm assignment
- [ ] Status changes to ASSIGNED
- [ ] Timeline shows assignment with developer name
- [ ] Developer receives assignment notification
- [ ] Request appears in developer's assignment list

### Assign to Team
- [ ] Open approved request
- [ ] Open assignment dialog
- [ ] Switch to "Team" tab
- [ ] Select "Backend Team"
- [ ] Confirm assignment
- [ ] Status changes to ASSIGNED
- [ ] Timeline shows team assignment
- [ ] All team members receive notification

### View Request Progress
- [ ] Open request with IN_PROGRESS status
- [ ] Progress section visible
- [ ] Shows current percentage
- [ ] Shows all progress updates with timestamps
- [ ] Developer notes visible
- [ ] Timeline includes progress events

### Download Attachments
- [ ] Open any request with attachments
- [ ] Attachments section lists all files
- [ ] Click filename downloads file
- [ ] Downloaded file correct type and size
- [ ] Downloaded file opens successfully

### Master Data - Priorities
- [ ] Navigate to Settings → Priorities
- [ ] Priority list loads
- [ ] Shows: Code, Name, Sort Order, Active status
- [ ] Click "Add Priority" opens form
- [ ] Create new priority:
  - Code: "URGENT"
  - Name: "Urgent"
  - Sort Order: 5
  - Active: Yes
- [ ] Save succeeds
- [ ] New priority appears in list
- [ ] Edit priority works
- [ ] Deactivate priority works
- [ ] Cannot delete priority with existing requests (shows error)
- [ ] Inactive priority hidden from selectors

### Master Data - Teams
- [ ] Navigate to Settings → Teams
- [ ] Team list loads
- [ ] Click "Add Team" creates team
- [ ] Enter name: "Mobile Team"
- [ ] Save succeeds
- [ ] Click "Manage Members" opens member dialog
- [ ] Shows current members
- [ ] Can add developer from dropdown
- [ ] Can remove member (click X)
- [ ] Save members succeeds
- [ ] Edit team name works
- [ ] Deactivate team works

### Master Data - Units
- [ ] Navigate to Settings → Units
- [ ] Unit list loads
- [ ] Add new unit works
- [ ] Edit unit works
- [ ] Deactivate unit works
- [ ] Inactive unit hidden from user registration

### Master Data - SLA Policies
- [ ] Navigate to Settings → SLA Policies
- [ ] Policy list loads showing type + priority combos
- [ ] Click "Add Policy" opens form
- [ ] Select Request Type: New Application
- [ ] Select Priority: Critical
- [ ] Enter Target Hours: 48
- [ ] Active: Yes
- [ ] Save succeeds
- [ ] Policy appears in list
- [ ] Edit policy works
- [ ] Deactivate policy works
- [ ] Policy applies to new approved requests

### User Management
- [ ] Navigate to Settings → Users
- [ ] User list loads all users
- [ ] Shows: Name, Email, Role, Unit, Active status
- [ ] Search by name works
- [ ] Search by email works
- [ ] Filter by role works
- [ ] Filter by active status works

**Add User:**
- [ ] Click "Add User" opens form
- [ ] Fill form:
  - Name: "Test Admin User"
  - Email: "testadmin@example.com"
  - Password: "test123"
  - Role: Admin
  - Unit: IT
  - Active: Yes
- [ ] Save succeeds
- [ ] New user appears in list
- [ ] Logout current admin
- [ ] Login with new user credentials succeeds
- [ ] New user has admin role access

**Edit User:**
- [ ] Back to admin, edit test user
- [ ] Change role to Developer
- [ ] Leave password blank (keep existing)
- [ ] Save succeeds
- [ ] User role updated
- [ ] Logout and login as test user
- [ ] Now has developer role access

**Deactivate User:**
- [ ] Edit test user
- [ ] Set Active: No
- [ ] Save succeeds
- [ ] Logout
- [ ] Try login as deactivated user
- [ ] Login fails with appropriate error
- [ ] Reactivate user for cleanup

### Reports - Laptri (Quarterly)
- [ ] Navigate to Reports → Laptri
- [ ] Report page loads
- [ ] Year filter defaults to current year (2026)
- [ ] Quarter filter shows Q1, Q2, Q3, Q4, All
- [ ] Request Type filter shows: All, New Application, RFC
- [ ] Summary cards show:
  - Total Completed Requests
  - New Applications count
  - RFC count
  - Average Completion Time (days)
- [ ] Charts render:
  - Completion trend by month (line chart)
  - Request type distribution (pie chart)
  - Average completion time by type (bar chart)
- [ ] Details table shows completed requests
- [ ] Table columns: Request No, Type, Title, Priority, Submitted, Completed, Duration
- [ ] Table sortable by columns
- [ ] Table searchable

**Filters:**
- [ ] Change year, report updates
- [ ] Select Q1, shows only Q1 data
- [ ] Select Q2, shows only Q2 data
- [ ] Select "New Application" only, filters correctly
- [ ] Select "RFC" only, filters correctly
- [ ] Reset to "All" shows all data

**Export to Excel:**
- [ ] Click "Export to Excel" button
- [ ] File downloads (laptri_YYYY_Qn.xlsx)
- [ ] Open Excel file
- [ ] Verify 3 sheets: Summary, Monthly Trend, Details
- [ ] Summary sheet has aggregate metrics
- [ ] Monthly Trend sheet has month-by-month breakdown
- [ ] Details sheet has all request records
- [ ] Data matches on-screen report

### Reports - Pencapaian SLA
- [ ] Navigate to Reports → Pencapaian SLA
- [ ] Report page loads
- [ ] Filters: Year, Type, Priority, SLA Status
- [ ] Summary cards show:
  - Total Requests
  - SLA Met (green)
  - SLA Exceeded (red)
  - Achievement Rate %
- [ ] Average times section:
  - Avg Target SLA
  - Avg Actual Time
  - Difference
- [ ] Charts render:
  - SLA achievement trend (line chart)
  - Met vs Exceeded comparison (bar chart)
- [ ] Details table shows:
  - Request No, Type, Title, Priority
  - Target SLA, Actual Time, SLA Status, Variance
- [ ] Color coding: Green row = Met, Red row = Exceeded
- [ ] Table sortable and searchable

**Filters:**
- [ ] Filter by year works
- [ ] Filter by type works
- [ ] Filter by priority works
- [ ] Filter "SLA Met" shows only compliant
- [ ] Filter "SLA Exceeded" shows only over SLA
- [ ] Reset filters shows all

**Export to Excel:**
- [ ] Click "Export to Excel"
- [ ] File downloads (sla_achievement_YYYY.xlsx)
- [ ] Open Excel file
- [ ] Verify 3 sheets: Summary, Monthly Trend, Details
- [ ] Data accurate
- [ ] SLA calculations correct

### Audit Logs
- [ ] Navigate to Settings → Audit Logs
- [ ] Audit log list loads
- [ ] Shows: Timestamp, Actor, Module, Action, Entity, Details
- [ ] Latest logs at top

**Filters:**
- [ ] Date range filter works (From/To)
- [ ] Module filter works (auth, requests, users, etc.)
- [ ] Action filter works (create, update, approve, etc.)
- [ ] Actor filter works (search by name)
- [ ] Entity type filter works

**View Log Detail:**
- [ ] Click on update log entry
- [ ] Detail modal/page opens
- [ ] Shows full context
- [ ] Before/After JSON diff visible
- [ ] IP address and user agent shown
- [ ] Timestamp accurate

**Verify Logged Events:**
- [ ] Login success logged
- [ ] Login failure logged (test with wrong password)
- [ ] Request create logged
- [ ] Request approve logged with before/after
- [ ] Request reject logged
- [ ] Assignment logged
- [ ] Priority create/update logged
- [ ] User create/update logged
- [ ] Progress update logged

### Responsive Design (Admin)
- [ ] Dashboard mobile layout
- [ ] Request list mobile layout
- [ ] Report charts responsive
- [ ] Settings pages mobile friendly
- [ ] Audit logs mobile layout
- [ ] All forms usable on mobile

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 👨‍💻 Developer Role Tests

### Dashboard
- [ ] Developer dashboard loads
- [ ] My Workload shows current assignment count
- [ ] In Progress shows active requests
- [ ] Completed This Month shows count
- [ ] Assignments list shows recent assignments
- [ ] Recent Activity shows updates

### View Assignments
- [ ] Navigate to My Assignment
- [ ] Shows only requests assigned to logged-in developer
- [ ] Table shows: Request No, Type, Title, Priority, Status, Assigned Date, Last Updated
- [ ] Search works
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Sort by priority (High to Low) works

### Update Progress

**First Update (Start Work):**
- [ ] Open assigned request
- [ ] "Update Progress" button visible
- [ ] Click opens update form
- [ ] Progress slider/input: set to 10%
- [ ] Update note required
- [ ] Enter note: "Requirements analysis complete. Starting database design."
- [ ] Save succeeds
- [ ] Success message displays
- [ ] Progress shows 10% on request detail
- [ ] Note visible in progress section
- [ ] Timeline includes progress update event
- [ ] Requester receives progress notification

**Milestone Update:**
- [ ] Update progress to 50%
- [ ] Enter note: "Backend API complete. Starting frontend."
- [ ] Save succeeds
- [ ] Progress updates to 50%
- [ ] Multiple updates visible in history
- [ ] Latest update at top

**Complete Request:**
- [ ] Update progress to 100%
- [ ] Enter note: "All requirements implemented and tested. Deployed to production."
- [ ] Save succeeds
- [ ] Request status changes to COMPLETED
- [ ] Timeline shows completion
- [ ] Requester receives completion notification
- [ ] Admin receives completion notification
- [ ] Request removed from developer's active assignments
- [ ] Request appears in Completed This Month

### View Request Details
- [ ] Can view full request information
- [ ] Can read description and requirements
- [ ] Can download attachments
- [ ] Can see all progress history
- [ ] Cannot approve/reject (admin only)
- [ ] Cannot assign (admin only)

### Notifications
- [ ] Receives assignment notifications
- [ ] Click notification opens assigned request
- [ ] Notification marked read after click
- [ ] Bell badge shows unread count

### Responsive Design (Developer)
- [ ] Dashboard mobile layout
- [ ] Assignment list mobile layout
- [ ] Update progress form mobile friendly
- [ ] Request detail mobile layout

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 🔐 Authorization Tests

### User Authorization
- [ ] User cannot access `/admin/*` routes
- [ ] User cannot access `/developer/*` routes
- [ ] User can only see own requests
- [ ] User cannot approve own request
- [ ] User cannot assign requests
- [ ] User cannot update progress on any request
- [ ] User cannot access audit logs
- [ ] User cannot manage master data
- [ ] User cannot manage users

### Developer Authorization
- [ ] Developer cannot access admin routes
- [ ] Developer can only see assigned requests
- [ ] Developer cannot approve/reject
- [ ] Developer cannot assign
- [ ] Developer can update progress only on assigned requests
- [ ] Developer cannot update progress on unassigned request
- [ ] Developer cannot access audit logs
- [ ] Developer cannot manage master data

### Admin Authorization
- [ ] Admin can access all routes
- [ ] Admin can see all requests
- [ ] Admin can approve/reject
- [ ] Admin can assign
- [ ] Admin can access reports
- [ ] Admin can manage master data
- [ ] Admin can manage users
- [ ] Admin can view audit logs

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 🌐 Cross-Browser Tests

### Chrome/Edge
- [ ] All core features work
- [ ] Layouts render correctly
- [ ] Forms submit successfully
- [ ] Charts render
- [ ] File uploads work
- [ ] Downloads work
- [ ] No console errors

### Firefox
- [ ] All core features work
- [ ] Layouts render correctly
- [ ] Forms submit successfully
- [ ] Charts render
- [ ] File uploads work
- [ ] Downloads work
- [ ] No console errors

### Safari (if available)
- [ ] All core features work
- [ ] Layouts render correctly
- [ ] Forms submit successfully
- [ ] Charts render
- [ ] File uploads work
- [ ] Downloads work
- [ ] No console errors

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 📱 Mobile Testing

### Mobile Chrome (Android)
- [ ] Login works
- [ ] Navigation drawer opens/closes
- [ ] Submit request form usable
- [ ] File upload from camera works
- [ ] File upload from gallery works
- [ ] Tables scroll horizontally
- [ ] Charts responsive
- [ ] Buttons tappable (not too small)
- [ ] No layout overflow

### Mobile Safari (iOS)
- [ ] Login works
- [ ] Navigation drawer works
- [ ] Forms usable
- [ ] File upload works
- [ ] Tables scroll
- [ ] Charts render
- [ ] Buttons tappable

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## ⚠️ Edge Case Tests

### Empty States
- [ ] Empty request list shows helpful message
- [ ] Empty notifications shows message
- [ ] Empty audit logs shows message
- [ ] Empty search results shows message

### Error Scenarios
- [ ] Submit form with validation errors shows clear messages
- [ ] Upload invalid file type shows error
- [ ] Upload oversized file shows error
- [ ] Network error shows user-friendly message
- [ ] 404 page renders for invalid routes
- [ ] Error boundary catches crashes

### Concurrent Operations
- [ ] Two admins approve same request (race condition)
- [ ] Two developers update same request progress
- [ ] Admin assigns while developer updates progress

### Data Integrity
- [ ] Cannot approve already rejected request
- [ ] Cannot reject already approved request
- [ ] Cannot update progress on completed request
- [ ] Cannot delete priority used in requests
- [ ] Cannot deactivate unit with active users

### Performance
- [ ] Request list with 100+ requests loads in < 3s
- [ ] Dashboard loads in < 3s
- [ ] Report generation takes < 5s
- [ ] Excel export with 50+ records completes
- [ ] No memory leaks (check browser task manager)

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 🎨 UI/UX Quality

### Visual Consistency
- [ ] Colors consistent across all pages
- [ ] Fonts consistent
- [ ] Spacing consistent
- [ ] Button styles consistent
- [ ] Badge styles consistent
- [ ] Card styles consistent

### Accessibility
- [ ] Tab navigation works through forms
- [ ] Enter key submits forms
- [ ] Escape key closes dialogs
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast sufficient (text readable)
- [ ] Labels present on all form fields
- [ ] ARIA labels on icon-only buttons
- [ ] Alt text on images

### Feedback
- [ ] Loading spinners show during async operations
- [ ] Success toasts appear after actions
- [ ] Error toasts appear on failures
- [ ] Button disabled states clear
- [ ] Form validation messages clear
- [ ] Hover states on clickable items

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 🔒 Security Tests

### File Upload Security
- [ ] Cannot upload .exe file
- [ ] Cannot upload .sh file
- [ ] Cannot upload .bat file
- [ ] Cannot upload file > 10MB
- [ ] Cannot upload 6+ files per request
- [ ] File MIME type validated server-side

### Input Validation
- [ ] XSS attempt in request description sanitized
- [ ] SQL injection attempt prevented (test in search)
- [ ] Script tags in input escaped
- [ ] Long input strings truncated appropriately

### Authentication Security
- [ ] Password not visible in UI
- [ ] Session cookie secure (check DevTools)
- [ ] Cannot access API without session
- [ ] CSRF protection enabled (NextAuth default)

### File Download Security
- [ ] Cannot download attachment from other user's request (user role)
- [ ] Admin can download any attachment
- [ ] Developer can download from assigned requests
- [ ] Invalid attachment ID returns 404

**✅ Pass | ❌ Fail | ⚠️ Notes:**

---

## 📊 Test Summary

**Test Date:** __________

**Tester:** __________

**Environment:** Development | Staging | Production

**Total Tests:** ____

**Passed:** ____

**Failed:** ____

**Blocked:** ____

---

## 🐛 Issues Found

| # | Severity | Page/Feature | Description | Status |
|---|----------|--------------|-------------|--------|
| 1 | High | | | Open |
| 2 | Medium | | | Fixed |
| 3 | Low | | | Deferred |

---

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] No high-severity bugs blocking release
- [ ] Performance acceptable
- [ ] Security tests passed
- [ ] Documentation reviewed
- [ ] Ready for production deployment

**Tested By:** __________________ **Date:** __________

**Approved By:** __________________ **Date:** __________

---

**Testing complete! Document all issues and retest after fixes. 🎯**
