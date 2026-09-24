# SiPPA Admin Guide

Comprehensive guide for administrators managing requests, viewing reports, and configuring the system.

---

## 📋 Table of Contents

- [Admin Responsibilities](#admin-responsibilities)
- [Dashboard Overview](#dashboard-overview)
- [Managing Requests](#managing-requests)
- [Reports](#reports)
- [Settings & Configuration](#settings--configuration)
- [Audit Logs](#audit-logs)
- [Best Practices](#best-practices)
- [FAQ](#faq)

---

## 👔 Admin Responsibilities

As an admin, you are responsible for:

✅ **Request Management**
- Review incoming requests
- Verify completeness and feasibility
- Approve or reject with reasons
- Set priorities based on business impact
- Assign to appropriate developers/teams

✅ **Workflow Oversight**
- Monitor request queues
- Ensure timely processing
- Track SLA compliance
- Handle escalations

✅ **Reporting**
- Generate quarterly Laptri reports
- Monitor SLA achievement
- Export data for stakeholders

✅ **System Configuration**
- Manage priorities, teams, units
- Configure SLA policies
- Manage user accounts
- Review audit logs

---

## 📊 Dashboard Overview

Your admin dashboard displays:

### Incoming Queue
New submitted requests awaiting initial review.  
**Action needed:** Review and move to verification or approval.

### Verification Queue
Requests under detailed review.  
**Action needed:** Approve or reject.

### Approved but Unassigned
Approved requests without developer assignment.  
**Action needed:** Set priority and assign.

### In Progress
Currently active requests being developed.  
**Monitor:** Track progress and SLA status.

### SLA Attention
Requests approaching or exceeding SLA deadlines.  
**Action needed:** Review and prioritize.

### Quick Stats
- Total requests (all time)
- Completed this month
- Average completion time
- SLA achievement rate

---

## 📋 Managing Requests

### Viewing All Requests

**Navigation:** Sidebar → DevTI Request

View complete request list with filters:
- Search by title, request number, or requester name
- Filter by status, type, priority
- Filter by date range
- Sort by columns

### Request Workflow

#### 1. Review Submitted Request

**Steps:**
1. Click on request from Incoming Queue
2. Review request details:
   - Title and description
   - Request type (New Application or RFC)
   - Requester information and unit
   - Urgency level set by requester
   - Attachments

3. Download and review attachments if needed

4. Verify:
   - ✅ Requirements are clear
   - ✅ Feasibility assessment
   - ✅ No duplicate requests
   - ✅ Within DevTI scope
   - ✅ Sufficient information to proceed

#### 2. Approve or Reject

**To Approve:**
1. Click **Approve** button
2. Request moves to "Approved but Unassigned" queue
3. Requester receives approval notification
4. Proceed to step 3

**To Reject:**
1. Click **Reject** button
2. Enter rejection reason (required):
   - Be specific and constructive
   - Explain why and what's needed
   - Examples:
     - "Duplicate of REQ-2026-005"
     - "Insufficient information. Please provide detailed use cases and expected outcomes"
     - "Out of scope. This requires infrastructure team, not DevTI"
3. Click **Confirm Reject**
4. Requester receives rejection notification with reason
5. Request status changes to REJECTED

💡 **Tip:** Provide actionable feedback in rejections so users can resubmit improved requests.

#### 3. Set Priority

For approved requests:

**Priority Levels:**
- **Low** - Can be scheduled flexibly
- **Medium** - Standard business request
- **High** - Important business need, near-term deadline
- **Critical** - Urgent, blocking operations

**Factors to Consider:**
- Business impact
- Number of users affected
- Deadline constraints
- Dependencies on other projects
- Resource availability

**Steps:**
1. Click **Set Priority** or **Edit** on request detail
2. Select appropriate priority level
3. Priority determines SLA target (configured in SLA Policies)

#### 4. Assign to Developer/Team

**Steps:**
1. Click **Assign** button
2. Select assignment type:
   - **Team** - Assign to team (team lead will delegate)
   - **Developer** - Assign directly to specific developer

3. Choose from dropdown:
   - Active teams or developers only
   - See current workload if available

4. Click **Assign**
5. Developer receives assignment notification
6. Request status changes to ASSIGNED

**Assignment Best Practices:**
- Balance workload across developers
- Match skills to request type
- Consider current assignments
- Team assignment for large/complex requests
- Direct assignment for specific expertise needs

### Monitoring Progress

**View progress updates:**
1. Open request detail
2. Scroll to Progress section
3. See percentage complete and developer notes
4. Timeline shows all progress history

**If progress is stalled:**
- Contact developer for status
- Reassign if necessary
- Update requester with realistic timeline

### Request Detail View

Full request information:

**Header Section**
- Request number and type badge
- Status and priority badges
- SLA indicator (green = on track, red = overdue)

**Request Information**
- Title and description
- Requester name and unit
- Submission date
- Target SLA hours

**Actions** (context-dependent)
- Approve / Reject (if pending)
- Set Priority (if approved)
- Assign (if approved)
- Edit (specific fields only)
- Download attachments

**Timeline**
Complete audit trail:
- Submission
- Status changes
- Assignments
- Progress updates
- Completion

**Progress History**
All developer updates with timestamps.

**Attachments**
Download requester's uploaded files.

---

## 📈 Reports

### Laptri (Quarterly Report)

**Purpose:** Quarterly summary of completed requests for stakeholder reporting.

**Navigation:** Sidebar → Laptri

**Filters:**
- **Year** - Select year (defaults to current)
- **Quarter** - Q1, Q2, Q3, Q4, or All
- **Request Type** - New Application, RFC, or All

**Report Sections:**

1. **Summary Cards**
   - Total completed requests
   - New Applications count
   - RFC count
   - Average completion time (days)

2. **Charts**
   - Completion trend by month
   - Request type distribution (pie chart)
   - Average completion time by type

3. **Details Table**
   - All completed requests in period
   - Columns: Request No, Type, Title, Priority, Submitted, Completed, Duration
   - Sortable and searchable

**Export to Excel:**
1. Configure filters as needed
2. Click **Export to Excel** button
3. Downloaded file contains 3 sheets:
   - **Summary** - Aggregate metrics
   - **Monthly Trend** - Breakdown by month
   - **Details** - Full request list with all data

**Use Cases:**
- Quarterly management reports
- Workload analysis
- Capacity planning
- Performance tracking

### Pencapaian SLA (SLA Achievement Report)

**Purpose:** Analyze SLA compliance and identify performance issues.

**Navigation:** Sidebar → Pencapaian SLA

**Filters:**
- **Year** - Select year (defaults to current)
- **Request Type** - New Application, RFC, or All
- **Priority** - Low, Medium, High, Critical, or All
- **SLA Status** - Met, Exceeded, or All

**Report Sections:**

1. **Summary Cards**
   - Total requests
   - SLA Met count (green badge)
   - SLA Exceeded count (red badge)
   - Achievement rate percentage

2. **Average Times**
   - Avg target SLA
   - Avg actual completion time
   - Difference (+ or -)

3. **Charts**
   - SLA achievement trend by month
   - Met vs Exceeded comparison

4. **Details Table**
   - All requests with SLA data
   - Columns: Request No, Type, Title, Priority, Target SLA, Actual Time, SLA Status, Variance
   - Color-coded: Green = Met, Red = Exceeded

**Export to Excel:**
1. Configure filters as needed
2. Click **Export to Excel** button
3. Downloaded file contains 3 sheets:
   - **Summary** - SLA metrics and achievement rate
   - **Monthly Trend** - Month-by-month SLA performance
   - **Details** - Full request list with SLA calculations

**Use Cases:**
- SLA compliance monitoring
- Identify bottlenecks
- Resource allocation decisions
- Process improvement opportunities

**Understanding SLA Calculations:**
- **Target SLA**: Hours set by SLA Policy (based on type + priority)
- **Actual Time**: Hours from submitted_at to completed_at (calendar days × 24)
- **Variance**: Actual - Target (negative = beat SLA, positive = exceeded)
- **SLA Status**: Met if Actual ≤ Target, else Exceeded

💡 **Tip:** Filter by "SLA Exceeded" to identify problematic requests requiring process review.

---

## ⚙️ Settings & Configuration

**Navigation:** Sidebar → Settings

### Priorities

Manage priority levels for requests.

**Default Priorities:**
- Low
- Medium
- High
- Critical

**Actions:**
- **Add New Priority** - Create custom priority level
- **Edit** - Change name or sort order
- **Deactivate** - Hide from selection (keeps historical data)

**Fields:**
- Code: Unique identifier (uppercase, no spaces)
- Name: Display name
- Sort Order: Display sequence (lower = shown first)
- Active: Yes/No

⚠️ **Warning:** Cannot delete priorities with existing requests. Deactivate instead.

### Teams

Manage developer teams.

**Default Teams:**
- Backend Team
- Frontend Team

**Actions:**
- **Add New Team** - Create team
- **Edit** - Update team name
- **Manage Members** - Add/remove developers
- **Deactivate** - Hide from assignment (keeps historical data)

**Team Members:**
- Click **Manage Members** on team row
- See current members
- Add developers from available list
- Remove members (click ❌)

💡 **Tip:** Team structure helps organize workload and improve assignment efficiency.

### Units

Manage organizational units (departments).

**Default Units:**
- IT
- Finance
- HR
- Operations
- Marketing

**Actions:**
- **Add New Unit** - Create unit
- **Edit** - Update unit details
- **Deactivate** - Hide from selection (keeps historical data)

**Fields:**
- Code: Unique identifier (uppercase)
- Name: Full unit name
- Active: Yes/No

**Use Cases:**
- Reporting by department
- Workload distribution analysis
- Access control (future)

### SLA Policies

Configure target SLA hours by request type and priority.

**Default Policies (examples):**

| Request Type | Priority | Target Hours |
|--------------|----------|--------------|
| New Application | Low | 720 (30 days) |
| New Application | Medium | 480 (20 days) |
| New Application | High | 240 (10 days) |
| New Application | Critical | 120 (5 days) |
| RFC | Low | 360 (15 days) |
| RFC | Medium | 240 (10 days) |
| RFC | High | 120 (5 days) |
| RFC | Critical | 72 (3 days) |

**Actions:**
- **Add New Policy** - Define new SLA rule
- **Edit** - Adjust target hours
- **Deactivate** - Stop using (keeps historical)

**Fields:**
- Request Type: New Application or RFC
- Priority: Select from active priorities
- Target Hours: SLA deadline in hours
- Active: Yes/No

**How SLA Applies:**
When admin sets priority on approved request:
1. System looks up SLA policy matching type + priority
2. Assigns target_sla_hours to request
3. Used in SLA calculations and reports

⚠️ **Important:** Changes affect only new requests. Existing requests keep their original SLA.

💡 **Tip:** Review and adjust SLA targets quarterly based on actual completion data.

### Users

Manage user accounts and roles.

**Navigation:** Settings → Users

**User List:**
- See all users with name, email, role, unit
- Filter by role or active status
- Search by name or email

**Actions:**

**Add New User:**
1. Click **Add User** button
2. Fill form:
   - Name (required)
   - Email (required, unique)
   - Password (required, min 6 chars)
   - Role (User, Admin, or Developer)
   - Unit (organizational unit)
   - Active (Yes/No)
3. Click **Create User**
4. User can now login with credentials

**Edit User:**
1. Click **Edit** on user row
2. Update fields (cannot change email)
3. Leave password blank to keep current
4. Click **Save Changes**

**Deactivate User:**
1. Click **Edit** on user row
2. Set Active to "No"
3. User cannot login but historical data preserved

⚠️ **Security Best Practices:**
- Use strong temporary passwords
- Require users to change password on first login (manual process)
- Deactivate accounts for terminated employees immediately
- Regularly audit admin and developer role assignments

---

## 🔍 Audit Logs

**Purpose:** Security and compliance tracking of all system actions.

**Navigation:** Settings → Audit Logs

**What's Logged:**
- User authentication (login success/failure)
- Request lifecycle (create, approve, reject, assign, complete)
- Master data changes (priorities, teams, units, SLA policies)
- User management (create, update, deactivate)
- Progress updates

**Log Columns:**
- **Timestamp** - When action occurred
- **Actor** - Who performed action (or "System")
- **Module** - Feature area (auth, requests, users, etc.)
- **Action** - What happened (create, update, delete, login, approve, etc.)
- **Entity** - Type and ID (e.g., "request 15")
- **Details** - Brief description

**Filters:**
- **Date Range** - From/To dates
- **Module** - Filter by feature area
- **Action** - Filter by action type
- **Actor** - Filter by user name
- **Entity Type** - Filter by entity (requests, users, etc.)

**View Details:**
Click on log entry to see:
- Full event context
- Before/After JSON diff (for updates)
- IP address and user agent
- Exact timestamp

**Use Cases:**
- Security investigations
- Compliance audits
- Troubleshooting ("who changed this?")
- User activity monitoring

**Export:**
Currently view-only. Export feature planned for v1.1.

⚠️ **Data Retention:** Audit logs kept indefinitely. Consider archiving strategy after 2+ years.

---

## 🎯 Best Practices

### Request Processing

**Timely Reviews**
- Check Incoming Queue daily
- Process requests within 24-48 hours
- Set clear expectations with requesters

**Consistent Standards**
- Use rejection reasons consistently
- Document common rejection scenarios
- Share templates with other admins

**Priority Guidelines**
- Document priority criteria
- Review priority decisions quarterly
- Adjust based on business changes

### Assignment Strategy

**Balance Workload**
- Track active assignments per developer
- Consider complexity, not just count
- Rotate work types for skill development

**Clear Communication**
- Notify developers of new assignments
- Include context and urgency
- Set expectations upfront

### SLA Management

**Monitor Proactively**
- Check SLA Attention queue daily
- Address blockers quickly
- Escalate risks early

**Regular Reviews**
- Review SLA policies quarterly
- Adjust based on actual completion times
- Consider seasonal variations

### Reporting

**Consistent Cadence**
- Generate Laptri at end of each quarter
- Share with stakeholders by Q+2 weeks
- Include insights, not just data

**Data Quality**
- Verify completed dates accurate
- Ensure all requests properly closed
- Clean up orphaned records

### System Hygiene

**User Management**
- Audit user accounts quarterly
- Deactivate unused accounts
- Review role assignments

**Master Data**
- Keep teams and units current
- Archive obsolete priorities
- Document configuration changes

**Security**
- Review audit logs weekly
- Monitor failed login attempts
- Report suspicious activity

---

## ❓ FAQ

### Can I reopen a completed request?

No direct reopen function in v1.0. User should submit new request referencing original.

### How do I reassign a request?

Currently requires manual unassign + reassign. Full reassign feature planned for v1.1.

### What if a developer is overloaded?

Review their assignments, reassign as needed, or adjust SLA expectations with requester.

### Can I bulk approve requests?

Not in v1.0. Each request requires individual review for quality control.

### How do I export audit logs?

Currently view-only. Export to CSV planned for v1.1.

### Can users edit their submitted requests?

No. Users must contact admin for changes or submit new request.

### What happens if SLA is exceeded?

No automatic penalty. Use SLA reports to identify patterns and improve processes.

### Can I have multiple admins?

Yes. All users with admin role have full admin privileges.

### How do I add a new request type?

Request types (New Application, RFC) are hardcoded in v1.0. Custom types planned for v2.0.

### Can I customize SLA calculation?

Current calculation is calendar days (24/7). Business hours option planned for v1.1.

---

## 🆘 Need Help?

- **Technical Issues**: Contact IT Support
- **Process Questions**: Consult DevTI lead
- **Feature Requests**: Email devti@yourdomain.com

---

**Admin effectively! You're the backbone of DevTI operations. 💪**
