# SIPPA Flow Diagrams - Before & After

**Document Purpose:** Visual representation of flow changes  
**Created:** 2026-10-06  
**For:** Non-technical stakeholders and visual learners

---

## 1. User Request Flow

### BEFORE (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST FLOW (OLD)                  │
└─────────────────────────────────────────────────────────────┘

User Login
    │
    ├──> Step 1: Jenis Permintaan
    │    └──> Select: New Application / RFC
    │         (No distinction in form fields)
    │
    ├──> Step 2: Informasi Permintaan
    │    └──> Fill: Title, Description
    │
    ├──> Step 3: Detail Kebutuhan
    │    └──> Fill: Requirements
    │
    ├──> Step 4: Lampiran
    │    └──> Upload files
    │
    ├──> Step 5: Review & Kirim
    │    └──> Submit
    │
    ├──> Request Created (status: SUBMITTED)
    │
    └──> Email notification to Admin
```

**Issues:**
- ❌ No version tracking
- ❌ No application master
- ❌ RFC dan NEW_APPLICATION sama saja (no differentiation)
- ❌ Multi-step form (tedious)

---

### AFTER (New)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST FLOW (NEW)                  │
└─────────────────────────────────────────────────────────────┘

User Login
    │
    └──> Single Page Form
         │
         ├──> Radio Button: NEW_APPLICATION or RFC
         │
         ├──> IF NEW_APPLICATION:
         │    │
         │    ├──> Title Input: "SIPPA HR"
         │    ├──> Version: "1.0.0" (auto, hidden)
         │    ├──> Description: "..."
         │    ├──> Urgency: High/Medium/Low
         │    └──> Upload files
         │
         ├──> IF RFC:
         │    │
         │    ├──> Application Selector (dropdown)
         │    │    └──> "SIPPA HR (v1.0.0)"
         │    │
         │    ├──> Version Input: "1.0.1"
         │    │    │
         │    │    └──> Real-time Validation
         │    │         ├──> If 1.0.1 > 1.0.0 ✅ OK
         │    │         └──> If 1.0.0 or less ❌ Error
         │    │
         │    ├──> Description: "Changes needed..."
         │    ├──> Urgency: High/Medium/Low
         │    └──> Upload files
         │
         └──> Review Section (expandable)
              └──> Submit
                   │
                   ├──> Request Created (status: SUBMITTED)
                   │
                   └──> Notifications sent to ALL admins
```

**Improvements:**
- ✅ Single page (faster)
- ✅ Conditional fields based on type
- ✅ Version validation for RFC
- ✅ Application master tracking
- ✅ Real-time feedback

---

## 2. Admin Assignment Flow

### BEFORE (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN ASSIGNMENT FLOW (OLD)                │
└─────────────────────────────────────────────────────────────┘

Request Submitted
    │
    ├──> Admin views request list
    │
    ├──> Admin clicks request
    │    └──> View details
    │
    ├──> Admin clicks "Approve"
    │    │
    │    ├──> Set Priority (High/Medium/Low)
    │    └──> Select Team (dropdown)
    │         └──> "Team DevTI A"
    │              (Team has 5 members, all assigned)
    │
    ├──> Request status: APPROVED → ASSIGNED
    │
    └──> Notification to Team Lead only
```

**Issues:**
- ❌ No individual assignment (whole team assigned)
- ❌ No role specification (BE, FE, QA?)
- ❌ No technical writer tracking
- ❌ No team leader designation
- ❌ Limited SLA visibility
- ❌ Can't balance workload across developers

---

### AFTER (New)

```
┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN ASSIGNMENT FLOW (NEW)                    │
└─────────────────────────────────────────────────────────────────┘

Request Submitted
    │
    ├──> Admin views request list
    │    └──> Can view workload by developer (new!)
    │
    ├──> Admin clicks request
    │    └──> View details + Application info
    │
    ├──> Admin clicks "Process Request"
    │    │
    │    ├──> Set Priority (High/Medium/Low)
    │    │    └──> SLA Target auto-calculated
    │    │         Example: "High + NEW_APP = 10 business days"
    │    │
    │    ├──> Approve or Reject
    │    │    └──> If Reject: Enter reason
    │    │         → End flow
    │    │
    │    └──> If Approve: Assignment Form
    │         │
    │         ├──> DevTI Urusan: [text input]
    │         │    Example: "Pengembangan Aplikasi Internal"
    │         │
    │         ├──> Team Leader: [dropdown - ALL users]
    │         │    └──> Select: Pak Eko Prasetyo
    │         │
    │         ├──> Technical Writer: [dropdown - TW only]
    │         │    └──> Select: Dewi Lestari (TW)
    │         │
    │         ├──> Assign Developers: [multi-select with roles]
    │         │    │
    │         │    └──> Developer List (with workload indicator):
    │         │         ☑ Ahmad Nur (BE) - 3 active assignments
    │         │         ☑ Siti Aminah (FE) - 2 active
    │         │         ☑ Budi Santoso (QA) - 4 active
    │         │         ☐ Dewi (SA) - 1 active
    │         │         ☐ Eko (DM) - 5 active ⚠️ high workload
    │         │
    │         ├──> SLA Display:
    │         │    └──> "Target: 10 business days"
    │         │         "Start: 2024-01-10"
    │         │         "Target completion: 2024-01-24"
    │         │
    │         └──> Notes: [optional]
    │
    ├──> Submit Assignment
    │    │
    │    ├──> Create 3 entries in request_team_assignments:
    │    │    - Ahmad (BE)
    │    │    - Siti (FE)
    │    │    - Budi (QA)
    │    │
    │    ├──> Update request fields:
    │    │    - devti_urusan
    │    │    - team_leader_id
    │    │    - technical_writer_id
    │    │    - status: IN_PROGRESS
    │    │
    │    └──> Send Notifications to:
    │         ├──> Ahmad (You are assigned as BE)
    │         ├──> Siti (You are assigned as FE)
    │         ├──> Budi (You are assigned as QA)
    │         ├──> Dewi Lestari (You are the TW)
    │         ├──> Pak Eko (You are the Team Leader)
    │         └──> Requester (Your request is being worked on)
    │
    └──> All parties notified
```

**Improvements:**
- ✅ Individual assignment with specific roles
- ✅ See developer workload before assigning
- ✅ Technical Writer dedicated field
- ✅ Team Leader designated
- ✅ DevTI Urusan tracking
- ✅ SLA auto-calculated and visible
- ✅ All stakeholders notified

---

## 3. Developer Dashboard Flow

### BEFORE (Current)

```
┌─────────────────────────────────────────────────────────────┐
│                DEVELOPER DASHBOARD (OLD)                    │
└─────────────────────────────────────────────────────────────┘

Developer Login
    │
    ├──> Dashboard
    │    │
    │    ├──> "Welcome, Ahmad"
    │    │    └──> Role: Developer (generic)
    │    │
    │    └──> My Assignments (all team requests)
    │         └──> Request #001 - SIPPA HR
    │              Status: In Progress
    │              Team: DevTI Team A
    │              [No role indicator]
    │
    └──> Click Request
         │
         └──> Request Detail
              ├──> Description
              ├──> Attachments
              ├──> Progress History
              └──> Update Progress button
                   (No team visibility)
```

**Issues:**
- ❌ No role badge
- ❌ Can't see team members
- ❌ No collaboration context
- ❌ Generic "Developer" label

---

### AFTER (New)

```
┌─────────────────────────────────────────────────────────────┐
│                DEVELOPER DASHBOARD (NEW)                    │
└─────────────────────────────────────────────────────────────┘

Developer Login
    │
    ├──> Dashboard
    │    │
    │    ├──> "Welcome, Ahmad"
    │    │    └──> Role Badge: "Backend Developer 🔹"
    │    │         (Color-coded, visible)
    │    │
    │    ├──> Quick Stats:
    │    │    ├──> Active Assignments: 3
    │    │    ├──> SLA At Risk: 1 ⚠️
    │    │    └──> Completed This Month: 8
    │    │
    │    └──> My Assignments (only where I'm assigned)
    │         │
    │         ├──> Request #001 - SIPPA HR
    │         │    My Role: Backend Developer 🔹
    │         │    Team: 5 members
    │         │    Status: In Progress
    │         │    SLA: 3 days remaining
    │         │
    │         ├──> Request #002 - SIPPA Finance
    │         │    My Role: Backend Developer 🔹
    │         │    Team: 3 members
    │         │    Status: Testing
    │         │    SLA: ⚠️ Overdue 1 day
    │         │
    │         └──> Filter by:
    │              - My Role
    │              - Status
    │              - Priority
    │
    └──> Click Request #001
         │
         └──> Request Detail
              │
              ├──> Application Info:
              │    └──> SIPPA HR (v1.0.0 → v1.1.0)
              │
              ├──> Team Members Card:
              │    │
              │    ├──> 👤 Ahmad Nur (You)
              │    │    Backend Developer 🔹
              │    │    ahmad@example.com
              │    │
              │    ├──> 👤 Siti Aminah
              │    │    Frontend Developer
              │    │    siti@example.com
              │    │
              │    ├──> 👤 Budi Santoso
              │    │    Quality Assurance
              │    │    budi@example.com
              │    │
              │    ├──> 📝 Technical Writer:
              │    │    Dewi Lestari
              │    │    dewi@example.com
              │    │
              │    └──> 👔 Team Leader:
              │         Pak Eko Prasetyo
              │         eko@example.com
              │
              ├──> Description & Requirements
              │
              ├──> Attachments
              │
              ├──> Progress History (all team updates)
              │    ├──> Siti: "UI mockup completed" (FE)
              │    ├──> Ahmad: "API endpoints done" (BE)
              │    └──> Budi: "Test cases ready" (QA)
              │
              └──> Update Progress button
```

**Improvements:**
- ✅ Role badge visible everywhere
- ✅ Only see my assignments (not whole team)
- ✅ Team composition visible
- ✅ Know who to collaborate with
- ✅ See everyone's progress
- ✅ Contact info accessible

---

## 4. Application Master Flow

### BEFORE (Current)

```
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION MASTER FLOW (OLD)                  │
└─────────────────────────────────────────────────────────────┘

❌ NO APPLICATION MASTER CONCEPT

- Each request is standalone
- No version tracking
- No application history
- RFC cannot reference previous requests
- No central application registry
```

---

### AFTER (New)

```
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION MASTER FLOW (NEW)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ NEW_APPLICATION Request Submitted       │
│ Title: "SIPPA HR"                       │
│ Description: "HR Management System"     │
└─────────────────────────────────────────┘
            │
            ├──> Admin Approves
            │    └──> Status: APPROVED
            │
            ├──> AUTO: Create Application Master
            │    │
            │    └──> request_applications table:
            │         - id: 1
            │         - application_name: "SIPPA HR"
            │         - current_version: "1.0.0"
            │         - created_by: User ID
            │         - created_at: 2024-01-10
            │
            ├──> Update Request:
            │    └──> requests.application_id = 1
            │
            └──> Assignment → Development → Completed
                 │
                 └──> Application Master remains:
                      "SIPPA HR" v1.0.0 (ACTIVE)

────────────────────────────────────────────────────────────────

Now RFC can be created:

┌─────────────────────────────────────────┐
│ RFC Request Submitted                   │
│ Application: "SIPPA HR" (select from    │
│              dropdown)                  │
│ Current Version: 1.0.0 (shown)         │
│ Requested Version: 1.1.0 (user input) │
└─────────────────────────────────────────┘
            │
            ├──> Validation:
            │    └──> Is 1.1.0 > 1.0.0? ✅ Yes
            │         (If No → Error message)
            │
            ├──> Request Created
            │    - request_type: RFC
            │    - application_id: 1 (linked)
            │    - requested_version: "1.1.0"
            │
            ├──> Admin Assigns & Developers Work
            │
            └──> Request Completed
                 │
                 └──> AUTO: Update Application Master
                      └──> request_applications:
                           - current_version: "1.1.0" (updated)
                           - updated_at: 2024-03-15

────────────────────────────────────────────────────────────────

Application History View (Admin):

┌─────────────────────────────────────────────────────────────┐
│  Application: SIPPA HR                                      │
│  Current Version: 1.1.0                                     │
│  Created: 2024-01-10                                        │
│  Last Updated: 2024-03-15                                   │
├─────────────────────────────────────────────────────────────┤
│  Version History:                                           │
│                                                             │
│  v1.1.0 ◄── CURRENT                                        │
│  └─ Request #RQ-2024-015 (RFC)                            │
│     └─ Completed: 2024-03-15                               │
│     └─ Changes: "Added employee attendance module"         │
│                                                             │
│  v1.0.0                                                     │
│  └─ Request #RQ-2024-001 (NEW_APPLICATION)                │
│     └─ Completed: 2024-02-01                               │
│     └─ Initial release                                      │
└─────────────────────────────────────────────────────────────┘

Next RFC for SIPPA HR:
- Must request version > 1.1.0
- Examples: 1.1.1, 1.2.0, 2.0.0
```

**Benefits:**
- ✅ Central application registry
- ✅ Version history tracked automatically
- ✅ RFC validation based on actual current version
- ✅ Easy to see all changes for an application
- ✅ Consistent naming (no duplicate app names)

---

## 5. SLA Calculation Flow

### BEFORE (Current)

```
┌─────────────────────────────────────────────────────────────┐
│              SLA CALCULATION FLOW (OLD)                     │
└─────────────────────────────────────────────────────────────┘

Request Submitted: 2024-01-10 10:00 AM
    │
    ├──> SLA Policy: High Priority = 240 hours (10 days calendar)
    │
    ├──> SLA Start: 2024-01-10 10:00 AM
    │
    ├──> SLA Target: 2024-01-20 10:00 AM
    │    (10 days * 24 hours = 240 hours)
    │
    └──> Calculation:
         - Includes ALL days (Mon-Sun)
         - Includes holidays
         - 24/7 counting
         
Example Timeline:
Jan 10 (Wed) ────> Jan 20 (Sat)
  [Start]            [Target]
  
  Includes:
  ✓ 10 full calendar days
  ✓ Weekend (Jan 13-14, Jan 20)
  ✓ Holiday (Jan 15 - National Holiday)
  
  Total: 240 hours = 10 calendar days
```

**Issues:**
- ❌ Unfair: counts weekends
- ❌ Unfair: counts holidays
- ❌ Not realistic for work planning

---

### AFTER (New)

```
┌─────────────────────────────────────────────────────────────┐
│              SLA CALCULATION FLOW (NEW)                     │
└─────────────────────────────────────────────────────────────┘

Request Submitted: 2024-01-10 (Wed) 10:00 AM
    │
    ├──> SLA Policy: High Priority = 10 business days
    │
    ├──> SLA Start: 2024-01-10
    │
    ├──> System Fetches Holidays from sla_holidays table:
    │    - 2024-01-15 (National Holiday)
    │    - 2024-01-17 (Regional Holiday)
    │
    └──> SLA Calculation:
         │
         └──> Count only BUSINESS DAYS:
              - Mon-Fri only
              - Exclude weekends (Sat-Sun)
              - Exclude holidays from database
              
Example Timeline:

Jan 10 (Wed) ──────────────────────> Jan 26 (Fri)
  [Start]                               [Target]
  
Day-by-Day Breakdown:
─────────────────────────────────────────────────
Wed Jan 10 ✓ Day 1 (business day)
Thu Jan 11 ✓ Day 2 (business day)
Fri Jan 12 ✓ Day 3 (business day)
Sat Jan 13 ✗ (weekend - excluded)
Sun Jan 14 ✗ (weekend - excluded)
Mon Jan 15 ✗ (holiday - excluded)
Tue Jan 16 ✓ Day 4 (business day)
Wed Jan 17 ✗ (holiday - excluded)
Thu Jan 18 ✓ Day 5 (business day)
Fri Jan 19 ✓ Day 6 (business day)
Sat Jan 20 ✗ (weekend - excluded)
Sun Jan 21 ✗ (weekend - excluded)
Mon Jan 22 ✓ Day 7 (business day)
Tue Jan 23 ✓ Day 8 (business day)
Wed Jan 24 ✓ Day 9 (business day)
Thu Jan 25 ✓ Day 10 (business day) ← Target Met!
Fri Jan 26 - (buffer)

Total: 10 business days
Calendar days elapsed: 16 days
```

**Database Structure:**

```sql
-- sla_holidays table
CREATE TABLE sla_holidays (
  id INT PRIMARY KEY,
  holiday_date DATE UNIQUE,
  description VARCHAR(255),
  is_active BOOLEAN
);

-- Example data
INSERT INTO sla_holidays VALUES
(1, '2024-01-15', 'National Holiday', TRUE),
(2, '2024-01-17', 'Regional Holiday', TRUE),
(3, '2024-08-17', 'Independence Day', TRUE);
```

**Calculation Function (Pseudocode):**

```typescript
function calculateBusinessDays(start: Date, end: Date): number {
  let count = 0;
  let current = new Date(start);
  const holidays = await getHolidays(); // from database
  
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const isHoliday = holidays.includes(formatDate(current));
    
    if (!isWeekend && !isHoliday) {
      count++;
    }
    
    current = addDays(current, 1);
  }
  
  return count;
}
```

**Benefits:**
- ✅ Fair calculation (only working days)
- ✅ Realistic for planning
- ✅ Admin can manage holidays
- ✅ Accurate SLA reporting

---

## 6. Complete End-to-End Flow

### Scenario: NEW_APPLICATION → RFC Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│         COMPLETE LIFECYCLE: NEW_APPLICATION → RFC                │
└──────────────────────────────────────────────────────────────────┘

STEP 1: User Creates NEW_APPLICATION
═══════════════════════════════════════════════════════════════════
User: "I need a new HR application"
    │
    ├──> Form Input:
    │    - Type: NEW_APPLICATION
    │    - Title: "SIPPA HR"
    │    - Description: "Employee management system"
    │    - Urgency: High
    │    - Files: requirements.pdf
    │
    ├──> Submit
    │    └──> Request #RQ-2024-001 created
    │         Status: SUBMITTED
    │
    └──> Notifications:
         └──> All admins: "New request pending verification"

────────────────────────────────────────────────────────────────────

STEP 2: Admin Processes Request
═══════════════════════════════════════════════════════════════════
Admin: Reviews request
    │
    ├──> Verify requirements complete
    │
    ├──> Assignment Form:
    │    - Priority: HIGH
    │    - DevTI Urusan: "Aplikasi Internal"
    │    - Team Leader: Pak Eko
    │    - Technical Writer: Dewi (TW)
    │    - Developers:
    │      ☑ Ahmad (BE)
    │      ☑ Siti (FE)
    │      ☑ Budi (QA)
    │    - SLA: 10 business days
    │
    ├──> Approve & Assign
    │    │
    │    ├──> AUTO: Create Application Master
    │    │    └──> request_applications:
    │    │         application_name: "SIPPA HR"
    │    │         current_version: "1.0.0"
    │    │
    │    └──> Update Request:
    │         application_id: [new ID]
    │         status: IN_PROGRESS
    │
    └──> Notifications sent to:
         - Ahmad, Siti, Budi (developers)
         - Dewi (TW)
         - Pak Eko (Team Leader)
         - Original User (requester)

────────────────────────────────────────────────────────────────────

STEP 3: Development Work
═══════════════════════════════════════════════════════════════════
Developers collaborate:
    │
    ├──> Ahmad (BE): "Database schema done" - 20% progress
    ├──> Siti (FE): "UI mockups ready" - 30% progress
    ├──> Ahmad (BE): "API endpoints complete" - 50% progress
    ├──> Siti (FE): "Frontend integrated" - 70% progress
    ├──> Budi (QA): "Testing in progress" - 80% progress
    ├──> Budi (QA): "All tests passed" - 95% progress
    └──> Dewi (TW): "Documentation complete" - 100% progress
         │
         └──> Mark as COMPLETED
              - Status: COMPLETED
              - Completed date: 2024-02-01
              - SLA: MET (8 business days, target was 10)

────────────────────────────────────────────────────────────────────

[Time passes... User uses SIPPA HR v1.0.0]

────────────────────────────────────────────────────────────────────

STEP 4: User Needs Changes (RFC)
═══════════════════════════════════════════════════════════════════
User: "I need to add attendance module to SIPPA HR"
    │
    ├──> Form Input:
    │    - Type: RFC
    │    - Application: [Select] "SIPPA HR" (v1.0.0)
    │    - Requested Version: "1.1.0"
    │      │
    │      └──> Validation:
    │           Is 1.1.0 > 1.0.0? ✅ Valid
    │
    │    - Description: "Add employee attendance tracking"
    │    - Urgency: Medium
    │
    ├──> Submit
    │    └──> Request #RQ-2024-015 created
    │         Status: SUBMITTED
    │
    └──> Notifications:
         └──> All admins: "RFC request for SIPPA HR pending"

────────────────────────────────────────────────────────────────────

STEP 5: Admin Assigns RFC
═══════════════════════════════════════════════════════════════════
Admin: Reviews RFC
    │
    ├──> Assignment Form:
    │    - Priority: MEDIUM
    │    - Team Leader: Pak Eko (same)
    │    - Technical Writer: Dewi (same)
    │    - Developers:
    │      ☑ Ahmad (BE) - familiar with app
    │      ☑ Siti (FE) - familiar with app
    │      ☐ Budi (QA) - not available, assign different QA
    │      ☑ Rina (QA) - available
    │    - SLA: 10 business days (Medium + RFC)
    │
    └──> Approve & Assign
         │
         └──> Request status: IN_PROGRESS

────────────────────────────────────────────────────────────────────

STEP 6: RFC Development
═══════════════════════════════════════════════════════════════════
Developers work on changes:
    │
    ├──> Ahmad (BE): "Attendance table added"
    ├──> Siti (FE): "Attendance UI implemented"
    ├──> Rina (QA): "Tested attendance module"
    └──> Dewi (TW): "Updated documentation"
         │
         └──> Mark as COMPLETED
              - Status: COMPLETED
              - Completed date: 2024-03-15
              - SLA: MET (9 business days)
              │
              └──> AUTO: Update Application Master
                   └──> request_applications:
                        current_version: "1.1.0" (updated!)
                        updated_at: 2024-03-15

────────────────────────────────────────────────────────────────────

RESULT: Application Master Updated
═══════════════════════════════════════════════════════════════════

request_applications table:
┌────────────────────────────────────────────────────────────┐
│ id: 1                                                      │
│ application_name: "SIPPA HR"                               │
│ current_version: "1.1.0" ◄── UPDATED                     │
│ created_by: User #5                                        │
│ created_at: 2024-01-10                                     │
│ updated_at: 2024-03-15 ◄── UPDATED                       │
└────────────────────────────────────────────────────────────┘

requests table:
┌────────────────────────────────────────────────────────────┐
│ Request #RQ-2024-001 (NEW_APPLICATION)                    │
│ - application_id: 1                                        │
│ - title: "SIPPA HR"                                        │
│ - status: COMPLETED                                        │
│ - completed_at: 2024-02-01                                 │
├────────────────────────────────────────────────────────────┤
│ Request #RQ-2024-015 (RFC)                                │
│ - application_id: 1 (linked!)                             │
│ - requested_version: "1.1.0"                               │
│ - status: COMPLETED                                        │
│ - completed_at: 2024-03-15                                 │
└────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────

NEXT RFC:
User can create another RFC for SIPPA HR
- Current version shown: 1.1.0
- Must request version > 1.1.0
- Examples: 1.1.1, 1.2.0, 2.0.0
```

**Complete Flow Benefits:**
- ✅ Full traceability from initial request to all changes
- ✅ Version history automatically maintained
- ✅ Application master always reflects current state
- ✅ RFC validation ensures version progression
- ✅ Team composition tracked per request
- ✅ SLA calculated fairly with business days

---

## Summary: Key Flow Improvements

### For Users
1. **Simpler Form:** Single page instead of 5 steps
2. **Version Validation:** Prevents invalid RFC submissions
3. **Clear Feedback:** Real-time validation and helpful errors
4. **Application Tracking:** See version history of your applications

### For Admins
1. **Better Assignment:** Individual developers with specific roles
2. **Workload Visibility:** See who's busy before assigning
3. **SLA Automation:** Auto-calculated based on priority and type
4. **Team Structure:** Technical Writer and Team Leader designated
5. **Application Master:** Central registry of all applications

### For Developers
1. **Role Clarity:** Know your specific role in each request
2. **Team Visibility:** See who you're working with
3. **Focused View:** Only see your assignments (not whole team's work)
4. **Collaboration:** Contact info and team composition visible

### For Everyone
1. **Fair SLA:** Business days only (exclude weekends and holidays)
2. **Better Tracking:** Version history and application lineage
3. **Clear Notifications:** All stakeholders informed automatically
4. **Audit Trail:** Complete history of all changes

---

**End of Flow Diagrams**

**Document Version:** 1.0  
**Last Updated:** 2026-10-06  
**Status:** Final

For implementation details, see:
- RESTRUCTURE_PLAN.md
- DATABASE_NEW_SCHEMA.md
- IMPLEMENTATION_PHASES.md
