import { config } from 'dotenv';
import { db } from './index';
import { roles, priorities, units, users, slaPolicies, requests, requestStatusHistories, requestTeamAssignments, requestProgress, requestAttachments, requestApplications, requestDocuments, documentTypes, serviceDocumentTypes, devteamUnits } from './schema';
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
  await db.delete(requestDocuments).execute();

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

  // Seed DevTeam Units (DevTI Urusan)
  console.log('  → Seeding devteam units...');
  await db.insert(devteamUnits).values([
    { id: 1, name: 'URUSAN PENGEMBANGAN PRODUK TI AKADEMIK' },
    { id: 2, name: 'URUSAN PENGEMBANGAN PRODUK TI NON-AKADEMIK' },
    { id: 3, name: 'URUSAN PENGEMBANGAN TI STRATEGIS' },
  ]).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

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

  // Seed Real User Requests (replaces generated test data)
  console.log('  → Seeding real user requests...');

  // Long Lorem boilerplate used across request 1
  const LOREM = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library in London, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. It has survived not only many decades, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised thanks to these sheets and more recently with desktop publishing software like Aldus PageMaker and Microsoft Word including versions of Lorem Ipsum.";

  // Application master created from an approved NEW_APPLICATION (original id 7 kept)
  await db.insert(requestApplications).values({
    id: 7,
    applicationName: 'Lorem ipsum dolor sit amet.',
    description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum tempora ullam impedit distinctio nisi natus recusandae laboriosam ipsum quam tempore!',
    currentVersion: '1.0.0',
    createdBy: 2, // John Doe
    createdAt: new Date('2026-10-19T12:01:22'),
    updatedAt: new Date('2026-10-19T12:01:22'),
  }).onDuplicateKeyUpdate({ set: { applicationName: sql`VALUES(application_name)` } });

  // 5 real requests (renumbered from ids 181-185; devtiUrusanId old units id 10 mapped → 2)
  await db.insert(requests).values([
    {
      id: 1,
      requestNo: 'REQ-20261020-001',
      requestType: 'rfc',
      applicationId: 4, // Asset Tracking
      requestedVersion: '3.1.3',
      title: 'Asset Tracking',
      description: LOREM,
      businessNeed: LOREM,
      objective: LOREM,
      expectedOutput: LOREM,
      urgency: 'medium',
      requesterId: 2,
      requesterName: 'John Doe',
      requesterEmail: 'user@sippa.local',
      requesterUnitId: 2,
      requesterPhone: null,
      devtiUrusanId: 2,
      technicalWriterId: 12,
      teamLeaderId: 10,
      priorityId: 2,
      status: 'done',
      submittedAt: new Date('2026-10-19T12:08:10'),
      approvedAt: new Date('2026-10-19T12:09:31'),
      rejectedAt: null,
      assignedAt: new Date('2026-10-19T12:09:59'),
      startedAt: null,
      completedAt: new Date('2026-10-19T12:57:02'),
      targetSlaHours: 1056,
      actualDurationHours: 24,
      slaMet: true,
      slaPausedAt: null,
      slaPausedDurationHours: 0,
      rejectionNote: null,
      completionNote: null,
      onHoldReason: null,
      createdAt: new Date('2026-10-19T19:08:09'),
      updatedAt: new Date('2026-10-19T19:57:02'),
    },
    {
      id: 2,
      requestNo: 'REQ-20261021-001',
      requestType: 'rfc',
      applicationId: 5, // Document Management
      requestedVersion: '1.4.1',
      title: 'Document Management',
      description: 'Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing Testing',
      businessNeed: 'Tetsing',
      objective: 'Testing',
      expectedOutput: 'Testing',
      urgency: 'low',
      requesterId: 2,
      requesterName: 'John Doe',
      requesterEmail: 'user@sippa.local',
      requesterUnitId: 2,
      requesterPhone: '081234567890',
      devtiUrusanId: 2,
      technicalWriterId: 12,
      teamLeaderId: 10,
      priorityId: 2,
      status: 'done',
      submittedAt: new Date('2026-10-21T00:08:06'),
      approvedAt: new Date('2026-10-21T03:40:36'),
      rejectedAt: null,
      assignedAt: new Date('2026-10-21T03:44:29'),
      startedAt: null,
      completedAt: new Date('2026-10-21T04:04:45'),
      targetSlaHours: 1056,
      actualDurationHours: 24,
      slaMet: true,
      slaPausedAt: null,
      slaPausedDurationHours: 0,
      rejectionNote: null,
      completionNote: null,
      onHoldReason: null,
      createdAt: new Date('2026-10-21T07:08:06'),
      updatedAt: new Date('2026-10-21T11:04:44'),
    },
    {
      id: 3,
      requestNo: 'REQ-20261021-002',
      requestType: 'rfc',
      applicationId: 1, // SIPPA Core
      requestedVersion: '1.2.1',
      title: 'SIPPA Core',
      description: 'Penambahan fitur baru. Penambahan fitur baru. Penambahan fitur baru',
      businessNeed: null,
      objective: 'Penambahan fitur baru',
      expectedOutput: 'Fitur sesuai',
      urgency: 'high',
      requesterId: 2,
      requesterName: 'John Doe',
      requesterEmail: 'user@sippa.local',
      requesterUnitId: 2,
      requesterPhone: null,
      devtiUrusanId: 2,
      technicalWriterId: 12,
      teamLeaderId: 3,
      priorityId: 3,
      status: 'ongoing',
      submittedAt: new Date('2026-10-21T04:09:44'),
      approvedAt: new Date('2026-10-21T04:13:05'),
      rejectedAt: null,
      assignedAt: new Date('2026-10-21T04:16:12'),
      startedAt: null,
      completedAt: null,
      targetSlaHours: 1056,
      actualDurationHours: null,
      slaMet: null,
      slaPausedAt: null,
      slaPausedDurationHours: 0,
      rejectionNote: null,
      completionNote: null,
      onHoldReason: null,
      createdAt: new Date('2026-10-21T11:09:44'),
      updatedAt: new Date('2026-10-21T04:16:12'),
    },
    {
      id: 4,
      requestNo: 'REQ-20261021-003',
      requestType: 'rfc',
      applicationId: 3, // Finance Portal
      requestedVersion: '1.0.9',
      title: 'Finance Portal',
      description: 'testing RFC, testing RFC,testing RFC, testing RFC, testing RFC',
      businessNeed: null,
      objective: null,
      expectedOutput: null,
      urgency: 'low',
      requesterId: 2,
      requesterName: 'John Doe',
      requesterEmail: 'user@sippa.local',
      requesterUnitId: 2,
      requesterPhone: null,
      devtiUrusanId: null,
      technicalWriterId: null,
      teamLeaderId: null,
      priorityId: null,
      status: 'rejected',
      submittedAt: new Date('2026-10-21T04:24:48'),
      approvedAt: null,
      rejectedAt: new Date('2026-10-21T04:25:25'),
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      targetSlaHours: null,
      actualDurationHours: null,
      slaMet: null,
      slaPausedAt: null,
      slaPausedDurationHours: 0,
      rejectionNote: 'tidak penting',
      completionNote: null,
      onHoldReason: null,
      createdAt: new Date('2026-10-21T11:24:47'),
      updatedAt: new Date('2026-10-21T04:25:25'),
    },
    {
      id: 5,
      requestNo: 'REQ-20261021-004',
      requestType: 'rfc',
      applicationId: 4, // Asset Tracking
      requestedVersion: '3.1.3',
      title: 'Asset Tracking',
      description: 'penambahan fitur, penambahan fitur, penambahan fitur, penambahan fitur',
      businessNeed: null,
      objective: null,
      expectedOutput: null,
      urgency: 'high',
      requesterId: 2,
      requesterName: 'John Doe',
      requesterEmail: 'user@sippa.local',
      requesterUnitId: 2,
      requesterPhone: null,
      devtiUrusanId: 2,
      technicalWriterId: 12,
      teamLeaderId: 3,
      priorityId: null,
      status: 'ongoing',
      submittedAt: new Date('2026-10-21T05:41:47'),
      approvedAt: new Date('2026-10-21T05:43:34'),
      rejectedAt: null,
      assignedAt: new Date('2026-10-21T05:44:20'),
      startedAt: null,
      completedAt: null,
      targetSlaHours: null,
      actualDurationHours: null,
      slaMet: null,
      slaPausedAt: null,
      slaPausedDurationHours: 48,
      rejectionNote: null,
      completionNote: null,
      onHoldReason: null,
      createdAt: new Date('2026-10-21T12:41:47'),
      updatedAt: new Date('2026-10-21T05:51:13'),
    },
  ]);

  // Request documents (10 files across requests 1, 2, 5)
  await db.insert(requestDocuments).values([
    { id: 2, requestId: 1, documentTypeId: 1, originalName: 'Tugas 2.pdf', storageKey: '2026/10/1792436889581-qe2otq29fm9-Tugas_2.pdf', mimeType: 'application/pdf', sizeBytes: 83457, uploadedBy: 2, uploadedAt: new Date('2026-10-19T19:08:09') },
    { id: 3, requestId: 1, documentTypeId: 4, originalName: 'Tugas 2.pdf', storageKey: '2026/10/1792438241595-65613f647iy-Tugas_2.pdf', mimeType: 'application/pdf', sizeBytes: 83457, uploadedBy: 1, uploadedAt: new Date('2026-10-19T19:30:41') },
    { id: 4, requestId: 1, documentTypeId: 5, originalName: 'Tugas 2 (1).pdf', storageKey: '2026/10/1792439460341-w1lmb3s8op-Tugas_2_1_.pdf', mimeType: 'application/pdf', sizeBytes: 135387, uploadedBy: 1, uploadedAt: new Date('2026-10-19T19:51:00') },
    { id: 5, requestId: 1, documentTypeId: 6, originalName: 'dataset_tugas 2026.1.xlsx', storageKey: '2026/10/1792439466208-m723shzmtz-dataset_tugas_2026.1.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 13527, uploadedBy: 1, uploadedAt: new Date('2026-10-19T19:51:06') },
    { id: 6, requestId: 1, documentTypeId: 7, originalName: 'dataset_tugas 2026.1.xlsx', storageKey: '2026/10/1792439471373-ett1hyefemd-dataset_tugas_2026.1.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 13527, uploadedBy: 1, uploadedAt: new Date('2026-10-19T19:51:11') },
    { id: 7, requestId: 1, documentTypeId: 8, originalName: 'dataset_tugas 2026.1.xlsx', storageKey: '2026/10/1792439475898-0rje8r3sae79-dataset_tugas_2026.1.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 13527, uploadedBy: 1, uploadedAt: new Date('2026-10-19T19:51:15') },
    { id: 8, requestId: 1, documentTypeId: 9, originalName: 'dataset_tugas 2026.1.xlsx', storageKey: '2026/10/1792439481107-558imehttdn-dataset_tugas_2026.1.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: 13527, uploadedBy: 1, uploadedAt: new Date('2026-10-19T19:51:21') },
    { id: 9, requestId: 2, documentTypeId: 1, originalName: 'Use Case.png', storageKey: '2026/10/1792580605018-d4emtax5wrv-Use_Case.png', mimeType: 'image/png', sizeBytes: 298210, uploadedBy: 10, uploadedAt: new Date('2026-10-21T11:03:25') },
    { id: 10, requestId: 5, documentTypeId: 1, originalName: 'Use Case Diagram SiPPA.png', storageKey: '2026/10/1792587039319-ao223fodye-Use_Case_Diagram_SiPPA.png', mimeType: 'image/png', sizeBytes: 227147, uploadedBy: 1, uploadedAt: new Date('2026-10-21T12:50:39') },
  ]);

  // Progress updates (5 entries)
  await db.insert(requestProgress).values([
    { id: 703, requestId: 1, progressPercent: 100, updateNote: 'test lorem do', updatedBy: 12, updatedByName: 'Dewi Lestari', createdAt: new Date('2026-10-19T19:56:33') },
    { id: 704, requestId: 1, progressPercent: 100, updateNote: LOREM, updatedBy: 12, updatedByName: 'Dewi Lestari', createdAt: new Date('2026-10-19T19:57:02') },
    { id: 705, requestId: 2, progressPercent: 80, updateNote: 'Tahap Testing', updatedBy: 10, updatedByName: 'Ahmad Fauzi', createdAt: new Date('2026-10-21T11:01:01') },
    { id: 706, requestId: 2, progressPercent: 100, updateNote: 'Pengerjaan Selesai', updatedBy: 10, updatedByName: 'Ahmad Fauzi', createdAt: new Date('2026-10-21T11:02:19') },
    { id: 707, requestId: 2, progressPercent: 100, updateNote: 'Aplikasi selesai dikerjakan', updatedBy: 10, updatedByName: 'Ahmad Fauzi', createdAt: new Date('2026-10-21T11:04:44') },
  ]);

  // Status histories (28 entries - full workflow traces)
  await db.insert(requestStatusHistories).values([
    { id: 1063, requestId: 1, fromStatus: null, toStatus: 'submitted', changedBy: 2, changedByName: 'John Doe', actorRole: null, note: 'Request dibuat', metadata: null, createdAt: new Date('2026-10-19T19:08:09') },
    { id: 1064, requestId: 1, fromStatus: 'submitted', toStatus: 'in_review', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: LOREM, metadata: null, createdAt: new Date('2026-10-19T19:09:13') },
    { id: 1065, requestId: 1, fromStatus: 'in_review', toStatus: 'approved', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: LOREM, metadata: null, createdAt: new Date('2026-10-19T19:09:31') },
    { id: 1066, requestId: 1, fromStatus: 'approved', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'Request di-assign ke tim:\n- Ketua Tim: Ahmad Fauzi\n- Technical Writer: Dewi Lestari\n- Developers: Andi Wijaya, Dian Pratama, Maya Sari\n- DevTI Urusan: URUSAN PENGEMBANGAN PRODUK TI NON-AKADEMIK\n- Catatan: ' + LOREM, metadata: null, createdAt: new Date('2026-10-19T19:09:59') },
    { id: 1067, requestId: 1, fromStatus: 'ongoing', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Priority diubah menjadi Medium', metadata: null, createdAt: new Date('2026-10-19T19:41:52') },
    { id: 1068, requestId: 1, fromStatus: 'ongoing', toStatus: 'done', changedBy: 12, changedByName: 'Dewi Lestari', actorRole: null, note: LOREM, metadata: null, createdAt: new Date('2026-10-19T19:57:02') },
    { id: 1069, requestId: 2, fromStatus: null, toStatus: 'submitted', changedBy: 2, changedByName: 'John Doe', actorRole: null, note: 'Request dibuat', metadata: null, createdAt: new Date('2026-10-21T07:08:06') },
    { id: 1070, requestId: 2, fromStatus: 'submitted', toStatus: 'in_review', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Request diverifikasi oleh admin', metadata: null, createdAt: new Date('2026-10-21T07:17:31') },
    { id: 1071, requestId: 2, fromStatus: 'in_review', toStatus: 'approved', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Request disetujui', metadata: null, createdAt: new Date('2026-10-21T10:40:35') },
    { id: 1072, requestId: 2, fromStatus: 'approved', toStatus: 'approved', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Priority diubah menjadi Medium', metadata: null, createdAt: new Date('2026-10-21T10:40:53') },
    { id: 1073, requestId: 2, fromStatus: 'approved', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'Request di-assign ke tim:\n- Ketua Tim: Ahmad Fauzi\n- Technical Writer: Dewi Lestari\n- Developers: Andi Wijaya, Dian Pratama, Maya Sari, Lisa Anggraini\n- DevTI Urusan: URUSAN PENGEMBANGAN PRODUK TI NON-AKADEMIK', metadata: null, createdAt: new Date('2026-10-21T10:44:28') },
    { id: 1074, requestId: 2, fromStatus: 'ongoing', toStatus: 'done', changedBy: 10, changedByName: 'Ahmad Fauzi', actorRole: null, note: 'Aplikasi selesai dikerjakan', metadata: null, createdAt: new Date('2026-10-21T11:04:44') },
    { id: 1075, requestId: 3, fromStatus: null, toStatus: 'submitted', changedBy: 2, changedByName: 'John Doe', actorRole: null, note: 'Request dibuat', metadata: null, createdAt: new Date('2026-10-21T11:09:44') },
    { id: 1076, requestId: 3, fromStatus: 'submitted', toStatus: 'in_review', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Approve', metadata: null, createdAt: new Date('2026-10-21T11:12:37') },
    { id: 1077, requestId: 3, fromStatus: 'in_review', toStatus: 'approved', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'oke', metadata: null, createdAt: new Date('2026-10-21T11:13:04') },
    { id: 1078, requestId: 3, fromStatus: 'approved', toStatus: 'approved', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Priority diubah menjadi High', metadata: null, createdAt: new Date('2026-10-21T11:13:48') },
    { id: 1079, requestId: 3, fromStatus: 'approved', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'Request di-assign ke tim:\n- Ketua Tim: Jane Smith\n- Technical Writer: Dewi Lestari\n- Developers: Andi Wijaya, Dian Pratama, Maya Sari, Lisa Anggraini\n- DevTI Urusan: URUSAN PENGEMBANGAN PRODUK TI NON-AKADEMIK', metadata: null, createdAt: new Date('2026-10-21T11:16:11') },
    { id: 1080, requestId: 4, fromStatus: null, toStatus: 'submitted', changedBy: 2, changedByName: 'John Doe', actorRole: null, note: 'Request dibuat', metadata: null, createdAt: new Date('2026-10-21T11:24:47') },
    { id: 1081, requestId: 4, fromStatus: 'submitted', toStatus: 'in_review', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Request diverifikasi oleh admin', metadata: null, createdAt: new Date('2026-10-21T11:25:16') },
    { id: 1082, requestId: 4, fromStatus: 'in_review', toStatus: 'rejected', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Request ditolak: tidak penting', metadata: null, createdAt: new Date('2026-10-21T11:25:25') },
    { id: 1083, requestId: 5, fromStatus: null, toStatus: 'submitted', changedBy: 2, changedByName: 'John Doe', actorRole: null, note: 'Request dibuat', metadata: null, createdAt: new Date('2026-10-21T12:41:47') },
    { id: 1084, requestId: 5, fromStatus: 'submitted', toStatus: 'in_review', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Request diverifikasi oleh admin', metadata: null, createdAt: new Date('2026-10-21T12:42:54') },
    { id: 1085, requestId: 5, fromStatus: 'in_review', toStatus: 'approved', changedBy: 1, changedByName: 'Admin User', actorRole: null, note: 'Request disetujui', metadata: null, createdAt: new Date('2026-10-21T12:43:33') },
    { id: 1086, requestId: 5, fromStatus: 'approved', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'Request di-assign ke tim:\n- Ketua Tim: Jane Smith\n- Technical Writer: Dewi Lestari\n- Developers: Ahmad Fauzi, Siti Nurhaliza, Andi Wijaya, Dian Pratama, Maya Sari, Lisa Anggraini\n- DevTI Urusan: URUSAN PENGEMBANGAN PRODUK TI NON-AKADEMIK', metadata: null, createdAt: new Date('2026-10-21T12:44:20') },
    { id: 1087, requestId: 5, fromStatus: 'ongoing', toStatus: 'on_hold', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'sedang ditinjau ulang', metadata: '{"reason":"sedang ditinjau ulang","pausedAt":"2026-10-21T12:46:40.841Z"}', createdAt: new Date('2026-10-21T12:46:40') },
    { id: 1088, requestId: 5, fromStatus: 'on_hold', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'Request dilanjutkan kembali', metadata: '{"resumedAt":"2026-10-21T12:49:00.438Z","pausedDurationHours":24}', createdAt: new Date('2026-10-21T12:49:00') },
    { id: 1089, requestId: 5, fromStatus: 'ongoing', toStatus: 'on_hold', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'sedang ditinjau ulang', metadata: '{"reason":"sedang ditinjau ulang","pausedAt":"2026-10-21T12:50:01.691Z"}', createdAt: new Date('2026-10-21T12:50:01') },
    { id: 1090, requestId: 5, fromStatus: 'on_hold', toStatus: 'ongoing', changedBy: 1, changedByName: 'Admin User', actorRole: 'admin', note: 'Request dilanjutkan kembali', metadata: '{"resumedAt":"2026-10-21T12:51:13.192Z","pausedDurationHours":48}', createdAt: new Date('2026-10-21T12:51:13') },
  ]);

  // Team assignments (23 entries across requests 1, 2, 3, 5)
  await db.insert(requestTeamAssignments).values([
    { id: 5, requestId: 1, assignedUserId: 14, developerRoleId: 3, assignedBy: 1, assignedAt: new Date('2026-10-19T12:09:59'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-19T19:09:59'), updatedAt: new Date('2026-10-19T19:09:59') },
    { id: 6, requestId: 1, assignedUserId: 16, developerRoleId: 4, assignedBy: 1, assignedAt: new Date('2026-10-19T12:09:59'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-19T19:09:59'), updatedAt: new Date('2026-10-19T19:09:59') },
    { id: 7, requestId: 1, assignedUserId: 18, developerRoleId: 5, assignedBy: 1, assignedAt: new Date('2026-10-19T12:09:59'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-19T19:09:59'), updatedAt: new Date('2026-10-19T19:09:59') },
    { id: 8, requestId: 1, assignedUserId: 10, developerRoleId: 1, assignedBy: 1, assignedAt: new Date('2026-10-19T12:09:59'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-19T19:09:59'), updatedAt: new Date('2026-10-19T19:09:59') },
    { id: 9, requestId: 1, assignedUserId: 12, developerRoleId: 2, assignedBy: 1, assignedAt: new Date('2026-10-19T12:09:59'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-19T19:09:59'), updatedAt: new Date('2026-10-19T19:09:59') },
    { id: 10, requestId: 2, assignedUserId: 14, developerRoleId: 3, assignedBy: 1, assignedAt: new Date('2026-10-21T03:44:29'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T10:44:28'), updatedAt: new Date('2026-10-21T10:44:28') },
    { id: 11, requestId: 2, assignedUserId: 16, developerRoleId: 4, assignedBy: 1, assignedAt: new Date('2026-10-21T03:44:29'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T10:44:28'), updatedAt: new Date('2026-10-21T10:44:28') },
    { id: 12, requestId: 2, assignedUserId: 18, developerRoleId: 5, assignedBy: 1, assignedAt: new Date('2026-10-21T03:44:29'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T10:44:28'), updatedAt: new Date('2026-10-21T10:44:28') },
    { id: 13, requestId: 2, assignedUserId: 20, developerRoleId: 6, assignedBy: 1, assignedAt: new Date('2026-10-21T03:44:29'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T10:44:28'), updatedAt: new Date('2026-10-21T10:44:28') },
    { id: 14, requestId: 2, assignedUserId: 10, developerRoleId: 1, assignedBy: 1, assignedAt: new Date('2026-10-21T03:44:29'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T10:44:28'), updatedAt: new Date('2026-10-21T10:44:28') },
    { id: 15, requestId: 2, assignedUserId: 12, developerRoleId: 2, assignedBy: 1, assignedAt: new Date('2026-10-21T03:44:29'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T10:44:28'), updatedAt: new Date('2026-10-21T10:44:28') },
    { id: 16, requestId: 3, assignedUserId: 14, developerRoleId: 3, assignedBy: 1, assignedAt: new Date('2026-10-21T04:16:12'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T11:16:11'), updatedAt: new Date('2026-10-21T11:16:11') },
    { id: 17, requestId: 3, assignedUserId: 16, developerRoleId: 4, assignedBy: 1, assignedAt: new Date('2026-10-21T04:16:12'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T11:16:11'), updatedAt: new Date('2026-10-21T11:16:11') },
    { id: 18, requestId: 3, assignedUserId: 18, developerRoleId: 5, assignedBy: 1, assignedAt: new Date('2026-10-21T04:16:12'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T11:16:11'), updatedAt: new Date('2026-10-21T11:16:11') },
    { id: 19, requestId: 3, assignedUserId: 20, developerRoleId: 6, assignedBy: 1, assignedAt: new Date('2026-10-21T04:16:12'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T11:16:11'), updatedAt: new Date('2026-10-21T11:16:11') },
    { id: 20, requestId: 3, assignedUserId: 12, developerRoleId: 2, assignedBy: 1, assignedAt: new Date('2026-10-21T04:16:12'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T11:16:11'), updatedAt: new Date('2026-10-21T11:16:11') },
    { id: 21, requestId: 5, assignedUserId: 10, developerRoleId: 1, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
    { id: 22, requestId: 5, assignedUserId: 11, developerRoleId: 2, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
    { id: 23, requestId: 5, assignedUserId: 14, developerRoleId: 3, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
    { id: 24, requestId: 5, assignedUserId: 16, developerRoleId: 4, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
    { id: 25, requestId: 5, assignedUserId: 18, developerRoleId: 5, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
    { id: 26, requestId: 5, assignedUserId: 20, developerRoleId: 6, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
    { id: 27, requestId: 5, assignedUserId: 12, developerRoleId: 2, assignedBy: 1, assignedAt: new Date('2026-10-21T05:44:20'), unassignedAt: null, notes: null, createdAt: new Date('2026-10-21T12:44:20'), updatedAt: new Date('2026-10-21T12:44:20') },
  ]);

  console.log('✅ Seeding completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@sippa.local / password123');
  console.log('  User: user@sippa.local / password123');
  console.log('  Developer: dev@sippa.local / password123');
  console.log('');
  console.log('📊 Seed Data:');
  console.log('  - 8 SLA policies created');
  console.log('  - 6 request applications created (5 base + 1 Lorem)');
  console.log('  - 5 real user requests (REQ-20261020-001 … REQ-20261021-004)');
  console.log('  - Statuses: 2 done, 2 ongoing, 1 rejected');
  console.log('  - 9 documents, 5 progress updates, 28 status histories, 23 team assignments');
  console.log('  - DevTI Urusan: mapped to devteam_units (old units id 10 → 2)');
  console.log('');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
