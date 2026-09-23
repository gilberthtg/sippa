# Phase 2 Manual Testing Checklist

## Test Environment
- **Server**: http://localhost:3000
- **Test Account**: user@sippa.local / password123
- **Test Date**: 2026-09-23

## Test Cases

### ✅ 1. Authentication & Navigation
- [ ] Login page loads correctly
- [ ] Login with valid credentials (user@sippa.local / password123)
- [ ] Redirect to /dashboard after login
- [ ] Sidebar shows: Dashboard, Request Baru, DevTI Request
- [ ] Top navigation shows user name and logout button
- [ ] Mobile navigation (hamburger menu) works

**Expected Result**: User successfully logged in and can see user dashboard

---

### ✅ 2. Request Submission - Step 1: Jenis Permintaan
- [ ] Navigate to "Request Baru" from sidebar
- [ ] Page shows "Buat Request Baru" title
- [ ] Progress bar shows "Step 1 of 5: Jenis Permintaan" (20%)
- [ ] Two radio options displayed: New Application, RFC
- [ ] Each option has description
- [ ] Select "New Application"
- [ ] Click "Selanjutnya" button
- [ ] Progress advances to Step 2

**Expected Result**: Can select request type and proceed to next step

---

### ✅ 3. Request Submission - Step 2: Informasi Dasar
- [ ] Progress bar shows "Step 2 of 5: Informasi Dasar" (40%)
- [ ] Form fields displayed: Judul, Deskripsi, Tingkat Urgensi, Nomor Telepon
- [ ] Character counter shows for Judul (0/200) and Deskripsi (0/5000)
- [ ] Required fields marked with red asterisk (*)
- [ ] Test validation: Enter title < 10 characters → Shows error
- [ ] Test validation: Enter description < 50 characters → Shows error
- [ ] Enter valid title: "Aplikasi Monitoring Inventaris Gudang"
- [ ] Enter valid description (50+ chars): "Aplikasi untuk memonitor stok barang di gudang secara real-time dengan fitur notifikasi..."
- [ ] Select urgency: "Tinggi"
- [ ] Enter phone (optional): "081234567890"
- [ ] Click "Selanjutnya"
- [ ] Progress advances to Step 3

**Expected Result**: Validation works, can enter valid data and proceed

---

### ✅ 4. Request Submission - Step 3: Detail Kebutuhan
- [ ] Progress bar shows "Step 3 of 5: Detail Kebutuhan" (60%)
- [ ] Three optional textarea fields displayed
- [ ] Character counters show (0/2000) for each field
- [ ] Enter business need (optional)
- [ ] Enter objective (optional)
- [ ] Enter expected output (optional)
- [ ] Click "Sebelumnya" → Returns to Step 2 with data preserved
- [ ] Click "Selanjutnya" → Progress to Step 4

**Expected Result**: Can navigate back/forward, data preserved

---

### ✅ 5. Request Submission - Step 4: Lampiran
- [ ] Progress bar shows "Step 4 of 5: Lampiran" (80%)
- [ ] Drag & drop zone displayed with upload icon
- [ ] Shows "Maksimal 5 file, 10.00 MB per file"
- [ ] Shows allowed formats: .pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg
- [ ] Click "Pilih File" button → File picker opens
- [ ] Select 1-2 test files (PDF or image)
- [ ] Files appear in preview list with:
  - File icon/thumbnail
  - File name
  - File size
  - Delete button (X)
- [ ] Test delete: Click X on a file → File removed from list
- [ ] Test validation: Try upload > 10MB file → Shows error
- [ ] Test validation: Try upload .txt file → Shows error
- [ ] Test drag & drop: Drag file into zone → File added
- [ ] Click "Selanjutnya"

**Expected Result**: File upload works, validation works, preview shows correctly

---

### ✅ 6. Request Submission - Step 5: Review & Kirim
- [ ] Progress bar shows "Step 5 of 5: Review & Kirim" (100%)
- [ ] Summary card displays all entered data:
  - Jenis Permintaan badge (New Application)
  - Judul
  - Deskripsi
  - Tingkat Urgensi badge
  - Nomor Telepon
  - Kebutuhan Bisnis (if filled)
  - Tujuan (if filled)
  - Output yang Diharapkan (if filled)
  - Lampiran (X files) with file names and sizes
- [ ] All data matches what was entered
- [ ] Click "Sebelumnya" → Can go back to edit
- [ ] Click "Kirim Request" button
- [ ] Button shows loading state: spinner + "Mengirim..."
- [ ] After success: Redirects to /requests/[id]

**Expected Result**: Summary accurate, submission successful, redirects to detail

---

### ✅ 7. Request Detail Page
- [ ] URL shows /requests/{number}
- [ ] Page loads without error
- [ ] Header card shows:
  - Request number (e.g., REQ-20260923-001)
  - Copy button (click to copy request number)
  - Status badge: "Submitted"
  - Priority badge: "-" (not assigned yet)
  - Type badge: "New Application"
  - Created date
  - Last updated date
- [ ] Information card shows all request details
- [ ] Timeline card shows:
  - "Diajukan" entry with timestamp
  - "oleh [User Name]"
  - Note: "Request dibuat"
- [ ] Attachments card shows:
  - File list with icons
  - File names, sizes, upload dates
  - Download button for each file
- [ ] Click download button → File downloads correctly
- [ ] "Kembali ke Daftar Request" button works

**Expected Result**: All information displayed correctly, file download works

---

### ✅ 8. Request List Page
- [ ] Navigate to "DevTI Request" from sidebar
- [ ] Page shows "DevTI Request" title
- [ ] "Request Baru" button visible in header
- [ ] Filter buttons displayed: Semua, Submitted, Verifikasi, Disetujui, Dikerjakan, Selesai, Ditolak
- [ ] "Semua" filter active by default
- [ ] Search box displayed with placeholder text
- [ ] Table shows created request with columns:
  - No. Request (REQ-YYYYMMDD-XXX)
  - Tipe (badge)
  - Judul
  - Status (badge)
  - Prioritas (-)
  - Tanggal
  - Aksi (Lihat button)
- [ ] Click "Submitted" filter → Table updates to show only submitted
- [ ] Click "Selesai" filter → Empty state shows (no completed requests yet)
- [ ] Click "Semua" → All requests shown again
- [ ] Enter request number in search → Table filters
- [ ] Enter partial title in search → Table filters
- [ ] Clear search → Shows all requests
- [ ] Click "Lihat" button → Opens request detail

**Expected Result**: Filters work, search works, navigation works

---

### ✅ 9. Edge Cases & Error Handling
- [ ] Test: Try to submit form without required fields → Shows validation errors
- [ ] Test: Try to upload 6 files → Shows "Maksimal 5 file" alert
- [ ] Test: Try to upload invalid file type → Shows error message
- [ ] Test: Navigate away from form mid-way → Data lost (no draft save)
- [ ] Test: Logout and login again → Previous requests visible
- [ ] Test: Try to access other user's request URL → Shows 403 error
- [ ] Test: Invalid request ID URL (/requests/99999) → Shows error

**Expected Result**: All validations work, proper error messages shown

---

### ✅ 10. Responsive Design
- [ ] Resize browser to mobile width (< 768px)
- [ ] Sidebar hides, hamburger menu appears
- [ ] Click hamburger → Drawer opens
- [ ] Navigation menu functional on mobile
- [ ] Form fields stack vertically
- [ ] Table scrolls horizontally
- [ ] Buttons full-width on mobile
- [ ] All features accessible on mobile

**Expected Result**: Responsive design works on all screen sizes

---

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Authentication & Navigation | ⏳ | |
| 2. Step 1: Jenis Permintaan | ⏳ | |
| 3. Step 2: Informasi Dasar | ⏳ | |
| 4. Step 3: Detail Kebutuhan | ⏳ | |
| 5. Step 4: Lampiran | ⏳ | |
| 6. Step 5: Review & Kirim | ⏳ | |
| 7. Request Detail Page | ⏳ | |
| 8. Request List Page | ⏳ | |
| 9. Edge Cases | ⏳ | |
| 10. Responsive Design | ⏳ | |

**Overall Status**: ⏳ Ready for Testing

---

## Issues Found
*(To be filled during testing)*

1. 
2. 
3. 

---

## Notes
- Server must be running: `npm run dev`
- Database must be seeded with test accounts
- Test with Chrome/Firefox for best compatibility
- Clear browser cache if seeing stale data
