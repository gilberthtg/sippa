# SIPPA Testing Checklist - Post-Restructure (Phase 1-7)

**Document Version:** 1.0  
**Last Updated:** 2026-10-10  
**Purpose:** Comprehensive testing checklist for SIPPA after Phase 1-7 restructure

---

## Overview

This checklist covers all critical workflows after the major restructure that introduced:
- Developer roles (SA, TW, BE, FE, QA, DM)
- Single-page request form with version validation
- Individual-based team assignments
- Application master management
- Business days SLA calculation
- Enhanced reporting

**Testing Priority:**
- 🔴 **CRITICAL** - Core functionality, must pass
- 🟡 **HIGH** - Important features, should pass
- 🟢 **MEDIUM** - Nice-to-have, can defer

---

## Pre-Testing Setup

### Database State Verification

- [ ] Phase 1 schema changes applied (developer_roles, request_applications, etc.)
- [ ] Seed data loaded (developer roles, SLA holidays, SLA policies)
- [ ] Migration scripts executed (Phase 7)
- [ ] Sample data exists for testing (users, requests, assignments)

### Application State Verification

- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] Production build successful (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] No console errors on page load

### Test Users Required

Create test accounts for each role:

```sql
-- Admin User
-- email: admin@test.com, password: Test1234!

-- Regular User
-- email: user@test.com, password: Test1234!

-- Developer (Backend)
-- email: developer.be@test.com, password: Test1234!, developer_role_id = BE

-- Developer (Frontend)
-- email: developer.fe@test.com, password: Test1234!, developer_role_id = FE

-- Developer (Technical Writer)
-- email: developer.tw@test.com, password: Test1234!, developer_role_id = TW

-- Developer (QA)
-- email: developer.qa@test.com, password: Test1234!, developer_role_id = QA
```

---

## SECTION 1: Authentication & Authorization

### 1.1 Login Flow 🔴 CRITICAL

- [ ] User can login with valid credentials
- [ ] Invalid credentials show error message
- [ ] User is redirected to correct dashboard based on role:
  - [ ] USER → `/dashboard`
  - [ ] ADMIN → `/admin/dashboard`
  - [ ] DEVELOPER → `/developer/dashboard`
- [ ] Session persists on page refresh
- [ ] Audit log entry created for login success
- [ ] Audit log entry created for login failure

### 1.2 Logout Flow 🔴 CRITICAL

- [ ] User can logout from UserMenu dropdown
- [ ] Session is terminated
- [ ] User is redirected to `/login`
- [ ] Audit log entry created for logout
- [ ] Cannot access protected routes after logout

### 1.3 Authorization 🔴 CRITICAL

- [ ] User cannot access `/admin/*` routes (403/404)
- [ ] User cannot access `/developer/*` routes (403/404)
- [ ] Admin cannot access `/developer/*` routes (403/404)
- [ ] Developer cannot access `/admin/*` routes (403/404)
- [ ] Unauthorized access redirects to appropriate error page

---

## SECTION 2: User Role - Request Submission

### 2.1 Single-Page Request Form 🔴 CRITICAL

#### NEW_APPLICATION Flow

- [ ] Navigate to `/requests/new`
- [ ] Select "New Application" radio button
- [ ] Form shows correct fields:
  - [ ] Title input (visible)
  - [ ] Application dropdown (hidden)
  - [ ] Version input (hidden)
  - [ ] Description textarea (visible)
  - [ ] Urgency dropdown (visible)
  - [ ] File upload section (visible)
- [ ] **Validation:**
  - [ ] Title required (min 3 characters)
  - [ ] Description required (min 20 characters)
  - [ ] Urgency required
  - [ ] Error messages display inline
- [ ] **Submit:**
  - [ ] Can save as draft (status = DRAFT)
  - [ ] Can submit (status = SUBMITTED)
  - [ ] Version auto-set to "1.0.0" (not visible to user)
  - [ ] Redirects to request detail page
  - [ ] Success message shown
  - [ ] Notification sent to all admins

#### RFC Flow

- [ ] Select "RFC" radio button
- [ ] Form shows correct fields:
  - [ ] Title input (hidden)
  - [ ] Application dropdown (visible, required)
  - [ ] Version input (visible, required)
  - [ ] Description textarea (visible)
  - [ ] Urgency dropdown (visible)
  - [ ] File upload section (visible)
- [ ] **Application Selection:**
  - [ ] Dropdown shows all applications from `request_applications`
  - [ ] Format: "Application Name (v1.2.3)"
  - [ ] Shows current version
  - [ ] Selection updates current version display
- [ ] **Version Validation (CRITICAL):**
  - [ ] Must be in semantic version format (x.y.z)
  - [ ] Real-time validation on input change
  - [ ] Error if version <= current version
  - [ ] Error message: "Version must be greater than current version (1.2.3)"
  - [ ] Success if version > current version
  - [ ] Auto-suggest buttons work (patch, minor, major):
    - [ ] Current: 1.2.3 → Patch: 1.2.4
    - [ ] Current: 1.2.3 → Minor: 1.3.0
    - [ ] Current: 1.2.3 → Major: 2.0.0
  - [ ] Server-side validation also enforces version > current
- [ ] **Submit:**
  - [ ] Version validation passes before submit
  - [ ] Request created with application_id and requested_version
  - [ ] Redirects to request detail
  - [ ] Success message shown
  - [ ] Notification sent to all admins

### 2.2 File Upload 🔴 CRITICAL

- [ ] Can upload multiple files (up to 5)
- [ ] Preview shows file name, size, type
- [ ] Can remove uploaded files before submit
- [ ] File validation:
  - [ ] Max file size: 10MB per file
  - [ ] Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
  - [ ] Error shown for invalid file types
  - [ ] Error shown for oversized files
- [ ] Files saved to `/uploads` directory
- [ ] Files associated with request in `request_attachments` table

### 2.3 Request List (User) 🟡 HIGH

- [ ] Navigate to `/requests`
- [ ] Shows only user's own requests (not other users' requests)
- [ ] Table columns:
  - [ ] Request Number
  - [ ] Type (NEW_APPLICATION / RFC badge)
  - [ ] Title / Application Name
  - [ ] Version (for RFC)
  - [ ] Status badge
  - [ ] Submitted Date
  - [ ] Actions (View)
- [ ] **Filtering:**
  - [ ] Filter by status (All, Submitted, Approved, Rejected, etc.)
  - [ ] Filter by request type (All, NEW_APPLICATION, RFC)
  - [ ] Search by request number or title
  - [ ] Filters trigger data refetch
  - [ ] Count updates based on filters
- [ ] **Pagination:**
  - [ ] Shows 20 items per page
  - [ ] Page navigation works
  - [ ] Shows total count
- [ ] **Empty State:**
  - [ ] Shows helpful message when no requests
  - [ ] "Create Request" button shown

### 2.4 Request Detail (User) 🔴 CRITICAL

- [ ] Navigate to `/requests/[id]`
- [ ] Shows request information:
  - [ ] Request Number
  - [ ] Type badge (NEW_APPLICATION / RFC)
  - [ ] Title / Application Name
  - [ ] Version (for RFC)
  - [ ] Description
  - [ ] Urgency badge
  - [ ] Status badge
  - [ ] Submitted Date
  - [ ] Priority (if set by admin)
- [ ] **For RFC:**
  - [ ] Shows linked application
  - [ ] Shows current version vs requested version
- [ ] **Status Timeline:**
  - [ ] Shows all status changes
  - [ ] Format: "Status changed from X to Y by [User] on [Date]"
  - [ ] Shows rejection reason if rejected
- [ ] **Team Information (if assigned):**
  - [ ] DevTI Urusan
  - [ ] Team Leader name
  - [ ] Technical Writer name
  - [ ] Developer list with roles (BE, FE, QA, etc.)
- [ ] **Attachments:**
  - [ ] List of uploaded files
  - [ ] Download button for each file
  - [ ] Download works (file served correctly)
- [ ] **Progress Updates (if any):**
  - [ ] Shows progress percentage
  - [ ] Shows update notes
  - [ ] Shows updated by and date
- [ ] **Authorization:**
  - [ ] User can only view their own requests
  - [ ] Cannot view other users' requests (403/404)

### 2.5 Dashboard (User) 🟡 HIGH

- [ ] Navigate to `/dashboard`
- [ ] **Statistics Cards:**
  - [ ] Total Requests
  - [ ] Pending (SUBMITTED)
  - [ ] In Progress
  - [ ] Completed
- [ ] **Recent Requests Widget:**
  - [ ] Shows last 5 requests
  - [ ] Click to view detail
- [ ] **Status Distribution Chart:**
  - [ ] Pie/bar chart showing requests by status
  - [ ] Chart renders correctly

### 2.6 Notifications (User) 🟡 HIGH

- [ ] **Notification Bell:**
  - [ ] Shows unread count badge
  - [ ] Dropdown shows recent notifications (5)
  - [ ] Click to mark as read
  - [ ] "View All" link to `/notifications`
- [ ] **Notification Events (User receives):**
  - [ ] Request submitted (confirmation)
  - [ ] Request approved (with team assignment info)
  - [ ] Request rejected (with reason)
  - [ ] Progress updated by developer
  - [ ] Request completed
- [ ] **Notification Page `/notifications`:**
  - [ ] Shows all notifications
  - [ ] Filter by read/unread
  - [ ] Mark all as read button
  - [ ] Click notification navigates to request

---

## SECTION 3: Admin Role - Request Management

### 3.1 Admin Dashboard 🔴 CRITICAL

- [ ] Navigate to `/admin/dashboard`
- [ ] **Statistics Cards:**
  - [ ] Total Requests
  - [ ] Pending Verification (status = SUBMITTED)
  - [ ] In Progress
  - [ ] Completed this Month
  - [ ] Belum Di-assign (approved but no assignments)
- [ ] **Developer Role Distribution Widget (NEW):**
  - [ ] Shows count of active assignments by developer role
  - [ ] Format: Backend: 5, Frontend: 4, QA: 3, etc.
  - [ ] Chart or list view
- [ ] **SLA Attention Widget:**
  - [ ] Shows requests nearing or exceeding SLA
  - [ ] Click to view request detail
- [ ] **Recent Activity:**
  - [ ] Shows last 10 status changes
  - [ ] Includes user name, action, timestamp

### 3.2 Request List (Admin) 🔴 CRITICAL

- [ ] Navigate to `/admin/requests`
- [ ] Shows ALL requests (from all users)
- [ ] Table columns:
  - [ ] Request Number
  - [ ] Requester Name
  - [ ] Unit
  - [ ] Type badge
  - [ ] Title / Application Name
  - [ ] Status badge
  - [ ] Priority badge (if set)
  - [ ] Submitted Date
  - [ ] SLA Status (badge: On Track, At Risk, Exceeded)
  - [ ] Actions (View, Assign if approved)
- [ ] **Filtering:**
  - [ ] Filter by status (All, Submitted, Approved, In Progress, etc.)
  - [ ] Filter by priority (All, High, Medium, Low)
  - [ ] Filter by request type (All, NEW_APPLICATION, RFC)
  - [ ] Filter by SLA status (All, On Track, At Risk, Exceeded)
  - [ ] Search by request number, requester name, or title
  - [ ] Multiple filters can be combined
- [ ] **Sorting:**
  - [ ] Sort by submitted date
  - [ ] Sort by priority
  - [ ] Sort by SLA status
- [ ] **Bulk Actions (if implemented):**
  - [ ] Select multiple requests
  - [ ] Batch approval (if in SUBMITTED status)

### 3.3 Request Detail (Admin) 🔴 CRITICAL

- [ ] Navigate to `/admin/requests/[id]`
- [ ] Shows all request information (same as User view)
- [ ] **Additional Admin Actions:**
  - [ ] Approve button (if status = SUBMITTED)
  - [ ] Reject button (if status = SUBMITTED)
  - [ ] Assign Team button (if status = APPROVED)
  - [ ] Set Priority dropdown (if not set)
  - [ ] Edit DevTI Urusan (if assigned)

### 3.4 Request Approval Flow 🔴 CRITICAL

- [ ] Open request with status = SUBMITTED
- [ ] Click "Approve" button
- [ ] **Confirmation Dialog:**
  - [ ] Shows request summary
  - [ ] Confirm / Cancel buttons
- [ ] **On Approve:**
  - [ ] Status changes to APPROVED
  - [ ] Status history entry created
  - [ ] **For NEW_APPLICATION (CRITICAL):**
    - [ ] Entry created in `request_applications` table
    - [ ] `application_name` extracted from request.title
    - [ ] `current_version` set to "1.0.0"
    - [ ] `request.application_id` updated with new application ID
  - [ ] Notification sent to requester
  - [ ] Audit log entry created
  - [ ] Admin can now assign team
- [ ] **Verify Application Master Created:**
  - [ ] Check `request_applications` table for new entry
  - [ ] Verify `request.application_id` is not NULL
  - [ ] Application now appears in RFC dropdown for future requests

### 3.5 Request Rejection Flow 🔴 CRITICAL

- [ ] Open request with status = SUBMITTED
- [ ] Click "Reject" button
- [ ] **Rejection Dialog:**
  - [ ] Reason textarea (required)
  - [ ] Confirm / Cancel buttons
- [ ] **On Reject:**
  - [ ] Status changes to REJECTED
  - [ ] Rejection reason saved in status history
  - [ ] Notification sent to requester (includes reason)
  - [ ] Audit log entry created
  - [ ] Request cannot be assigned

### 3.6 Team Assignment Flow 🔴 CRITICAL (NEW)

This is the most critical change in the restructure.

- [ ] Open request with status = APPROVED
- [ ] Click "Assign Team" button
- [ ] **Team Assignment Dialog Opens:**

#### Section: DevTI Urusan

- [ ] Text input for DevTI urusan
- [ ] Example placeholder shown
- [ ] Optional field (can be empty)

#### Section: Team Leader

- [ ] Dropdown shows ALL users (any role)
- [ ] Format: "Name (Role)" - e.g., "John Doe (Admin)"
- [ ] Can select any user as team leader
- [ ] Required field
- [ ] Selected user highlighted

#### Section: Technical Writer

- [ ] Dropdown shows only users with `developer_role_id = TW`
- [ ] Format: "Name"
- [ ] If no TW users exist, shows message
- [ ] Required field
- [ ] **Validation:**
  - [ ] Must select a TW user
  - [ ] Cannot be empty
  - [ ] Error shown if not selected

#### Section: Assign Developers

- [ ] Shows list of all users with `role = DEVELOPER`
- [ ] **For each developer, shows:**
  - [ ] Checkbox for selection
  - [ ] Developer name
  - [ ] Developer role badge (SA, TW, BE, FE, QA, DM)
  - [ ] Role color-coded (BE = green, FE = yellow, QA = red, etc.)
- [ ] **Filtering:**
  - [ ] Filter by developer role (All, SA, TW, BE, FE, QA, DM)
  - [ ] Search by name
- [ ] **Selection:**
  - [ ] Can select multiple developers
  - [ ] Minimum 1 developer required
  - [ ] Checkbox state updates
  - [ ] Selected count shown (e.g., "3 developers selected")
- [ ] **Validation:**
  - [ ] At least 1 developer must be selected
  - [ ] Error shown if none selected
  - [ ] Technical Writer can be in developer list (can be selected as both TW and developer)

#### Section: SLA Target

- [ ] Shows auto-calculated SLA target
- [ ] Format: "X business days"
- [ ] Calculated from: request_type + priority
- [ ] Read-only display
- [ ] If priority not set, shows message to set priority first

#### Assignment Submission

- [ ] "Assign Team" button at bottom
- [ ] Button disabled if validation fails
- [ ] **On Submit:**
  - [ ] Dialog shows loading state
  - [ ] Server validation runs
  - [ ] **Database Changes:**
    - [ ] `request.team_leader_id` updated
    - [ ] `request.technical_writer_id` updated
    - [ ] `request.devti_urusan` updated (if provided)
    - [ ] Individual entries created in `request_team_assignments` for each selected developer
    - [ ] Each assignment includes: `assigned_user_id`, `developer_role_id`, `assigned_by`, `assigned_at`
  - [ ] Request status changes to IN_PROGRESS
  - [ ] Status history entry created
  - [ ] **Notifications sent to:**
    - [ ] Team leader
    - [ ] Technical writer
    - [ ] Each assigned developer (with their specific role mentioned)
    - [ ] Requester (FYI)
  - [ ] **Audit log entries created:**
    - [ ] Assignment action
    - [ ] Status change action
  - [ ] Dialog closes
  - [ ] Success message shown
  - [ ] Page refreshes to show new status and team

#### Assignment Display After Assignment

- [ ] Request detail page shows "Team Information" section
- [ ] **Displays:**
  - [ ] DevTI Urusan
  - [ ] Team Leader: Name (Role)
  - [ ] Technical Writer: Name
  - [ ] Developers:
    - [ ] List with name and role badge
    - [ ] Example: "John Doe (Backend Developer)"
    - [ ] Role color-coded
  - [ ] Assignment date
  - [ ] Assigned by (admin name)

### 3.7 Priority Management 🟡 HIGH

- [ ] Admin can set priority on request detail page
- [ ] Dropdown: High, Medium, Low
- [ ] Priority badge color:
  - [ ] High: Red
  - [ ] Medium: Yellow
  - [ ] Low: Green
- [ ] Priority change triggers SLA recalculation
- [ ] Status history entry created
- [ ] Audit log entry created

### 3.8 Settings - Developer Roles 🟡 HIGH (NEW)

- [ ] Navigate to `/admin/settings/developer-roles`
- [ ] **Table shows:**
  - [ ] Code (SA, TW, BE, FE, QA, DM)
  - [ ] Name
  - [ ] Description
  - [ ] Active status
  - [ ] Actions (Edit, Toggle Status)
- [ ] **CRUD Operations:**
  - [ ] Create new developer role
  - [ ] Edit existing role (name, description)
  - [ ] Activate/deactivate role
  - [ ] Cannot delete role if in use
- [ ] **Validation:**
  - [ ] Code must be unique
  - [ ] Name required
  - [ ] Code cannot be changed after creation
- [ ] Audit log entries created for all changes

### 3.9 Settings - Applications Master 🟡 HIGH (NEW)

- [ ] Navigate to `/admin/settings/applications`
- [ ] **Table shows:**
  - [ ] Application Name
  - [ ] Current Version
  - [ ] Created Date
  - [ ] Created By (user name)
  - [ ] Total RFCs (count of RFC requests for this app)
  - [ ] Actions (View History)
- [ ] **View History:**
  - [ ] Click "View History" opens dialog/page
  - [ ] Shows all requests related to this application:
    - [ ] NEW_APPLICATION (v1.0.0) - original
    - [ ] RFC (v1.1.0) - first update
    - [ ] RFC (v1.2.0) - second update
    - [ ] etc.
  - [ ] Shows request number, version, status, date
  - [ ] Click to navigate to request detail
- [ ] **Restrictions:**
  - [ ] Cannot manually create application (must come from approved NEW_APPLICATION)
  - [ ] Cannot manually edit version (must come from completed RFC)
  - [ ] Cannot delete application
  - [ ] Read-only view for admin
- [ ] **Auto-Update on RFC Completion:**
  - [ ] When RFC status changes to COMPLETED
  - [ ] Application `current_version` updated to RFC `requested_version`
  - [ ] Verify this happens automatically

### 3.10 Settings - SLA Holidays 🟡 HIGH (NEW)

- [ ] Navigate to `/admin/settings/sla-holidays`
- [ ] **Table shows:**
  - [ ] Holiday Date
  - [ ] Description (holiday name)
  - [ ] Active status
  - [ ] Actions (Edit, Delete, Toggle Status)
- [ ] **CRUD Operations:**
  - [ ] Create new holiday (date picker + description)
  - [ ] Edit holiday (change date or description)
  - [ ] Delete holiday
  - [ ] Activate/deactivate holiday
- [ ] **Validation:**
  - [ ] Date must be unique
  - [ ] Date must be in valid format (YYYY-MM-DD)
  - [ ] Description required
- [ ] **Calendar View (if implemented):**
  - [ ] Shows holidays in calendar format
  - [ ] Click date to add holiday
- [ ] **Bulk Import (if implemented):**
  - [ ] Upload CSV with holidays
  - [ ] Format: date, description
- [ ] Audit log entries created for all changes

### 3.11 Settings - Other Master Data 🟡 HIGH

Verify existing settings pages still work:

- [ ] **Priorities:** CRUD operations work
- [ ] **Units:** CRUD operations work
- [ ] **Users:** CRUD operations work
  - [ ] **For Developer users:**
    - [ ] Developer Role dropdown required
    - [ ] Must select one of: SA, TW, BE, FE, QA, DM
    - [ ] Cannot save developer without role
    - [ ] Role badge shown in user table
- [ ] **SLA Policies:** CRUD operations work
  - [ ] **Field change:**
    - [ ] `target_hours` changed to `target_business_days`
    - [ ] Input label: "Target (Business Days)"
    - [ ] Validation: Must be positive integer
    - [ ] Example: 7 days instead of 168 hours

### 3.12 Audit Logs 🟡 HIGH

- [ ] Navigate to `/admin/settings/audit-logs`
- [ ] **Table shows:**
  - [ ] Timestamp
  - [ ] Actor (user who performed action)
  - [ ] Module
  - [ ] Action (e.g., "REQUEST_APPROVED", "TEAM_ASSIGNED")
  - [ ] Entity Type & ID
  - [ ] Details (JSON diff view)
- [ ] **Filtering:**
  - [ ] Filter by date range
  - [ ] Filter by actor (user)
  - [ ] Filter by module
  - [ ] Filter by action type
- [ ] **JSON Diff View:**
  - [ ] Click "View Details" opens dialog
  - [ ] Shows before/after JSON with highlighting
  - [ ] Sensitive data (passwords) not shown
- [ ] **Export (if implemented):**
  - [ ] Export filtered logs to CSV

---

## SECTION 4: Developer Role - Assignment & Progress

### 4.1 Developer Dashboard 🔴 CRITICAL

- [ ] Navigate to `/developer/dashboard`
- [ ] **Role Badge Display (NEW):**
  - [ ] Shows "Welcome, [Name]"
  - [ ] Shows "Role: [Developer Role]" badge
  - [ ] Role color-coded (BE = green, FE = yellow, etc.)
  - [ ] Badge uses correct role from `developer_role_id`
- [ ] **Statistics Cards:**
  - [ ] My Active Assignments (count)
  - [ ] Pending Progress Update (count)
  - [ ] Completed This Month (count)
- [ ] **Recent Assignments Widget:**
  - [ ] Shows last 5 assigned requests
  - [ ] **Shows "My Role" for each:**
    - [ ] Example: "Backend Developer" badge
    - [ ] Role color-coded
  - [ ] Click to view detail

### 4.2 Assignments Page 🔴 CRITICAL

- [ ] Navigate to `/developer/assignments`
- [ ] Shows only requests where developer is assigned
- [ ] **Table columns:**
  - [ ] Request Number
  - [ ] Application Name
  - [ ] **My Role (NEW)** - shows developer's specific role in this request
  - [ ] Status badge
  - [ ] Priority badge
  - [ ] Team Members count (e.g., "5 members")
  - [ ] Progress percentage
  - [ ] SLA Status badge
  - [ ] Actions (View, Update Progress)
- [ ] **"My Role" Column:**
  - [ ] Shows role badge (SA, TW, BE, FE, QA, DM)
  - [ ] Color-coded by role
  - [ ] Example: If developer is assigned as BE to request #123, shows "BE" badge
- [ ] **Filtering:**
  - [ ] Filter by status (All, In Progress, Completed)
  - [ ] Filter by priority (All, High, Medium, Low)
  - [ ] Search by request number or application name
- [ ] **Sorting:**
  - [ ] Sort by SLA status (at-risk first)
  - [ ] Sort by priority
  - [ ] Sort by assigned date
- [ ] **Empty State:**
  - [ ] Shows helpful message when no assignments
  - [ ] "Check back later" message

### 4.3 DevTI Request Page 🟡 HIGH

- [ ] Navigate to `/developer/requests`
- [ ] Shows same data as assignments page (duplicate page for navigation)
- [ ] Menu item "DevTI Request" navigates here
- [ ] Functionality identical to assignments page

### 4.4 Request Detail (Developer) 🔴 CRITICAL

- [ ] Navigate to `/developer/requests/[id]` or from assignments
- [ ] Shows all request information
- [ ] **"My Role" Badge (NEW):**
  - [ ] Prominently displayed at top of page
  - [ ] Example: "Your Role: Backend Developer"
  - [ ] Color-coded badge
- [ ] **Team Information (ENHANCED):**
  - [ ] Shows DevTI Urusan
  - [ ] Shows Team Leader (with contact info)
  - [ ] Shows Technical Writer (with contact info)
  - [ ] **Developer List with Roles:**
    - [ ] All assigned developers shown
    - [ ] Each with name + role badge
    - [ ] **Current developer highlighted:**
      - [ ] Example: "John Doe (Backend Developer) ← You"
      - [ ] Different background color or border
      - [ ] Arrow or badge indicating "You"
  - [ ] Example display:
    ```
    Team Members:
    - Jane Smith (Frontend Developer)
    - John Doe (Backend Developer) ← You
    - Bob Wilson (Quality Assurance)
    ```
- [ ] **Progress Update Section:**
  - [ ] Progress percentage slider/input (0-100)
  - [ ] Update note textarea
  - [ ] "Update Progress" button
  - [ ] Previous progress entries shown below (history)
- [ ] **Progress History:**
  - [ ] Shows all progress updates
  - [ ] Format: "X% - [Note] by [Developer Name] on [Date]"
  - [ ] Sorted newest first
  - [ ] Shows which developer made each update (useful for multi-dev assignments)
- [ ] **Authorization:**
  - [ ] Developer can only view requests where they are assigned
  - [ ] Cannot view requests they're not assigned to (403/404)

### 4.5 Progress Update Flow 🔴 CRITICAL

- [ ] Open assigned request detail
- [ ] Scroll to "Update Progress" section
- [ ] **Input Progress:**
  - [ ] Enter percentage (0-100)
  - [ ] Enter update note (required, min 10 characters)
  - [ ] Validation on both fields
- [ ] Click "Update Progress" button
- [ ] **On Submit:**
  - [ ] Loading state shown
  - [ ] Server action executed
  - [ ] **Database Changes:**
    - [ ] Entry created in `request_progress` table
    - [ ] Includes: progress_percent, update_note, updated_by, created_at
  - [ ] Status history entry created (if status changes)
  - [ ] **If progress = 100%:**
    - [ ] Request status automatically changes to COMPLETED
    - [ ] Completed_at timestamp set
    - [ ] SLA calculation finalized
    - [ ] Notification sent to requester
    - [ ] Notification sent to admins
    - [ ] **For RFC requests:**
      - [ ] Application `current_version` updated to `requested_version`
      - [ ] Verify this auto-update happens
  - [ ] Success message shown
  - [ ] Page refreshes to show new progress
  - [ ] Progress history updated with new entry
- [ ] **Notifications sent to:**
  - [ ] Requester (progress update notification)
  - [ ] Other team members (optional, if implemented)

### 4.6 Notifications (Developer) 🟡 HIGH

- [ ] **Notification Events (Developer receives):**
  - [ ] Assigned to new request (with role specified: "You have been assigned as Backend Developer")
  - [ ] Request completed by another team member
  - [ ] Request status changed by admin
- [ ] Notification bell works (same as User/Admin)
- [ ] Navigate to `/developer/notifications`
- [ ] Can mark notifications as read

---

## SECTION 5: Reporting

### 5.1 Laptri Report 🔴 CRITICAL

- [ ] Navigate to `/admin/reports/laptri`
- [ ] **Filters:**
  - [ ] Year dropdown (default: current year)
  - [ ] Quarter dropdown (All, Q1, Q2, Q3, Q4)
  - [ ] Request Type dropdown (All, NEW_APPLICATION, RFC)
  - [ ] Unit dropdown (All, specific units)
- [ ] **Report Data:**
  - [ ] Total completed requests (in selected period)
  - [ ] Breakdown by request type (count and percentage)
  - [ ] Average completion time by type (in business days)
  - [ ] Average completion time by priority (in business days)
  - [ ] Monthly trend chart (requests completed per month)
  - [ ] **NEW: Developer Role Metrics:**
    - [ ] Table showing: Role | Count | Avg Completion Time
    - [ ] Example: "Backend Developer | 25 requests | 8.5 days"
    - [ ] Sorted by count (most involved roles first)
- [ ] **Charts:**
  - [ ] Bar chart: Requests by month
  - [ ] Pie chart: Requests by type
  - [ ] Pie chart: Requests by priority
  - [ ] Bar chart: Developer roles distribution (NEW)
- [ ] **Excel Export:**
  - [ ] "Export to Excel" button
  - [ ] Generates .xlsx file
  - [ ] **Sheets included:**
    - [ ] Summary (key metrics)
    - [ ] Monthly Trend (table data)
    - [ ] Details (all completed requests)
    - [ ] Developer Roles (NEW - role metrics)
  - [ ] File downloads successfully
  - [ ] Data matches on-screen report

### 5.2 SLA Achievement Report 🔴 CRITICAL

- [ ] Navigate to `/admin/reports/sla`
- [ ] **Filters:**
  - [ ] Year dropdown (default: current year)
  - [ ] Request Type dropdown (All, NEW_APPLICATION, RFC)
  - [ ] Priority dropdown (All, High, Medium, Low)
  - [ ] SLA Status dropdown (All, Met, Exceeded)
- [ ] **Report Data:**
  - [ ] Total requests (in selected period)
  - [ ] SLA Met count and percentage
  - [ ] SLA Exceeded count and percentage
  - [ ] Average actual completion time (in business days) (NEW)
  - [ ] Average target SLA (in business days) (NEW)
  - [ ] **Calculation uses Business Days (CRITICAL):**
    - [ ] Excludes weekends (Saturday, Sunday)
    - [ ] Excludes holidays from `sla_holidays` table
    - [ ] Verify by checking specific request:
      - [ ] Submitted: Monday (2024-01-15)
      - [ ] Completed: Friday (2024-01-26)
      - [ ] Calendar days: 11
      - [ ] Business days: 9 (excludes 2 weekends = 4 days, includes 1 holiday = -1 day = 9)
  - [ ] Monthly trend chart (SLA achievement rate per month)
  - [ ] Breakdown by priority (table: Priority | Total | Met | Exceeded | Rate)
  - [ ] Breakdown by request type (table: Type | Total | Met | Exceeded | Rate)
- [ ] **Charts:**
  - [ ] Line chart: SLA achievement rate over time
  - [ ] Bar chart: Met vs Exceeded by priority
  - [ ] Bar chart: Met vs Exceeded by type
- [ ] **Excel Export:**
  - [ ] "Export to Excel" button
  - [ ] Generates .xlsx file
  - [ ] **Sheets included:**
    - [ ] Summary (key metrics)
    - [ ] Monthly Trend (achievement rate per month)
    - [ ] By Priority (breakdown table)
    - [ ] By Type (breakdown table)
    - [ ] Details (all requests with SLA times in business days)
  - [ ] File downloads successfully
  - [ ] Data matches on-screen report
  - [ ] **Verify business days shown correctly in Details sheet**

### 5.3 Report Performance 🟡 HIGH

- [ ] Reports load within 5 seconds (for dataset < 500 requests)
- [ ] No browser freeze during chart rendering
- [ ] Excel export completes within 10 seconds

---

## SECTION 6: Data Integrity & Business Rules

### 6.1 Version Validation (RFC) 🔴 CRITICAL

Critical business rule after restructure.

**Test Scenario 1: Valid Version Progression**

- [ ] Create NEW_APPLICATION "App A" (v1.0.0)
- [ ] Admin approves → application master created
- [ ] User submits RFC for "App A" with version "1.0.1"
- [ ] ✅ Validation passes (1.0.1 > 1.0.0)
- [ ] Request created successfully

**Test Scenario 2: Invalid Version (Equal)**

- [ ] Existing application "App A" at v1.0.0
- [ ] User submits RFC for "App A" with version "1.0.0"
- [ ] ❌ Validation fails
- [ ] Error message: "Version must be greater than current version (1.0.0)"
- [ ] Cannot submit request

**Test Scenario 3: Invalid Version (Less Than)**

- [ ] Existing application "App A" at v1.0.0
- [ ] User submits RFC for "App A" with version "0.9.9"
- [ ] ❌ Validation fails
- [ ] Error message shown
- [ ] Cannot submit request

**Test Scenario 4: Version Format Validation**

- [ ] User enters invalid format: "1.0" (missing patch)
- [ ] ❌ Validation fails with format error
- [ ] User enters invalid format: "v1.0.0" (has 'v' prefix)
- [ ] ❌ Validation fails
- [ ] User enters invalid format: "1.0.a" (non-numeric)
- [ ] ❌ Validation fails
- [ ] User enters valid format: "1.0.0"
- [ ] ✅ Validation passes (format check)

**Test Scenario 5: Auto-Suggest Versions**

- [ ] Current version: 1.2.3
- [ ] Click "Patch" suggestion → "1.2.4" filled
- [ ] Click "Minor" suggestion → "1.3.0" filled
- [ ] Click "Major" suggestion → "2.0.0" filled
- [ ] All suggestions pass validation

**Test Scenario 6: Server-Side Validation**

- [ ] Attempt to bypass client validation (browser dev tools)
- [ ] Submit RFC with version <= current
- [ ] Server rejects with 400 error
- [ ] Error message returned to client
- [ ] Request not created in database

### 6.2 Application Master Auto-Creation 🔴 CRITICAL

**Test Scenario 1: NEW_APPLICATION Approval**

- [ ] User submits NEW_APPLICATION "System XYZ"
- [ ] Admin approves request
- [ ] **Verify database:**
  - [ ] Query `request_applications` table
  - [ ] New entry exists: application_name = "System XYZ", current_version = "1.0.0"
  - [ ] `requests.application_id` updated with new application ID
- [ ] **Verify UI:**
  - [ ] Navigate to `/admin/settings/applications`
  - [ ] "System XYZ" appears in list with v1.0.0
  - [ ] Created date = approval date
  - [ ] Created by = requester
- [ ] **Verify RFC dropdown:**
  - [ ] Navigate to `/requests/new`
  - [ ] Select RFC
  - [ ] Application dropdown includes "System XYZ (v1.0.0)"

**Test Scenario 2: RFC Updates Current Version**

- [ ] Existing application "App B" at v1.0.0
- [ ] User submits RFC for "App B" to v1.1.0
- [ ] Admin approves and assigns team
- [ ] Developer updates progress to 100%
- [ ] Request status changes to COMPLETED
- [ ] **Verify database:**
  - [ ] Query `request_applications` where application_name = "App B"
  - [ ] `current_version` updated to "1.1.0"
- [ ] **Verify UI:**
  - [ ] Navigate to `/admin/settings/applications`
  - [ ] "App B" shows current version: v1.1.0
- [ ] **Verify next RFC:**
  - [ ] User creates new RFC for "App B"
  - [ ] Current version shown: 1.1.0
  - [ ] Must enter version > 1.1.0

### 6.3 Team Assignment Rules 🔴 CRITICAL

**Test Scenario 1: Technical Writer Required**

- [ ] Admin opens assignment dialog
- [ ] Leaves Technical Writer dropdown empty
- [ ] Selects developers
- [ ] Clicks "Assign Team"
- [ ] ❌ Validation error: "Technical Writer is required"
- [ ] Cannot submit
- [ ] Select a TW user
- [ ] ✅ Validation passes

**Test Scenario 2: At Least One Developer Required**

- [ ] Admin opens assignment dialog
- [ ] Sets TW and Team Leader
- [ ] Does NOT select any developers
- [ ] Clicks "Assign Team"
- [ ] ❌ Validation error: "At least one developer must be selected"
- [ ] Select 1+ developers
- [ ] ✅ Validation passes

**Test Scenario 3: Individual Assignments Created**

- [ ] Admin assigns:
  - [ ] Team Leader: User A
  - [ ] Technical Writer: User B (TW role)
  - [ ] Developers: User C (BE), User D (FE), User E (QA)
- [ ] Submits assignment
- [ ] **Verify database:**
  - [ ] Query `request_team_assignments` for this request
  - [ ] Should have 3 rows (one per developer):
    - [ ] Row 1: assigned_user_id = User C, developer_role_id = BE
    - [ ] Row 2: assigned_user_id = User D, developer_role_id = FE
    - [ ] Row 3: assigned_user_id = User E, developer_role_id = QA
  - [ ] Each row has: assigned_by, assigned_at, request_id
- [ ] **Verify `requests` table:**
  - [ ] team_leader_id = User A
  - [ ] technical_writer_id = User B
  - [ ] devti_urusan = (entered value)

**Test Scenario 4: Developer Sees Own Role**

- [ ] Login as User C (assigned as BE)
- [ ] Navigate to `/developer/assignments`
- [ ] Find the assigned request in table
- [ ] **Verify "My Role" column shows "BE" badge**
- [ ] Click to view request detail
- [ ] **Verify "Your Role: Backend Developer" badge at top**
- [ ] **Verify team member list highlights:**
  - [ ] "User C (Backend Developer) ← You" highlighted

### 6.4 Developer Role Constraints 🔴 CRITICAL

**Test Scenario 1: Developer Must Have Role**

- [ ] Admin creates new user
- [ ] Select Role: Developer
- [ ] **Developer Role dropdown appears (required)**
- [ ] Attempts to save without selecting developer role
- [ ] ❌ Validation error: "Developer role is required"
- [ ] Select a developer role (e.g., BE)
- [ ] ✅ Save succeeds
- [ ] **Verify database:**
  - [ ] User has role_id = DEVELOPER
  - [ ] User has developer_role_id = BE (not NULL)

**Test Scenario 2: Non-Developer Can Have NULL Role**

- [ ] Admin creates new user
- [ ] Select Role: User or Admin
- [ ] Developer Role dropdown not shown (or hidden/optional)
- [ ] Save succeeds
- [ ] **Verify database:**
  - [ ] User has role_id = USER or ADMIN
  - [ ] User has developer_role_id = NULL (correct)

**Test Scenario 3: Technical Writer Must Have TW Role**

- [ ] Admin attempts to assign team
- [ ] TW dropdown only shows users with developer_role_id = TW
- [ ] Cannot select users with other roles (BE, FE, etc.)
- [ ] If no TW users exist, shows "No technical writers available"
- [ ] Admin must create TW user first

### 6.5 SLA Business Days Calculation 🔴 CRITICAL

**Test Scenario 1: Weekend Exclusion**

- [ ] Create request: Submitted Friday 5 PM (2024-10-11)
- [ ] Complete request: Monday 9 AM (2024-10-14)
- [ ] Calendar days: 3 days
- [ ] **Business days should be: 1 day**
  - [ ] Friday 5 PM → end of day = part of Friday
  - [ ] Saturday, Sunday excluded
  - [ ] Monday 9 AM = part of Monday
  - [ ] Total: 1 business day (Friday → Monday)
- [ ] **Verify SLA report shows 1 business day, not 3**

**Test Scenario 2: Holiday Exclusion**

Prerequisite: Add a holiday to `sla_holidays` table for testing (e.g., 2024-10-15)

- [ ] Create request: Submitted Monday (2024-10-14)
- [ ] Complete request: Wednesday (2024-10-16)
- [ ] Calendar days: 2 days
- [ ] Holiday on Tuesday (2024-10-15)
- [ ] **Business days should be: 1 day**
  - [ ] Monday = 1 day
  - [ ] Tuesday = holiday (excluded)
  - [ ] Wednesday = part of Wednesday
  - [ ] Total: 1 business day
- [ ] **Verify SLA report shows 1 business day**

**Test Scenario 3: Mixed Week**

- [ ] Create request: Submitted Monday (2024-10-07)
- [ ] Complete request: Next Monday (2024-10-14)
- [ ] Calendar days: 7 days
- [ ] **Business days should be: 5 days**
  - [ ] Mon-Fri (first week) = 5 days
  - [ ] Sat-Sun = excluded
  - [ ] Monday (next week) = 0 (completed at start of day)
  - [ ] Total: 5 business days
- [ ] **Verify SLA report shows 5 business days**

**Test Scenario 4: SLA Policy in Business Days**

- [ ] Navigate to `/admin/settings/sla-policies`
- [ ] Verify all policies show "Target (Business Days)" not hours
- [ ] Create new policy: NEW_APPLICATION + High Priority = 7 business days
- [ ] Verify saves correctly
- [ ] **Verify assigned request:**
  - [ ] Request with this policy shows: "SLA Target: 7 business days"
  - [ ] SLA calculation uses business days, not calendar days

---

## SECTION 7: UI/UX Validation

### 7.1 Responsive Design 🟡 HIGH

- [ ] **Desktop (>= 1024px):**
  - [ ] Sidebar visible
  - [ ] Top nav with breadcrumbs
  - [ ] Tables show all columns
  - [ ] Forms use two-column layout where appropriate
- [ ] **Tablet (768px - 1023px):**
  - [ ] Sidebar hidden, hamburger menu shown
  - [ ] Mobile nav drawer works
  - [ ] Tables scroll horizontally if needed
  - [ ] Forms stack to single column
- [ ] **Mobile (< 768px):**
  - [ ] All pages accessible
  - [ ] Touch targets >= 44px
  - [ ] Text readable without zoom
  - [ ] Forms stack vertically
  - [ ] Dialogs fit screen

### 7.2 Color Consistency 🟢 MEDIUM

- [ ] Primary color: Red (#ed2e34) used consistently
- [ ] Status badges have correct colors:
  - [ ] SUBMITTED: Blue
  - [ ] APPROVED: Green
  - [ ] REJECTED: Red
  - [ ] IN_PROGRESS: Yellow
  - [ ] COMPLETED: Purple/Gray
- [ ] Developer role badges color-coded:
  - [ ] SA: Purple
  - [ ] TW: Blue
  - [ ] BE: Green
  - [ ] FE: Yellow
  - [ ] QA: Red
  - [ ] DM: Indigo
- [ ] Priority badges:
  - [ ] High: Red background
  - [ ] Medium: Yellow background
  - [ ] Low: Green background

### 7.3 Loading States 🟡 HIGH

- [ ] All async actions show loading indicator:
  - [ ] Form submissions
  - [ ] Data fetches (tables, reports)
  - [ ] File uploads
  - [ ] Dialog submissions
- [ ] Loading states use skeleton screens or spinners
- [ ] Buttons show loading text (e.g., "Saving..." instead of "Save")

### 7.4 Error States 🟡 HIGH

- [ ] **Form Validation Errors:**
  - [ ] Inline error messages shown below fields
  - [ ] Red border on invalid fields
  - [ ] Error messages helpful and actionable
- [ ] **Server Errors:**
  - [ ] Toast notification shown with error message
  - [ ] Console logs error details (for debugging)
  - [ ] User sees friendly message
- [ ] **404 Pages:**
  - [ ] Custom 404 page shown for invalid routes
  - [ ] "Go to Dashboard" button works
- [ ] **500 Errors:**
  - [ ] Custom error page shown
  - [ ] "Try Again" button works

### 7.5 Empty States 🟢 MEDIUM

- [ ] **No Requests:**
  - [ ] User request list shows: "You haven't created any requests yet"
  - [ ] "Create Request" button shown
- [ ] **No Assignments:**
  - [ ] Developer assignments shows: "You don't have any assignments yet"
  - [ ] Friendly message shown
- [ ] **No Notifications:**
  - [ ] Notifications page shows: "No notifications"
  - [ ] Icon shown
- [ ] **No Results:**
  - [ ] Filter returns no results: "No requests found matching your filters"
  - [ ] "Clear Filters" button shown

### 7.6 Accessibility 🟡 HIGH

- [ ] **Keyboard Navigation:**
  - [ ] Tab through forms in logical order
  - [ ] Enter key submits forms
  - [ ] Escape key closes dialogs
  - [ ] Focus visible (ring-2 ring-ring)
- [ ] **Screen Reader:**
  - [ ] All images have alt text
  - [ ] Icon-only buttons have aria-label
  - [ ] Form fields have associated labels
  - [ ] Status messages use aria-live
- [ ] **Color Contrast:**
  - [ ] Text contrast >= 4.5:1 (WCAG AA)
  - [ ] Button contrast >= 4.5:1
  - [ ] Use color + text/icon (not color alone)

---

## SECTION 8: Performance & Scalability

### 8.1 Page Load Performance 🟡 HIGH

- [ ] **Dashboard pages load < 3 seconds:**
  - [ ] User dashboard
  - [ ] Admin dashboard
  - [ ] Developer dashboard
- [ ] **Request list pages load < 3 seconds:**
  - [ ] User request list
  - [ ] Admin request list
  - [ ] Developer assignments
- [ ] **Reports load < 5 seconds:**
  - [ ] Laptri report
  - [ ] SLA report
- [ ] **No browser freeze** during data loading

### 8.2 Large Dataset Handling 🟢 MEDIUM

- [ ] **500+ Requests:**
  - [ ] Pagination works correctly
  - [ ] No performance degradation
  - [ ] Filters apply within reasonable time (< 2 seconds)
- [ ] **Excel Export:**
  - [ ] Completes within 30 seconds for 500 requests
  - [ ] File size reasonable (< 5 MB)
  - [ ] All data included

### 8.3 Database Query Performance 🟢 MEDIUM

- [ ] **Indexes exist on:**
  - [ ] requests.status
  - [ ] requests.requester_id
  - [ ] requests.application_id
  - [ ] request_team_assignments.request_id
  - [ ] request_team_assignments.assigned_user_id
  - [ ] users.developer_role_id
  - [ ] request_applications.application_name
- [ ] No N+1 query issues (check server logs)
- [ ] Queries complete < 500ms

---

## SECTION 9: Security

### 9.1 Authentication 🔴 CRITICAL

- [ ] **Session Security:**
  - [ ] Session cookie is httpOnly
  - [ ] Session cookie is secure (HTTPS only, if in production)
  - [ ] Session timeout after inactivity (e.g., 24 hours)
- [ ] **Password Security:**
  - [ ] Passwords hashed with bcrypt
  - [ ] Raw passwords never logged
  - [ ] Password not returned in API responses

### 9.2 Authorization 🔴 CRITICAL

All authorization checks on server-side:

- [ ] **User:**
  - [ ] Can only create own requests
  - [ ] Can only view own requests
  - [ ] Cannot access admin/developer routes
- [ ] **Admin:**
  - [ ] Can view all requests
  - [ ] Can approve/reject requests
  - [ ] Can assign teams
  - [ ] Cannot access developer routes (unless also developer)
- [ ] **Developer:**
  - [ ] Can only view assigned requests
  - [ ] Cannot view unassigned requests
  - [ ] Cannot access admin routes
  - [ ] Can only update progress on assigned requests

### 9.3 Input Validation 🔴 CRITICAL

- [ ] **Server-side validation exists for:**
  - [ ] Request creation (title, description, version, etc.)
  - [ ] Team assignment (TW required, min 1 developer, etc.)
  - [ ] Progress update (percentage 0-100, note required)
  - [ ] Master data CRUD (unique constraints, required fields)
- [ ] **File Upload Validation:**
  - [ ] File size limit enforced (10 MB)
  - [ ] File type whitelist enforced (PDF, DOC, etc.)
  - [ ] MIME type verified (not just extension)
  - [ ] No executable files accepted
- [ ] **SQL Injection Prevention:**
  - [ ] All queries use parameterized statements (Drizzle ORM)
  - [ ] No raw SQL with string concatenation
- [ ] **XSS Prevention:**
  - [ ] User input sanitized (React auto-escapes)
  - [ ] No dangerouslySetInnerHTML with user data
  - [ ] Rich text editor sanitizes HTML

### 9.4 Audit Trail 🟡 HIGH

- [ ] **Audit logs created for:**
  - [ ] Login success/failure
  - [ ] Logout
  - [ ] Request submission
  - [ ] Request approval/rejection
  - [ ] Team assignment
  - [ ] Progress update
  - [ ] Master data changes (priorities, users, roles, etc.)
  - [ ] SLA policy changes
- [ ] **Audit log includes:**
  - [ ] Actor (user ID and name)
  - [ ] Action (descriptive name)
  - [ ] Timestamp
  - [ ] Before/after data (JSON)
  - [ ] IP address
  - [ ] User agent
- [ ] **Sensitive data not logged:**
  - [ ] Passwords (sanitized)
  - [ ] Session tokens

---

## SECTION 10: Migration Verification (Phase 7)

### 10.1 Developer Role Migration 🔴 CRITICAL

- [ ] **All developers have `developer_role_id`:**
  ```sql
  SELECT COUNT(*) FROM users
  WHERE role_id = (SELECT id FROM roles WHERE code = 'DEVELOPER')
  AND developer_role_id IS NULL;
  -- Should return 0
  ```
- [ ] Default assignment (BE) applied correctly
- [ ] No NULL developer_role_id for any developer

### 10.2 Application Master Migration 🔴 CRITICAL

- [ ] **All approved NEW_APPLICATION have `application_id`:**
  ```sql
  SELECT COUNT(*) FROM requests
  WHERE request_type = 'NEW_APPLICATION'
  AND status IN ('APPROVED', 'IN_PROGRESS', 'COMPLETED')
  AND application_id IS NULL;
  -- Should return 0
  ```
- [ ] Application names extracted correctly
- [ ] Duplicate names handled (e.g., "App (1)", "App (2)")
- [ ] Current version set to "1.0.0" for all

### 10.3 Individual Assignment Migration 🔴 CRITICAL

- [ ] **Old team assignments converted:**
  ```sql
  -- Count old assignments
  SELECT COUNT(*) FROM request_assignments;
  
  -- Count new assignments (should be >= old count, as 1 team = multiple individuals)
  SELECT COUNT(*) FROM request_team_assignments;
  ```
- [ ] All assignments have `developer_role_id`
- [ ] Metadata preserved (assigned_by, assigned_at, notes)
- [ ] No orphaned assignments

### 10.4 Old Tables Cleanup 🟢 MEDIUM

- [ ] **Old tables no longer used by application:**
  - [ ] `teams` - not referenced
  - [ ] `team_members` - not referenced
  - [ ] `request_assignments` - not referenced
- [ ] Tables can be dropped (after verification period):
  ```sql
  DROP TABLE IF EXISTS request_assignments;
  DROP TABLE IF EXISTS team_members;
  DROP TABLE IF EXISTS teams;
  ```
- [ ] **Do NOT drop immediately** - wait 1-2 weeks after production deployment

---

## SECTION 11: Cross-Browser Testing

### 11.1 Chrome/Edge (Chromium) 🟡 HIGH

- [ ] All pages render correctly
- [ ] Forms submit correctly
- [ ] Dialogs display correctly
- [ ] Charts render (Recharts)
- [ ] File upload works
- [ ] Excel export downloads

### 11.2 Firefox 🟡 HIGH

- [ ] All pages render correctly
- [ ] Forms submit correctly
- [ ] Dialogs display correctly
- [ ] Charts render
- [ ] File upload works
- [ ] Excel export downloads

### 11.3 Safari (if available) 🟢 MEDIUM

- [ ] All pages render correctly
- [ ] Forms submit correctly
- [ ] Date pickers work
- [ ] File upload works

### 11.4 Mobile Browsers 🟡 HIGH

- [ ] Chrome Android: Core workflows work
- [ ] Safari iOS: Core workflows work (if available)
- [ ] Touch interactions work (tap, swipe, pinch-zoom)

---

## SECTION 12: Edge Cases & Stress Testing

### 12.1 Concurrent Actions 🟢 MEDIUM

- [ ] **Two admins approve same request simultaneously:**
  - [ ] Only one succeeds
  - [ ] Other gets error message
  - [ ] No data corruption
- [ ] **Two developers update progress simultaneously:**
  - [ ] Both updates recorded
  - [ ] No data loss
  - [ ] Status history correct

### 12.2 Large File Upload 🟢 MEDIUM

- [ ] Upload file close to 10 MB limit (e.g., 9.8 MB)
- [ ] Success
- [ ] Upload file over 10 MB limit (e.g., 10.5 MB)
- [ ] Rejected with error message

### 12.3 Very Long Inputs 🟢 MEDIUM

- [ ] Request title: 500 characters (over limit)
  - [ ] Validation error shown
  - [ ] Database constraint prevents save
- [ ] Request description: 10,000 characters
  - [ ] Saves correctly (if within limit)
  - [ ] Displays correctly on detail page

### 12.4 Special Characters 🟢 MEDIUM

- [ ] Application name with special chars: "App's & Co. (2024)"
  - [ ] Saves correctly
  - [ ] Displays correctly
  - [ ] No SQL injection
  - [ ] No XSS
- [ ] Version with invalid chars: "1.0.0-beta"
  - [ ] Validation rejects (if strict semantic versioning enforced)

### 12.5 Rapid Repeated Actions 🟢 MEDIUM

- [ ] Click submit button 10 times rapidly
  - [ ] Only one request created (duplicate prevention)
  - [ ] No 500 errors
- [ ] Refresh page during form submission
  - [ ] No duplicate data created
  - [ ] User can retry

---

## SECTION 13: Production Readiness

### 13.1 Build & Deployment 🔴 CRITICAL

- [ ] **TypeScript Compilation:**
  ```bash
  npx tsc --noEmit
  # Should exit 0, no errors
  ```
- [ ] **Production Build:**
  ```bash
  npm run build
  # Should complete successfully, no errors
  ```
- [ ] **Database Migrations:**
  - [ ] All migrations applied in order
  - [ ] No migration errors
  - [ ] Schema matches Drizzle definitions
- [ ] **Environment Variables:**
  - [ ] .env.example up-to-date
  - [ ] All required vars documented
  - [ ] No secrets in .env.example

### 13.2 Logging & Monitoring 🟡 HIGH

- [ ] **Application Logs:**
  - [ ] Errors logged to console/file
  - [ ] Log level configurable
  - [ ] No sensitive data in logs (passwords, tokens)
- [ ] **Database Logs:**
  - [ ] Slow queries logged (if enabled)
  - [ ] Connection errors logged
- [ ] **Audit Logs:**
  - [ ] All critical actions logged
  - [ ] Logs include timestamp, actor, action
  - [ ] Logs queryable from admin panel

### 13.3 Backup & Recovery 🔴 CRITICAL

- [ ] **Database Backup:**
  - [ ] Backup procedure documented
  - [ ] Test restore from backup
  - [ ] Backup includes all tables
- [ ] **File Backup:**
  - [ ] Uploads directory backed up
  - [ ] Restore procedure documented
- [ ] **Rollback Plan:**
  - [ ] Phase 7 rollback script tested
  - [ ] Can revert to pre-migration state

### 13.4 Documentation 🔴 CRITICAL

- [ ] **README.md updated** with restructure changes
- [ ] **SETUP.md updated** with new schema
- [ ] **DEPLOYMENT.md updated** with migration steps
- [ ] **USER_GUIDE.md updated** with new request flow
- [ ] **ADMIN_GUIDE.md updated** with new assignment flow
- [ ] **DEVELOPER_GUIDE.md updated** with role information
- [ ] **MIGRATION_GUIDE.md exists** (Phase 7)
- [ ] **.ai/ documentation updated** (DATABASE.md, BUSINESS_RULES.md, etc.)

---

## SECTION 14: Request Status Workflow (7-Status Restructure, Phase 5)

Reference: `.ai/STATUS_WORKFLOW.md` (state machine + transition table).
Automation: `npx jest` → 202 tests covering the transition matrix and admin
workflows (see `__tests__/actions/`). The manual scenarios below verify the
runtime/UI behavior around them.

### 14.1 User Role — Submission & Visibility `• CRITICAL`

- [ ] Submit NEW_APPLICATION request → status badge "Diajukan" (SUBMITTED), gray
- [ ] Submit RFC request (existing application, version > current) → status "Diajukan"
- [ ] Request detail shows status prominently; no status-change controls for user
- [ ] Request detail "Riwayat Status" tab lists every transition with timestamp + actor
- [ ] Request list filters include all 7 Indonesian status labels; counts update per filter
- [ ] Receive notification when admin verifies request ("sedang ditinjau")
- [ ] Receive notification with reason when request is rejected
- [ ] Receive notification when request is completed
- [ ] Resubmit rejected request (REJECTED → SUBMITTED) allowed via own-request flow

### 14.2 Admin Role — Verification, Approve, Reject `• CRITICAL`

- [ ] Admin dashboard shows request stats and SLA At-Risk widget (pause-aware)
- [ ] "Verifikasi" on SUBMITTED → IN_REVIEW ("Sedang Ditinjau", blue), button disappears
- [ ] After verify: requester gets IN_REVIEW notification; status history gets entry
- [ ] "Tolak" requires reason → REJECTED ("Ditolak", red); reason visible on detail
- [ ] Rejection notification to requester includes reason
- [ ] REJECTED request shows no further action buttons (except resubmission path)
- [ ] Approve on IN_REVIEW → "Disetujui" (green); NEW_APPLICATION auto-creates
      application master in Settings → Applications (name = title, version 1.0.0)

### 14.3 Admin Role — Team Assignment (APPROVED → ONGOING) `• CRITICAL`

- [ ] Assignment dialog loads units, users, developers grouped by role
- [ ] Approve without assign leaves APPROVED status with "Assign Tim" button
- [ ] DevTI Urusan is a units dropdown (required)
- [ ] Technical Writer dropdown only lists users with TW role
- [ ] Submitting without TW or without ≥1 developer → error, no status change
- [ ] Submitting TW with non-TW role via other means → server error "bukan Technical Writer"
- [ ] After assignment: ONGOING ("Sedang Berlangsung", amber), team visible on detail
- [ ] Each assigned developer + TL + TW + requester receive assignment notifications
- [ ] Previously assigned team (re-assignment) gets unassigned_at set and is replaced

### 14.4 Admin & Developer Role — Hold / Resume `• CRITICAL`

- [ ] "Tahan" requires reason (error if < 10 chars) → ON_HOLD ("Ditangguhkan", orange)
- [ ] ON_HOLD: slaPausedAt recorded (DB), status history logs reason
- [ ] Hold/resume notification sent to requester + team members + admins
- [ ] Domain validation: submit with < 10 chars reason shows error "Alasan penahanan minimal 10 karakter"
- [ ] "Lanjutkan" on ON_HOLD → ONGOING; slaPausedDurationHours accumulates; history logs cycle
- [ ] Multiple hold/resume cycles all appear in status history with reasons
- [ ] Assigned developer / TL / TW can hold + resume; unassigned developer gets "Forbidden"

### 14.5 Admin & Developer Role — Completion (ONGOING → DONE) `• CRITICAL`

- [ ] "Selesaikan" on ONGOING → DONE ("Selesai", emerald); no further admin buttons
- [ ] completion persists actualDurationHours (business hours − pauses) and slaMet
- [ ] If pauses existed, actualDurationHours excludes accumulated pause hours
- [ ] Completion notification sent to requester + team members + admins
- [ ] DONE request cannot change status again (server blocks; UI shows no actions)

### 14.6 Transition & Edge-Case Guards `• CRITICAL`

- [ ] SUBMITTED request cannot be approved/done directly (server action rejected, Indonesian error)
- [ ] IN_REVIEW cannot jump to ONGOING/DONE; ON_HOLD cannot be rejected/done directly
- [ ] ONGOING cannot revert to SUBMITTED/IN_REVIEW/APPROVED
- [ ] REJECTED → anything except resubmission is blocked ("status final" message)
- [ ] DONE → any status blocked ("status final" message)
- [ ] Two tabs on same request: second status write surfaces validation error from latest server state (last write wins, history intact)
- [ ] `npx jest` → all suites pass (202 tests) — transition matrix + admin workflows + SLA

---

## Test Execution Log

Use this section to track testing progress:

```
Date: ___________
Tester: ___________
Environment: [ ] Development [ ] Staging [ ] Production

Section 1: Authentication & Authorization
[ ] 1.1 Login Flow - Result: ___________
[ ] 1.2 Logout Flow - Result: ___________
[ ] 1.3 Authorization - Result: ___________

Section 2: User Role - Request Submission
[ ] 2.1 Single-Page Request Form - Result: ___________
    [ ] NEW_APPLICATION Flow - Result: ___________
    [ ] RFC Flow - Result: ___________
    [ ] Version Validation - Result: ___________
[ ] 2.2 File Upload - Result: ___________
[ ] 2.3 Request List (User) - Result: ___________
[ ] 2.4 Request Detail (User) - Result: ___________
[ ] 2.5 Dashboard (User) - Result: ___________
[ ] 2.6 Notifications (User) - Result: ___________

Section 3: Admin Role - Request Management
[ ] 3.1 Admin Dashboard - Result: ___________
[ ] 3.2 Request List (Admin) - Result: ___________
[ ] 3.3 Request Detail (Admin) - Result: ___________
[ ] 3.4 Request Approval Flow - Result: ___________
[ ] 3.5 Request Rejection Flow - Result: ___________
[ ] 3.6 Team Assignment Flow - Result: ___________
[ ] 3.7 Priority Management - Result: ___________
[ ] 3.8 Settings - Developer Roles - Result: ___________
[ ] 3.9 Settings - Applications Master - Result: ___________
[ ] 3.10 Settings - SLA Holidays - Result: ___________
[ ] 3.11 Settings - Other Master Data - Result: ___________
[ ] 3.12 Audit Logs - Result: ___________

Section 4: Developer Role - Assignment & Progress
[ ] 4.1 Developer Dashboard - Result: ___________
[ ] 4.2 Assignments Page - Result: ___________
[ ] 4.3 DevTI Request Page - Result: ___________
[ ] 4.4 Request Detail (Developer) - Result: ___________
[ ] 4.5 Progress Update Flow - Result: ___________
[ ] 4.6 Notifications (Developer) - Result: ___________

Section 5: Reporting
[ ] 5.1 Laptri Report - Result: ___________
[ ] 5.2 SLA Achievement Report - Result: ___________
[ ] 5.3 Report Performance - Result: ___________

Section 6: Data Integrity & Business Rules
[ ] 6.1 Version Validation (RFC) - Result: ___________
[ ] 6.2 Application Master Auto-Creation - Result: ___________
[ ] 6.3 Team Assignment Rules - Result: ___________
[ ] 6.4 Developer Role Constraints - Result: ___________
[ ] 6.5 SLA Business Days Calculation - Result: ___________

Section 7: UI/UX Validation
[ ] 7.1 Responsive Design - Result: ___________
[ ] 7.2 Color Consistency - Result: ___________
[ ] 7.3 Loading States - Result: ___________
[ ] 7.4 Error States - Result: ___________
[ ] 7.5 Empty States - Result: ___________
[ ] 7.6 Accessibility - Result: ___________

Section 8: Performance & Scalability
[ ] 8.1 Page Load Performance - Result: ___________
[ ] 8.2 Large Dataset Handling - Result: ___________
[ ] 8.3 Database Query Performance - Result: ___________

Section 9: Security
[ ] 9.1 Authentication - Result: ___________
[ ] 9.2 Authorization - Result: ___________
[ ] 9.3 Input Validation - Result: ___________
[ ] 9.4 Audit Trail - Result: ___________

Section 10: Migration Verification
[ ] 10.1 Developer Role Migration - Result: ___________
[ ] 10.2 Application Master Migration - Result: ___________
[ ] 10.3 Individual Assignment Migration - Result: ___________
[ ] 10.4 Old Tables Cleanup - Result: ___________

Section 11: Cross-Browser Testing
[ ] 11.1 Chrome/Edge - Result: ___________
[ ] 11.2 Firefox - Result: ___________
[ ] 11.3 Safari - Result: ___________
[ ] 11.4 Mobile Browsers - Result: ___________

Section 12: Edge Cases & Stress Testing
[ ] 12.1 Concurrent Actions - Result: ___________
[ ] 12.2 Large File Upload - Result: ___________
[ ] 12.3 Very Long Inputs - Result: ___________
[ ] 12.4 Special Characters - Result: ___________
[ ] 12.5 Rapid Repeated Actions - Result: ___________

Section 13: Production Readiness
[ ] 13.1 Build & Deployment - Result: ___________
[ ] 13.2 Logging & Monitoring - Result: ___________
[ ] 13.3 Backup & Recovery - Result: ___________
[ ] 13.4 Documentation - Result: ___________

OVERALL TEST RESULT: [ ] PASS [ ] FAIL
Notes: ___________________________________________
_________________________________________________
_________________________________________________
```

---

## Bug Report Template

Use this template to report bugs found during testing:

```markdown
### Bug #___

**Priority:** [ ] Critical [ ] High [ ] Medium [ ] Low

**Section:** (e.g., 3.6 Team Assignment Flow)

**Description:**
(Clear description of the bug)

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
(What should happen)

**Actual Result:**
(What actually happened)

**Screenshots/Logs:**
(Attach if available)

**Environment:**
- Browser: 
- OS: 
- Database: 

**Assigned To:** 
**Status:** [ ] Open [ ] In Progress [ ] Fixed [ ] Verified
```

---

## Summary

This comprehensive testing checklist covers:

- ✅ **13 major sections**
- ✅ **200+ test cases**
- ✅ **Critical business rules** from restructure (version validation, team assignment, business days SLA)
- ✅ **All roles** (User, Admin, Developer)
- ✅ **All new features** from Phase 1-7
- ✅ **Security, performance, accessibility**
- ✅ **Migration verification**

**Estimated Testing Time:**
- **Quick Smoke Test:** 2-3 hours (critical paths only)
- **Comprehensive Test:** 2-3 days (all checkboxes)
- **Full Regression:** 1 week (including edge cases, cross-browser, stress tests)

**Next Steps After Testing:**
1. Execute tests following priority: 🔴 CRITICAL → 🟡 HIGH → 🟢 MEDIUM
2. Document all bugs using Bug Report Template
3. Fix critical bugs before production deployment
4. Update documentation based on testing findings
5. Re-test fixes before final deployment

---

**Document Prepared By:** Kiro AI  
**For:** SIPPA v1.0 Post-Restructure Testing  
**Contact:** development@sippa.go.id (replace with actual contact)
