# SIPPA Restructure - Decision Form

**Date:** _____________  
**Reviewer:** _____________  
**Role:** _____________

---

## Instructions

Dokumen ini berisi 9 pertanyaan kritis yang memerlukan keputusan sebelum implementasi dimulai. Silakan:
1. Baca setiap pertanyaan dengan seksama
2. Pilih opsi (beri tanda X atau lingkari)
3. Tambahkan notes jika ada pertimbangan khusus
4. Tanda tangan di bagian bawah

---

## SECTION A: Critical Decisions (Must Decide Before Phase 1)

### Question 1: Developer Role Assignment for Existing Users
**Context:** Ada developer yang sudah terdaftar di sistem. Mereka harus diberi role spesifik (SA/TW/BE/FE/QA/DM).

**Question:** Bagaimana cara assign role untuk existing developers?

- [ ] **Option A:** Admin manually assigns via UI (migration script creates pending list, admin fills in manually)
  - Pros: Accurate role assignment
  - Cons: Manual work required, takes time
  
- [ ] **Option B:** Auto-assign all to "BE" (Backend) as default, admin can change later
  - Pros: Quick, minimal manual work
  - Cons: May not reflect actual roles
  
- [ ] **Option C:** Migration script with mapping logic (try to infer from team history)
  - Pros: Semi-automated, reasonably accurate
  - Cons: Some manual verification still needed

**Selected Option:** ______

**Notes:**
```




```

---

### Question 2: Team Leader Permissions
**Context:** Admin akan assign "Team Leader" untuk setiap request. Team leader adalah koordinator project.

**Question:** Apakah team leader punya special permissions di sistem?

- [ ] **Option A:** No special permissions (just a label for coordination)
  - Team leader tidak bisa akses apapun di sistem
  - Hanya terlihat namanya sebagai "Team Leader"
  - Koordinasi dilakukan outside system
  
- [ ] **Option B:** Can view all team member progress and activities
  - Team leader bisa lihat progress semua team member
  - Bisa lihat history updates dari semua developer
  - Read-only access
  
- [ ] **Option C:** Can view AND update request status
  - Team leader bisa lihat + update
  - Bisa approve progress dari team member
  - Write access

**Selected Option:** ______

**Notes:**
```




```

---

### Question 3: Technical Writer Requirement
**Context:** Admin bisa assign Technical Writer untuk setiap request. TW bertugas bikin dokumentasi.

**Question:** Apakah Technical Writer WAJIB untuk semua requests?

- [ ] **Option A:** Required for ALL requests (NEW_APPLICATION and RFC)
  - Admin tidak bisa submit assignment tanpa pilih TW
  - Enforced di database dan UI
  
- [ ] **Option B:** Required only for NEW_APPLICATION (optional for RFC)
  - NEW_APPLICATION: TW wajib
  - RFC: TW optional
  
- [ ] **Option C:** Optional for all (admin decides based on complexity)
  - Admin bisa skip TW jika request simple
  - Warning message if not filled, tapi bisa proceed

**Selected Option:** ______

**Notes:**
```




```

---

## SECTION B: Important Decisions (Can decide during Phase 1-2)

### Question 4: Version Format Enforcement
**Context:** RFC request butuh version number baru (e.g., 1.2.3 → 1.2.4).

**Question:** Format versioning yang digunakan?

- [ ] **Option A:** Strict Semantic Versioning (x.y.z only)
  - Format: MAJOR.MINOR.PATCH (e.g., 1.2.3)
  - Validation enforces this format
  - User must follow semver rules
  
- [ ] **Option B:** Allow custom formats (e.g., 2024.1.0, v1.2, etc.)
  - Flexible versioning
  - Validation only checks: new > old
  - Example: 2024.1.0, v1.2, release-3

**Selected Option:** ______

**Notes:**
```




```

**Recommendation:** Option A (Semantic Versioning) lebih standard dan clear.

---

### Question 5: Developer Workload Limit
**Context:** Admin assign developers ke requests. Developer bisa punya multiple assignments bersamaan.

**Question:** Apakah ada limit maximum assignments per developer?

- [ ] **Option A:** No limit (admin's discretion)
  - Admin bebas assign banyak request ke 1 developer
  - No warning or blocking
  
- [ ] **Option B:** Soft limit with warning (e.g., 5 active assignments)
  - System shows warning jika developer sudah punya >= 5 active
  - Admin bisa proceed (just warning)
  - Example: "⚠️ Ahmad already has 5 active assignments"
  
- [ ] **Option C:** Hard limit blocks assignment (e.g., max 5 active)
  - System blocks assignment if developer >= 5 active
  - Admin must unassign from other request first

**Selected Option:** ______

**Soft Limit Number (if Option B):** ______ assignments

**Hard Limit Number (if Option C):** ______ assignments

**Notes:**
```




```

**Recommendation:** Option B with soft limit 5-7 assignments.

---

### Question 6: SLA Holiday Management
**Context:** System punya tabel `sla_holidays` untuk exclude hari libur dari perhitungan SLA.

**Question:** Siapa yang bisa manage (add/edit/delete) holidays?

- [ ] **Option A:** Only super admin (1-2 orang)
  - Restricted access
  - Prevent accidental changes
  
- [ ] **Option B:** All admins can manage
  - Semua user dengan role ADMIN bisa manage
  - Flexible
  
- [ ] **Option C:** Needs approval workflow
  - Admin propose holiday
  - Super admin approve
  - Two-step process

**Selected Option:** ______

**Notes:**
```




```

**Recommendation:** Option B (all admins) untuk simplicity, atau Option A jika concern about data integrity.

---

## SECTION C: Nice-to-Have Decisions (Can decide post-launch)

### Question 7: Additional Request Types
**Context:** Saat ini ada 2 request types: NEW_APPLICATION dan RFC.

**Question:** Apakah butuh request types tambahan?

- [ ] **Option A:** Stick to NEW_APPLICATION and RFC only
  - Simple, clear
  - Current requirement sufficient
  
- [ ] **Option B:** Add more types (check all that apply)
  - [ ] BUG_FIX (urgent fixes)
  - [ ] ENHANCEMENT (minor improvements)
  - [ ] MAINTENANCE (routine updates)
  - [ ] HOTFIX (critical production fixes)
  - [ ] Other: _______________________

**Selected Option:** ______

**Notes:**
```




```

**Recommendation:** Start with Option A, add more later jika needed.

---

### Question 8: Version History Display
**Context:** Setiap aplikasi punya version history dari RFCs yang completed.

**Question:** Apakah butuh dedicated page untuk lihat version history per application?

- [ ] **Option A:** Yes, create dedicated version history page
  - Page: `/admin/settings/applications/{id}/history`
  - Show: Timeline of all versions
  - Show: All RFCs related to this app
  
- [ ] **Option B:** No, sufficient to filter requests list by application
  - User can filter requests by application_id
  - See all RFCs in standard request list
  - No dedicated page needed

**Selected Option:** ______

**Notes:**
```




```

**Recommendation:** Option B for v1.0, Option A for v1.1 if user feedback requests it.

---

### Question 9: Developer Performance Metrics
**Context:** System bisa track developer performance (completion time, SLA met rate, etc).

**Question:** Apakah include individual developer performance metrics di reports?

**Privacy & HR Consideration:** Metrics bisa digunakan untuk evaluasi kinerja (sensitive).

- [ ] **Option A:** Yes, include in admin reports (visible to admins only)
  - Report: Developer Workload History
  - Metrics: Avg completion time, SLA met %, total requests
  - Use for: Resource planning, workload balancing
  
- [ ] **Option B:** No, only show aggregate metrics (team-level only)
  - Report: Overall developer role distribution
  - No individual tracking
  - Privacy preserved
  
- [ ] **Option C:** Include but anonymized (no names, only roles)
  - Metrics by role: "Backend developers avg 10 days"
  - No individual identification

**Selected Option:** ______

**Notes:**
```




```

**Recommendation:** Option A for better resource planning, tapi perlu policy jelas tentang penggunaan data.

---

## SECTION D: Timeline & Resources

### Timeline Acceptance
Based on implementation plan (7-9 weeks), apakah timeline acceptable?

- [ ] **Accept as-is** (7-9 weeks)
- [ ] **Request faster** (target: _____ weeks) - may need more resources
- [ ] **Can extend** (up to: _____ weeks) - if needed for quality

**Selected:** ______

**Notes:**
```




```

---

### Resource Allocation
Apakah resources berikut available?

Development Team:
- [ ] Backend Developer (1-2 person)
- [ ] Frontend Developer (1-2 person)
- [ ] Database Admin (1 person, part-time OK)
- [ ] QA Tester (1 person, part-time OK)

Environment:
- [ ] Staging environment (for testing)
- [ ] Production database backup capability
- [ ] Rollback plan ready

Budget:
- [ ] Budget approved for development hours
- [ ] Budget for potential downtime (maintenance window)

**Notes:**
```




```

---

## SECTION E: Risk Acceptance

I have read and understand the following risks:

- [ ] **Data Migration Risk:** Existing data will be migrated. Full backup will be taken. Rollback plan ready.
- [ ] **Downtime Risk:** ~2-4 hours maintenance window needed for production deployment.
- [ ] **User Retraining:** Users need to learn new request form (single page) and version validation.
- [ ] **Admin Workflow Change:** Assignment process is more detailed (more fields to fill).
- [ ] **Developer Scope Change:** Developers will be assigned specific roles (may require re-organization).

**Risk Acceptance Signature:** ___________________ Date: ________

---

## SECTION F: Final Approval

### Overall Decision

- [ ] **APPROVED** - Proceed with implementation as planned
  - I approve the restructure plan
  - All critical decisions made (Q1-Q3)
  - Resources allocated
  - Timeline accepted
  - Risks accepted
  
- [ ] **APPROVED WITH CHANGES** - Proceed with modifications
  - Changes requested (specify below)
  - Re-review after changes
  
- [ ] **NOT APPROVED** - Do not proceed
  - Reason (specify below)

**Selected:** ______

**Changes or Reasons:**
```




```

---

### Signatures

**Product Owner / Stakeholder:**

Name: _______________________
Signature: _______________________
Date: _______________________

**Technical Lead:**

Name: _______________________
Signature: _______________________
Date: _______________________

**Project Manager:**

Name: _______________________
Signature: _______________________
Date: _______________________

---

## Next Steps After Approval

1. ✅ Save this completed form to project records
2. ✅ Communicate decisions to development team
3. ✅ Schedule kick-off meeting (Phase 1 start)
4. ✅ Setup staging environment
5. ✅ Proceed with Phase 1: Database Foundation

---

**Form Version:** 1.0  
**Last Updated:** 2026-10-06  
**Status:** Pending Completion

---

**Terima kasih atas reviewnya!** 🙏

Jika ada pertanyaan atau membutuhkan klarifikasi, silakan hubungi development team.
