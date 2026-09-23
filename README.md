# SiPPA - Sistem Informasi Permintaan Pengembangan Aplikasi

Web application untuk centralized submission, recording, workflow management, progress monitoring, quarterly reporting, dan SLA reporting untuk application-development requests.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js API Routes & Server Actions
- **Database:** MySQL 8.0+ with Drizzle ORM
- **Authentication:** NextAuth.js v5
- **Validation:** Zod
- **Forms:** React Hook Form

## Prerequisites

- Node.js 20+ 
- MySQL 8.0+
- npm or pnpm

## Getting Started

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Setup Database

Create a MySQL database:

```sql
CREATE DATABASE sippa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sippa

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Push Database Schema

```bash
npm run db:push
```

This will create all tables in your MySQL database.

### 5. Seed Database

```bash
npm run db:seed
```

This will create:
- 3 roles (User, Admin, Developer)
- 4 priorities (Low, Medium, High, Critical)
- 4 sample units (IT, Finance, HR, Operations)
- 2 teams (DevTI, Infrastructure)
- 3 test users (see below)

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

After seeding, you can login with:

| Role      | Email              | Password    | Access                          |
|-----------|--------------------|--------------|---------------------------------|
| Admin     | admin@sippa.local  | password123 | Full system access              |
| User      | user@sippa.local   | password123 | Submit & view own requests      |
| Developer | dev@sippa.local    | password123 | View assigned requests, update progress |

## Project Structure

```
sippa/
├── .ai/                      # AI context documentation (IMPORTANT!)
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login)
│   ├── (user)/              # User role pages
│   ├── (admin)/             # Admin role pages
│   ├── (developer)/         # Developer role pages
│   └── api/                 # API routes
├── components/              
│   ├── ui/                  # shadcn/ui components
│   └── requests/            # Request-specific components
├── lib/
│   ├── db/                  # Database schema & connection
│   │   └── schema/          # Drizzle schemas
│   ├── auth/                # Authentication & permissions
│   ├── validations/         # Zod validation schemas
│   └── utils.ts             # Utility functions
├── db/migrations/           # SQL migrations (auto-generated)
└── uploads/                 # File uploads (gitignored)
```

## Database Schema

### Core Tables

- **users** - System users with roles
- **roles** - User roles (User, Admin, Developer)
- **units** - Organizational units/departments
- **teams** - Developer teams
- **priorities** - Priority levels

### Request Tables

- **requests** - Main request entity
- **request_status_histories** - Status change audit trail
- **request_attachments** - File attachments
- **request_assignments** - Developer/team assignments
- **request_progress** - Progress updates

### Supporting Tables

- **sla_policies** - SLA target rules
- **audit_logs** - System audit trail

## Request Workflow

```
SUBMITTED → VERIFICATION → APPROVED → ASSIGNED → IN_PROGRESS → COMPLETED
                         ↓
                      REJECTED
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate migration files
npm run db:push      # Push schema to database (development)
npm run db:migrate   # Run migrations (production)
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:seed      # Seed database with initial data
```

## Features Roadmap

### ✅ Phase 0-2: Foundation (COMPLETED)
- [x] Project setup with Next.js + TypeScript
- [x] Database schema design (Drizzle ORM)
- [x] Authentication with NextAuth.js
- [x] Role-based access control (RBAC)
- [x] Green-themed UI with shadcn/ui
- [x] Basic dashboard pages for all roles
- [x] Status, Priority, and SLA badge components

### 🚧 Phase 3-5: Request Management (NEXT)
- [ ] Request submission form (User)
- [ ] Request list & detail view (User)
- [ ] File upload functionality
- [ ] Request verification & approval (Admin)
- [ ] Priority assignment (Admin)
- [ ] Developer assignment (Admin)

### 📋 Phase 6-8: Developer & SLA
- [ ] Developer workspace
- [ ] Progress tracking
- [ ] Request completion workflow
- [ ] SLA calculation & monitoring
- [ ] SLA alerts & notifications

### 📊 Phase 9-10: Reporting
- [ ] Laptri (Quarterly Report)
- [ ] SLA Performance Report
- [ ] Dashboard metrics & charts

### 🔧 Phase 11+: Advanced Features
- [ ] Audit trail viewer
- [ ] Notification system
- [ ] User/Unit/Team management UI
- [ ] Advanced filtering & search
- [ ] Export functionality (PDF/Excel)

## Development Guidelines

### AI-Friendly Documentation

**IMPORTANT:** This project uses AI-assisted development. Before making any changes:

1. Read `AGENTS.md` for AI working rules
2. Check `.ai/` folder for:
   - `PROJECT_CONTEXT.md` - Project overview
   - `BUSINESS_RULES.md` - Business logic & workflow
   - `DATABASE.md` - Database schema documentation
   - `ARCHITECTURE.md` - Technical architecture
   - `DECISIONS.md` - Architecture Decision Records (ADRs)
   - `SESSION_LOG.md` - Development history

### Code Conventions

- Use TypeScript for all new files
- Server Components by default, Client Components only when needed
- Validate all inputs with Zod schemas
- Check permissions server-side (never trust client)
- Use Drizzle ORM for database queries
- Follow existing naming conventions

### Database Changes

1. Modify schema in `lib/db/schema/*.ts`
2. Run `npm run db:push` (development) or `npm run db:generate` + `npm run db:migrate` (production)
3. Update `.ai/DATABASE.md` documentation

### Architecture Decisions

All major decisions must be documented in `.ai/DECISIONS.md` with:
- Decision number (ADR-XXXX)
- Date
- Status (Proposed/Confirmed/Deprecated)
- Decision summary
- Reason
- Alternatives considered
- Impact

## Security

- Passwords hashed with bcrypt
- Session-based authentication with HttpOnly cookies
- Server-side authorization checks on every request
- Input validation with Zod
- SQL injection protection via Drizzle ORM
- File upload validation (type, size)
- CSRF protection (built-in with Next.js Server Actions)

## License

Private - Internal use only

## Support

For issues or questions, refer to:
- `.ai/` documentation folder
- `AGENTS.md` for AI context
- Project blueprint in session notes

---

**Status:** Phase 1-2 Complete ✅ | Ready for Phase 3 Implementation 🚀

Last Updated: 2026-09-23
