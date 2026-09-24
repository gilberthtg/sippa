# SiPPA Developer Guide

Guide for developers handling assigned requests and updating progress.

---

## 📋 Table of Contents

- [Developer Role](#developer-role)
- [Dashboard Overview](#dashboard-overview)
- [Managing Assignments](#managing-assignments)
- [Updating Progress](#updating-progress)
- [Best Practices](#best-practices)
- [FAQ](#faq)

---

## 👨‍💻 Developer Role

As a developer in SiPPA, you are responsible for:

✅ **Assignment Management**
- View requests assigned to you or your team
- Understand requirements from request details
- Download and review attachments

✅ **Progress Tracking**
- Update work progress regularly
- Provide meaningful progress notes
- Set realistic completion percentages

✅ **Communication**
- Keep requesters informed via progress updates
- Notify admin of blockers or delays
- Request clarification when requirements unclear

---

## 📊 Dashboard Overview

Your developer dashboard displays:

### My Workload
Current number of assigned requests.

### In Progress
Requests you're actively working on.

### Completed This Month
Your completion count for current month.

### Assignments List
Recent assignments with:
- Request number and title
- Priority badge
- Days since assignment
- Quick link to detail

### Recent Activity
Latest updates and notifications related to your assignments.

---

## 📋 Managing Assignments

### Viewing All Assignments

**Navigation:** Sidebar → My Assignment

See complete list of assigned requests:

**Table Columns:**
- **Request No** - Unique identifier
- **Type** - New Application or RFC
- **Title** - Request title
- **Priority** - Business priority (Low, Medium, High, Critical)
- **Status** - Current status
- **Assigned Date** - When you received it
- **Last Updated** - Most recent activity

**Filters:**
- **Search** - Search by title or request number
- **Status** - All, Assigned, In Progress, Completed
- **Priority** - Filter by priority level
- **Date Range** - Filter by assignment date

**Sorting:**
Click column headers to sort.

💡 **Tip:** Sort by Priority (High to Low) to focus on critical items first.

### Understanding Assignment Notification

When admin assigns request to you:
1. You receive in-app notification
2. Request appears in My Assignment list
3. Status is "ASSIGNED"

**Notification includes:**
- Request title
- Priority level
- Requester name
- Link to request detail

### Viewing Request Details

Click on any request to see full information:

**Request Information Section**
- Request number and type
- Title and detailed description
- Requester name and unit
- Priority level (set by admin)
- SLA target hours
- Submission and assignment dates

**Requirements**
Read description carefully:
- What requester needs
- Why they need it
- Who will use it
- Any constraints or deadlines

**Attachments**
Download supporting files:
- Click filename to download
- May include:
  - Screenshots or mockups
  - Sample data files
  - Detailed requirement documents
  - Flow diagrams

💡 **Tip:** Download and review all attachments before starting work.

**Timeline**
See request history:
- When submitted
- Admin approval
- Assignment to you
- All progress updates

---

## 📝 Updating Progress

### Why Update Progress?

Regular progress updates:
- Keep requester informed
- Help admin monitor workload
- Track SLA compliance
- Document work history

### When to Update Progress

**Recommended frequency:**
- When starting work (0% → initial %)
- At major milestones (25%, 50%, 75%)
- Weekly for long-running tasks
- When blocked or delayed
- Upon completion (100%)

### How to Update Progress

**Steps:**

1. **Open Request Detail**
   - Navigate to My Assignment
   - Click on request

2. **Click "Update Progress" Button**
   - Usually in top right or below request info

3. **Fill Update Form**

   **Progress Percentage (required)**
   - Slider or input: 0-100%
   - Be realistic and honest
   - Examples:
     - 10% - Requirement analysis complete
     - 25% - Database schema designed
     - 50% - Core functionality implemented
     - 75% - Testing in progress
     - 90% - Bug fixes complete
     - 100% - Ready for production (triggers completion)

   **Update Note (required)**
   - Brief description of progress made
   - What's completed
   - What's next
   - Any blockers or issues

4. **Click "Save Update"**

5. **Confirmation**
   - Success message appears
   - Requester receives notification
   - Update appears in timeline
   - If 100%, request marked COMPLETED

### Progress Update Examples

**Good Updates:**

✅ "25% - Requirements analysis complete. Database schema designed and reviewed. Starting backend API development."

✅ "50% - Core CRUD APIs implemented and tested. Starting frontend UI development next."

✅ "75% - Frontend UI complete. Integration testing in progress. Found minor bug in date filtering, fixing today."

✅ "90% - All features implemented and tested. Deployment to staging complete. Waiting for user acceptance testing."

✅ "100% - User acceptance testing passed. Deployed to production. All requirements met."

**Poor Updates:**

❌ "Working on it" - Not specific

❌ "50%" - No note explaining what's done

❌ "Almost done" - No percentage, vague

❌ "Busy with other things" - Not professional

### Setting Progress to 100%

When you set progress to **100%**:
- Request automatically marked COMPLETED
- Requester receives completion notification
- Admin receives completion notification
- Request removed from your active workload
- SLA calculation finalized

⚠️ **Only set 100% when:**
- All requirements delivered
- Testing complete
- Deployed/delivered to requester
- No known issues remaining
- Ready for production use

### Progress History

All your updates are visible in:
- Request detail timeline
- Progress section showing:
  - Date/time of update
  - Progress percentage
  - Your note
  - Who updated (you)

Requesters and admins can see this history.

---

## 🎯 Best Practices

### Requirement Understanding

**Before Starting:**
- Read description thoroughly
- Review all attachments
- Identify unclear requirements
- Contact admin/requester for clarifications (via admin)

**Document Assumptions:**
If you make technical decisions, note them in progress updates.

### Time Management

**Prioritization:**
1. Critical priority first
2. Consider SLA deadlines
3. Balance multiple assignments
4. Communicate if overloaded

**Estimations:**
- Give realistic progress percentages
- Don't set 90% too early
- Plan for testing and bug fixes
- Account for deployment time

### Communication

**Progress Notes:**
- Be specific and technical-but-readable
- Mention what's completed
- State what's next
- Flag blockers immediately

**When Blocked:**
- Update progress with blocker explanation
- Notify admin via appropriate channel
- Suggest solutions if possible
- Don't let request stall silently

**Examples:**
- "Blocked: Waiting for database access credentials from infrastructure team"
- "Blocked: Clarification needed on user role permissions. Sent questions to admin."
- "Delayed: Found critical bug in third-party library. Investigating workaround."

### Quality Standards

**Before Marking Complete:**
- [ ] All requirements implemented
- [ ] Code tested thoroughly
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] Documentation updated (if applicable)
- [ ] Deployed successfully
- [ ] No known bugs

### Multiple Assignments

**If you have multiple requests:**
- Update each separately
- Don't neglect lower priority
- Communicate realistic timelines
- Request reassignment if truly overloaded

---

## 📊 Tracking Your Performance

### Personal Metrics

While v1.0 doesn't show developer-specific reports, you can track:
- Completed requests this month (dashboard)
- Average time to complete (manual calculation)
- Types of requests you handle

### Future Features (v1.1+)

Planned developer features:
- Personal performance dashboard
- Workload analytics
- Completion rate metrics
- Time tracking per request

---

## ❓ FAQ

### How do I know what to work on first?

Prioritization order:
1. **Critical priority** - Highest urgency
2. **SLA approaching** - Check timeline
3. **High priority** - Important business needs
4. **Longest waiting** - First assigned

### Can I see other developers' assignments?

No. You only see your own assignments for focus and privacy.

### What if requirements are unclear?

1. Note in progress update: "Clarification needed on..."
2. Contact admin (they coordinate with requester)
3. Don't make assumptions that could be wrong
4. Wait for clarification before proceeding

### Can I reject an assignment?

No direct reject function. If truly cannot handle:
1. Contact admin immediately
2. Explain reason (skill gap, overloaded, etc.)
3. Admin may reassign

### What if I'll miss the SLA?

1. Update progress with realistic estimate
2. Notify admin as soon as you know
3. Explain reason for delay
4. Suggest revised timeline
5. Admin communicates with requester

### Can I update progress multiple times per day?

Yes, but usually unnecessary. Update at meaningful milestones or weekly.

### What if I completed it but forgot to update to 100%?

Update to 100% as soon as you remember. Completion timestamp will be when you update, not when you actually finished.

### Do I need to update on weekends?

No. Update during business hours at your regular schedule.

### Can I edit a previous progress update?

No. Progress updates are immutable for audit trail. Create new update to correct/clarify.

### What if requester contacts me directly?

Direct admin to coordinate. Keep communication centralized for record-keeping.

### How detailed should progress notes be?

Detailed enough to be useful:
- Technical enough for you to remember
- Clear enough for requester to understand
- Specific enough for admin to track

Example length: 1-3 sentences per update.

### Can I work on non-assigned requests?

No. Work only on requests assigned to you. If you want to help, ask admin to reassign.

### What happens if I leave or transfer?

Admin will reassign your active requests to another developer.

---

## 🆘 Need Help?

- **Assignment Questions**: Contact admin or team lead
- **Technical Issues**: IT Support
- **Requirement Clarifications**: Request via admin

---

**Happy developing! Your work makes SiPPA valuable. 🚀**
