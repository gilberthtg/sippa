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

Select one of:

**New Application**
- For entirely new applications/systems
- Examples: New employee portal, new reporting system, new mobile app

**RFC (Request for Change)**
- For changes to existing applications
- Examples: Add new feature, fix bug, modify workflow, update UI

### Step 3: Fill Request Information

**Title** (required)
- Brief, descriptive title
- Example: "Employee Self-Service Portal" or "Add Export to Excel in HR Report"

**Description** (required)
- Detailed explanation of what you need
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
- **Critical** - Urgent, blocking work

💡 **Tip:** Admins will set final priority considering other factors.

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

### After Submission

✅ You'll see a success message with your request number (e.g., REQ-2026-001)

📧 You'll receive a notification confirming submission

📊 Request appears in your DevTI Request list with status: **SUBMITTED**

---

## 📋 Tracking Requests

### Viewing All Requests

1. Click **DevTI Request** in sidebar
2. See table with all your requests

### Request List Columns

- **Request No** - Unique identifier (REQ-2026-XXX)
- **Type** - New Application or RFC
- **Title** - Request title
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
- Description and urgency
- Your unit
- Current status and priority

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

You can resubmit with corrections after addressing the issues.

### What happens after approval?

1. Admin sets priority based on urgency and business impact
2. Admin assigns to appropriate developer or team
3. You receive "assigned" notification
4. Developer begins work and provides progress updates
5. You receive "completed" notification when finished

### How do I know progress?

Check request detail page for:
- Current status badge
- Progress percentage (if in progress)
- Developer notes in progress section
- Timeline history

### Can I contact the developer directly?

For progress questions, check updates on request detail page first. For urgent clarifications, contact admin who will coordinate with developer.

### What if I have a critical issue?

- Mark urgency as "Critical" when submitting
- Contact admin immediately via phone/email
- Provide request number for faster processing

### Can I submit multiple requests?

Yes, no limit. Each request is tracked independently.

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

### Be Specific
❌ "Fix the system"  
✅ "Add search functionality to employee directory that filters by name and department"

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

---

## 🆘 Need Help?

- **Technical Issues**: Contact IT Support
- **Request Status Questions**: Check DevTI Request page or contact admin
- **General Questions**: Email devti@yourdomain.com

---

**Happy requesting! The DevTI team is here to help. 🚀**
