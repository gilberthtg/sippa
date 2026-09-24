# SiPPA Deployment Guide

Production deployment instructions for various hosting environments.

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All Phase 8 tests passed
- [ ] `npm run build` succeeds without errors
- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] Security audit clean: `npm audit`
- [ ] Environment variables documented
- [ ] Database migration files ready
- [ ] Backup strategy in place
- [ ] SSL certificate obtained
- [ ] Domain configured

---

## 🌍 Environment Variables

### Required Production Variables

Create `.env.production` with:

```env
# Database (Production MySQL instance)
DB_HOST=production-mysql-host.example.com
DB_PORT=3306
DB_USER=sippa_prod_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=sippa_production

# NextAuth (CRITICAL: Must be HTTPS in production)
NEXTAUTH_URL=https://sippa.yourdomain.com
NEXTAUTH_SECRET=GENERATE_NEW_SECRET_DO_NOT_REUSE_DEV

# File Upload
UPLOAD_DIR=/var/www/sippa/uploads
MAX_FILE_SIZE=10485760

# Node Environment
NODE_ENV=production
```

### Generate Production Secret

**Never reuse development secrets!**

```bash
# Linux/Mac:
openssl rand -base64 64

# Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Security Rules

- ✅ Use strong, unique `NEXTAUTH_SECRET`
- ✅ Use strong database password (16+ chars, mixed case, numbers, symbols)
- ✅ Store secrets in secure vault (not version control)
- ✅ Use HTTPS for `NEXTAUTH_URL`
- ✅ Restrict database user to `sippa_production` database only
- ❌ Never commit `.env.production` to Git

---

## 🗄️ Database Setup

### 1. Create Production Database

```sql
-- Login to production MySQL
mysql -u root -p

-- Create database
CREATE DATABASE sippa_production 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create dedicated user
CREATE USER 'sippa_prod_user'@'localhost' 
  IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- Grant privileges (least privilege principle)
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX 
  ON sippa_production.* 
  TO 'sippa_prod_user'@'localhost';

FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'sippa_prod_user'@'localhost';
EXIT;
```

### 2. Push Schema

```bash
# Point to production database
npm run db:push

# Verify tables created
mysql -u sippa_prod_user -p sippa_production -e "SHOW TABLES;"
```

### 3. Create Initial Admin User

**DO NOT run `npm run db:seed` in production!**

Instead, manually create first admin:

```sql
USE sippa_production;

-- Insert admin user
INSERT INTO users (name, email, password, role_id, unit_id, is_active, created_at, updated_at)
VALUES (
  'System Admin',
  'admin@yourdomain.com',
  '$2a$10$HASHED_PASSWORD_HERE',  -- See below for hashing
  (SELECT id FROM roles WHERE code = 'admin'),
  (SELECT id FROM units WHERE code = 'IT'),
  1,
  NOW(),
  NOW()
);
```

**Hash password:**
```bash
node -e "console.log(require('bcryptjs').hashSync('your_temp_password', 10))"
```

---

## 🚀 Deployment Methods

Choose deployment method based on your infrastructure:

---

## Option 1: VPS/Server Deployment (Ubuntu/Debian)

### Prerequisites
- Ubuntu 22.04+ or Debian 11+
- Root or sudo access
- Domain pointed to server IP

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installations
node --version  # v20.x
npm --version   # v10.x
mysql --version # 8.x
nginx -v        # 1.x
pm2 --version   # 5.x
```

### Step 2: Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/sippa
sudo chown $USER:$USER /var/www/sippa

# Clone repository
cd /var/www/sippa
git clone <repository-url> .

# Install dependencies
npm ci --production

# Create uploads directory
mkdir -p /var/www/sippa/uploads
chmod 755 /var/www/sippa/uploads

# Setup environment
cp .env.example .env.production
nano .env.production  # Edit with production values
```

### Step 3: Build Application

```bash
cd /var/www/sippa
npm run build

# Verify build succeeded
ls -la .next/
```

### Step 4: Setup PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sippa',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/sippa',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/sippa-error.log',
    out_file: '/var/log/pm2/sippa-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application
pm2 start ecosystem.config.js

# Setup PM2 startup script
pm2 startup
# Run the command it outputs

pm2 save

# Verify
pm2 list
pm2 logs sippa
```

### Step 5: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/sippa
```

Paste this configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sippa.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sippa.yourdomain.com;

    # SSL certificates (update paths after installing certbot)
    ssl_certificate /etc/letsencrypt/live/sippa.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sippa.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Client max body size (for file uploads)
    client_max_body_size 50M;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/sippa-access.log;
    error_log /var/log/nginx/sippa-error.log;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sippa /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (interactive)
sudo certbot --nginx -d sippa.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Auto-renewal is setup via cron automatically
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### Step 8: Verify Deployment

1. Visit: `https://sippa.yourdomain.com`
2. Verify HTTPS works (green padlock)
3. Login with admin credentials
4. Test core functionality:
   - Submit request
   - Upload file
   - Approve request
   - View reports

---

## Option 2: Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# Build application
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create uploads directory
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: sippa_production
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
```

### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app npm run db:push

# Stop
docker-compose down
```

---

## Option 3: Vercel Deployment (Not Recommended for Production)

**⚠️ Limitations:**
- Serverless functions have 10s timeout
- File uploads stored in `/tmp` (ephemeral)
- Requires external MySQL and file storage

**Only suitable for demo/staging environments.**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables via Vercel dashboard
```

---

## 🔄 Update/Rollback Procedures

### Update Application (VPS)

```bash
cd /var/www/sippa

# Backup current version
git tag "backup-$(date +%Y%m%d-%H%M%S)"

# Pull latest code
git pull origin main

# Install new dependencies
npm ci --production

# Rebuild
npm run build

# Run migrations if any
npm run db:push

# Restart application
pm2 restart sippa

# Monitor logs
pm2 logs sippa --lines 100
```

### Rollback (VPS)

```bash
cd /var/www/sippa

# List backups
git tag -l "backup-*"

# Rollback to previous version
git checkout backup-20260924-153000

# Rebuild
npm ci --production
npm run build

# Restart
pm2 restart sippa
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs sippa
pm2 logs sippa --lines 200

# CPU/Memory
pm2 monit

# Restart if needed
pm2 restart sippa

# Stop
pm2 stop sippa
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/sippa-access.log

# Error logs
sudo tail -f /var/log/nginx/sippa-error.log
```

### Database Health

```bash
# Check connections
mysql -u sippa_prod_user -p sippa_production -e "SHOW PROCESSLIST;"

# Check table sizes
mysql -u sippa_prod_user -p sippa_production -e "
  SELECT table_name, 
         ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
  FROM information_schema.TABLES
  WHERE table_schema = 'sippa_production'
  ORDER BY (data_length + index_length) DESC;
"
```

---

## 🔐 Security Best Practices

### Application Level
- ✅ Change default admin password immediately after deployment
- ✅ Use strong passwords (16+ characters)
- ✅ Enable HTTPS only (no HTTP access)
- ✅ Keep dependencies updated: `npm audit fix`
- ✅ Restrict file upload types and sizes
- ✅ Review audit logs regularly

### Server Level
- ✅ Keep Ubuntu/OS updated: `sudo apt update && sudo apt upgrade`
- ✅ Configure firewall (UFW)
- ✅ Disable root SSH login
- ✅ Use SSH keys instead of passwords
- ✅ Setup fail2ban for brute-force protection
- ✅ Regular security audits

### Database Level
- ✅ Use dedicated database user (not root)
- ✅ Grant only required privileges
- ✅ Bind MySQL to localhost only
- ✅ Regular backups (see below)
- ✅ Enable binary logging for point-in-time recovery

---

## 💾 Backup Strategy

### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-sippa-db.sh
```

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sippa"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Dump database
mysqldump -u sippa_prod_user -p'PASSWORD_HERE' \
  --single-transaction \
  --routines \
  --triggers \
  sippa_production | gzip > $BACKUP_DIR/sippa_$TIMESTAMP.sql.gz

# Delete old backups
find $BACKUP_DIR -name "sippa_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: sippa_$TIMESTAMP.sql.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-sippa-db.sh

# Setup daily cron
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-sippa-db.sh >> /var/log/sippa-backup.log 2>&1
```

### File Backup

```bash
# Backup uploads directory
tar -czf /var/backups/sippa/uploads_$(date +%Y%m%d).tar.gz /var/www/sippa/uploads

# Sync to external storage (optional)
rsync -avz /var/backups/sippa/ user@backup-server:/backups/sippa/
```

### Restore from Backup

```bash
# Restore database
gunzip < /var/backups/sippa/sippa_20260924_020000.sql.gz | \
  mysql -u sippa_prod_user -p sippa_production

# Restore uploads
tar -xzf /var/backups/sippa/uploads_20260924.tar.gz -C /
```

---

## 🆘 Troubleshooting Production Issues

### Application won't start

```bash
# Check PM2 logs
pm2 logs sippa --lines 200

# Check environment variables
pm2 env 0

# Check database connection
mysql -u sippa_prod_user -p sippa_production -e "SELECT 1;"

# Restart
pm2 restart sippa
```

### High memory usage

```bash
# Check PM2 status
pm2 monit

# Reduce PM2 instances if needed
pm2 scale sippa 1

# Restart application
pm2 restart sippa
```

### 502 Bad Gateway

```bash
# Check if Next.js is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/sippa-error.log

# Test port 3000 directly
curl http://localhost:3000

# Restart services
pm2 restart sippa
sudo systemctl restart nginx
```

---

## 📈 Performance Optimization

### Enable Nginx Caching

Add to nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

location /_next/static {
    proxy_cache STATIC;
    proxy_pass http://localhost:3000;
}
```

### Database Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_requester ON requests(requester_id);
CREATE INDEX idx_requests_submitted ON requests(submitted_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

### PM2 Cluster Mode

Already configured in ecosystem.config.js (2 instances).

---

## 📞 Support

For deployment issues, contact DevTI infrastructure team.

---

**Deployment complete! Monitor logs and enjoy SiPPA in production! 🎉**
