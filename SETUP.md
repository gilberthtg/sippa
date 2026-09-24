# SiPPA Setup Guide

Complete installation and setup instructions for development and local testing.

---

## 📋 Prerequisites

### Required Software

1. **Node.js** (v20.x or higher)
   ```bash
   node --version  # Should be >= 20.0.0
   npm --version   # Should be >= 10.0.0
   ```
   Download: https://nodejs.org/

2. **MySQL** (v8.x or higher)
   ```bash
   mysql --version  # Should be >= 8.0.0
   ```
   Download: https://dev.mysql.com/downloads/mysql/

3. **Git** (for version control)
   ```bash
   git --version
   ```
   Download: https://git-scm.com/

### Optional Tools
- **MySQL Workbench** - GUI for database management
- **Drizzle Studio** - Database viewer (`npm run db:studio`)
- **VS Code** - Recommended editor with TypeScript support

---

## 🚀 Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd sippa
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (~500MB):
- Next.js, React, TypeScript
- Drizzle ORM, mysql2
- shadcn/ui, Tailwind CSS
- NextAuth.js, bcryptjs
- And more...

**Troubleshooting:**
- If you get `EACCES` errors, don't use `sudo`. Fix npm permissions first.
- If behind a proxy, configure npm: `npm config set proxy http://proxy:port`

### 3. Setup MySQL Database

#### Option A: Create Database Manually

1. Login to MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create database:
   ```sql
   CREATE DATABASE sippa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;  -- Verify 'sippa' exists
   EXIT;
   ```

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Execute: `CREATE DATABASE sippa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### 4. Configure Environment Variables

1. Copy example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=sippa

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_here_generate_with_openssl_rand_base64_32

   # File Upload
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ```

3. Generate secure `NEXTAUTH_SECRET`:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32

   # On Windows (PowerShell):
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Important:** Never commit `.env` to Git. It's already in `.gitignore`.

### 5. Push Database Schema

Push the schema to MySQL (creates all tables):

```bash
npm run db:push
```

**Expected output:**
```
✅ Tables created successfully
✅ Indexes created
✅ Foreign keys established
```

**Verify tables were created:**
```bash
mysql -u root -p sippa -e "SHOW TABLES;"
```

You should see:
- users
- roles
- units
- priorities
- teams
- team_members
- sla_policies
- requests
- request_status_histories
- request_attachments
- request_assignments
- request_progress
- notifications
- audit_logs

### 6. Seed Database with Test Data

Populate database with initial roles, users, and sample requests:

```bash
npm run db:seed
```

**Seed data includes:**
- 3 Roles: User, Admin, Developer
- 5 Units: IT, Finance, HR, Operations, Marketing
- 4 Priorities: Low, Medium, High, Critical
- 2 Teams: Backend Team, Frontend Team
- 8 SLA Policies (by type and priority)
- 10 Users (3 admins, 3 developers, 4 regular users)
- 25 Sample requests (spanning all quarters of 2026)

**Seed Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Admin | admin2@example.com | admin123 |
| Developer | dev1@example.com | dev123 |
| Developer | dev2@example.com | dev123 |
| User | user1@example.com | user123 |
| User | user2@example.com | user123 |

### 7. Create Uploads Directory

Ensure the uploads directory exists and is writable:

```bash
# Linux/Mac:
mkdir -p uploads
chmod 755 uploads

# Windows (PowerShell):
New-Item -ItemType Directory -Force -Path uploads
```

### 8. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.3.6
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.5s
```

### 9. Verify Installation

1. Open browser: `http://localhost:3000`
2. You should see the login page
3. Login with admin credentials: `admin@example.com` / `admin123`
4. Verify dashboard loads successfully
5. Check sidebar navigation works
6. Try viewing requests list

**✅ Setup Complete!**

---

## 🗂️ Project Structure

```
sippa/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── (user)/              # User role routes
│   ├── (admin)/             # Admin role routes
│   ├── (developer)/         # Developer role routes
│   ├── actions/             # Server actions
│   ├── api/                 # API route handlers
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # Shell, nav, header
│   ├── shared/              # Reusable components
│   └── requests/            # Domain components
├── lib/
│   ├── db/                  # Database schema & seed
│   ├── auth/                # NextAuth config
│   ├── validations/         # Zod schemas
│   ├── config/              # App configuration
│   └── utils/               # Utility functions
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
├── uploads/                 # User-uploaded files (gitignored)
├── .ai/                     # AI context & documentation
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── drizzle.config.ts        # Drizzle ORM config
├── next.config.ts           # Next.js config
├── tailwind.config.ts       # Tailwind CSS config
└── package.json             # Dependencies & scripts
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio (GUI)
npm run db:seed          # Seed database with test data

# Build & Type Check
npx tsc --noEmit         # TypeScript type checking
npm run build            # Production build
```

---

## 🔍 Verify Setup Checklist

- [ ] Node.js v20+ installed
- [ ] MySQL v8+ installed and running
- [ ] Database `sippa` created
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file configured with valid credentials
- [ ] Schema pushed successfully (14 tables created)
- [ ] Seed data loaded (10 users, 25 requests)
- [ ] `uploads/` directory exists
- [ ] Dev server starts without errors
- [ ] Login page loads at `http://localhost:3000`
- [ ] Can login with `admin@example.com` / `admin123`
- [ ] Dashboard displays correctly

---

## 🐛 Common Issues

### Issue: Cannot connect to MySQL

**Error:** `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # Linux/Mac:
   sudo systemctl status mysql
   # or
   brew services list

   # Windows:
   # Check Services panel for MySQL80
   ```

2. Test MySQL connection:
   ```bash
   mysql -u root -p
   # Enter password when prompted
   ```

3. Check credentials in `.env`:
   - `DB_HOST` should be `localhost`
   - `DB_PORT` should be `3306`
   - `DB_USER` and `DB_PASSWORD` must match MySQL credentials
   - `DB_NAME` must be `sippa`

4. Grant privileges (if needed):
   ```sql
   GRANT ALL PRIVILEGES ON sippa.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Issue: Port 3000 already in use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Kill process using port 3000:
   ```bash
   # Linux/Mac:
   lsof -ti:3000 | xargs kill -9

   # Windows (PowerShell):
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
   ```

2. Or use a different port:
   ```bash
   npm run dev -- -p 3001
   ```

### Issue: Module not found errors

**Error:** `Module not found: Can't resolve 'xxx'`

**Solutions:**
1. Delete and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Issue: Permission denied on uploads/

**Error:** `EACCES: permission denied, mkdir 'uploads'`

**Solutions:**
```bash
# Linux/Mac:
sudo chown -R $USER:$USER uploads/
chmod 755 uploads/

# Windows:
# Right-click uploads/ > Properties > Security > Edit > Allow Full Control
```

### Issue: Build errors after git pull

**Solution:**
```bash
npm install          # Install new dependencies
npm run db:push      # Update schema if changed
rm -rf .next         # Clear build cache
npm run dev          # Restart server
```

### Issue: NEXTAUTH_SECRET not set warning

**Error:** `[auth][error] MissingSecret`

**Solution:**
Generate and set `NEXTAUTH_SECRET` in `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copy output to .env
```

---

## 🔄 Resetting Development Database

To start fresh with clean data:

```bash
# Method 1: Drop and recreate (recommended)
mysql -u root -p -e "DROP DATABASE sippa; CREATE DATABASE sippa;"
npm run db:push
npm run db:seed

# Method 2: Truncate all tables (keeps structure)
mysql -u root -p sippa < reset.sql  # If you have a reset script
npm run db:seed
```

---

## 📝 Next Steps

After successful setup:

1. **Explore the Application**
   - Login with different roles
   - Submit a test request
   - Approve and assign as admin
   - Update progress as developer

2. **Review Documentation**
   - Read [USER_GUIDE.md](./USER_GUIDE.md)
   - Read [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
   - Review [API_CONVENTIONS.md](./API_CONVENTIONS.md)

3. **Start Development**
   - Check `.ai/ARCHITECTURE.md` for system design
   - Review `.ai/BUSINESS_RULES.md` for workflows
   - See `.ai/DECISIONS.md` for ADRs

4. **Optional: Open Drizzle Studio**
   ```bash
   npm run db:studio
   # Opens at https://local.drizzle.studio
   ```

---

## 🆘 Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions
- Review `.ai/` documentation for architecture details
- Contact DevTI team for support

---

**Setup complete! Start building with `npm run dev` 🚀**
