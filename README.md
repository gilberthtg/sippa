# SiPPA - Sistem Informasi Permintaan Pengembangan Aplikasi

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)

Web application for centralized submission, recording, workflow management, progress monitoring, quarterly reporting, and SLA reporting for application-development requests handled by DevTI.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [User Roles](#user-roles)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## ✨ Features

### For Users
- 📝 Submit new application or RFC requests with attachments
- 📊 Track request status with real-time timeline
- 🔔 Receive in-app notifications on status changes
- 📁 Upload multiple attachments per request (max 5 files, 10MB each)
- 🔍 Filter and search personal requests

### For Admins
- ✅ Review and approve/reject incoming requests
- 🎯 Set priorities and assign to developers/teams
- 📈 View comprehensive dashboard with multiple queues
- 📊 Generate Laptri (quarterly reports) with Excel export
- 📉 Analyze SLA achievement with detailed metrics
- ⚙️ Manage master data (priorities, teams, units, SLA policies)
- 👥 User management (create, edit, deactivate)
- 🔍 View audit logs with advanced filtering
- 💾 Export reports to Excel with summary and details

### For Developers
- 📋 View assigned requests and workload
- 📝 Update progress with percentage and notes
- 🔔 Receive assignment notifications
- 📊 Track progress history per request

### System Features
- 🔐 Secure authentication with NextAuth.js
- 🔒 Role-based access control (User, Admin, Developer)
- 📝 Complete audit trail for all actions
- 🔔 Real-time in-app notifications
- 📱 Fully responsive design (mobile, tablet, desktop)
- ♿ WCAG AA accessibility compliance
- 🎨 Calm, green-themed UI with excellent UX
- 🛡️ Security headers and file validation
- 📊 Chart visualizations with Recharts

---

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 16.3 (App Router)
- **Language**: TypeScript 5.x
- **Database**: MySQL 8.x
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5

### Frontend
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

### Backend
- **API**: Next.js Server Actions & Route Handlers
- **File Storage**: Local filesystem
- **Excel Export**: SheetJS (xlsx)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- MySQL 8.x
- npm or yarn

### Installation

See [SETUP.md](./SETUP.md) for detailed setup instructions.

**Quick Start:**

```bash
# 1. Clone repository
git clone <repository-url>
cd sippa

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Setup database
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

Visit `http://localhost:3000` and login with seed credentials.

---

## 📚 Documentation

- [**SETUP.md**](./SETUP.md) - Detailed installation and setup guide
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Production deployment instructions
- [**USER_GUIDE.md**](./USER_GUIDE.md) - Guide for end users
- [**ADMIN_GUIDE.md**](./ADMIN_GUIDE.md) - Guide for administrators
- [**DEVELOPER_GUIDE.md**](./DEVELOPER_GUIDE.md) - Guide for developers
- [**API_CONVENTIONS.md**](./API_CONVENTIONS.md) - Server action patterns and conventions
- [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) - Common issues and solutions

### Architecture Documentation
- `.ai/ARCHITECTURE.md` - System architecture
- `.ai/DATABASE.md` - Database schema
- `.ai/BUSINESS_RULES.md` - Business rules and workflows
- `.ai/DECISIONS.md` - Architecture decision records (ADRs)

---

## 👥 User Roles

### User (Requester)
Default role for all new users. Can submit requests and track their status.

### Admin
Manages all requests, handles approvals, assigns work, views reports, and manages system configuration.

**Seed Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### Developer
Receives assigned requests and updates progress. Manages their workload.

**Seed Developer Credentials:**
- Email: `dev1@example.com`, `dev2@example.com`
- Password: `dev123`

---

## ⚠️ Known Limitations

Current version (v1.0) has the following limitations:

### SLA Calculation
- Uses **calendar days (24/7)**, not business hours
- No business day/holiday calendar support
- SLA starts from `submitted_at` (includes admin processing time)

### Notifications
- **In-app only** (no email or push notifications)
- Polling-based (30-second intervals)
- No notification preferences/settings

### Reporting
- No developer performance metrics
- Date filters limited to year/quarter/month
- Excel export only (no PDF)
- No embedded charts in exports

### User Management
- No password complexity requirements
- No rate limiting on login attempts
- No password reset workflow
- No self-service profile editing

### File Storage
- Local filesystem only (not cloud storage)
- No file preview functionality
- No virus scanning

### Workflow
- No request reopening capability
- No request editing after submission
- No request cancellation by user
- No multi-stage approval workflow

These limitations are documented and planned for future releases.

---

## 🗺️ Roadmap

### v1.1 (Q1 2027)
- ✉️ Email notifications via SMTP
- 📊 Developer performance dashboard
- 🔄 Request reopening workflow
- 🕐 Business-hour SLA calculation
- 🔒 Password complexity enforcement
- 🛡️ Rate limiting on authentication

### v1.2 (Q2 2027)
- ☁️ Cloud storage integration (S3/Azure)
- 📄 PDF report export
- 📧 Notification preferences
- 🔍 Advanced search with full-text
- 📱 Push notifications
- 🧪 Automated E2E tests

### v2.0 (Future)
- 🌐 Multi-language support (EN/ID)
- 📊 Custom dashboard widgets
- 🔌 REST API with OpenAPI docs
- 📈 Advanced analytics
- 🤖 AI-powered request categorization
- 📲 Mobile app (React Native)

---

## 📄 License

Proprietary - Internal use only.

---

## 🤝 Support

For issues, questions, or feature requests, contact the DevTI team.

---

**Built with ❤️ by DevTI**
