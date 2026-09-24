# Changelog

All notable changes to the SiPPA project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-24

### 🎉 Initial Release

First production-ready release of SiPPA (Sistem Informasi Permintaan Pengembangan Aplikasi).

### ✨ Features

#### Request Management
- **Request Baru** - Users can submit new development requests
  - Two request types: New Application and RFC
  - Rich text description with urgency levels
  - Multi-file attachment support (up to 5 files, 10MB each)
  - Automatic request number generation (REQ-YYYY-NNN)
  
- **Request Workflow** - Complete lifecycle management
  - Status flow: SUBMITTED → VERIFICATION → APPROVED → ASSIGNED → IN_PROGRESS → COMPLETED
  - Admin approval/rejection with reason tracking
  - Priority assignment (Low, Medium, High, Critical)
  - Developer/team assignment
  - Progress tracking with percentage and notes
  - Complete audit trail and timeline

#### Role-Based Access
- **User Role**
  - Submit and track own requests
  - View request details and timeline
  - Receive notifications on status changes
  - Download own attachments

- **Admin Role**
  - View and manage all requests
  - Approve/reject with reasons
  - Set priorities and assign work
  - Manage master data (priorities, teams, units, SLA policies)
  - User management (create, edit, deactivate)
  - Generate and export reports
  - View audit logs

- **Developer Role**
  - View assigned requests
  - Update progress with notes
  - Track personal workload
  - Receive assignment notifications

#### Reporting
- **Laptri (Quarterly Report)**
  - Completed requests summary by quarter
  - Request type breakdown (New Application vs RFC)
  - Average completion time by type and priority
  - Monthly trend charts
  - Export to Excel (3 sheets: Summary, Trend, Details)
  - Filterable by year, quarter, type

- **Pencapaian SLA (SLA Achievement Report)**
  - SLA compliance tracking (Met vs Exceeded)
  - Achievement rate percentage
  - Average target vs actual completion times
  - Variance analysis
  - Monthly trend visualization
  - Export to Excel with detailed breakdown
  - Filterable by year, type, priority, SLA status

#### Notifications
- **In-App Notifications** - Real-time updates
  - Request submitted confirmation
  - Approval/rejection notifications
  - Assignment notifications for developers
  - Progress update notifications for requesters
  - Completion notifications
  - Unread badge counter
  - Notification history page
  - Mark as read functionality
  - 30-second polling for updates

#### Security & Audit
- **Authentication** - NextAuth.js v5
  - Email/password login
  - Secure session management
  - Role-based access control
  - Protected routes via middleware

- **Audit Logging** - Complete activity tracking
  - All CRUD operations logged
  - User authentication events
  - Before/after data snapshots
  - IP address and user agent capture
  - Module-based filtering
  - JSON diff viewer for updates
  - Advanced search and filters

- **Security Hardening**
  - File upload validation (type, size, count)
  - Access control on file downloads
  - Security headers (X-Frame-Options, X-Content-Type-Options)
  - Password hashing with bcrypt
  - SQL injection prevention via Drizzle ORM
  - XSS protection via React escaping

#### Master Data Management
- **Priorities** - Configurable priority levels
- **Teams** - Developer team organization
- **Units** - Organizational units/departments
- **SLA Policies** - Target hours by request type and priority
- **Users** - User account management with roles

#### UI/UX
- **Responsive Design** - Mobile, tablet, desktop support
- **Green-themed Design** - Calm, professional aesthetic
- **Accessible** - WCAG AA compliant
- **shadcn/ui Components** - Modern, consistent UI primitives
- **Role-specific Layouts** - Tailored navigation per role
- **Status Badges** - Visual status indicators
- **Timeline View** - Request history visualization
- **Empty States** - Helpful placeholders for no data
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Instant feedback on actions

### 🛠️ Technical Stack

- **Framework**: Next.js 16.3 (App Router)
- **Language**: TypeScript 5.x
- **Database**: MySQL 8.x with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Excel Export**: SheetJS (xlsx)
- **Icons**: Lucide React
- **File Storage**: Local filesystem

### 📝 Documentation

- **README.md** - Project overview and quick start
- **SETUP.md** - Detailed installation instructions
- **DEPLOYMENT.md** - Production deployment guide
- **USER_GUIDE.md** - End user documentation
- **ADMIN_GUIDE.md** - Administrator guide
- **DEVELOPER_GUIDE.md** - Developer role guide
- **API_CONVENTIONS.md** - Development patterns
- **TROUBLESHOOTING.md** - Common issues and solutions

### ⚠️ Known Limitations

- SLA calculation uses calendar days (24/7), not business hours
- In-app notifications only (no email or push)
- No developer performance metrics in reports
- No request reopening workflow
- File storage is local filesystem (not cloud)
- No password complexity enforcement
- No rate limiting on authentication
- No request editing after submission
- Excel export only (no PDF)

### 🔒 Security Notes

- All passwords hashed with bcrypt (10 rounds)
- Role-based access enforced server-side
- File uploads validated (type, size, count)
- Audit trail for all mutations
- Security headers enabled
- Session-based authentication

### 📊 Database Schema

14 tables:
- users, roles, units
- priorities, teams, team_members
- sla_policies
- requests, request_status_histories, request_attachments
- request_assignments, request_progress
- notifications, audit_logs

### 🎯 Acceptance Criteria Met

All requirements from original specification (CP - Gambaran Aplikasi SIPPA.pdf):
- ✅ Request Baru (New Application and RFC submission)
- ✅ DevTI Request (workflow management for all roles)
- ✅ Laptri (quarterly reporting with Excel export)
- ✅ Pencapaian SLA (SLA achievement analysis)
- ✅ Role-based access (User, Admin, Developer)
- ✅ Notifications (in-app)
- ✅ Audit trail (complete activity logging)

---

## [Unreleased]

### Planned for v1.1 (Q1 2027)

- Email notifications via SMTP
- Developer performance dashboard
- Request reopening workflow
- Business-hour SLA calculation
- Password complexity enforcement
- Rate limiting on authentication
- Request editing capability
- Bulk approval actions

### Planned for v1.2 (Q2 2027)

- Cloud storage integration (S3/Azure)
- PDF report export
- Notification preferences
- Advanced search with full-text
- Push notifications
- Automated E2E tests with Playwright

### Planned for v2.0 (Future)

- Multi-language support (EN/ID toggle)
- Custom dashboard widgets
- REST API with OpenAPI documentation
- Advanced analytics
- AI-powered request categorization
- Mobile app (React Native)

---

## Version History

- **1.0.0** (2026-09-24) - Initial release
  - Core request management workflow
  - Role-based access control
  - Laptri and SLA reporting
  - In-app notifications
  - Audit logging
  - Master data management

---

## Migration Notes

### Upgrading to v1.0.0

This is the initial release. No migration required.

For fresh installation, see [SETUP.md](./SETUP.md).

---

## Contributors

Built with ❤️ by the DevTI team.

---

**For detailed feature information, see respective user guides in `/docs`.**
