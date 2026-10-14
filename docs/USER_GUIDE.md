# SiPPA User Guide

Guide for end users (requesters) using SiPPA to submit and track development requests.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Submitting a Request](#submitting-a-request)
- [Tracking Requests](#tracking-requests)
- [Notifications](#notifications)
- [FAQ](#faq)

---

## 🚀 Getting Started

### Accessing SiPPA

1. Open your web browser
2. Navigate to: `https://sippa.yourdomain.com`
3. Login with your credentials provided by IT

### First Time Login

After logging in, you'll see:
- **Dashboard** - Overview of your requests
- **Request Baru** - Submit new requests
- **DevTI Request** - View all your requests
- **Notifications** - Bell icon in top right

---

## 📊 Dashboard Overview

Your dashboard shows:

### Pending Requests
Requests awaiting admin review or approval.

### In Progress Requests  
Requests currently being worked on by developers.

### Recently Completed
Your last 5 completed requests.

### Recent Activity
Latest status updates on your requests.

---

## ✍️ Submitting a Request

### Step 1: Click "Request Baru"

From the sidebar, click **Request Baru** or the "+ Request Baru" button on dashboard.

### Step 2: Choose Request Type

SiPPA now uses a **single-page form** that adapts based on your request type.

Select one of:

**New Application**
- For entirely new applications/systems that don't exist yet
- Examples: New employee portal, new reporting system, new mobile app
- System will automatically assign version "1.0.0"

**RFC (Request for Change)**
- For changes, updates, or enhancements to **existing applications**
- Examples: Add new feature, fix bug, modify workflow, update UI
- You'll select which application and specify the new version

### Step 3: Fill Request Information

#### For New Application:

**Title** (required)
- Name of the new application you want
- Example: "Employee Self-Service Portal" or "HR Dashboard System"
- Must be at least 3 characters

**Version**
- Automatically set to "1.0.0" (not editable)
- This will be the first version of your new application

#### For RFC (Request for Change):

**Select Application** (required)
- Choose from dropdown of existing applications
- Shows application name and current version
- Example: "SIPPA HR System (v1.2.3)"
- Only applications from approved requests appear here

**Requested Version** (required)
- Enter the new version number you're requesting
- Format: x.y.z (example: 1.2.4, 1.3.0, 2.0.0)
- **Must be higher than current version**
- System validates in real-time

**Version Validation:**
- ✅ Valid: Current v1.2.3 → Requested v1.2.4 (patch update)
- ✅ Valid: Current v1.2.3 → Requested v1.3.0 (minor update)  
- ✅ Valid: Current v1.2.3 → Requested v2.0.0 (major update)
- ❌ Invalid: Current v1.2.3 → Requested v1.2.3 (same version)
- ❌ Invalid: Current v1.2.3 → Requested v1.2.0 (lower version)

💡 **Tip:** Not sure what version to use?
- **Patch (x.y.Z)**: Bug fixes, small changes (1.2.3 → 1.2.4)
- **Minor (x.Y.z)**: New features, no breaking changes (1.2.3 → 1.3.0)
- **Major (X.y.z)**: Major changes, breaking changes (1.2.3 → 2.0.0)

System will show helpful suggestions if you enter an invalid version.

#### For Both Types:

**Description** (required)
- Detailed explanation of what you need
- Minimum 20 characters
- Be specific about requirements
- Include:
  - What problem this solves
  - Who will use it
  - Key features needed
  - Any constraints or deadlines

**Urgency** (required)
Select importance level:
- **Low** - Can wait, no deadline pressure
- **Medium** - Important but not critical
- **High** - Important with near-term deadline

💡 **Tip:** Admins will set final priority considering other factors like business impact and available resources.

### Step 4: Add Attachments (Optional)

Upload supporting files:
- Screenshots or mockups
- Excel files with data examples
- Word documents with detailed requirements
- Flow diagrams

**File Requirements:**
- Maximum 5 files per request
- Maximum 10MB per file
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP

**To upload:**
1. Click "Choose Files" or drag files to upload area
2. Selected files appear with name and size
3. Click ❌ to remove unwanted files

### Step 5: Review and Submit

Review your information:
- Check title and description accuracy
- Verify urgency level
- Confirm attachments uploaded

Click **Submit Request** when ready.

### Step 6: Review and Submit

Review your information:
- Check request type (New Application or RFC)
- For New Application: Verify title and description
- For RFC: Verify application selection and version number
- Confirm urgency level
- Confirm attachments uploaded correctly

Click **Submit Request** when ready.

### After Submission

✅ You'll see a success message with your request number (e.g., REQ-2026-001)

📧 You'll receive a notification confirming submission

📊 Request appears in your DevTI Request list with status: **SUBMITTED**

#### What Happens Next for New Application:
1. Admin reviews and approves/rejects
2. If approved, your application becomes part of the application master list
3. Future RFCs can reference this application

#### What Happens Next for RFC:
1. Admin reviews version change request
2. Validates that version progression makes sense
3. If approved and completed, application version updates in the system

---

## 📋 Tracking Requests

### Viewing All Requests

1. Click **DevTI Request** in sidebar
2. See table with all your requests

### Request List Columns

- **Request No** - Unique identifier (REQ-2026-XXX)
- **Type** - New Application or RFC
- **Title / Application** - Request title (for New Application) or Application name (for RFC)
- **Version** - For RFC: shows requested version
- **Status** - Current workflow status
- **Priority** - Set by admin after approval
- **Submitted** - Date you submitted
- **Updated** - Last status change

### Filtering Requests

Use filters to narrow down:
- **Search** - Search by title or request number
- **Status** - Filter by status (All, Submitted, Approved, etc.)
- **Type** - Filter by New Application or RFC
- **Date Range** - Filter by submission date

### Request Statuses

| Status | Meaning |
|--------|---------|
| **SUBMITTED** | Awaiting admin review |
| **VERIFICATION** | Admin is reviewing details |
| **REJECTED** | Admin rejected (see rejection reason) |
| **APPROVED** | Admin approved, awaiting assignment |
| **ASSIGNED** | Assigned to developer/team |
| **IN_PROGRESS** | Developer is working on it |
| **COMPLETED** | Work finished |

### Viewing Request Details

Click on any request to see:

**Request Information**
- Request number, type, title
- For RFC: Application name and requested version
- Description and urgency
- Your unit
- Current status and priority

**Team Assignment** (if assigned)
Once your request is assigned, you can see:
- **DevTI Urusan** - Which DevTI division is handling it
- **Team Leader** - Project coordinator
- **Technical Writer** - Documentation specialist
- **Assigned Developers** - Team members with their specific roles:
  - System Analyst (SA)
  - Backend Developer (BE)
  - Frontend Developer (FE)
  - Quality Assurance (QA)
  - Data Management (DM)

**Timeline**
Visual history showing:
- When you submitted
- Admin approval/rejection
- Developer assignment
- Progress updates
- Completion

**Attachments**
Download files you uploaded by clicking filename.

**Progress Updates** (if in progress)
- Current completion percentage
- Developer notes on progress
- Timestamps for each update

---

## 🔔 Notifications

### Notification Bell

Top right corner shows:
- 🔴 Red badge - Unread notifications count
- Click bell to view recent notifications

### Notification Types

You'll receive notifications when:

| Event | Example |
|-------|---------|
| **Request Submitted** | "Your request REQ-2026-015 has been submitted successfully" |
| **Request Approved** | "Your request 'Employee Portal' has been approved with priority: High" |
| **Request Rejected** | "Your request 'Mobile App' has been rejected. Reason: Duplicate request" |
| **Progress Updated** | "Progress update on 'HR Report': 50% complete - Database integration done" |
| **Request Completed** | "Your request 'Export Feature' has been completed" |

### Viewing All Notifications

1. Click **Notifications** page from sidebar or bell dropdown
2. See all notifications with filters:
   - **All** - Every notification
   - **Unread** - Only new notifications
   - **Read** - Previously viewed

### Managing Notifications

- Click notification to mark as read
- Click "Mark all as read" to clear badge
- Notifications stay for 90 days

---

## ❓ FAQ

### What's the difference between New Application and RFC?

**New Application**: For brand new systems that don't exist yet. The system automatically assigns version "1.0.0" and creates a new entry in the application master list when approved.

**RFC (Request for Change)**: For changes to existing applications. You must select an existing application and specify a version number higher than the current version.

### How do I know what version to request for RFC?

The system shows the current version when you select an application. Your requested version must be higher. Guidelines:
- **Patch update** (1.2.3 → 1.2.4): Bug fixes, small changes
- **Minor update** (1.2.3 → 1.3.0): New features
- **Major update** (1.2.3 → 2.0.0): Significant changes

If you're unsure, use a minor update (increment the middle number). The system will validate and suggest corrections if needed.

### Why can't I submit an RFC with version 1.2.3 when current is 1.2.3?

Version numbers must always increase. Same or lower versions are not allowed because they would create confusion. The system requires version progression to track application evolution properly.

### Can I submit a New Application with the same name as an existing one?

When admins approve your New Application, it creates a new entry in the application master. It's best to check with admin if you're unsure whether an application already exists. You might need to submit an RFC instead.

### Who are the team members I see on my request?

Once assigned, you'll see:
- **Team Leader**: Coordinates the project
- **Technical Writer**: Creates documentation
- **Developers**: Multiple specialists with specific roles (backend, frontend, QA, etc.)

This team structure ensures your request is handled by the right expertise.

### How long does approval take?

Typically 1-3 business days. Admins review requests in submission order and may contact you for clarification.

### Can I edit my request after submission?

No. If you need changes, contact admin via email or submit a new request referencing the original.

### Can I cancel my request?

Contact admin to cancel. Include request number in your message.

### Why was my request rejected?

Check rejection reason in request detail timeline. Common reasons:
- Duplicate of existing request
- Insufficient information
- Out of scope for DevTI
- Budget/resource constraints
- For RFC: Version validation issues

You can resubmit with corrections after addressing the issues.

### What happens after approval?

1. Admin sets priority based on urgency and business impact
2. Admin assigns to appropriate team:
   - Selects Team Leader
   - Assigns Technical Writer
   - Assigns multiple developers with specific roles
3. You receive "assigned" notification with team details
4. Team begins work and provides progress updates
5. You receive "completed" notification when finished
6. For New Application: Application added to master list
7. For RFC: Application version updated in system

### How do I know progress?

Check request detail page for:
- Current status badge
- Progress percentage (if in progress)
- Developer notes in progress section
- Timeline history
- Team composition and their roles

### Can I contact the developer directly?

For progress questions, check updates on request detail page first. For urgent clarifications, contact admin who will coordinate with the team.

### What if I have a critical issue?

- Mark urgency as "High" when submitting
- Contact admin immediately via phone/email
- Provide request number for faster processing
- Admin will prioritize based on business impact

### Can I submit multiple requests?

Yes, no limit. Each request is tracked independently. You can submit multiple New Applications or RFCs.

### What file types can I upload?

Supported formats:
- Documents: PDF, DOC, DOCX
- Spreadsheets: XLS, XLSX
- Images: JPG, PNG
- Archives: ZIP

Maximum: 5 files, 10MB each

### I can't upload my file

Check:
- File size under 10MB?
- File type allowed?
- Already have 5 files? (remove one first)
- Stable internet connection?

Still having issues? Contact IT support.

### How do I download my attachments?

1. Open request detail page
2. Scroll to Attachments section
3. Click filename to download

### Can I see other users' requests?

No. You only see your own submitted requests for privacy.

### How long are requests kept?

All requests are kept indefinitely for record-keeping and reporting purposes.

### Mobile access?

Yes! SiPPA is fully responsive. Access from:
- Desktop/laptop (recommended)
- Tablet
- Smartphone

Use the same URL and credentials.

---

## 💡 Tips for Better Requests

### Choose the Right Type
- **New Application**: Only for brand new systems
- **RFC**: For any change to existing systems

### Be Specific
❌ "Fix the system"  
✅ "Add search functionality to employee directory that filters by name and department"

### For RFC: Know Your Version
- Check current version in the dropdown
- Request next logical version
- System helps with validation and suggestions

### Provide Context
Include:
- What problem you're solving
- Who needs this
- When it's needed
- Why it's important

### Attach Examples
Screenshots, mockups, or sample data help developers understand requirements.

### Set Realistic Urgency
Not everything is critical. Honest urgency helps admins prioritize effectively.

### Follow Up
Check notifications and progress updates regularly.

### Understand the Team
Once assigned, you'll see the full team working on your request. Each member has a specific role to ensure quality delivery.

---

## 🆘 Need Help?

- **Technical Issues**: Contact IT Support
- **Request Status Questions**: Check DevTI Request page or contact admin
- **General Questions**: Email devti@yourdomain.com

---

**Happy requesting! The DevTI team is here to help. 🚀**
