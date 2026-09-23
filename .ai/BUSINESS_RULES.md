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
- View Laptri (quarterly reports)
- View SLA achievement reports
- Export reports to Excel

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
- Laptri groups completed requests by quarter
- Includes: quarterly counts, type breakdown, average completion time by type and priority, monthly trends
- Filterable by: year, quarter, request type
- Exportable to Excel with summary and detail sheets
- SLA compares actual handling time against the request's target SLA
- Includes: total requests, met/exceeded counts, achievement rate, average times, monthly trends
- Filterable by: year, request type, priority, SLA status
- Exportable to Excel with summary and detail sheets

## Deferred Requirements (v1.1+)
- Developer performance metrics in reports
  - Individual completion rates
  - Workload distribution
  - Quality metrics
- Advanced reporting features
  - Custom date ranges beyond year filter
  - PDF export
  - Chart embedding in exports
  - Scheduled report generation

## Explicitly unresolved
Do not guess rules for:
- reopening a rejected request
- reopening a completed request
- approval by multiple admins
- priority calculation method
- SLA pause/resume rules
- SLA calendar/business hours
- developer/team workload limits
