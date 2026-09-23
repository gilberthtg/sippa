# Phase 6 Quick Testing Guide

## Prerequisites
✅ Server running at: http://localhost:3000
✅ Database connected and seeded

## Test Credentials
- **Admin:** admin@sippa.local / password123
- **User:** user@sippa.local / password123  
- **Developer:** dev@sippa.local / password123

---

## Quick Test Flow (15 minutes)

### 1. Authorization Check (2 min)
1. Open http://localhost:3000/login
2. Login as admin@sippa.local / password123
3. Navigate to http://localhost:3000/admin/settings
4. ✅ Should see settings dashboard with 5 cards

### 2. User Management (5 min)

**Create User:**
1. Click "Settings" in sidebar
2. Click "User Management" card
3. Click "Add User" button
4. Fill in:
   - Name: Test User Phase 6
   - Email: testphase6@sippa.local
   - Password: test123456
   - Role: User
   - Unit: (select any)
   - Phone: 0812345678
5. Click "Create User"
6. ✅ Should see success toast and user in list

**Edit User:**
1. Find "Test User Phase 6" in list
2. Click three-dot menu → Edit
3. Change name to "Test User Updated"
4. Click "Save Changes"
5. ✅ Should see success toast

**Change Password:**
1. Click three-dot menu → Change Password
2. Enter: newpass123 (both fields)
3. Click "Change Password"
4. ✅ Should see success toast

**Deactivate User:**
1. Click three-dot menu → Deactivate
2. Confirm
3. ✅ Status badge should show "Inactive"

**Test Self-Protection:**
1. Find admin@sippa.local in list
2. Click three-dot menu → Deactivate
3. ✅ Should be disabled or show error

**Test Search:**
1. Type "Test User" in search box
2. Wait 1 second
3. ✅ List should filter to matching users

**Test Filters:**
1. Click "Filters" button
2. Check "User" role
3. Click "Apply Filters"
4. ✅ Should show only users with User role

### 3. SLA Policies (3 min)

**Create Policy:**
1. Go back to /admin/settings
2. Click "SLA Policies" card
3. Click "Add SLA Policy"
4. Fill in:
   - Request Type: New Application
   - Priority: Low
   - Target Hours: 168
   - Effective From: (pick today's date)
   - Effective To: (leave empty)
5. Click "Create Policy"
6. ✅ Should see success toast

**Test Duplicate Prevention:**
1. Click "Add SLA Policy" again
2. Use same type (New Application) + priority (Low)
3. Click "Create Policy"
4. ✅ Should see error "An active SLA policy already exists..."

**Edit Policy:**
1. Find created policy
2. Click three-dot menu → Edit
3. Change Target Hours to 200
4. Click "Save Changes"
5. ✅ Should see success toast and updated value

### 4. Master Data - Units (2 min)

1. Go to /admin/settings
2. Click "Units" card
3. Click "Add Unit"
4. Fill: Code: "TEST_DEPT", Name: "Test Department"
5. Click "Create Unit"
6. ✅ Should see success toast

**Test Duplicate Code:**
1. Click "Add Unit" again
2. Use same code: "TEST_DEPT"
3. ✅ Should see error "Unit code already exists"

### 5. Master Data - Priorities (2 min)

1. Go to /admin/settings/priorities
2. Find any priority (not first or last)
3. Click UP arrow button
4. ✅ Priority should move up one position
5. Click DOWN arrow button
6. ✅ Priority should move back down

**Create Priority:**
1. Click "Add Priority"
2. Fill: Code: "TEST", Name: "Test Priority"
3. ✅ Should be created

### 6. Master Data - Teams (1 min)

1. Go to /admin/settings/teams
2. Click "Add Team"
3. Fill: Code: "TEST_TEAM", Name: "Test Team"
4. Click "Create Team"
5. ✅ Should see success toast

---

## Automated Verification Tests

### Build Verification
```bash
npm run build
```
✅ Expected: Build succeeds with 0 errors

### Lint Check
```bash
npm run lint
```
✅ Expected: 0 errors, 0 warnings

### TypeScript Check
```bash
npm run build
```
✅ Expected: Type check passes

---

## What to Look For

### ✅ Success Indicators
- Green toast notifications appear on success
- Data appears immediately in lists after create
- Edit dialogs pre-populate with current values
- Filters update URL params
- Search is debounced (doesn't trigger on every keystroke)
- Buttons show loading state during async operations
- Empty states show when no data
- Pagination works when more than 20 items

### ❌ Error Indicators
- Red toast notifications for errors
- Console errors in browser DevTools
- Validation errors display inline in forms
- Cannot submit forms with missing required fields
- Self-protection prevents dangerous actions

### 🔍 Security Checks
- Cannot access /admin/settings as non-admin user
- Cannot deactivate own admin account
- Cannot change own admin role
- All mutations require authentication
- No sensitive data in console logs

---

## Known Limitations (Expected Behavior)

1. ⚠️ **No bulk operations** - Can only create/edit one item at a time
2. ⚠️ **No undo** - Changes are immediate and permanent
3. ⚠️ **No draft mode** - All changes saved immediately
4. ⚠️ **Audit logging not visible** - Logs written but no UI to view them
5. ⚠️ **Static pages warning** - Some dynamic pages show warnings during build (expected)

---

## Quick Smoke Test (5 minutes)

If time is limited, test only these critical paths:

1. ✅ Login as admin
2. ✅ Access /admin/settings (should work)
3. ✅ Create one user (should succeed)
4. ✅ Create one SLA policy (should succeed)
5. ✅ Try to deactivate self (should fail)
6. ✅ Logout and login as user
7. ✅ Try to access /admin/settings (should redirect/fail)

---

## Reporting Issues

If you find issues, note:
- **What you did** (steps to reproduce)
- **What happened** (actual result)
- **What should happen** (expected result)
- **Error messages** (from toast or console)
- **Screenshot** (if UI issue)

---

## Test Status: READY FOR MANUAL TESTING

Server: http://localhost:3000
Login: admin@sippa.local / password123

**Start testing now!** 🚀
