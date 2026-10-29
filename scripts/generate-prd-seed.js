const fs = require('fs');
const path = require('path');

// 10 University Applications from PRD (IDs 11-20)
const universityApps = [
  { id: 11, name: 'SIAKAD (Sistem Informasi Akademik)', desc: 'Mengelola KRS, KHS, jadwal kuliah, nilai, dan data akademik mahasiswa.', version: '2.1.0' },
  { id: 12, name: 'LMS (Learning Management System)', desc: 'Mendukung pembelajaran online, pengumpulan tugas, kuis, dan materi kuliah.', version: '1.4.2' },
  { id: 13, name: 'Sistem Keuangan Kampus', desc: 'Mengelola pembayaran uang kuliah, tagihan, beasiswa, dan laporan keuangan.', version: '1.8.0' },
  { id: 14, name: 'Sistem Informasi Kepegawaian (SIPEG)', desc: 'Mengelola data dosen, staf, absensi, cuti, dan administrasi kepegawaian.', version: '2.0.1' },
  { id: 15, name: 'Sistem Penerimaan Mahasiswa Baru (PMB)', desc: 'Mengelola pendaftaran, seleksi, pengumuman, dan registrasi mahasiswa baru.', version: '1.3.0' },
  { id: 16, name: 'Sistem Perpustakaan Digital', desc: 'Mencari buku, meminjam koleksi, mengakses jurnal, dan mengelola data perpustakaan.', version: '1.1.5' },
  { id: 17, name: 'Sistem Presensi Online', desc: 'Mencatat kehadiran mahasiswa dan dosen dalam kegiatan perkuliahan.', version: '1.2.0' },
  { id: 18, name: 'Sistem Informasi Penelitian dan Pengabdian (LPPM)', desc: 'Mengelola proposal penelitian, hibah, publikasi ilmiah, dan kegiatan pengabdian masyarakat.', version: '1.0.4' },
  { id: 19, name: 'Portal Kemahasiswaan', desc: 'Mengelola organisasi mahasiswa, kegiatan kampus, beasiswa, prestasi, dan layanan konseling.', version: '1.5.0' },
  { id: 20, name: 'Sistem Informasi Alumni dan Karier', desc: 'Mengelola data alumni, lowongan kerja, tracer study, dan informasi karier.', version: '1.0.2' }
];

// 10 New Applications corresponding to 10 NEW_APPLICATION requests (IDs 21-30)
const newApps = [
  { id: 21, name: 'Sistem Reservasi Ruangan dan Fasilitas Kampus', desc: 'Peminjaman aula, ruang rapat, laboratorium komputer, dan fasilitas kampus terintegrasi.', version: '1.0.0' },
  { id: 22, name: 'Sistem Manajemen Magang dan MBKM', desc: 'Platform pendaftaran, penempatan, dan pelaporan program magang serta studi independen mahasiswa.', version: '1.0.0' },
  { id: 23, name: 'Sistem Monitoring Skripsi dan Tugas Akhir (SIMTA)', desc: 'Monitoring bimbingan skripsi, pengajuan judul, sidang proposal, dan ujian pendadaran terintegrasi.', version: '1.0.0' },
  { id: 24, name: 'Sistem Evaluasi Dosen oleh Mahasiswa (EDOM)', desc: 'Kuesioner evaluasi pembelajaran semester dan penilaian pedagogik dosen oleh mahasiswa secara anonim.', version: '1.0.0' },
  { id: 25, name: 'Sistem Manajemen Inventaris dan Laboratorium (SIMLAB)', desc: 'Peminjaman alat laboratorium, penjadwalan praktikum, dan pencatatan bahan habis pakai praktikum.', version: '1.0.0' },
  { id: 26, name: 'Sistem Informasi Asrama Mahasiswa (SIMAS)', desc: 'Pendaftaran kamar asrama, pembayaran iuran hunian, absensi malam, dan tata tertib asrama mahasiswa.', version: '1.0.0' },
  { id: 27, name: 'Sistem Layanan Konseling Mahasiswa (E-Counseling)', desc: 'Layanan reservasi konseling psikolog kampus, asesmen stres mahasiswa, dan pencatatan rekam bimbingan.', version: '1.0.0' },
  { id: 28, name: 'Sistem Penjaminan Mutu Internal (SPMI Online)', desc: 'Audit mutu internal, pemantauan indikator kinerja utama (IKU), dan pelaporan siklus PPEPP universitas.', version: '1.0.0' },
  { id: 29, name: 'Portal Layanan Wisuda dan Legalisir Ijazah Online', desc: 'Pendaftaran wisuda, verifikasi bebas pinjam pustaka/biaya kuliah, dan layanan legalisir digital ijazah.', version: '1.0.0' },
  { id: 30, name: 'Sistem Kerjasama Industri dan Kemitraan (SIKERMA)', desc: 'Pencatatan MoU/MoA, monitoring realisasi program kerjasama, dan database mitra industri dalam & luar negeri.', version: '1.0.0' }
];

// Definition of 28 requests
// Target SLA Hours:
// new_application (targetBusinessDays: 135) -> target_sla_hours = 3240
// rfc (targetBusinessDays: 44) -> target_sla_hours = 1056
const requestDefs = [
  // ========================================================
  // Q1 2026: 14 Requests (8 NEW_APP, 6 RFC)
  // SLA: 13 Met, 1 Exceeded (New App)
  // ========================================================

  // 1. NEW_APP - EXCEEDED (Submitted Aug 2025, completed Feb 2026, 145 business days = 3480h > 3240h target)
  {
    id: 301, reqNo: 'REQ-20250815-001', type: 'new_application', title: newApps[0].name, newAppId: newApps[0].id,
    desc: 'Pengembangan sistem peminjaman aula serbaguna, ruang seminar, dan laboratorium antar-unit di universitas.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 11,
    subAt: '2025-08-15 09:00:00', appAt: '2025-08-18 10:00:00', asgAt: '2025-08-19 13:30:00', comAt: '2026-02-27 16:00:00',
    targetHours: 3240, actualHours: 3480, slaMet: 0
  },
  // 2. NEW_APP - Met (38 business days = 912h)
  {
    id: 302, reqNo: 'REQ-20260105-002', type: 'new_application', title: newApps[1].name, newAppId: newApps[1].id,
    desc: 'Platform pendaftaran, penempatan, logbook harian, dan konversi nilai program Magang dan Studi Independen (MBKM).',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-05 08:30:00', appAt: '2026-01-06 09:15:00', asgAt: '2026-01-06 14:00:00', comAt: '2026-02-26 16:30:00',
    targetHours: 3240, actualHours: 912, slaMet: 1
  },
  // 3. NEW_APP - Met (41 business days = 984h)
  {
    id: 303, reqNo: 'REQ-20260107-003', type: 'new_application', title: newApps[2].name, newAppId: newApps[2].id,
    desc: 'Monitoring bimbingan skripsi online, pengajuan judul, persetujuan pembimbing, hingga pendaftaran sidang pendadaran.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-07 09:00:00', appAt: '2026-01-08 10:00:00', asgAt: '2026-01-08 15:30:00', comAt: '2026-03-05 15:00:00',
    targetHours: 3240, actualHours: 984, slaMet: 1
  },
  // 4. NEW_APP - Met (43 business days = 1032h)
  {
    id: 304, reqNo: 'REQ-20260112-004', type: 'new_application', title: newApps[3].name, newAppId: newApps[3].id,
    desc: 'Pengembangan modul kuesioner evaluasi dosen oleh mahasiswa (EDOM) dengan fitur anonimitas hasil kuesioner.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-12 10:15:00', appAt: '2026-01-13 11:20:00', asgAt: '2026-01-13 16:00:00', comAt: '2026-03-12 14:00:00',
    targetHours: 3240, actualHours: 1032, slaMet: 1
  },
  // 5. NEW_APP - Met (45 business days = 1080h)
  {
    id: 305, reqNo: 'REQ-20260115-005', type: 'new_application', title: newApps[4].name, newAppId: newApps[4].id,
    desc: 'Aplikasi manajemen laboratorium untuk pencatatan inventaris alat riset, kalibrasi berkala, dan peminjaman fasilitas.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-15 11:00:00', appAt: '2026-01-16 13:00:00', asgAt: '2026-01-16 16:30:00', comAt: '2026-03-18 16:00:00',
    targetHours: 3240, actualHours: 1080, slaMet: 1
  },
  // 6. NEW_APP - Met (46 business days = 1104h)
  {
    id: 306, reqNo: 'REQ-20260119-006', type: 'new_application', title: newApps[5].name, newAppId: newApps[5].id,
    desc: 'Sistem informasi pengelolaan asrama mahasiswa untuk alokasi kamar, penagihan iuran, dan perizinan keluar malam.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-19 09:30:00', appAt: '2026-01-20 10:45:00', asgAt: '2026-01-20 14:15:00', comAt: '2026-03-24 15:30:00',
    targetHours: 3240, actualHours: 1104, slaMet: 1
  },
  // 7. NEW_APP - Met (34 business days = 816h)
  {
    id: 307, reqNo: 'REQ-20260122-007', type: 'new_application', title: newApps[6].name, newAppId: newApps[6].id,
    desc: 'Aplikasi layanan konseling psikologi daring bagi mahasiswa untuk konsultasi dan asesmen kesehatan mental.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 2, twId: 11,
    subAt: '2026-01-22 08:45:00', appAt: '2026-01-23 09:30:00', asgAt: '2026-01-23 13:45:00', comAt: '2026-03-10 11:00:00',
    targetHours: 3240, actualHours: 816, slaMet: 1
  },
  // 8. NEW_APP - Met (43 business days = 1032h)
  {
    id: 308, reqNo: 'REQ-20260126-008', type: 'new_application', title: newApps[7].name, newAppId: newApps[7].id,
    desc: 'Sistem audit mutu internal dan monitoring ketercapaian target IKU fakultas serta prodi guna mendukung akreditasi.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 12,
    subAt: '2026-01-26 10:00:00', appAt: '2026-01-27 11:00:00', asgAt: '2026-01-27 15:00:00', comAt: '2026-03-26 16:30:00',
    targetHours: 3240, actualHours: 1032, slaMet: 1
  },

  // 9. RFC - Met (SIAKAD - 21 business days = 504h)
  {
    id: 309, reqNo: 'REQ-20260108-009', type: 'rfc', title: universityApps[0].name, appId: 11, reqVer: '2.2.0',
    desc: 'Integrasi modul pembayaran Virtual Account (VA) Bank Mandiri, BNI, dan BRI untuk registrasi KRS semester genap.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-08 08:15:00', appAt: '2026-01-09 09:00:00', asgAt: '2026-01-09 13:00:00', comAt: '2026-02-06 16:00:00',
    targetHours: 1056, actualHours: 504, slaMet: 1
  },
  // 10. RFC - Met (LMS - 23 business days = 552h)
  {
    id: 310, reqNo: 'REQ-20260113-010', type: 'rfc', title: universityApps[1].name, appId: 12, reqVer: '1.5.0',
    desc: 'Penambahan fitur proctoring ujian online berbasis snapshot webcam dan browser tab-lock untuk ujian akhir.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-13 09:30:00', appAt: '2026-01-14 10:15:00', asgAt: '2026-01-14 14:30:00', comAt: '2026-02-13 17:00:00',
    targetHours: 1056, actualHours: 552, slaMet: 1
  },
  // 11. RFC - Met (Keuangan - 25 business days = 600h)
  {
    id: 311, reqNo: 'REQ-20260116-011', type: 'rfc', title: universityApps[2].name, appId: 13, reqVer: '1.9.0',
    desc: 'Otomasi rekonsiliasi mutasi bank harian dan pencocokan otomatis invoice tagihan biaya laboratorium.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 11,
    subAt: '2026-01-16 10:00:00', appAt: '2026-01-19 11:30:00', asgAt: '2026-01-19 15:00:00', comAt: '2026-02-20 16:30:00',
    targetHours: 1056, actualHours: 600, slaMet: 1
  },
  // 12. RFC - Met (SIPEG - 26 business days = 624h)
  {
    id: 312, reqNo: 'REQ-20260120-012', type: 'rfc', title: universityApps[3].name, appId: 14, reqVer: '2.1.0',
    desc: 'Integrasi sistem sinkronisasi data Beban Kerja Dosen (BKD) dengan Web Service Platform SISTER Kemendikbudristek.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-20 11:15:00', appAt: '2026-01-21 13:00:00', asgAt: '2026-01-21 16:00:00', comAt: '2026-02-25 15:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1
  },
  // 13. RFC - Met (PMB - 27 business days = 648h)
  {
    id: 313, reqNo: 'REQ-20260123-013', type: 'rfc', title: universityApps[4].name, appId: 15, reqVer: '1.4.0',
    desc: 'Implementasi fitur OCR untuk ekstraksi otomatis nilai rapor calon mahasiswa jalur seleksi prestasi.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-01-23 09:00:00', appAt: '2026-01-26 10:00:00', asgAt: '2026-01-26 14:00:00', comAt: '2026-03-02 16:00:00',
    targetHours: 1056, actualHours: 648, slaMet: 1
  },
  // 14. RFC - Met (Perpustakaan - 28 business days = 672h)
  {
    id: 314, reqNo: 'REQ-20260127-014', type: 'rfc', title: universityApps[5].name, appId: 16, reqVer: '1.2.0',
    desc: 'Integrasi Single Sign-On (SSO) akun kampus dengan basis data jurnal internasional ScienceDirect dan IEEE Xplore.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-27 10:45:00', appAt: '2026-01-28 11:30:00', asgAt: '2026-01-28 15:30:00', comAt: '2026-03-06 14:30:00',
    targetHours: 1056, actualHours: 672, slaMet: 1
  },

  // ========================================================
  // Q2 2026: 7 Requests (1 NEW_APP, 6 RFC)
  // SLA: 6 Met, 1 Exceeded (RFC)
  // ========================================================

  // 15. NEW_APP - Met (38 business days = 912h)
  {
    id: 315, reqNo: 'REQ-20260406-015', type: 'new_application', title: newApps[8].name, newAppId: newApps[8].id,
    desc: 'Portal pendaftaran wisuda terintegrasi, verifikasi bebas pinjam pustaka, bebas SPP, dan legalisir digital ijazah.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 11,
    subAt: '2026-04-06 09:00:00', appAt: '2026-04-07 10:00:00', asgAt: '2026-04-07 14:00:00', comAt: '2026-05-29 15:00:00',
    targetHours: 3240, actualHours: 912, slaMet: 1
  },
  // 16. RFC - EXCEEDED (Kemahasiswaan - 51 business days = 1224h > 1056h target)
  {
    id: 316, reqNo: 'REQ-20260407-016', type: 'rfc', title: universityApps[8].name, appId: 19, reqVer: '1.6.0',
    desc: 'Modul perizinan kegiatan organisasi kemahasiswaan (Ormawa) dan peminjaman inventaris perlengkapan kampus.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 12,
    subAt: '2026-04-07 10:00:00', appAt: '2026-04-08 11:00:00', asgAt: '2026-04-08 15:00:00', comAt: '2026-06-23 16:00:00',
    targetHours: 1056, actualHours: 1224, slaMet: 0
  },
  // 17. RFC - Met (SIAKAD - 27 business days = 648h)
  {
    id: 317, reqNo: 'REQ-20260408-017', type: 'rfc', title: universityApps[0].name, appId: 11, reqVer: '2.3.0',
    desc: 'Validasi otomatis kelayakan prasyarat mata kuliah saat input rencana studi dan integrasi tandatangan elektronik KHS.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 11,
    subAt: '2026-04-08 08:30:00', appAt: '2026-04-09 09:15:00', asgAt: '2026-04-09 13:45:00', comAt: '2026-05-18 16:00:00',
    targetHours: 1056, actualHours: 648, slaMet: 1
  },
  // 18. RFC - Met (LMS - 26 business days = 624h)
  {
    id: 318, reqNo: 'REQ-20260414-018', type: 'rfc', title: universityApps[1].name, appId: 12, reqVer: '1.6.0',
    desc: 'Modul forum diskusi interaktif dengan integrasi notifikasi push ke aplikasi mobile mahasiswa dan rubric grading tugas.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 12,
    subAt: '2026-04-14 09:45:00', appAt: '2026-04-15 10:30:00', asgAt: '2026-04-15 14:00:00', comAt: '2026-05-22 17:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1
  },
  // 19. RFC - Met (Keuangan - 24 business days = 576h)
  {
    id: 319, reqNo: 'REQ-20260417-019', type: 'rfc', title: universityApps[2].name, appId: 13, reqVer: '2.0.0',
    desc: 'Modul pengajuan anggaran kegiatan ormawa mahasiswa dan pencairan bantuan riset dosen secara online terpusat.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 2, twId: 11,
    subAt: '2026-04-17 09:00:00', appAt: '2026-04-20 10:00:00', asgAt: '2026-04-20 13:30:00', comAt: '2026-05-25 15:00:00',
    targetHours: 1056, actualHours: 576, slaMet: 1
  },
  // 20. RFC - Met (SIPEG - 30 business days = 720h)
  {
    id: 320, reqNo: 'REQ-20260421-020', type: 'rfc', title: universityApps[3].name, appId: 14, reqVer: '2.2.0',
    desc: 'Modul pengajuan cuti dosen dan tendik berbasis alur persetujuan berjenjang dan pemotongan jatah cuti otomatis.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 12,
    subAt: '2026-04-21 10:00:00', appAt: '2026-04-22 11:15:00', asgAt: '2026-04-22 15:30:00', comAt: '2026-06-03 15:30:00',
    targetHours: 1056, actualHours: 720, slaMet: 1
  },
  // 21. RFC - Met (Presensi - 22 business days = 528h)
  {
    id: 321, reqNo: 'REQ-20260427-021', type: 'rfc', title: universityApps[6].name, appId: 17, reqVer: '1.4.0',
    desc: 'Dashboard rekapitulasi kehadiran pengajar per semester untuk integrasi ke sistem pembayaran honor perkuliahan.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-04-27 08:30:00', appAt: '2026-04-28 09:00:00', asgAt: '2026-04-28 13:00:00', comAt: '2026-05-28 16:30:00',
    targetHours: 1056, actualHours: 528, slaMet: 1
  },

  // ========================================================
  // Q3 2026: 3 Requests (0 NEW_APP, 3 RFC)
  // SLA: 3 Met, 0 Exceeded
  // ========================================================

  // 22. RFC - Met (Keuangan - 26 business days = 624h)
  {
    id: 322, reqNo: 'REQ-20260708-022', type: 'rfc', title: universityApps[2].name, appId: 13, reqVer: '2.1.0',
    desc: 'Peningkatan integrasi payment gateway QRIS dinamis untuk pembayaran biaya registrasi semester pendek.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 2, twId: 12,
    subAt: '2026-07-08 08:30:00', appAt: '2026-07-09 09:30:00', asgAt: '2026-07-09 13:30:00', comAt: '2026-08-14 16:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1
  },
  // 23. RFC - Met (Perpustakaan - 24 business days = 576h)
  {
    id: 323, reqNo: 'REQ-20260720-023', type: 'rfc', title: universityApps[5].name, appId: 16, reqVer: '1.3.0',
    desc: 'Fitur peminjaman buku mandiri dengan pemindaian barcode buku dan QR code kartu tanda mahasiswa via ponsel.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 11,
    subAt: '2026-07-20 10:15:00', appAt: '2026-07-21 11:30:00', asgAt: '2026-07-21 15:30:00', comAt: '2026-08-25 15:00:00',
    targetHours: 1056, actualHours: 576, slaMet: 1
  },
  // 24. RFC - Met (LPPM - 25 business days = 600h)
  {
    id: 324, reqNo: 'REQ-20260727-024', type: 'rfc', title: universityApps[7].name, appId: 18, reqVer: '1.1.0',
    desc: 'Modul blind review proposal penelitian dan pengabdian masyarakat dengan form penilaian kriteria berbasis rubrik.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 12,
    subAt: '2026-07-27 09:15:00', appAt: '2026-07-28 10:00:00', asgAt: '2026-07-28 14:15:00', comAt: '2026-09-02 16:30:00',
    targetHours: 1056, actualHours: 600, slaMet: 1
  },

  // ========================================================
  // Q4 2026: 4 Requests (1 NEW_APP, 3 RFC)
  // SLA: 4 Met, 0 Exceeded
  // ========================================================

  // 25. NEW_APP - Met (36 business days = 864h)
  {
    id: 325, reqNo: 'REQ-20261001-025', type: 'new_application', title: newApps[9].name, newAppId: newApps[9].id,
    desc: 'Sistem pendataan dokumen kerjasama institusi (MoU/MoA) dengan mitra industri dan universitas luar negeri.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-10-01 09:00:00', appAt: '2026-10-02 10:00:00', asgAt: '2026-10-02 14:00:00', comAt: '2026-11-20 15:00:00',
    targetHours: 3240, actualHours: 864, slaMet: 1
  },
  // 26. RFC - Met (SIAKAD - 24 business days = 576h)
  {
    id: 326, reqNo: 'REQ-20261002-026', type: 'rfc', title: universityApps[0].name, appId: 11, reqVer: '2.4.0',
    desc: 'Fitur konversi nilai dan rekognisi hingga 20 SKS untuk program magang dan studi independen kurikulum merdeka.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-10-02 08:30:00', appAt: '2026-10-05 09:00:00', asgAt: '2026-10-05 13:00:00', comAt: '2026-11-06 16:00:00',
    targetHours: 1056, actualHours: 576, slaMet: 1
  },
  // 27. RFC - Met (LMS - 26 business days = 624h)
  {
    id: 327, reqNo: 'REQ-20261007-027', type: 'rfc', title: universityApps[1].name, appId: 12, reqVer: '1.7.0',
    desc: 'Peningkatan kapasitas streaming video materi kuliah, sinkronisasi tautan Zoom otomatis, dan absensi webinar.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 11,
    subAt: '2026-10-07 09:15:00', appAt: '2026-10-08 10:15:00', asgAt: '2026-10-08 14:15:00', comAt: '2026-11-13 17:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1
  },
  // 28. RFC - Met (PMB - 25 business days = 600h)
  {
    id: 328, reqNo: 'REQ-20261012-028', type: 'rfc', title: universityApps[4].name, appId: 15, reqVer: '1.5.0',
    desc: 'Integrasi sistem Computer Based Test (CBT) mandiri dengan bank soal terenkripsi dan penilaian otomatis ujian masuk.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-10-12 10:00:00', appAt: '2026-10-13 11:00:00', asgAt: '2026-10-13 15:00:00', comAt: '2026-11-17 16:30:00',
    targetHours: 1056, actualHours: 600, slaMet: 1
  }
];

// Generate SQL script
let sql = `-- ==============================================================================
-- SIPPA: Script Seed Data Permintaan Pengembangan Aplikasi (PRD Aligned)
-- Periode: Q1 - Q4 2026 (Total 28 Requests: Q1=14, Q2=7, Q3=3, Q4=4)
-- SLA: 26 Tercapai (92.9%), 2 Melampaui (7.1%):
--   - 1 NEW_APPLICATION Exceeded di Q1 (ID: 301)
--   - 1 RFC Exceeded di Q2 (ID: 316)
-- Hold Cycles: NONE (Alur langsung tanpa tahanan)
-- Tables Populated:
--   1. request_applications (10 Aplikasi Master PRD [ID 11-20] + 10 Aplikasi Baru [ID 21-30])
--   2. requests (28 Requests: 10 NEW_APPLICATION, 18 RFC)
--   3. request_team_assignments (Penugasan tim pengembang: SA, TW, BE, FE, QA, DM)
--   4. request_status_histories (Riwayat transisi status alur workflow)
--   5. request_progress (Update progress pengerjaan 50% dan 100%)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Hapus data seed sebelumnya (ID >= 301)
DELETE FROM \`request_progress\` WHERE \`request_id\` >= 301;
DELETE FROM \`request_team_assignments\` WHERE \`request_id\` >= 301;
DELETE FROM \`request_status_histories\` WHERE \`request_id\` >= 301;
DELETE FROM \`requests\` WHERE \`id\` >= 301;
DELETE FROM \`request_applications\` WHERE \`id\` >= 11;

-- ------------------------------------------------------------------------------
-- 1. TABEL: request_applications
-- Master Aplikasi Universitas dari PRD (ID 11-20) dan Aplikasi Baru (ID 21-30)
-- ------------------------------------------------------------------------------
INSERT INTO \`request_applications\` (\`id\`, \`application_name\`, \`description\`, \`current_version\`, \`created_by\`, \`created_at\`, \`updated_at\`)
VALUES
`;

const allApps = [...universityApps, ...newApps];
const appValues = allApps.map(app => {
  const escName = app.name.replace(/'/g, "\\'");
  const escDesc = app.desc.replace(/'/g, "\\'");
  return `  (${app.id}, '${escName}', '${escDesc}', '${app.version}', 1, '2026-01-02 08:00:00', '2026-01-02 08:00:00')`;
});

sql += appValues.join(',\n');
sql += `\nON DUPLICATE KEY UPDATE 
  \`application_name\` = VALUES(\`application_name\`),
  \`description\` = VALUES(\`description\`),
  \`current_version\` = VALUES(\`current_version\`);\n\n`;

// ------------------------------------------------------------------------------
// 2. TABEL: requests (28 Records)
// ------------------------------------------------------------------------------
sql += `-- ------------------------------------------------------------------------------
-- 2. TABEL: requests (28 Records)
-- ------------------------------------------------------------------------------
INSERT INTO \`requests\` (
  \`id\`, \`request_no\`, \`request_type\`, \`title\`, \`application_id\`, \`requested_version\`,
  \`description\`, \`business_need\`, \`objective\`, \`expected_output\`, \`urgency\`,
  \`requester_id\`, \`requester_name\`, \`requester_email\`, \`requester_unit_id\`, \`requester_phone\`,
  \`devti_urusan_id\`, \`technical_writer_id\`, \`team_leader_id\`, \`priority_id\`, \`status\`,
  \`submitted_at\`, \`approved_at\`, \`rejected_at\`, \`assigned_at\`, \`started_at\`, \`completed_at\`,
  \`target_sla_hours\`, \`actual_duration_hours\`, \`sla_met\`, \`sla_paused_at\`, \`sla_paused_duration_hours\`,
  \`rejection_note\`, \`completion_note\`, \`on_hold_reason\`, \`created_at\`, \`updated_at\`
) VALUES
`;

const requestValues = requestDefs.map((req, idx) => {
  const isNewApp = req.type === 'new_application';
  const appId = isNewApp ? req.newAppId : req.appId;
  const reqVer = isNewApp ? '1.0.0' : req.reqVer;
  const requesterId = (idx % 2 === 0) ? 2 : 4;
  const requesterName = requesterId === 2 ? 'John Doe' : 'Bob Wilson';
  const requesterEmail = requesterId === 2 ? 'user@sippa.local' : 'user3@sippa.local';
  const requesterUnitId = ((idx % 6) + 1); // 1 to 6
  const requesterPhone = requesterId === 2 ? '081234567891' : '081234567893';
  const completionNote = 'Pengembangan selesai dan telah lulus uji UAT serta deployment ke production.';

  const escTitle = req.title.replace(/'/g, "\\'");
  const escDesc = req.desc.replace(/'/g, "\\'");
  const escBNeed = `Kebutuhan operasional akademik dan peningkatan efisiensi layanan pada unit terkait.`.replace(/'/g, "\\'");
  const escObj = `Mengotomasi alur kerja, integrasi data, dan standarisasi proses bisnis universitas.`.replace(/'/g, "\\'");
  const escExpOut = `Modul aplikasi yang stabil, terdokumentasi lengkap, serta lolos pengujian fungsional dan keamanan.`.replace(/'/g, "\\'");

  return `  (${req.id}, '${req.reqNo}', '${req.type}', '${escTitle}', ${appId}, '${reqVer}', ` +
    `'${escDesc}', '${escBNeed}', '${escObj}', '${escExpOut}', '${req.urgency}', ` +
    `${requesterId}, '${requesterName}', '${requesterEmail}', ${requesterUnitId}, '${requesterPhone}', ` +
    `${req.devtiUrusanId}, ${req.twId}, 10, ${req.priorityId}, 'done', ` +
    `'${req.subAt}', '${req.appAt}', NULL, '${req.asgAt}', '${req.asgAt}', '${req.comAt}', ` +
    `${req.targetHours}, ${req.actualHours}, ${req.slaMet}, NULL, 0, ` +
    `NULL, '${completionNote}', NULL, '${req.subAt}', '${req.comAt}')`;
});

sql += requestValues.join(',\n');
sql += `\nON DUPLICATE KEY UPDATE 
  \`status\` = VALUES(\`status\`),
  \`target_sla_hours\` = VALUES(\`target_sla_hours\`),
  \`actual_duration_hours\` = VALUES(\`actual_duration_hours\`),
  \`sla_met\` = VALUES(\`sla_met\`),
  \`completed_at\` = VALUES(\`completed_at\`);\n\n`;

// ------------------------------------------------------------------------------
// 3. TABEL: request_team_assignments
// ------------------------------------------------------------------------------
sql += `-- ------------------------------------------------------------------------------
-- 3. TABEL: request_team_assignments (Penugasan Developer ke Request)
-- ------------------------------------------------------------------------------
INSERT INTO \`request_team_assignments\` (
  \`request_id\`, \`assigned_user_id\`, \`developer_role_id\`, \`assigned_by\`, \`assigned_at\`, \`unassigned_at\`, \`notes\`, \`created_at\`, \`updated_at\`
) VALUES
`;

const assignmentRows = [];
requestDefs.forEach((req, idx) => {
  const beId = (idx % 2 === 0) ? 13 : 14;
  const feId = (idx % 2 === 0) ? 15 : 16;
  const qaId = (idx % 2 === 0) ? 17 : 18;
  const dmId = (idx % 2 === 0) ? 19 : 20;

  // 1. Team Leader (SA)
  assignmentRows.push(`  (${req.id}, 10, 1, 1, '${req.asgAt}', NULL, 'Penugasan Ketua Tim & System Analyst', '${req.asgAt}', '${req.asgAt}')`);
  // 2. Technical Writer (TW)
  assignmentRows.push(`  (${req.id}, ${req.twId}, 2, 1, '${req.asgAt}', NULL, 'Penugasan Technical Writer & Dokumentasi', '${req.asgAt}', '${req.asgAt}')`);
  // 3. Back End (BE)
  assignmentRows.push(`  (${req.id}, ${beId}, 3, 1, '${req.asgAt}', NULL, 'Implementasi API & Business Logic Backend', '${req.asgAt}', '${req.asgAt}')`);
  // 4. Front End (FE)
  assignmentRows.push(`  (${req.id}, ${feId}, 4, 1, '${req.asgAt}', NULL, 'Implementasi Antarmuka Pengguna & Frontend Web', '${req.asgAt}', '${req.asgAt}')`);
  // 5. Quality Assurance (QA)
  assignmentRows.push(`  (${req.id}, ${qaId}, 5, 1, '${req.asgAt}', NULL, 'Pengujian Fungsional, Integrasi, dan UAT', '${req.asgAt}', '${req.asgAt}')`);
  // 6. Data Management (DM)
  assignmentRows.push(`  (${req.id}, ${dmId}, 6, 1, '${req.asgAt}', NULL, 'Pemodelan Basis Data & Migrasi Skema', '${req.asgAt}', '${req.asgAt}')`);
});

sql += assignmentRows.join(',\n');
sql += `;\n\n`;

// ------------------------------------------------------------------------------
// 4. TABEL: request_status_histories
// ------------------------------------------------------------------------------
sql += `-- ------------------------------------------------------------------------------
-- 4. TABEL: request_status_histories (Riwayat Status Perubahan Workflow)
-- ------------------------------------------------------------------------------
INSERT INTO \`request_status_histories\` (
  \`request_id\`, \`from_status\`, \`to_status\`, \`changed_by\`, \`changed_by_name\`, \`actor_role\`, \`note\`, \`metadata\`, \`created_at\`
) VALUES
`;

const historyRows = [];
requestDefs.forEach((req, idx) => {
  const requesterId = (idx % 2 === 0) ? 2 : 4;
  const requesterName = requesterId === 2 ? 'John Doe' : 'Bob Wilson';

  // 1. submitted
  historyRows.push(`  (${req.id}, NULL, 'submitted', ${requesterId}, '${requesterName}', 'USER', 'Permintaan pengembangan berhasil diajukan oleh pemohon', NULL, '${req.subAt}')`);
  // 2. in_review
  historyRows.push(`  (${req.id}, 'submitted', 'in_review', 1, 'Admin User', 'ADMIN', 'Admin memverifikasi kelengkapan dokumen dan rincian kebutuhan', NULL, '${req.subAt}')`);
  // 3. approved
  historyRows.push(`  (${req.id}, 'in_review', 'approved', 1, 'Admin User', 'ADMIN', 'Permintaan disetujui untuk diteruskan ke tim pengembang DevTI', NULL, '${req.appAt}')`);
  // 4. ongoing
  historyRows.push(`  (${req.id}, 'approved', 'ongoing', 1, 'Admin User', 'ADMIN', 'Tim pengembang telah ditugaskan dan prioritas ditetapkan', NULL, '${req.asgAt}')`);
  // 5. done
  historyRows.push(`  (${req.id}, 'ongoing', 'done', 10, 'Ahmad Fauzi', 'DEVELOPER', 'Pengerjaan selesai, telah melalui verifikasi UAT dan disetujui pemohon', NULL, '${req.comAt}')`);
});

sql += historyRows.join(',\n');
sql += `;\n\n`;

// ------------------------------------------------------------------------------
// 5. TABEL: request_progress
// ------------------------------------------------------------------------------
sql += `-- ------------------------------------------------------------------------------
-- 5. TABEL: request_progress (Update Progres Pengerjaan)
-- ------------------------------------------------------------------------------
INSERT INTO \`request_progress\` (
  \`request_id\`, \`progress_percent\`, \`update_note\`, \`updated_by\`, \`updated_by_name\`, \`created_at\`
) VALUES
`;

const progressRows = [];
requestDefs.forEach((req) => {
  progressRows.push(`  (${req.id}, 50, 'Analisis proses bisnis, perancangan basis data, dan implementasi endpoint API backend selesai 50%', 10, 'Ahmad Fauzi', '${req.asgAt}')`);
  progressRows.push(`  (${req.id}, 100, 'Integrasi frontend dan backend selesai, pengujian fungsional QA tuntas, dokumen teknis User Manual selesai.', 10, 'Ahmad Fauzi', '${req.comAt}')`);
});

sql += progressRows.join(',\n');
sql += `;\n\n`;

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

const outputPath = path.join(__dirname, '..', 'db', 'seeds', '003_quarterly_requests_prd.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated SQL file at: ${outputPath}`);
console.log(`Summary:`);
console.log(`- Request Applications: ${allApps.length} rows`);
console.log(`- Requests: ${requestDefs.length} rows`);
console.log(`- Team Assignments: ${assignmentRows.length} rows`);
console.log(`- Status Histories: ${historyRows.length} rows`);
console.log(`- Progress Updates: ${progressRows.length} rows`);
