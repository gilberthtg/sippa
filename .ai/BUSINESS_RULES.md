# SIPPA Business Rules

## Workflow baseline
User submits request (New Application / RFC)
→ Admin verifies completeness
→ Admin Rejects OR Approves
→ if Approved: Admin sets priority and assigns developer/team
→ Developer works and updates progress
→ Request completed
→ data becomes available for Laptri and SLA reporting.

## Request types
- New Application
- RFC

## Roles
### User
- Create request
- Select request type
- Enter requirement details
- Upload attachments/evidence
- View own request list and status

### Admin
- View all requests and details
- Verify requests
- Approve/reject requests
- Set priority
- Assign team/developer
- Edit permitted request data

### Developer
- View assigned requests
- Update work progress

## Status proposal for implementation
The following is a technical representation of the PDF flow, not an additional business requirement:
- SUBMITTED
- VERIFICATION
- REJECTED
- APPROVED
- ASSIGNED
- IN_PROGRESS
- COMPLETED

If the institution uses different status names, update this file before implementation.

## Reporting
- Laptri groups completed requests by quarter.
- SLA compares actual handling time against the request's target SLA.

## Explicitly unresolved
Do not guess rules for:
- reopening a rejected request
- reopening a completed request
- approval by multiple admins
- priority calculation method
- SLA pause/resume rules
- SLA calendar/business hours
- developer/team workload limits
