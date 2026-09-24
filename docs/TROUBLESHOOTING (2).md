# SiPPA Troubleshooting Guide

Common issues and solutions for developers and administrators.

---

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [File Upload Issues](#file-upload-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Performance Issues](#performance-issues)
- [Common Errors](#common-errors)

---

## 🔧 Installation Issues

### Issue: npm install fails

**Error:** `npm ERR! code EACCES` or permission errors

**Solution:**
```bash
# Don't use sudo with npm!
# Fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then retry
npm install
```

**Error:** `npm ERR! network` or timeout

**Solution:**
```bash
# Increase timeout
npm install --fetch-timeout=60000

# Or use different registry
npm install --registry=https://registry.npmjs.org/

# Clear cache first
npm cache clean --force
npm install
```

### Issue: Node version mismatch

**Error:** `Requires Node.js >= 20.0.0`

**Solution:**
```bash
# Check current version
node --version

# Install Node 20+ using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should be v20.x.x
```

---

## 🗄️ Database Issues

### Issue: Cannot connect to MySQL

**Error:** `ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'`

**Solution 1: Verify credentials**
```bash
# Test MySQL login
mysql -u root -p
# Enter password when prompted

# If successful, check .env file
cat .env | grep DB_
# Ensure DB_USER and DB_PASSWORD match
```

**Solution 2: Reset MySQL password**
```bash
# Stop MySQL
sudo systemctl stop mysql

# Start in safe mode
sudo mysqld_safe --skip-grant-tables &

# Connect without password
mysql -u root

# Reset password
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;

# Stop safe mode and restart normally
sudo killall mysqld
sudo systemctl start mysql

# Update .env with new password
```

**Error:** `ECONNREFUSED 127.0.0.1:3306`

**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# If stopped, start it
sudo systemctl start mysql
sudo systemctl enable mysql

# Verify port
sudo netstat -tlnp | grep 3306
```

### Issue: Database schema out of sync

**Error:** `Table 'sippa.requests' doesn't exist`

**Solution:**
```bash
# Push schema to database
npm run db:push

# Verify tables created
mysql -u root -p sippa -e "SHOW TABLES;"

# Expected output: 14 tables
```

### Issue: Foreign key constraint errors

**Error:** `Cannot add or update a child row: a foreign key constraint fails`

**Solution:**
```bash
# Check data integrity
mysql -u root -p sippa

# Find orphaned records
SELECT r.id, r.requester_id 
FROM requests r 
LEFT JOIN users u ON r.requester_id = u.id 
WHERE u.id IS NULL;

# Fix by removing orphaned data or adding missing parent records

# If seed data is corrupted, reset:
DROP DATABASE sippa;
CREATE DATABASE sippa;
npm run db:push
npm run db:seed
```

### Issue: Seed script fails

**Error:** `Duplicate entry` or constraint violations

**Solution:**
```bash
# Clean database first
mysql -u root -p sippa -e "
  SET FOREIGN_KEY_CHECKS = 0;
  TRUNCATE TABLE audit_logs;
  TRUNCATE TABLE notifications;
  TRUNCATE TABLE request_progress;
  TRUNCATE TABLE request_assignments;
  TRUNCATE TABLE request_attachments;
  TRUNCATE TABLE request_status_histories;
  TRUNCATE TABLE requests;
  TRUNCATE TABLE team_members;
  TRUNCATE TABLE teams;
  TRUNCATE TABLE sla_policies;
  TRUNCATE TABLE priorities;
  TRUNCATE TABLE users;
  TRUNCATE TABLE units;
  TRUNCATE TABLE roles;
  SET FOREIGN_KEY_CHECKS = 1;
"

# Re-run seed
npm run db:seed
```

---

## 🔐 Authentication Issues

### Issue: Cannot login with seed credentials

**Error:** "Invalid credentials" or stuck on login page

**Solution 1: Verify user exists**
```sql
mysql -u root -p sippa

SELECT id, name, email, role_id, is_active 
FROM users 
WHERE email = 'admin@example.com';

-- If no result, re-seed
-- If is_active = 0, activate user
UPDATE users SET is_active = 1 WHERE email = 'admin@example.com';
```

**Solution 2: Verify password hash**
```bash
# Generate new hash
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"

# Copy output and update database
mysql -u root -p sippa
UPDATE users 
SET password = '$2a$10$...' 
WHERE email = 'admin@example.com';
```

### Issue: Session expires immediately

**Error:** Logged out after every page refresh

**Solution:**
```bash
# Check NEXTAUTH_SECRET is set
cat .env | grep NEXTAUTH_SECRET

# If empty or missing, generate new one
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env
echo "NEXTAUTH_SECRET=<generated_secret>" >> .env

# Restart server
npm run dev
```

### Issue: "Invalid CSRF token" error

**Solution:**
```bash
# Clear browser cookies for localhost
# In Chrome: DevTools → Application → Cookies → Clear All

# Restart dev server
npm run dev

# Try login again
```

### Issue: Middleware redirect loop

**Error:** Page keeps redirecting, browser shows "Too many redirects"

**Solution:**
```typescript
// Check middleware.ts
// Ensure auth and public routes are correct

// middleware.ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)']
}

// If still looping, check auth callback in lib/auth/options.ts
// Ensure session callback returns user correctly
```

---

## 📎 File Upload Issues

### Issue: Cannot upload files

**Error:** "Failed to upload file" or 413 Payload Too Large

**Solution 1: Check file size**
```bash
# Verify MAX_FILE_SIZE in .env
cat .env | grep MAX_FILE_SIZE

# Should be: 10485760 (10MB in bytes)
# If missing:
echo "MAX_FILE_SIZE=10485760" >> .env
```

**Solution 2: Check upload directory**
```bash
# Ensure uploads/ exists and is writable
ls -la uploads/

# If not found, create it
mkdir -p uploads
chmod 755 uploads

# Windows:
# Create uploads folder in project root
```

**Solution 3: Nginx upload limit (production)**
```nginx
# Edit /etc/nginx/sites-available/sippa
# Add to server block:
client_max_body_size 50M;

# Restart nginx
sudo systemctl restart nginx
```

### Issue: File type not allowed

**Error:** "File type not allowed"

**Solution:**
Check allowed MIME types in server action:

```typescript
// app/actions/requests.ts or similar
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'application/zip'
]

// If you need to add more, update this array
```

### Issue: Download fails with 404

**Error:** Cannot download attachment, 404 Not Found

**Solution:**
```bash
# Check if file exists on disk
ls -la uploads/

# Check database record
mysql -u root -p sippa
SELECT id, original_name, storage_key 
FROM request_attachments 
WHERE id = <attachment_id>;

# If storage_key file doesn't exist in uploads/, file was deleted
# User needs to re-upload

# Check download route exists
ls app/api/attachments/[id]/download/route.ts
```

---

## 🏗️ Build & Deployment Issues

### Issue: Build fails with TypeScript errors

**Error:** `Type error: ...` during `npm run build`

**Solution:**
```bash
# Run type check to see all errors
npx tsc --noEmit

# Common fixes:

# 1. Missing type definitions
npm install --save-dev @types/node @types/react @types/react-dom

# 2. Strict null checks
# Add proper null checks or use optional chaining

# 3. Any type usage
# Replace 'any' with proper types

# 4. Import errors
# Check import paths are correct
```

### Issue: Build succeeds but app crashes on start

**Error:** Module not found or runtime errors

**Solution:**
```bash
# Clear .next cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
npm run start

# Check environment variables are set
cat .env
# Ensure all required vars present
```

### Issue: Port 3000 already in use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Linux/Mac - Find and kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or find PID manually
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Static files not loading

**Error:** 404 on `/_next/static/...` files

**Solution:**
```bash
# Rebuild with clean cache
rm -rf .next
npm run build

# Check public/ folder exists
ls -la public/

# Verify next.config.ts doesn't have wrong basePath or assetPrefix

# In production, check nginx config proxies /_next correctly
```

---

## ⚡ Performance Issues

### Issue: Slow page loads

**Symptoms:** Pages take 5+ seconds to load

**Solution 1: Check database queries**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check for missing indexes
SHOW INDEX FROM requests;
SHOW INDEX FROM notifications;

-- Add indexes if missing
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

**Solution 2: Check server resources**
```bash
# Check CPU and memory
top
# or
htop

# Check disk space
df -h

# Check MySQL performance
mysqladmin -u root -p status
mysqladmin -u root -p processlist
```

**Solution 3: Enable Next.js caching**
```typescript
// In server components, use fetch with cache
const data = await fetch('...', {
  next: { revalidate: 60 } // Cache for 60 seconds
})

// For server actions, consider caching strategy
```

### Issue: High memory usage

**Symptoms:** Server crashes with "Out of memory"

**Solution:**
```bash
# PM2: Reduce instances
pm2 scale sippa 1

# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run start

# In PM2 ecosystem.config.js
node_args: "--max-old-space-size=4096"

# Check for memory leaks
node --inspect npm run start
# Use Chrome DevTools to profile
```

### Issue: Database connection pool exhausted

**Error:** `Too many connections` or timeouts

**Solution:**
```typescript
// lib/db/index.ts
// Adjust connection pool settings
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on load
  queueLimit: 0
})
```

---

## ❌ Common Errors

### Error: "Hydration failed"

**Full error:** "Text content does not match server-rendered HTML"

**Cause:** Client/server mismatch, often from:
- Date formatting differences
- Conditional rendering based on client-only state
- Browser extensions injecting code

**Solution:**
```typescript
// Use suppressHydrationWarning for known issues
<time suppressHydrationWarning>
  {formatDate(date)}
</time>

// Or ensure consistent rendering
import { useEffect, useState } from 'react'

function DateDisplay({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <span>Loading...</span>
  }
  
  return <span>{date.toLocaleString()}</span>
}
```

### Error: "Failed to fetch" in browser console

**Cause:** Network error, often CORS or server down

**Solution:**
```bash
# Check dev server is running
ps aux | grep next

# Check browser console for exact URL
# Ensure URL is correct (http://localhost:3000)

# Check for ad blockers or privacy extensions
# Disable temporarily to test

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Win) or Cmd+Shift+R (Mac)
```

### Error: "Cannot read property 'xxx' of undefined"

**Cause:** Accessing property on null/undefined object

**Solution:**
```typescript
// Use optional chaining
const name = user?.name ?? 'Unknown'

// Or guard clauses
if (!user) {
  return <div>Loading...</div>
}

return <div>{user.name}</div>

// In server actions, validate input
if (!requestId || typeof requestId !== 'number') {
  return { success: false, error: 'Invalid request ID' }
}
```

### Error: "Deadlock found when trying to get lock"

**MySQL deadlock error**

**Solution:**
```typescript
// Wrap in retry logic for critical operations
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && error.code === 'ER_LOCK_DEADLOCK') {
      await new Promise(resolve => setTimeout(resolve, 100))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

// Usage
const result = await withRetry(() => 
  db.update(requests).set({ status: 'APPROVED' }).where(...)
)
```

---

## 🐛 Debugging Tips

### Enable Debug Logging

```bash
# .env.development
DEBUG=*
NODE_ENV=development

# More specific
DEBUG=drizzle:*
DEBUG=next:*
```

### Check Server Logs

```bash
# Development
# Console shows all logs

# Production with PM2
pm2 logs sippa --lines 200
pm2 logs sippa --err # Error logs only

# Production logs
tail -f /var/log/pm2/sippa-error.log
tail -f /var/log/nginx/sippa-error.log
```

### Browser DevTools

```
F12 → Console (JavaScript errors)
F12 → Network (API failures)
F12 → Application → Cookies (Session issues)
F12 → Application → Local Storage (Client state)
```

### Database Query Debugging

```typescript
// Enable query logging in Drizzle
import { drizzle } from 'drizzle-orm/mysql2'

const db = drizzle(pool, { 
  logger: true // Logs all queries to console
})
```

---

## 🆘 Getting More Help

### Before Asking for Help

Provide:
1. **Error message** (full stack trace)
2. **Steps to reproduce**
3. **Environment** (OS, Node version, MySQL version)
4. **What you've tried**
5. **Relevant code** (if applicable)

### Resources

- **Project Documentation**: `/docs` and `.ai/` folders
- **Next.js Docs**: https://nextjs.org/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team
- **MySQL Docs**: https://dev.mysql.com/doc/

### Contact

- **Technical Issues**: IT Support
- **Feature Questions**: DevTI team
- **Bug Reports**: Create issue in repository

---

**Most issues have simple solutions - stay calm and debug systematically! 🔍**
