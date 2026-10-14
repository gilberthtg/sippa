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

### Incoming Queue (Belum Di-review)
New submitted requests awaiting initial review.  
**Action needed:** Review and move to verification or approval.

### Verification Queue
Requests under detailed review.  
**Action needed:** Approve or reject.

### Approved but Unassigned (Belum Di-assign)
Approved requests without team assignment.  
**Action needed:** Set priority and assign team.  
**Critical metric:** Minimize this queue to avoid delays.

### In Progress
Currently active requests being developed by assigned teams.  
**Monitor:** Track progress and SLA status.

### SLA Attention
Requests approaching or exceeding SLA deadlines.  
**Action needed:** Review and prioritize.

###Developer Role Distribution Widget
Visual breakdown showing how many requests involve each developer role:
- **SA (System Analyst)** - Purple: Requirements and design
- **TW (Technical Writer)** - Blue: Documentation
- **BE (Backend Developer)** - Green: Server-side development
- **FE (Frontend Developer)** - Yellow: User interface
- **QA (Quality Assurance)** - Red: Testing and quality
- **DM (Data Management)** - Indigo: Database work

**Use this to:**
- Identify role bottlenecks
- Balance team assignments
- Plan capacity by specialty

### Quick Stats
- Total requests (all time)
- Completed this month
- Average completion time (business days)
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

#### 4. Assign Team to Request

**Important:** Team assignment is now individual-based with specific roles, not team-based. You'll assign multiple developers with their specialized roles.

**Steps:**
1. Click **Assign Team** button on approved request
2. Team Assignment Dialog opens with the following fields:

**a. DevTI Urusan** (required)
- Text input field
- Specify which DevTI division/section handles this request
- Example: "Pengembangan Aplikasi Internal", "Integrasi Sistem"
- Helps track workload by division

**b. Team Leader** (required)
- Dropdown of all users (any role: User, Admin, or Developer)
- Select the project coordinator/liaison
- Team Leader responsibilities:
  - Coordinates project activities
  - Acts as main contact for requester
  - Monitors progress and timeline
- Can be admin, regular user, or developer

**c. Technical Writer** (required)
- Dropdown filtered to developers with Technical Writer (TW) role only
- Must assign exactly 1 Technical Writer
- TW responsibilities:
  - Creates technical documentation
  - Writes user guides
  - Maintains documentation standards

**d. Assign Developers** (required, minimum 1)
- Multi-select list showing all active developers
- Each developer shows their role badge:
  - **SA** (System Analyst) - Purple badge
  - **BE** (Backend Developer) - Green badge
  - **FE** (Frontend Developer) - Yellow badge
  - **QA** (Quality Assurance) - Red badge
  - **DM** (Data Management) - Indigo badge
  - **TW** (Technical Writer) - Blue badge (listed here but should be selected above)
- Check boxes for developers you want to assign
- Typical assignment: 3-5 developers with complementary roles
- Example team:
  ```
  ☑ Ahmad Nur (Backend Developer)
  ☑ Siti Aminah (Frontend Developer)
  ☑ Budi Santoso (Quality Assurance)
  ☐ Dewi Lestari (Data Management)
  ```

**e. SLA Target** (auto-calculated)
- Automatically displayed based on request type + priority
- Shows: "Target: X hari kerja" (business days)
- Business days = Monday-Friday, excluding holidays
- Read-only, set by SLA policies

3. Review team composition
4. Click **Assign Team**
5. System creates individual assignments for each team member
6. Request status changes to IN_PROGRESS
7. Notifications sent to ALL team members:
   - Team Leader
   - Technical Writer
   - All assigned developers
   - Requester (FYI)

**Assignment Validation:**
- System ensures:
  - Technical Writer has TW role
  - At least 1 developer assigned
  - DevTI Urusan is specified
  - Team Leader is selected
  - All roles are valid and active

**Assignment Best Practices:**
- **Balance workload:** Check Developer Workload view before assigning
- **Match skills:** 
  - BE for server-side work, APIs, database
  - FE for UI, user experience
  - SA for requirements analysis, system design
  - QA for testing, quality assurance
  - DM for database design, data migration
- **Team size:** 
  - Small requests: 2-3 developers (e.g., 1 BE + 1 FE or 1 BE + 1 QA)
  - Medium requests: 3-4 developers (e.g., 1 SA + 1 BE + 1 FE + 1 QA)
  - Large requests: 4-6 developers (full team with all roles)
- **Technical Writer:** Required for all requests (documentation is mandatory)
- **Team Leader:** Choose someone with project coordination skills

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

### Developer Workload View

**Purpose:** Help balance assignments across developers and identify over/under-utilized resources.

**Access:** From dashboard or before assigning teams

**Displays:**
- List of all developers with DEVELOPER role
- Current active assignments per developer
- Developer role specialization (SA, TW, BE, FE, QA, DM)
- SLA status of their assignments

**Table Columns:**
- **Developer Name**
- **Role** - Specialty badge (BE, FE, QA, etc.)
- **Active Assignments** - Count of IN_PROGRESS requests
- **Unit** - Developer's organizational unit
- **SLA Status** - Summary (X met, Y exceeded)

**Filters:**
- By Developer Role (SA, TW, BE, FE, QA, DM, All)
- By Unit
- By Workload (low to high)

**Sort:**
- By Name
- By Active Assignments (identifies overloaded developers)
- By Developer Role

**Use Cases:**
- **Before assignment:** Check who has capacity
- **Resource planning:** Identify hiring needs
- **Load balancing:** Redistribute if someone is overloaded
- **Performance review:** See completion rates

**Best Practices:**
- Aim for 3-5 active assignments per developer
- Consider role specialization when assigning
- Monitor developers with >7 active assignments (risk of burnout)
- Balance complex requests across multiple developers

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

⚠️ **DEPRECATED:** Team-based assignment has been replaced with individual role-based assignment in the restructure.

**Old Approach (No longer used):**
- Developers were organized into predefined teams
- Requests were assigned to entire teams
- Team leads delegated within the team

**New Approach (Current):**
- Developers have specific roles (SA, TW, BE, FE, QA, DM)
- Admin assigns individuals with appropriate roles for each request
- More flexible and better matches skills to needs

**Historical Data:**
- Old team information is preserved for historical requests
- You can still view old team assignments in completed requests
- No new team-based assignments can be created

**See:** Developer Roles section below for current role management.

### Developer Roles

Manage specialized developer roles for role-based assignment.

**Navigation:** Settings → Developer Roles

**Available Roles:**

| Code | Name | Description | Badge Color |
|------|------|-------------|-------------|
| **SA** | System Analyst | Requirements analysis and system design | Purple |
| **TW** | Technical Writer | Technical documentation and user guides | Blue |
| **BE** | Backend Developer | Server-side development, APIs, databases | Green |
| **FE** | Frontend Developer | User interface and client-side development | Yellow |
| **QA** | Quality Assurance | Testing, quality control, bug tracking | Red |
| **DM** | Data Management | Database design, data migration, data tasks | Indigo |

**Actions:**
- **View Roles** - See all configured roles
- **Edit Role** - Update name, description, sort order
- **Deactivate** - Hide from selection (keeps historical data)
- Cannot delete roles with existing assignments

**Role Assignment:**
- Each developer must have exactly 1 developer role
- Assigned when creating/editing developer user accounts
- Displayed throughout the system (badges, workload view, team composition)

**Use Cases:**
- Assignment planning (know who has what skills)
- Workload distribution by specialty
- Reporting by role
- Team composition display

💡 **Tip:** Role specialization improves assignment quality and developer satisfaction.

### Applications

View application master list (read-only).

**Navigation:** Settings → Applications

**Purpose:** Central registry of all applications managed by DevTI.

**How Applications are Created:**
- **Automatically** when admin approves a NEW_APPLICATION request
- Application name comes from request title
- Initial version: 1.0.0
- Cannot be manually created or deleted

**Application List Shows:**
- **Application Name** - Unique application identifier
- **Current Version** - Latest approved version (updated by completed RFCs)
- **Created Date** - When first NEW_APPLICATION was approved
- **Total RFCs** - Count of change requests for this application

**Actions:**
- **View History** - See all requests (NEW_APPLICATION + RFCs) for this application
- **View Details** - Application information and version timeline

**Version Management:**
- NEW_APPLICATION creates application with version 1.0.0
- RFC requests specify new version (must be > current version)
- When RFC completed, current_version updates automatically
- Version history tracked through request records

**Use Cases:**
- See all applications under DevTI management
- Track version progression
- Reference for RFC submissions (users select from this list)
- Portfolio reporting

💡 **Note:** This is a read-only view. Applications are managed through the request workflow, not direct CRUD.

### SLA Holidays

Manage holiday calendar for business days calculation.

**Navigation:** Settings → SLA Holidays

**Purpose:** Define non-working days excluded from SLA calculations.

**Holiday List:**
- All configured holidays (Indonesian national holidays by default)
- Shows date, description, and active status
- Sorted chronologically

**Actions:**

**Add Holiday:**
1. Click **Add Holiday** button
2. Fill form:
   - Date (required, must be future date for practical use)
   - Description (e.g., "Hari Kemerdekaan RI", "Tahun Baru")
   - Active (Yes/No)
3. Click **Save**

**Edit Holiday:**
1. Click **Edit** on holiday row
2. Update date or description
3. Click **Save Changes**

**Delete Holiday:**
1. Click **Delete** on holiday row
2. Confirm deletion
3. ⚠️ Only delete if added by mistake. Historical holidays should remain for accurate reporting.

**Bulk Import (CSV):**
1. Click **Import CSV** button
2. Download template CSV if needed
3. Prepare CSV with columns: date, description
4. Upload CSV file
5. Review preview
6. Click **Import** to add all holidays

**CSV Format Example:**
```
date,description
2026-01-01,Tahun Baru
2026-02-12,Imlek
2026-03-11,Isra Mi'raj
```

**Pre-loaded Holidays:**
System comes with Indonesian national holidays for 2024-2026 (61 holidays total).

**Use Cases:**
- Accurate SLA calculations (business days only)
- Planning around national holidays
- Reporting actual working days
- Set realistic expectations for requesters

**Business Days Impact:**
- Holidays are excluded from SLA countdown
- Example: 5 business days target submitted Friday, includes Monday-Friday next week, excludes weekend + any holidays
- More accurate than calendar days for Indonesian context

💡 **Tip:** Update holidays annually, typically in December for the following year.

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

Configure target SLA in **business days** by request type and priority.

**Important:** SLA is now calculated in **business days** (Monday-Friday only), excluding weekends and holidays defined in SLA Holidays.

**Default Policies (examples):**

| Request Type | Priority | Target Business Days |
|--------------|----------|---------------------|
| New Application | Low | 30 days |
| New Application | Medium | 20 days |
| New Application | High | 10 days |
| RFC | Low | 15 days |
| RFC | Medium | 10 days |
| RFC | High | 5 days |

**Actions:**
- **Add New Policy** - Define new SLA rule
- **Edit** - Adjust target business days
- **Deactivate** - Stop using (keeps historical)

**Business Days Calculation:**
- **Included:** Monday - Friday
- **Excluded:** Saturday, Sunday, and holidays from SLA Holidays table
- **Start:** Request submitted_at date
- **End:** Request completed_at date
- **Example:** Request submitted Monday, target 5 business days = following Monday (if no holidays)

**Fields:**
- Request Type: NEW_APPLICATION or RFC
- Priority: Low, Medium, High (from Priorities master)
- Target Business Days: Number of working days
- Active: Yes/No

⚠️ **Important:** Changing SLA policies affects future requests only. Existing requests keep their original SLA target.

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
- For developers: also shows developer role (SA, TW, BE, FE, QA, DM)
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
   - **Developer Role** (required if role = Developer)
     - Select from: SA, TW, BE, FE, QA, DM
     - Each developer must have exactly one role
     - Cannot create developer without selecting role
   - Unit (organizational unit)
   - Active (Yes/No)
3. Click **Create User**
4. User can now login with credentials

**Edit User:**
1. Click **Edit** on user row
2. Update fields (cannot change email)
3. For developers: can change developer role if needed
4. Leave password blank to keep current
5. Click **Save Changes**

**Deactivate User:**
1. Click **Edit** on user row
2. Set Active to "No"
3. User cannot login but historical data preserved

**Developer Role Assignment:**
- **Required** for all users with role = Developer
- System enforces this at database level
- Used for:
  - Assignment filtering (find BE developers)
  - Workload view (group by role)
  - Team composition display
  - Role-based reporting

⚠️ **Security Best Practices:**
- Use strong temporary passwords
- Require users to change password on first login (manual process)
- Deactivate accounts for terminated employees immediately
- Regularly audit admin and developer role assignments
- Ensure all developers have appropriate developer roles assigned

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
