# SIPPA Restructure Summary

**Created:** 2026-10-06  
**Status:** DRAFT - Awaiting Stakeholder Approval  
**Estimated Implementation:** 7-9 weeks (10 phases)

---

## Executive Summary

Dokumen ini merupakan ringkasan dari rencana restrukturisasi aplikasi SIPPA berdasarkan requirement baru yang mencakup:
1. Perubahan struktur database menggunakan `db.pdm` sebagai referensi
2. Flow aplikasi yang disederhanakan untuk User, Admin, dan Developer
3. Role developer yang lebih spesifik (SA, TW, BE, FE, QA, DM)
4. Perhitungan SLA menggunakan hari kerja (business days)

---

## Quick Reference - 3 Main Documents

### 1. RESTRUCTURE_PLAN.md (Overview)
- **Purpose:** High-level plan perubahan
- **Content:** 11 phases perubahan, flow baru, business rules
- **Target Audience:** Stakeholders, Product Owner, Technical Lead
- **Read time:** ~30 minutes

### 2. DATABASE_NEW_SCHEMA.md (Technical Spec)
- **Purpose:** Detail spesifikasi database schema
- **Content:** 15 tabel (4 baru, 4 update, 2 hapus, 5 no change)
- **Target Audience:** Database Admin, Backend Developer
- **Read time:** ~45 minutes

### 3. IMPLEMENTATION_PHASES.md (Action Plan)
- **Purpose:** Step-by-step implementation guide
- **Content:** 10 phases dengan 500+ tasks
- **Target Audience:** Development Team, Project Manager
- **Read time:** ~60 minutes

---

## What's Changing? (Summary)

### Database Changes

#### New Tables (4)
1. **developer_roles** - SA, TW, BE, FE, QA, DM
2. **request_applications** - Master data aplikasi (auto-created from NEW_APPLICATION)
3. **sla_holidays** - Hari libur untuk perhitungan business days
4. **request_team_assignments** - Assignment individual dengan role

#### Updated Tables (4)
1. **users** → +developer_role_id (required for developers)
2. **requests** → +8 fields (application_id, requested_version, devti_urusan, technical_writer_id, team_leader_id, dll)
3. **sla_policies** → target_hours → target_business_days
4. **request_status_histories** → +actor_role, +metadata (JSON)

#### Removed Tables (2)
1. ~~teams~~ → Tidak digunakan lagi (individual assignment)
2. ~~team_members~~ → Tidak digunakan lagi

#### No Change (5)
- roles
- units
- priorities
- request_attachments
- request_progress
- notifications
- audit_logs

---

## Flow Changes Summary

### 1. Role User - Request Form (SIMPLIFIED)

#### Before (Multi-step)
```
Step 1: Jenis Permintaan
Step 2: Informasi Permintaan  
Step 3: Detail Kebutuhan
Step 4: Lampiran
Step 5: Review & Kirim
```

#### After (Single Page)
```
[Single Page Form]
├─ Section 1: Jenis Permintaan (Radio: NEW_APPLICATION / RFC)
├─ Section 2: Informasi Aplikasi (Conditional)
│   ├─ If NEW_APPLICATION: Title + Description
│   └─ If RFC: Application Dropdown + Version Input + Validation
├─ Section 3: Detail Kebutuhan  
├─ Section 4: Lampiran
└─ Section 5: Review & Submit
```

**Key Changes:**
- ✅ Single page dengan progressive disclosure
- ✅ NEW_APPLICATION: Version default "1.0.0" (hidden from user)
- ✅ RFC: Pilih aplikasi dari dropdown (hanya approved apps)
- ✅ RFC: Version validation (must be > current_version)
- ✅ Real-time validation with helpful error messages

#### Version Validation Example
```
Current Version: 1.2.3
User enters: 1.2.3 ❌ Error: "Version must be greater than 1.2.3"
User enters: 1.2.2 ❌ Error: "Version must be greater than 1.2.3"
User enters: 1.2.4 ✅ Valid (patch bump)
User enters: 1.3.0 ✅ Valid (minor bump)
User enters: 2.0.0 ✅ Valid (major bump)
```

---

### 2. Role Admin - Assignment (ENHANCED)

#### Before (Simple)
```
Request → Approve → Assign Team (pilih 1 team) → Done
```

#### After (Detailed)
```
Request → Verify → Approve → Assignment Form:
├─ Set Priority (High/Medium/Low)
├─ DevTI Urusan (text input)
├─ Ketua Tim (dropdown: semua user)
├─ Technical Writer (dropdown: developer_role = TW only)
├─ Assign Developers (multi-select with role badges)
│   ├─ ☑ Ahmad (BE)
│   ├─ ☑ Siti (FE)
│   ├─ ☑ Budi (QA)
│   └─ ☐ Dewi (SA)
├─ SLA Target (auto-calculated: X business days)
└─ Submit → Notifications sent to all assigned
```

**Key Changes:**
- ✅ Individual assignment (not team)
- ✅ Multiple developers with different roles
- ✅ Dedicated Technical Writer field
- ✅ Team Leader field (any user)
- ✅ DevTI Urusan tracking
- ✅ SLA auto-calculated based on priority + request type
- ✅ Developer workload view to help distribute load

---

### 3. Role Developer - Scope (SPECIALIZED)

#### Before
```
Developer → Generic role → Assigned to team → See all team requests
```

#### After
```
Developer → Specific role (SA/TW/BE/FE/QA/DM) → Individual assignment → See only my assignments

Dashboard:
├─ Role Badge: "Backend Developer 🔹"
├─ My Assignments (only where I'm assigned)
└─ Team View on each request:
    ├─ Ahmad (BE) ← You
    ├─ Siti (FE)
    └─ Budi (QA)
```

**Key Changes:**
- ✅ 1 developer = 1 specific role (SA, TW, BE, FE, QA, or DM)
- ✅ Role badge visible everywhere
- ✅ Team composition shown in request detail
- ✅ See who you're working with (collaboration)
- ✅ Role-specific UI hints (future)

---

### 4. SLA Calculation (BUSINESS DAYS)

#### Before
```
SLA = Calendar hours (24/7)
Start: submitted_at
End: completed_at
Calculation: end - start (in hours)
```

#### After
```
SLA = Business days (Mon-Fri only)
Start: submitted_at
End: completed_at
Exclude: Weekends (Sat, Sun) + Holidays (from sla_holidays table)

Example:
Submitted: Friday, Jan 10, 2024 (start counting)
Weekend: Sat-Sun (excluded)
Monday Jan 13: Day 2
Holiday: Jan 15 (excluded)
Completed: Jan 16: Total = 4 business days
```

**Key Changes:**
- ✅ Business days instead of calendar hours
- ✅ Weekends excluded automatically
- ✅ Holidays excluded from sla_holidays table
- ✅ More accurate and fair SLA tracking
- ✅ Admin can manage holidays

---

## Data Model Changes Visualized

### User → Developer Role Relationship

```
┌──────────────┐       1        ┌──────────────────┐
│    users     │ ────────────> │ developer_roles  │
│              │                │                  │
│ - id         │                │ - id             │
│ - name       │                │ - code (SA/TW... │
│ - email      │                │ - name           │
│ - role_id ─┐ │                └──────────────────┘
│            │ │
│ - developer_role_id ─┐
│   (nullable)         │
└──────────────────────┘
        │
        └─> If role = DEVELOPER, developer_role_id MUST be set
            (enforced by CHECK constraint)
```

### Request → Application Relationship

```
┌────────────────────────┐       0..1      ┌─────────────────────┐
│       requests         │ ──────────────> │ request_applications│
│                        │                 │                     │
│ - id                   │                 │ - id                │
│ - request_type ───┐    │                 │ - application_name  │
│ - application_id ─┤    │                 │ - current_version   │
│ - title           │    │                 └─────────────────────┘
│ - requested_version    │
└────────────────────────┘
        │
        └─> If NEW_APPLICATION: application_id = NULL, title required
            If RFC: application_id required, requested_version required
```

### Request → Team Assignment Relationship

```
┌──────────────────┐       1:N       ┌──────────────────────────┐
│    requests      │ ───────────────> │ request_team_assignments │
│                  │                  │                          │
│ - id             │                  │ - id                     │
│ - technical_     │                  │ - request_id             │
│   writer_id ─┐   │                  │ - assigned_user_id ──┐   │
│ - team_      │   │                  │ - developer_role_id  │   │
│   leader_id  │   │                  │ - assigned_by        │   │
└──────────────┼───┘                  └──────────────────────┼───┘
               │                                             │
               └──> Special assignments                     │
                    (1 TW, 1 Leader)                        │
                                                            │
                                        Multiple developers │
                                        with different roles│
                                        (3-5 typical)       │
```

---

## Migration Strategy Overview

### Phase 1: Backup
```
1. Full database backup
2. Copy production to staging
3. Test migration on staging first
```

### Phase 2: Create New Tables
```
CREATE TABLE developer_roles (...);
CREATE TABLE request_applications (...);
CREATE TABLE sla_holidays (...);
CREATE TABLE request_team_assignments (...);
```

### Phase 3: Alter Existing
```
ALTER TABLE users ADD developer_role_id INT;
ALTER TABLE requests ADD application_id INT;
ALTER TABLE requests ADD requested_version VARCHAR(50);
... (8 more columns)
```

### Phase 4: Migrate Data
```
-- Migrate users: assign developer_role
UPDATE users SET developer_role_id = ... WHERE role_id = DEVELOPER;

-- Create applications from approved NEW_APPLICATIONs
INSERT INTO request_applications SELECT ... FROM requests WHERE ...;

-- Migrate team assignments to individual assignments
INSERT INTO request_team_assignments SELECT ... FROM old structure;
```

### Phase 5: Cleanup
```
DROP TABLE teams;
DROP TABLE team_members;
-- Keep backups for safety
```

---

## Implementation Timeline

### Phase 1: Database Foundation (3-4 days)
- Create new tables
- Alter existing tables
- Setup constraints & indexes

### Phase 2: Core Models & Actions (4-5 days)
- TypeScript types
- Server actions
- Version validation logic
- SLA calculation utilities

### Phase 3: User Request Flow (5-6 days)
- Single-page form
- Version validation UI
- Application selector

### Phase 4: Admin Assignment Flow (5-6 days)
- Assignment form
- Developer workload view
- Notifications

### Phase 5: Developer Workspace (3-4 days)
- Role badges
- Team view
- Assignment list

### Phase 6: Reporting Updates (4-5 days)
- Business days SLA
- Developer role metrics

### Phase 7: Master Data UI (3-4 days)
- Developer roles management
- Applications view
- Holidays management

### Phase 8: Data Migration (2-3 days)
- Migrate users
- Migrate requests/applications
- Migrate assignments

### Phase 9: Testing & QA (5-7 days)
- Unit tests
- Integration tests
- E2E scenarios
- Performance testing
- Bug fixes

### Phase 10: Documentation & Deployment (2-3 days)
- Update docs
- Staging deployment
- Production deployment
- Training

**Total: 36-47 days (7-9 weeks)**

---

## Critical Success Factors

### Must Have
1. ✅ Zero data loss during migration
2. ✅ All existing requests preserved and accessible
3. ✅ Version validation prevents invalid RFCs
4. ✅ Business days calculation accurate
5. ✅ Developers can only have one role
6. ✅ Technical Writer role enforced

### Should Have
1. ✅ Page load < 2 seconds
2. ✅ Assignment flow < 5 minutes
3. ✅ User training completion > 80%
4. ✅ Support tickets < 5/week (first month)

### Nice to Have
1. 📋 Version history visualization
2. 📋 Developer workload analytics
3. 📋 Role-specific checklists
4. 📋 Team collaboration features

---

## Risks & Mitigation

### High Risk Items

#### 1. Data Migration
- **Risk:** Data loss or corruption
- **Mitigation:** Full backup, test on staging, dry-run, manual verification
- **Rollback:** Restore from backup

#### 2. Version Validation Complexity
- **Risk:** User confusion
- **Mitigation:** Clear errors, examples, tooltips, auto-suggest, training

#### 3. Assignment Flow Changes
- **Risk:** Admin adoption issues
- **Mitigation:** Training, walkthrough videos, helpdesk support, phased rollout

---

## Open Questions (Needs Stakeholder Decision)

### Critical (Need answer before implementation)

1. **Developer Role Assignment for Existing Users**
   - Q: How to assign roles to existing developers?
   - Options:
     - A) Admin manually assigns via UI
     - B) Auto-assign all to "BE" (Backend) as default
     - C) Migration script with mapping logic
   - **Decision needed:** [           ]

2. **Team Leader Permissions**
   - Q: Does team leader have special permissions?
   - Options:
     - A) No special permissions (just coordinator)
     - B) Can view all team member progress
     - C) Can update request status
   - **Decision needed:** [           ]

3. **Technical Writer Requirement**
   - Q: Is TW required for all requests?
   - Options:
     - A) Required for all requests
     - B) Required only for NEW_APPLICATION
     - C) Optional, admin decides
   - **Decision needed:** [           ]

### Important (Can be decided during implementation)

4. **Version Format**
   - Q: Enforce strict semantic versioning?
   - Options:
     - A) Strict (x.y.z only)
     - B) Allow custom (e.g., 2024.1.0)
   - **Decision needed:** [           ]

5. **Developer Workload Limit**
   - Q: Is there a max assignments per developer?
   - Options:
     - A) No limit (admin discretion)
     - B) Soft limit with warning (e.g., 5 active)
     - C) Hard limit blocks assignment
   - **Decision needed:** [           ]

6. **SLA Holiday Management**
   - Q: Who can manage holidays?
   - Options:
     - A) Only super admin
     - B) All admins
     - C) Needs approval workflow
   - **Decision needed:** [           ]

### Nice to Have (Can be decided post-launch)

7. **Additional Request Types**
   - Q: Beyond NEW_APPLICATION and RFC, need others?
   - Examples: BUG_FIX, ENHANCEMENT, MAINTENANCE
   - **Decision needed:** [           ]

8. **Version History Display**
   - Q: Need dedicated page for version history per app?
   - **Decision needed:** [           ]

9. **Developer Performance Metrics**
   - Q: Include individual developer performance in reports?
   - Privacy consideration
   - **Decision needed:** [           ]

---

## Next Steps (Action Items)

### Immediate (This Week)
- [ ] **Stakeholder Review:** Schedule meeting to review all 3 documents
- [ ] **Decision Meeting:** Get answers to 9 open questions
- [ ] **PDF Analysis:** Read `CP - Detail Aplikasi SIPPA.pdf` and `master.pdf` thoroughly
- [ ] **Approval:** Get sign-off on plan before implementation

### Week 1-2 (After Approval)
- [ ] **Phase 1 Start:** Database foundation
- [ ] **Setup Staging:** Prepare staging environment
- [ ] **Team Kick-off:** Brief development team

### Week 3-10 (Implementation)
- [ ] Execute Phases 1-10 as documented
- [ ] Weekly progress reports to stakeholders
- [ ] Continuous testing and feedback

### Post-Launch
- [ ] Week 1: Intensive monitoring
- [ ] Week 2-4: Support and bug fixes
- [ ] Month 2-3: Stabilization and optimization

---

## Contact & Review

### Document Authors
- AI Assistant (Kiro)
- Based on requirements from user

### Review Checklist
- [ ] Stakeholders reviewed RESTRUCTURE_PLAN.md
- [ ] Database team reviewed DATABASE_NEW_SCHEMA.md
- [ ] Development team reviewed IMPLEMENTATION_PHASES.md
- [ ] All 9 open questions answered
- [ ] Budget and timeline approved
- [ ] Risk assessment accepted
- [ ] Go/No-Go decision: [        ]

### Approval Signatures
- Product Owner: _________________ Date: _______
- Technical Lead: ________________ Date: _______
- Database Admin: ________________ Date: _______
- Project Manager: _______________ Date: _______

---

## Quick Start Guide

### For Stakeholders
1. Read this summary (10 minutes)
2. Review RESTRUCTURE_PLAN.md (30 minutes)
3. Provide decisions on open questions
4. Approve or request changes

### For Technical Team
1. Read this summary (10 minutes)
2. Read DATABASE_NEW_SCHEMA.md (45 minutes)
3. Read IMPLEMENTATION_PHASES.md (60 minutes)
4. Prepare questions for kick-off meeting

### For Project Manager
1. Read all 3 documents (2 hours)
2. Review timeline and resource allocation
3. Identify risks and dependencies
4. Prepare project plan

---

**Document Version:** 1.0  
**Status:** DRAFT - Awaiting Approval  
**Last Updated:** 2026-10-06

---

**Ready to proceed?** Get stakeholder approval and move to Phase 1!
