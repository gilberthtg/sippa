# Quick Test Guide - Phase 3 Admin Features

## Prerequisites
✅ Server running: http://localhost:3000  
✅ Database seeded with test accounts  
✅ Test accounts ready  

---

## Quick Test Sequence (5 minutes)

### 1. Login & Dashboard (1 min)
```
1. Navigate to http://localhost:3000
2. Should redirect to /login
3. Login: admin@sippa.local / password123
4. Should redirect to /admin/dashboard
5. Check: 8 stat cards visible
6. Check: SLA widget visible
7. Check: Recent activity visible
```

### 2. Request List (1 min)
```
1. Click "DevTI Request" in sidebar (or /admin/requests)
2. Check: Table shows all requests
3. Check: Can see requests from all users
4. Try: Status filter → Select "Diajukan"
5. Check: URL updates (?status=submitted)
6. Try: Search box → Type request number
7. Check: Results filter
8. Click: "Reset" button
```

### 3. Request Detail (1 min)
```
1. Click "Detail" on any request
2. Check: Full request info displays
3. Check: Admin Actions panel on right
4. Check: Status timeline visible
5. Check: Actions match current status
```

### 4. Verify Workflow (2 min)
```
IF request status = SUBMITTED:
  1. Click "Verifikasi Request"
  2. Add note (optional)
  3. Click "Verifikasi"
  4. Check: Toast notification
  5. Check: Status → VERIFICATION
  6. Check: Timeline updated

IF request status = VERIFICATION:
  1. Click "Setujui"
  2. Add note (optional)
  3. Click "Setujui"
  4. Check: Status → APPROVED
  5. Check: approved_at set

OR:
  1. Click "Tolak"
  2. Leave reason empty → Try submit
  3. Check: Validation error
  4. Enter reason: "Test rejection"
  5. Click "Tolak Request"
  6. Check: Status → REJECTED
```

### 5. Priority & Assignment (30 sec)
```
IF request status = APPROVED:
  1. Select priority from dropdown
  2. Click "Simpan Priority"
  3. Check: Priority badge updates
  4. Click "Assign Request"
  5. Select team or developer
  6. Click "Assign"
  7. Check: Status → ASSIGNED
```

---

## Critical Tests

### ✅ Must Pass
- [ ] Admin can login
- [ ] Dashboard displays stats
- [ ] Can view all requests (not just own)
- [ ] Can verify SUBMITTED request
- [ ] Can approve VERIFICATION request
- [ ] Can reject with mandatory reason
- [ ] Can set priority
- [ ] Can assign to team/developer
- [ ] Status changes recorded in timeline
- [ ] Toast notifications work

### ⚠️ Should Check
- [ ] Filters work (status, priority, type)
- [ ] Search works (debounced)
- [ ] Pagination works (if >20 requests)
- [ ] SLA widget calculates correctly
- [ ] Recent activity shows transitions
- [ ] Mobile responsive

### 🔒 Security
- [ ] User cannot access /admin routes
- [ ] Developer cannot access /admin routes
- [ ] Actions validated server-side

---

## Known Limitations (Expected)
- No real-time updates (manual refresh needed)
- No undo for status changes
- No bulk actions
- No admin notes feature

---

## If Issues Found

1. **Console Errors**: Open browser DevTools (F12) → Console tab
2. **Network Errors**: Check Network tab in DevTools
3. **Server Errors**: Check terminal running `npm run dev`
4. **Database Errors**: Check database connection and seed data

---

## Test Data Needed

To test all workflows, you need requests in different statuses:
- SUBMITTED → Test verify action
- VERIFICATION → Test approve/reject
- APPROVED → Test priority/assign
- ASSIGNED → Test priority change

**Create test data**:
1. Login as user@sippa.local
2. Submit multiple requests via /requests/new
3. Logout, login as admin
4. Process requests through workflow

---

**Quick Test Time**: ~5 minutes  
**Full Test Time**: ~30 minutes  
**File**: docs/PHASE3_TESTING.md (detailed checklist)

---

**Ready to test!** Open http://localhost:3000 and start with admin login.
