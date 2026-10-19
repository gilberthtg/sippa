import { config } from 'dotenv';
import { db } from './index';
import { roles, priorities, units, users, slaPolicies, requests, requestStatusHistories, requestTeamAssignments, requestProgress, requestAttachments, requestApplications, documentTypes, serviceDocumentTypes } from './schema';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

// Load environment variables from .env.local or .env
config({ path: '.env.local' });
config({ path: '.env' });

async function seed() {
  console.log('🌱 Seeding database...');

  // Clean up existing test data
  console.log('  → Cleaning up existing test data...');

  // Delete in order to respect foreign key constraints
  await db.delete(requestProgress).execute();
  await db.delete(requestTeamAssignments).execute();
  await db.delete(requestStatusHistories).execute();
  await db.delete(requestAttachments).execute();

  // Drop deprecated request_assignments table if exists
  try {
    await db.execute('DELETE FROM request_assignments');
  } catch (e) {
    // Table might not exist, ignore error
  }

  await db.delete(requests).execute();
  await db.delete(requestApplications).execute(); // Clear request applications
  await db.delete(slaPolicies).execute();

  // Seed Roles
  console.log('  → Seeding roles...');
  await db.insert(roles).values([
    { id: 1, code: 'user', name: 'User', description: 'Regular user who submits requests' },
    { id: 2, code: 'admin', name: 'Admin', description: 'Administrator who manages requests' },
    { id: 3, code: 'developer', name: 'Developer', description: 'Developer who works on requests' },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

  // Seed Priorities
  console.log('  → Seeding priorities...');
  await db.insert(priorities).values([
    { id: 1, code: 'low', name: 'Low', sortOrder: 1, isActive: true },
    { id: 2, code: 'medium', name: 'Medium', sortOrder: 2, isActive: true },
    { id: 3, code: 'high', name: 'High', sortOrder: 3, isActive: true },
    { id: 4, code: 'critical', name: 'Critical', sortOrder: 4, isActive: false },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

  // Seed Units
  console.log('  → Seeding units...');
  await db.insert(units).values([
    { id: 1, code: 'DIR-001', name: 'DIREKTORAT AKADEMIK' },
    { id: 2, code: 'DIR-002', name: 'DIREKTORAT SUMBER DAYA MANUSIA' },
    { id: 3, code: 'DIR-003', name: 'DIREKTORAT KEUANGAN' },
    { id: 4, code: 'DIR-004', name: 'DIREKTORAT KEMAHASISWAAN' },
    { id: 5, code: 'DIR-005', name: 'DIREKTORAT PEMASARAN DAN ADMISI' },
    { id: 6, code: 'DIR-006', name: 'DIREKTORAT PENELITIAN DAN PENGABDIAN MASYARAKAT' },
    { id: 7, code: 'DIR-007', name: 'DIREKTORAT KERJASAMA STRATEGIS DAN INTERNATIONAL OFFICE' },
    { id: 8, code: 'DIR-008', name: 'DIREKTORAT BANDUNG TECHNO PARK' },
    { id: 9, code: 'DIR-009', name: 'DIREKTORAT SEKRETARIAT DAN PERENCANAAN STRATEGIS' },
    { id: 10, code: 'DIR-010', name: 'DIREKTORAT ASET DAN SUSTAINABILITY' },
    { id: 11, code: 'DIR-011', name: 'DIREKTORAT PASCA SARJANA DAN ADVANCE LEARNING' },
    { id: 12, code: 'DIR-012', name: 'DIREKTORAT PENGELOLA DANA ABADI' },
  ]).onDuplicateKeyUpdate({
    set: {
      name: sql`VALUES(name)`,
    },
  });

  // Seed Document Types
  console.log('  → Seeding document types...');
  await db.insert(documentTypes).values([
    { id: 1, name: 'Permintaan Aplikasi', sortOrder: 1, isActive: true },
    { id: 2, name: 'Project Plan', sortOrder: 2, isActive: true },
    { id: 3, name: 'Spesifikasi dan Desain Kebutuhan Perangkat Lunak (SDKPL)', sortOrder: 3, isActive: true },
    { id: 4, name: 'Appendix', sortOrder: 4, isActive: true },
    { id: 5, name: 'Notulensi', sortOrder: 5, isActive: true },
    { id: 6, name: 'User Acceptance Testing (UAT)', sortOrder: 6, isActive: true },
    { id: 7, name: 'Security Test', sortOrder: 7, isActive: true },
    { id: 8, name: 'Berita Acara Serah Terima (BAST)', sortOrder: 8, isActive: true },
    { id: 9, name: 'User Manual', sortOrder: 9, isActive: true },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

  // Seed Service Document Types
  console.log('  → Seeding service document types...');
  const pengembanganDocs = [1, 2, 3, 5, 6, 7, 8, 9];
  for (let i = 0; i < pengembanganDocs.length; i++) {
    await db.insert(serviceDocumentTypes).values({
      requestType: 'new_application',
      documentTypeId: pengembanganDocs[i],
      isRequired: true,
      sortOrder: i + 1,
    }).onDuplicateKeyUpdate({ set: { isRequired: sql`VALUES(is_required)` } });
  }
  const rfcDocs = [1, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < rfcDocs.length; i++) {
    await db.insert(serviceDocumentTypes).values({
      requestType: 'rfc',
      documentTypeId: rfcDocs[i],
      isRequired: true,
      sortOrder: i + 1,
    }).onDuplicateKeyUpdate({ set: { isRequired: sql`VALUES(is_required)` } });
  }

  // Seed Users
  console.log('  → Seeding users...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  await db.insert(users).values([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@sippa.local',
      passwordHash: defaultPassword,
      roleId: 2, // admin
      unitId: 1,
      phone: '081234567890',
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'user@sippa.local',
      passwordHash: defaultPassword,
      roleId: 1, // user
      unitId: 2,
      phone: '081234567891',
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'user2@sippa.local',
      passwordHash: defaultPassword,
      roleId: 1, // user
      unitId: 3,
      phone: '081234567892',
    },
    {
      id: 4,
      name: 'Bob Wilson',
      email: 'user3@sippa.local',
      passwordHash: defaultPassword,
      roleId: 1, // user
      unitId: 4,
      phone: '081234567893',
    },
    // Developer - System Analyst
    {
      id: 10,
      name: 'Ahmad Fauzi',
      email: 'dev.sa@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 1, // SA
      unitId: 1,
      phone: '081234567910',
    },
    // Developer - Technical Writer
    {
      id: 11,
      name: 'Siti Nurhaliza',
      email: 'dev.tw@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 2, // TW
      unitId: 1,
      phone: '081234567911',
    },
    {
      id: 12,
      name: 'Dewi Lestari',
      email: 'dev.tw2@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 2, // TW
      unitId: 1,
      phone: '081234567912',
    },
    // Developer - Back End
    {
      id: 13,
      name: 'Budi Santoso',
      email: 'dev.be@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 3, // BE
      unitId: 1,
      phone: '081234567913',
    },
    {
      id: 14,
      name: 'Andi Wijaya',
      email: 'dev.be2@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 3, // BE
      unitId: 1,
      phone: '081234567914',
    },
    // Developer - Front End
    {
      id: 15,
      name: 'Rina Kusuma',
      email: 'dev.fe@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 4, // FE
      unitId: 1,
      phone: '081234567915',
    },
    {
      id: 16,
      name: 'Dian Pratama',
      email: 'dev.fe2@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 4, // FE
      unitId: 1,
      phone: '081234567916',
    },
    // Developer - Quality Assurance
    {
      id: 17,
      name: 'Yudi Setiawan',
      email: 'dev.qa@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 5, // QA
      unitId: 1,
      phone: '081234567917',
    },
    {
      id: 18,
      name: 'Maya Sari',
      email: 'dev.qa2@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 5, // QA
      unitId: 1,
      phone: '081234567918',
    },
    // Developer - Data Management
    {
      id: 19,
      name: 'Rudi Hartono',
      email: 'dev.dm@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 6, // DM
      unitId: 1,
      phone: '081234567919',
    },
    {
      id: 20,
      name: 'Lisa Anggraini',
      email: 'dev.dm2@sippa.local',
      passwordHash: defaultPassword,
      roleId: 3, // developer
      developerRoleId: 6, // DM
      unitId: 1,
      phone: '081234567920',
    },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

  // Seed Request Applications (for RFC testing)
  console.log('  → Seeding request applications...');
  await db.insert(requestApplications).values([
    {
      id: 1,
      applicationName: 'SIPPA Core',
      description: 'Sistem Informasi Permintaan Pengembangan Aplikasi - Platform utama untuk manajemen request pengembangan',
      currentVersion: '1.2.0',
      createdBy: 1,
    },
    {
      id: 2,
      applicationName: 'HR Management System',
      description: 'Sistem manajemen sumber daya manusia untuk mengelola data karyawan, absensi, dan penggajian',
      currentVersion: '2.5.3',
      createdBy: 1,
    },
    {
      id: 3,
      applicationName: 'Finance Portal',
      description: 'Portal keuangan untuk manajemen budget, invoice, dan laporan keuangan',
      currentVersion: '1.0.8',
      createdBy: 1,
    },
    {
      id: 4,
      applicationName: 'Asset Tracking',
      description: 'Aplikasi untuk tracking dan manajemen aset perusahaan',
      currentVersion: '3.1.2',
      createdBy: 1,
    },
    {
      id: 5,
      applicationName: 'Document Management',
      description: 'Sistem manajemen dokumen dengan fitur versioning dan workflow approval',
      currentVersion: '1.4.0',
      createdBy: 1,
    },
  ]).onDuplicateKeyUpdate({ set: { applicationName: sql`VALUES(application_name)` } });

  // Seed SLA Policies
  console.log('  → Seeding SLA policies...');
  await db.insert(slaPolicies).values([
    { requestType: 'new_application', priorityId: 1, targetBusinessDays: 135 },  // Low: 7 days
    { requestType: 'new_application', priorityId: 2, targetBusinessDays: 135 },  // Medium: 5 days
    { requestType: 'new_application', priorityId: 3, targetBusinessDays: 135 },  // High: 3 days
    // { requestType: 'new_application', priorityId: 4, targetBusinessDays: 2 },  // Critical: 2 days
    { requestType: 'rfc', priorityId: 1, targetBusinessDays: 44 },  // Low: 4 days
    { requestType: 'rfc', priorityId: 2, targetBusinessDays: 44 },  // Medium: 3 days
    { requestType: 'rfc', priorityId: 3, targetBusinessDays: 44 },  // High: 2 days
    // { requestType: 'rfc', priorityId: 4, targetBusinessDays: 1 },  // Critical: 1 day
  ]).onDuplicateKeyUpdate({ set: { targetBusinessDays: sql`VALUES(target_business_days)` } });

  // Seed Completed Requests for Testing Reports
  console.log('  → Seeding completed requests...');

  // Helper to create dates in 2026
  const makeDate = (month: number, day: number, hour = 9) => new Date(2026, month - 1, day, hour, 0, 0);

  const completedRequests = [
    // Q1 2026 - 6 requests
    { no: 1, type: 'new_application', priority: 2, unit: 2, month: 1, day: 15, duration: 110 }, // Met
    { no: 2, type: 'rfc', priority: 1, unit: 3, month: 1, day: 28, duration: 90 }, // Met
    { no: 3, type: 'new_application', priority: 3, unit: 4, month: 2, day: 10, duration: 80 }, // Exceeded
    { no: 4, type: 'rfc', priority: 2, unit: 2, month: 2, day: 20, duration: 65 }, // Met
    { no: 5, type: 'new_application', priority: 4, unit: 3, month: 3, day: 5, duration: 45 }, // Met
    { no: 6, type: 'rfc', priority: 3, unit: 4, month: 3, day: 25, duration: 50 }, // Exceeded

    // Q2 2026 - 7 requests
    { no: 7, type: 'new_application', priority: 1, unit: 2, month: 4, day: 8, duration: 160 }, // Met
    { no: 8, type: 'rfc', priority: 2, unit: 3, month: 4, day: 18, duration: 70 }, // Met
    { no: 9, type: 'new_application', priority: 3, unit: 4, month: 5, day: 5, duration: 68 }, // Met
    { no: 10, type: 'rfc', priority: 4, unit: 2, month: 5, day: 15, duration: 22 }, // Met
    { no: 11, type: 'new_application', priority: 2, unit: 3, month: 5, day: 28, duration: 130 }, // Exceeded
    { no: 12, type: 'rfc', priority: 1, unit: 4, month: 6, day: 10, duration: 95 }, // Met
    { no: 13, type: 'new_application', priority: 4, unit: 2, month: 6, day: 25, duration: 40 }, // Met

    // Q3 2026 - 6 requests
    { no: 14, type: 'rfc', priority: 3, unit: 3, month: 7, day: 8, duration: 55 }, // Exceeded
    { no: 15, type: 'new_application', priority: 2, unit: 4, month: 7, day: 20, duration: 115 }, // Met
    { no: 16, type: 'rfc', priority: 2, unit: 2, month: 8, day: 5, duration: 68 }, // Met
    { no: 17, type: 'new_application', priority: 1, unit: 3, month: 8, day: 18, duration: 165 }, // Met
    { no: 18, type: 'rfc', priority: 4, unit: 4, month: 9, day: 3, duration: 20 }, // Met
    { no: 19, type: 'new_application', priority: 3, unit: 2, month: 9, day: 20, duration: 75 }, // Exceeded

    // Q4 2026 - 6 requests (future dates but marked as completed for testing)
    { no: 20, type: 'rfc', priority: 1, unit: 3, month: 10, day: 10, duration: 92 }, // Met
    { no: 21, type: 'new_application', priority: 4, unit: 4, month: 10, day: 25, duration: 52 }, // Exceeded
    { no: 22, type: 'rfc', priority: 2, unit: 2, month: 11, day: 8, duration: 70 }, // Met
    { no: 23, type: 'new_application', priority: 3, unit: 3, month: 11, day: 20, duration: 70 }, // Met
    { no: 24, type: 'rfc', priority: 3, unit: 4, month: 12, day: 5, duration: 46 }, // Met
    { no: 25, type: 'new_application', priority: 1, unit: 2, month: 12, day: 20, duration: 170 }, // Exceeded
  ];

  for (const req of completedRequests) {
    const submittedAt = makeDate(req.month, req.day - Math.floor(req.duration / 24) - 1);
    const approvedAt = new Date(submittedAt.getTime() + (8 * 60 * 60 * 1000)); // 8 hours later
    const assignedAt = new Date(approvedAt.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
    const startedAt = new Date(assignedAt.getTime() + (4 * 60 * 60 * 1000)); // 4 hours later
    const completedAt = makeDate(req.month, req.day);

    const targetSlaHours = req.type === 'new_application'
      ? [168, 120, 72, 48][req.priority - 1]
      : [96, 72, 48, 24][req.priority - 1];

    const slaMet = req.duration <= targetSlaHours;

    const [result] = await db.insert(requests).values({
      requestNo: `REQ-2026${String(req.month).padStart(2, '0')}${String(req.day).padStart(2, '0')}-${String(req.no).padStart(3, '0')}`,
      requestType: req.type as 'new_application' | 'rfc',
      title: `${req.type === 'new_application' ? 'New Application' : 'RFC'} Request ${req.no}`,
      description: `Test request for reporting - ${req.type} with ${['low', 'medium', 'high', 'critical'][req.priority - 1]} priority`,
      businessNeed: 'Business need description for testing',
      objective: 'Objective description for testing',
      expectedOutput: 'Expected output description for testing',
      urgency: req.priority <= 2 ? 'low' : req.priority === 3 ? 'medium' : 'high',
      requesterId: 2, // John Doe (user)
      requesterName: 'John Doe',
      requesterEmail: 'user@sippa.local',
      requesterUnitId: req.unit,
      requesterPhone: '081234567891',
      priorityId: req.priority,
      status: 'completed',
      submittedAt,
      approvedAt,
      assignedAt,
      startedAt,
      completedAt,
      targetSlaHours,
      actualDurationHours: req.duration,
      slaMet,
      completionNote: `Completed successfully - SLA ${slaMet ? 'met' : 'exceeded'}`,
    });

    const requestId = Number(result.insertId);

    // Add status histories
    await db.insert(requestStatusHistories).values([
      {
        requestId,
        fromStatus: null,
        toStatus: 'submitted',
        changedBy: 2,
        changedByName: 'John Doe',
        createdAt: submittedAt,
      },
      {
        requestId,
        fromStatus: 'submitted',
        toStatus: 'verification',
        changedBy: 1,
        changedByName: 'Admin User',
        createdAt: new Date(submittedAt.getTime() + (2 * 60 * 60 * 1000)),
      },
      {
        requestId,
        fromStatus: 'verification',
        toStatus: 'approved',
        changedBy: 1,
        changedByName: 'Admin User',
        createdAt: approvedAt,
      },
      {
        requestId,
        fromStatus: 'approved',
        toStatus: 'assigned',
        changedBy: 1,
        changedByName: 'Admin User',
        createdAt: assignedAt,
      },
      {
        requestId,
        fromStatus: 'assigned',
        toStatus: 'in_progress',
        changedBy: 3,
        changedByName: 'Developer One',
        createdAt: startedAt,
      },
      {
        requestId,
        fromStatus: 'in_progress',
        toStatus: 'completed',
        changedBy: 3,
        changedByName: 'Developer One',
        createdAt: completedAt,
      },
    ]);

    // Add assignment - TODO: Update to requestTeamAssignments in Phase 2
    /*
    await db.insert(requestTeamAssignments).values({
      requestId,
      assignedUserId: 3,
      developerRoleId: 3, // Backend developer
      assignedBy: 1,
      assignedAt,
    });
    */

    // Add progress updates
    const progressDuration = completedAt.getTime() - startedAt.getTime();
    await db.insert(requestProgress).values([
      {
        requestId,
        progressPercent: 25,
        updateNote: 'Started working on the request',
        updatedBy: 3,
        updatedByName: 'Developer One',
        createdAt: new Date(startedAt.getTime() + progressDuration * 0.2),
      },
      {
        requestId,
        progressPercent: 50,
        updateNote: 'Development in progress',
        updatedBy: 3,
        updatedByName: 'Developer One',
        createdAt: new Date(startedAt.getTime() + progressDuration * 0.5),
      },
      {
        requestId,
        progressPercent: 75,
        updateNote: 'Testing phase',
        updatedBy: 3,
        updatedByName: 'Developer One',
        createdAt: new Date(startedAt.getTime() + progressDuration * 0.75),
      },
      {
        requestId,
        progressPercent: 100,
        updateNote: 'Completed and delivered',
        updatedBy: 3,
        updatedByName: 'Developer One',
        createdAt: completedAt,
      },
    ]);
  }

  console.log('✅ Seeding completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@sippa.local / password123');
  console.log('  User: user@sippa.local / password123');
  console.log('  Developer: dev@sippa.local / password123');
  console.log('');
  console.log('📊 Report Data:');
  console.log('  - 8 SLA policies created');
  console.log('  - 5 request applications created');
  console.log('  - 25 completed requests created');
  console.log('  - Distribution: Q1(6), Q2(7), Q3(6), Q4(6)');
  console.log('  - Types: 13 New Application, 12 RFC');
  console.log('  - SLA: 18 met (72%), 7 exceeded (28%)');
  console.log('');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
