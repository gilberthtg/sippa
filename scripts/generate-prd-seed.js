const fs = require('fs');
const path = require('path');

// 10 University Applications from PRD
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

// 22 New Applications
const newApps = [
  { id: 21, name: 'Sistem Manajemen Magang dan MBKM', desc: 'Platform pendaftaran, penempatan, dan pelaporan program magang serta studi independen mahasiswa.', version: '1.0.0' },
  { id: 22, name: 'Sistem Monitoring Skripsi dan Tugas Akhir (SIMTA)', desc: 'Monitoring bimbingan skripsi, pengajuan judul, sidang proposal, dan ujian pendadaran terintegrasi.', version: '1.0.0' },
  { id: 23, name: 'Sistem Evaluasi Dosen oleh Mahasiswa (EDOM)', desc: 'Kuesioner evaluasi pembelajaran semester dan penilaian pedagogik dosen oleh mahasiswa secara anonim.', version: '1.0.0' },
  { id: 24, name: 'Sistem Manajemen Inventaris dan Laboratorium (SIMLAB)', desc: 'Peminjaman alat laboratorium, penjadwalan praktikum, dan pencatatan bahan habis pakai praktikum.', version: '1.0.0' },
  { id: 25, name: 'Sistem Informasi Asrama Mahasiswa (SIMAS)', desc: 'Pendaftaran kamar asrama, pembayaran iuran hunian, absensi malam, dan tata tertib asrama mahasiswa.', version: '1.0.0' },
  { id: 26, name: 'Sistem Layanan Konseling Mahasiswa (E-Counseling)', desc: 'Layanan reservasi konseling psikolog kampus, asesmen stres mahasiswa, dan pencatatan rekam bimbingan.', version: '1.0.0' },
  { id: 27, name: 'Sistem Penjaminan Mutu Internal (SPMI Online)', desc: 'Audit mutu internal, pemantauan indikator kinerja utama (IKU), dan pelaporan siklus PPEPP universitas.', version: '1.0.0' },
  { id: 28, name: 'Portal Layanan Wisuda dan Legalisir Ijazah Online', desc: 'Pendaftaran wisuda, verifikasi bebas pinjam pustaka/biaya kuliah, dan layanan legalisir digital ijazah.', version: '1.0.0' },
  { id: 29, name: 'Sistem Reservasi Ruangan dan Fasilitas Kampus', desc: 'Peminjaman aula, ruang rapat, laboratorium komputer, dan lapangan olahraga terintegrasi kalender akademik.', version: '1.0.0' },
  { id: 30, name: 'Sistem Pemilihan Mahasiswa Raya (E-Voting Pemira)', desc: 'Pemungutan suara pemilihan ketua BEM dan DPM universitas secara online dengan enkripsi aman.', version: '1.0.0' },
  { id: 31, name: 'Sistem Pengelolaan Dana Abadi dan Endowment Fund', desc: 'Pencatatan donasi alumni, pengelolaan portofolio dana abadi kampus, dan transparansi penyaluran bantuan.', version: '1.0.0' },
  { id: 32, name: 'Sistem Manajemen Parkir dan Akses Kendaraan Kampus', desc: 'Registrasi plat nomor mahasiswa dan staf, sistem portal RFID, dan pemantauan kapasitas kantong parkir.', version: '1.0.0' },
  { id: 33, name: 'KampusHub Mobile - Layanan Terpadu Mahasiswa', desc: 'Aplikasi mobile all-in-one untuk notifikasi jadwal kuliah, presensi QR code, dan informasi kegiatan kampus.', version: '1.0.0' },
  { id: 34, name: 'Sistem Informasi Klinik dan Layanan Medis Kampus', desc: 'Pencatatan rekam medis mahasiswa dan staf, antrean pemeriksaan dokter kampus, dan stok obat poliklinik.', version: '1.0.0' },
  { id: 35, name: 'Sistem Pengaduan Etik dan Whistleblowing (WBS)', desc: 'Kanal pelaporan anonim atas dugaan pelanggaran etik, kekerasan seksual (Satgas PPKS), dan gratifikasi.', version: '1.0.0' },
  { id: 36, name: 'Sistem Kerjasama Industri dan Kemitraan (SIKERMA)', desc: 'Pencatatan MoU/MoA, monitoring realisasi program kerjasama, dan database mitra industri dalam & luar negeri.', version: '1.0.0' },
  { id: 37, name: 'Repositori Karya Ilmiah dan Tugas Akhir Terbuka', desc: 'Pengunggahan mandiri karya ilmiah mahasiswa (skripsi, tesis) dan integrasi metadata dengan RAMA Kemendikbud.', version: '1.0.0' },
  { id: 38, name: 'Sistem Pengadaan Barang dan Jasa Kampus (E-Proc)', desc: 'Pengadaan barang operasional kampus, tender vendor rekanan, dan pelacakan surat perintah kerja (SPK).', version: '1.0.0' },
  { id: 39, name: 'Sistem Sentra Kekayaan Intelektual dan Paten (HKI)', desc: 'Pendaftaran paten dosen, pencatatan hak cipta karya ilmiah, dan pendampingan komersialisasi riset.', version: '1.0.0' },
  { id: 40, name: 'Sistem Inkubator Bisnis dan Startup Mahasiswa', desc: 'Pendaftaran tenant inkubator, pendampingan mentoring bisnis, dan evaluasi milestone pendanaan startup mahasiswa.', version: '1.0.0' },
  { id: 41, name: 'Sistem Manajemen Kuliah Kerja Nyata (SIM-KKN)', desc: 'Penempatan lokasi KKN tematik, logbook kegiatan lapangan harian, dan penilaian dosen pembimbing lapangan.', version: '1.0.0' },
  { id: 42, name: 'Sistem Informasi Beasiswa Terintegrasi Kampus', desc: 'Pendaftaran beasiswa KIP-Kuliah, prestasi, dan mitra swasta beserta seleksi berkas dan scoring kelayakan.', version: '1.0.0' }
];

// Definition of 43 requests
const requestDefs = [
  // ==========================================
  // Q1 2026: 20 Requests (10 NEW_APP, 10 RFC)
  // SLA: 16 Met (80%), 4 Exceeded (20%)
  // ==========================================
  // 1. NEW_APP - Met
  {
    id: 301, reqNo: 'REQ-20260105-001', type: 'new_application', title: newApps[0].name, newAppId: newApps[0].id,
    desc: 'Pengembangan sistem informasi terpadu untuk mengelola pendaftaran, penempatan, logbook, dan konversi nilai program Magang dan Studi Independen Bersertifikat (MBKM).',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-05 08:30:00', appAt: '2026-01-06 09:15:00', asgAt: '2026-01-06 14:00:00', comAt: '2026-02-27 16:30:00',
    targetHours: 3240, actualHours: 936, slaMet: 1, pauseHours: 0, hold: false
  },
  // 2. NEW_APP - Met
  {
    id: 302, reqNo: 'REQ-20260107-002', type: 'new_application', title: newApps[1].name, newAppId: newApps[1].id,
    desc: 'Pengembangan sistem monitoring skripsi online mulai dari pendaftaran judul, persetujuan pembimbing, upload berkas bimbingan, hingga pendaftaran sidang pendadaran.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-07 09:00:00', appAt: '2026-01-08 10:00:00', asgAt: '2026-01-08 15:30:00', comAt: '2026-03-05 15:00:00',
    targetHours: 3240, actualHours: 984, slaMet: 1, pauseHours: 0, hold: false
  },
  // 3. NEW_APP - Met
  {
    id: 303, reqNo: 'REQ-20260112-003', type: 'new_application', title: newApps[2].name, newAppId: newApps[2].id,
    desc: 'Pengembangan modul kuesioner evaluasi dosen oleh mahasiswa (EDOM) yang dapat diakses melalui portal akademik dengan jaminan anonimitas responden.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-12 10:15:00', appAt: '2026-01-13 11:20:00', asgAt: '2026-01-13 16:00:00', comAt: '2026-03-12 14:00:00',
    targetHours: 3240, actualHours: 1056, slaMet: 1, pauseHours: 0, hold: false
  },
  // 4. NEW_APP - Met
  {
    id: 304, reqNo: 'REQ-20260115-004', type: 'new_application', title: newApps[3].name, newAppId: newApps[3].id,
    desc: 'Aplikasi manajemen laboratorium untuk pencatatan inventaris alat riset, kalibrasi berkala, serta peminjaman fasilitas praktikum oleh civitas akademika.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-15 11:00:00', appAt: '2026-01-16 13:00:00', asgAt: '2026-01-16 16:30:00', comAt: '2026-03-18 16:00:00',
    targetHours: 3240, actualHours: 1080, slaMet: 1, pauseHours: 0, hold: false
  },
  // 5. NEW_APP - Met
  {
    id: 305, reqNo: 'REQ-20260119-005', type: 'new_application', title: newApps[4].name, newAppId: newApps[4].id,
    desc: 'Sistem informasi pengelolaan asrama mahasiswa untuk alokasi kamar, billing tagihan bulanan, pencatatan izin bermalam, dan manajemen sarana prasarana.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 11,
    subAt: '2026-01-19 09:30:00', appAt: '2026-01-20 10:45:00', asgAt: '2026-01-20 14:15:00', comAt: '2026-03-24 15:30:00',
    targetHours: 3240, actualHours: 1104, slaMet: 1, pauseHours: 0, hold: false
  },
  // 6. NEW_APP - Met
  {
    id: 306, reqNo: 'REQ-20260122-006', type: 'new_application', title: newApps[5].name, newAppId: newApps[5].id,
    desc: 'Aplikasi layanan konseling daring bagi mahasiswa untuk konsultasi psikologis, asesmen kesehatan mental secara rahasia dengan psikolog universitas.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-22 08:45:00', appAt: '2026-01-23 09:30:00', asgAt: '2026-01-23 13:45:00', comAt: '2026-03-10 11:00:00',
    targetHours: 3240, actualHours: 792, slaMet: 1, pauseHours: 48, hold: true
  },
  // 7. NEW_APP - Met
  {
    id: 307, reqNo: 'REQ-20260126-007', type: 'new_application', title: newApps[6].name, newAppId: newApps[6].id,
    desc: 'Sistem audit mutu internal dan monitoring ketercapaian target IKU fakultas serta prodi guna mendukung akreditasi LAM dan BAN-PT.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-01-26 10:00:00', appAt: '2026-01-27 11:00:00', asgAt: '2026-01-27 15:00:00', comAt: '2026-03-26 16:30:00',
    targetHours: 3240, actualHours: 1032, slaMet: 1, pauseHours: 0, hold: false
  },
  // 8. NEW_APP - Met
  {
    id: 308, reqNo: 'REQ-20260129-008', type: 'new_application', title: newApps[7].name, newAppId: newApps[7].id,
    desc: 'Portal pendaftaran wisuda, integrasi verifikasi bebas pustaka, bebas tagihan SPP, upload karya akhir, dan pemesanan toga wisudawan.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-29 08:30:00', appAt: '2026-01-30 09:45:00', asgAt: '2026-01-30 14:00:00', comAt: '2026-03-27 14:15:00',
    targetHours: 3240, actualHours: 960, slaMet: 1, pauseHours: 0, hold: false
  },
  // 9. NEW_APP - Exceeded (Submitted in 2025, completed in Q1 2026 taking 145 business days)
  {
    id: 309, reqNo: 'REQ-20250815-009', type: 'new_application', title: newApps[8].name, newAppId: newApps[8].id,
    desc: 'Sistem reservasi ruang rapat, aula serbaguna, dan laboratorium komputer antar unit kerja universitas dengan otorisasi berjenjang.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 11,
    subAt: '2025-08-15 09:00:00', appAt: '2025-08-18 10:00:00', asgAt: '2025-08-19 13:30:00', comAt: '2026-03-16 16:00:00',
    targetHours: 3240, actualHours: 3600, slaMet: 0, pauseHours: 0, hold: false
  },
  // 10. NEW_APP - Exceeded (Submitted in 2025, completed in Q1 2026 taking 142 business days)
  {
    id: 310, reqNo: 'REQ-20250820-010', type: 'new_application', title: newApps[9].name, newAppId: newApps[9].id,
    desc: 'Sistem e-voting pemilihan raya mahasiswa untuk memilih ketua BEM dan DPM dengan sistem verifikasi dua langkah (2FA) NIM mahasiswa.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 12,
    subAt: '2025-08-20 10:30:00', appAt: '2025-08-21 11:15:00', asgAt: '2025-08-22 14:00:00', comAt: '2026-03-19 15:30:00',
    targetHours: 3240, actualHours: 3504, slaMet: 0, pauseHours: 0, hold: false
  },

  // 11. RFC - Met (SIAKAD)
  {
    id: 311, reqNo: 'REQ-20260108-011', type: 'rfc', title: universityApps[0].name, appId: 11, reqVer: '2.2.0',
    desc: 'Integrasi modul pembayaran Virtual Account (VA) Bank Mandiri, BNI, dan BRI untuk registrasi KRS semester genap agar otomatis terverifikasi.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-08 08:15:00', appAt: '2026-01-09 09:00:00', asgAt: '2026-01-09 13:00:00', comAt: '2026-02-06 16:00:00',
    targetHours: 1056, actualHours: 504, slaMet: 1, pauseHours: 0, hold: false
  },
  // 12. RFC - Met (LMS)
  {
    id: 312, reqNo: 'REQ-20260113-012', type: 'rfc', title: universityApps[1].name, appId: 12, reqVer: '1.5.0',
    desc: 'Penambahan fitur proctoring ujian online berbasis webcam snapshot dan browser tab-lock untuk mencegah kecurangan ujian akhir semester.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-01-13 09:30:00', appAt: '2026-01-14 10:15:00', asgAt: '2026-01-14 14:30:00', comAt: '2026-02-13 17:00:00',
    targetHours: 1056, actualHours: 552, slaMet: 1, pauseHours: 0, hold: false
  },
  // 13. RFC - Met (Keuangan)
  {
    id: 313, reqNo: 'REQ-20260116-013', type: 'rfc', title: universityApps[2].name, appId: 13, reqVer: '1.9.0',
    desc: 'Otomasi rekonsiliasi mutasi bank harian dan pencocokan otomatis invoice tagihan biaya laboratorium serta sumbangan pembinaan pendidikan.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 11,
    subAt: '2026-01-16 10:00:00', appAt: '2026-01-19 11:30:00', asgAt: '2026-01-19 15:00:00', comAt: '2026-02-20 16:30:00',
    targetHours: 1056, actualHours: 600, slaMet: 1, pauseHours: 0, hold: false
  },
  // 14. RFC - Met (SIPEG)
  {
    id: 314, reqNo: 'REQ-20260120-014', type: 'rfc', title: universityApps[3].name, appId: 14, reqVer: '2.1.0',
    desc: 'Integrasi sistem sinkronisasi data Beban Kerja Dosen (BKD) dengan Web Service Platform SISTER Kemendikbudristek secara berkala.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-20 11:15:00', appAt: '2026-01-21 13:00:00', asgAt: '2026-01-21 16:00:00', comAt: '2026-02-25 15:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1, pauseHours: 0, hold: false
  },
  // 15. RFC - Met (PMB)
  {
    id: 315, reqNo: 'REQ-20260123-015', type: 'rfc', title: universityApps[4].name, appId: 15, reqVer: '1.4.0',
    desc: 'Implementasi fitur OCR (Optical Character Recognition) untuk ekstraksi otomatis nilai rapor calon mahasiswa jalur prestasi undangan.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-01-23 09:00:00', appAt: '2026-01-26 10:00:00', asgAt: '2026-01-26 14:00:00', comAt: '2026-03-02 16:00:00',
    targetHours: 1056, actualHours: 648, slaMet: 1, pauseHours: 0, hold: false
  },
  // 16. RFC - Met (Perpustakaan)
  {
    id: 316, reqNo: 'REQ-20260127-016', type: 'rfc', title: universityApps[5].name, appId: 16, reqVer: '1.2.0',
    desc: 'Integrasi Single Sign-On (SSO) akun kampus dengan pangkalan database e-journal ScienceDirect, SpringerLink, dan IEEE Xplore.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-27 10:45:00', appAt: '2026-01-28 11:30:00', asgAt: '2026-01-28 15:30:00', comAt: '2026-03-06 14:30:00',
    targetHours: 1056, actualHours: 672, slaMet: 1, pauseHours: 0, hold: false
  },
  // 17. RFC - Met (Presensi)
  {
    id: 317, reqNo: 'REQ-20260130-017', type: 'rfc', title: universityApps[6].name, appId: 17, reqVer: '1.3.0',
    desc: 'Penambahan validasi geofencing GPS radius 50 meter dan deteksi liveness face recognition untuk presensi kehadiran kuliah tatap muka.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-01-30 08:30:00', appAt: '2026-02-02 09:15:00', asgAt: '2026-02-02 13:45:00', comAt: '2026-03-04 15:00:00',
    targetHours: 1056, actualHours: 528, slaMet: 1, pauseHours: 0, hold: false
  },
  // 18. RFC - Met (LPPM)
  {
    id: 318, reqNo: 'REQ-20260203-018', type: 'rfc', title: universityApps[7].name, appId: 18, reqVer: '1.1.0',
    desc: 'Modul blind review proposal penelitian dan pengabdian masyarakat oleh reviewer internal dengan form penilaian kriteria berbasis rubrik.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 12,
    subAt: '2026-02-03 09:15:00', appAt: '2026-02-04 10:00:00', asgAt: '2026-02-04 14:15:00', comAt: '2026-03-11 16:30:00',
    targetHours: 1056, actualHours: 600, slaMet: 1, pauseHours: 0, hold: false
  },
  // 19. RFC - Exceeded (Kemahasiswaan - took 50 business days > 44 days target)
  {
    id: 319, reqNo: 'REQ-20260102-019', type: 'rfc', title: universityApps[8].name, appId: 19, reqVer: '1.6.0',
    desc: 'Penyusunan modul Surat Keterangan Pendamping Ijazah (SKPI) dengan sistem akumulasi poin keaktifan organisasi, lomba, dan kepanitiaan.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 3, twId: 11,
    subAt: '2026-01-02 08:00:00', appAt: '2026-01-05 09:00:00', asgAt: '2026-01-05 13:00:00', comAt: '2026-03-23 17:00:00',
    targetHours: 1056, actualHours: 1296, slaMet: 0, pauseHours: 0, hold: false
  },
  // 20. RFC - Exceeded (Alumni - took 49 business days > 44 days target)
  {
    id: 320, reqNo: 'REQ-20260105-020', type: 'rfc', title: universityApps[9].name, appId: 20, reqVer: '1.1.0',
    desc: 'Pembaruan kuisioner tracer study lulusan sesuai standar terbaru Ditjen Diktiristek dengan integrasi broadcast WhatsApp API blast.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 12,
    subAt: '2026-01-05 10:00:00', appAt: '2026-01-06 11:30:00', asgAt: '2026-01-06 15:30:00', comAt: '2026-03-25 16:00:00',
    targetHours: 1056, actualHours: 1248, slaMet: 0, pauseHours: 0, hold: false
  },

  // ==========================================
  // Q2 2026: 10 Requests (5 NEW_APP, 5 RFC)
  // SLA: 8 Met (80%), 2 Exceeded (20%)
  // ==========================================
  // 21. NEW_APP - Met
  {
    id: 321, reqNo: 'REQ-20260406-021', type: 'new_application', title: newApps[10].name, newAppId: newApps[10].id,
    desc: 'Aplikasi pengelolaan dana abadi universitas untuk transparansi pelaporan donasi alumni dan hasil imbal hasil investasi beasiswa.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 11,
    subAt: '2026-04-06 09:00:00', appAt: '2026-04-07 10:00:00', asgAt: '2026-04-07 14:00:00', comAt: '2026-05-29 15:00:00',
    targetHours: 3240, actualHours: 912, slaMet: 1, pauseHours: 0, hold: false
  },
  // 22. NEW_APP - Met
  {
    id: 322, reqNo: 'REQ-20260410-022', type: 'new_application', title: newApps[11].name, newAppId: newApps[11].id,
    desc: 'Sistem manajemen gerbang parkir terpadu dengan integrasi pembacaan plat nomor otomatis (ANPR) dan kartu mahasiswa RFID.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 12,
    subAt: '2026-04-10 10:30:00', appAt: '2026-04-13 11:00:00', asgAt: '2026-04-13 15:00:00', comAt: '2026-06-12 16:00:00',
    targetHours: 3240, actualHours: 1032, slaMet: 1, pauseHours: 0, hold: false
  },
  // 23. NEW_APP - Met
  {
    id: 323, reqNo: 'REQ-20260415-023', type: 'new_application', title: newApps[12].name, newAppId: newApps[12].id,
    desc: 'Aplikasi mobile terpadu bagi mahasiswa untuk notifikasi jadwal perkuliahan harian, KRS, transkrip nilai, dan informasi akademik.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-04-15 08:30:00', appAt: '2026-04-16 09:30:00', asgAt: '2026-04-16 13:30:00', comAt: '2026-06-05 14:30:00',
    targetHours: 3240, actualHours: 864, slaMet: 1, pauseHours: 0, hold: false
  },
  // 24. NEW_APP - Met
  {
    id: 324, reqNo: 'REQ-20260420-024', type: 'new_application', title: newApps[13].name, newAppId: newApps[13].id,
    desc: 'Sistem informasi klinik universitas untuk rekam medis elektronik mahasiswa, pendaftaran berobat online, dan inventaris obat-obatan.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 12,
    subAt: '2026-04-20 09:15:00', appAt: '2026-04-21 10:30:00', asgAt: '2026-04-21 14:00:00', comAt: '2026-06-19 15:45:00',
    targetHours: 3240, actualHours: 1008, slaMet: 1, pauseHours: 0, hold: false
  },
  // 25. NEW_APP - Exceeded (Submitted in late 2025, completed in June 2026 taking 146 business days)
  {
    id: 325, reqNo: 'REQ-20251110-025', type: 'new_application', title: newApps[14].name, newAppId: newApps[14].id,
    desc: 'Kanal pengaduan pelanggaran kode etik, kecurangan akademik, dan kekerasan seksual secara aman dan terenkripsi.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2025-11-10 09:00:00', appAt: '2025-11-11 10:00:00', asgAt: '2025-11-11 14:30:00', comAt: '2026-06-25 16:30:00',
    targetHours: 3240, actualHours: 3648, slaMet: 0, pauseHours: 0, hold: false
  },

  // 26. RFC - Met (SIAKAD)
  {
    id: 326, reqNo: 'REQ-20260408-026', type: 'rfc', title: universityApps[0].name, appId: 11, reqVer: '2.3.0',
    desc: 'Validasi otomatis kelayakan prasyarat mata kuliah saat input rencana studi serta integrasi tanda tangan digital pada lembar KHS.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 11,
    subAt: '2026-04-08 08:30:00', appAt: '2026-04-09 09:15:00', asgAt: '2026-04-09 13:45:00', comAt: '2026-05-18 16:00:00',
    targetHours: 1056, actualHours: 648, slaMet: 1, pauseHours: 0, hold: false
  },
  // 27. RFC - Met (LMS)
  {
    id: 327, reqNo: 'REQ-20260414-027', type: 'rfc', title: universityApps[1].name, appId: 12, reqVer: '1.6.0',
    desc: 'Penyediaan modul forum diskusi interaktif dengan integrasi notifikasi push ke aplikasi mobile mahasiswa dan rubric grading tugas.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 12,
    subAt: '2026-04-14 09:45:00', appAt: '2026-04-15 10:30:00', asgAt: '2026-04-15 14:00:00', comAt: '2026-05-22 17:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1, pauseHours: 0, hold: false
  },
  // 28. RFC - Met (SIPEG)
  {
    id: 328, reqNo: 'REQ-20260421-028', type: 'rfc', title: universityApps[3].name, appId: 14, reqVer: '2.2.0',
    desc: 'Pengembangan modul pengajuan cuti dosen dan tenaga kependidikan berbasis alur persetujuan berjenjang dan pemotongan jatah cuti otomatis.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 2, twId: 11,
    subAt: '2026-04-21 10:00:00', appAt: '2026-04-22 11:15:00', asgAt: '2026-04-22 15:30:00', comAt: '2026-06-03 15:30:00',
    targetHours: 1056, actualHours: 720, slaMet: 1, pauseHours: 0, hold: false
  },
  // 29. RFC - Met (Presensi)
  {
    id: 329, reqNo: 'REQ-20260427-029', type: 'rfc', title: universityApps[6].name, appId: 17, reqVer: '1.4.0',
    desc: 'Penyusunan dashboard rekapitulasi kehadiran pengajar per semester untuk integrasi ke sistem penggajian dan remunerasi dosen honorer.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-04-27 08:30:00', appAt: '2026-04-28 09:00:00', asgAt: '2026-04-28 13:00:00', comAt: '2026-05-28 16:30:00',
    targetHours: 1056, actualHours: 528, slaMet: 1, pauseHours: 0, hold: false
  },
  // 30. RFC - Exceeded (Kemahasiswaan - took 48 business days > 44 days target)
  {
    id: 330, reqNo: 'REQ-20260407-030', type: 'rfc', title: universityApps[8].name, appId: 19, reqVer: '1.7.0',
    desc: 'Modul perizinan kegiatan organisasi kemahasiswaan (Ormawa) dan peminjaman inventaris perlengkapan kampus secara online.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-04-07 10:00:00', appAt: '2026-04-08 11:00:00', asgAt: '2026-04-08 15:00:00', comAt: '2026-06-23 16:00:00',
    targetHours: 1056, actualHours: 1224, slaMet: 0, pauseHours: 0, hold: false
  },

  // ==========================================
  // Q3 2026: 5 Requests (3 NEW_APP, 2 RFC)
  // SLA: 4 Met (80%), 1 Exceeded (20%)
  // ==========================================
  // 31. NEW_APP - Met
  {
    id: 331, reqNo: 'REQ-20260706-031', type: 'new_application', title: newApps[15].name, newAppId: newApps[15].id,
    desc: 'Sistem pendataan dokumen kerjasama institusi (MoU/MoA) dengan mitra industri dan universitas luar negeri beserta pelaporan realisasi kegiatan.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-07-06 09:00:00', appAt: '2026-07-07 10:00:00', asgAt: '2026-07-07 14:00:00', comAt: '2026-08-28 15:30:00',
    targetHours: 3240, actualHours: 912, slaMet: 1, pauseHours: 0, hold: false
  },
  // 32. NEW_APP - Met
  {
    id: 332, reqNo: 'REQ-20260713-032', type: 'new_application', title: newApps[16].name, newAppId: newApps[16].id,
    desc: 'Repositori terbuka karya ilmiah sivitas akademika universitas untuk mendukung gerakan open access dan integrasi sitasi Google Scholar.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 3, twId: 12,
    subAt: '2026-07-13 10:00:00', appAt: '2026-07-14 11:00:00', asgAt: '2026-07-14 15:00:00', comAt: '2026-09-18 16:00:00',
    targetHours: 3240, actualHours: 1152, slaMet: 1, pauseHours: 0, hold: false
  },
  // 33. NEW_APP - Exceeded (Submitted Feb 2026, completed Sept 2026 taking 144 business days)
  {
    id: 333, reqNo: 'REQ-20260216-033', type: 'new_application', title: newApps[17].name, newAppId: newApps[17].id,
    desc: 'Sistem pengadaan barang dan jasa elektronik kampus untuk transparansi lelang vendor dan pelacakan realisasi pengiriman logistik.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 11,
    subAt: '2026-02-16 09:30:00', appAt: '2026-02-17 10:30:00', asgAt: '2026-02-17 14:00:00', comAt: '2026-09-24 16:30:00',
    targetHours: 3240, actualHours: 3600, slaMet: 0, pauseHours: 0, hold: false
  },

  // 34. RFC - Met (Keuangan)
  {
    id: 334, reqNo: 'REQ-20260708-034', type: 'rfc', title: universityApps[2].name, appId: 13, reqVer: '2.0.0',
    desc: 'Modul pengajuan anggaran kegiatan ormawa mahasiswa dan pencairan bantuan riset dosen secara paperless dengan notifikasi email/SMS.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 2, twId: 12,
    subAt: '2026-07-08 08:30:00', appAt: '2026-07-09 09:30:00', asgAt: '2026-07-09 13:30:00', comAt: '2026-08-14 16:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1, pauseHours: 0, hold: false
  },
  // 35. RFC - Met (Perpustakaan)
  {
    id: 335, reqNo: 'REQ-20260720-035', type: 'rfc', title: universityApps[5].name, appId: 16, reqVer: '1.3.0',
    desc: 'Fitur peminjaman buku mandiri dengan pemindaian barcode buku dan QR code kartu tanda mahasiswa via aplikasi ponsel.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 2, twId: 11,
    subAt: '2026-07-20 10:15:00', appAt: '2026-07-21 11:30:00', asgAt: '2026-07-21 15:30:00', comAt: '2026-08-25 15:00:00',
    targetHours: 1056, actualHours: 576, slaMet: 1, pauseHours: 0, hold: false
  },

  // ==========================================
  // Q4 2026: 8 Requests (4 NEW_APP, 4 RFC)
  // SLA: 6 Met (75%), 2 Exceeded (25%)
  // ==========================================
  // 36. NEW_APP - Met
  {
    id: 336, reqNo: 'REQ-20261001-036', type: 'new_application', title: newApps[18].name, newAppId: newApps[18].id,
    desc: 'Aplikasi pendaftaran paten, hak cipta, dan desain industri bagi dosen serta pencatatan royalti inovasi teknologi universitas.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-10-01 09:00:00', appAt: '2026-10-02 10:00:00', asgAt: '2026-10-02 14:00:00', comAt: '2026-11-20 15:00:00',
    targetHours: 3240, actualHours: 840, slaMet: 1, pauseHours: 0, hold: false
  },
  // 37. NEW_APP - Met
  {
    id: 337, reqNo: 'REQ-20261005-037', type: 'new_application', title: newApps[19].name, newAppId: newApps[19].id,
    desc: 'Portal inkubator bisnis mahasiswa untuk penjadwalan mentoring dengan praktisi industri dan pemantauan pendanaan modal ventura kampus.',
    urgency: 'low', priorityId: 1, devtiUrusanId: 3, twId: 12,
    subAt: '2026-10-05 10:30:00', appAt: '2026-10-06 11:15:00', asgAt: '2026-10-06 15:30:00', comAt: '2026-11-27 16:30:00',
    targetHours: 3240, actualHours: 912, slaMet: 1, pauseHours: 0, hold: false
  },
  // 38. NEW_APP - Met
  {
    id: 338, reqNo: 'REQ-20261008-038', type: 'new_application', title: newApps[20].name, newAppId: newApps[20].id,
    desc: 'Sistem penentuan lokasi dan alokasi kelompok KKN tematik mahasiswa serta pengunggahan logbook mingguan kegiatan pengabdian.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-10-08 08:30:00', appAt: '2026-10-09 09:30:00', asgAt: '2026-10-09 13:45:00', comAt: '2026-11-25 15:00:00',
    targetHours: 3240, actualHours: 816, slaMet: 1, pauseHours: 0, hold: false
  },
  // 39. NEW_APP - Exceeded (Submitted in May 2026, completed in Nov 2026 taking 140 business days)
  {
    id: 339, reqNo: 'REQ-20260504-039', type: 'new_application', title: newApps[21].name, newAppId: newApps[21].id,
    desc: 'Sistem seleksi berkas penerima beasiswa KIP-Kuliah dan beasiswa prestasi dengan scoring kelayakan ekonomi keluarga secara otomatis.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 12,
    subAt: '2026-05-04 09:00:00', appAt: '2026-05-05 10:00:00', asgAt: '2026-05-05 14:00:00', comAt: '2026-11-26 16:00:00',
    targetHours: 3240, actualHours: 3504, slaMet: 0, pauseHours: 0, hold: false
  },

  // 40. RFC - Met (SIAKAD)
  {
    id: 340, reqNo: 'REQ-20261002-040', type: 'rfc', title: universityApps[0].name, appId: 11, reqVer: '2.4.0',
    desc: 'Penambahan fitur konversi nilai dan rekognisi hingga 20 SKS untuk program magang dan studi independen kurikulum merdeka.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 11,
    subAt: '2026-10-02 08:30:00', appAt: '2026-10-05 09:00:00', asgAt: '2026-10-05 13:00:00', comAt: '2026-11-06 16:00:00',
    targetHours: 1056, actualHours: 576, slaMet: 1, pauseHours: 0, hold: false
  },
  // 41. RFC - Met (LMS)
  {
    id: 341, reqNo: 'REQ-20261007-041', type: 'rfc', title: universityApps[1].name, appId: 12, reqVer: '1.7.0',
    desc: 'Peningkatan kapasitas streaming video materi kuliah, sinkronisasi tautan Zoom otomatis, dan sistem absensi kehadiran webinar.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 1, twId: 12,
    subAt: '2026-10-07 09:15:00', appAt: '2026-10-08 10:15:00', asgAt: '2026-10-08 14:15:00', comAt: '2026-11-13 17:00:00',
    targetHours: 1056, actualHours: 624, slaMet: 1, pauseHours: 0, hold: false
  },
  // 42. RFC - Met (LPPM)
  {
    id: 342, reqNo: 'REQ-20261012-042', type: 'rfc', title: universityApps[7].name, appId: 18, reqVer: '1.2.0',
    desc: 'Modul pelaporan kemajuan berkas luaran wajib publikasi jurnal terindeks Scopus dan SINTA beserta verifikasi anggaran pengeluaran.',
    urgency: 'medium', priorityId: 2, devtiUrusanId: 3, twId: 11,
    subAt: '2026-10-12 10:00:00', appAt: '2026-10-13 11:00:00', asgAt: '2026-10-13 15:00:00', comAt: '2026-11-18 15:30:00',
    targetHours: 1056, actualHours: 600, slaMet: 1, pauseHours: 0, hold: false
  },
  // 43. RFC - Exceeded (PMB - took 49 business days > 44 days target)
  {
    id: 343, reqNo: 'REQ-20260901-043', type: 'rfc', title: universityApps[4].name, appId: 15, reqVer: '1.5.0',
    desc: 'Integrasi sistem Computer Based Test (CBT) mandiri dengan bank soal terenkripsi dan sistem penilaian otomatis ujian masuk universitas.',
    urgency: 'high', priorityId: 3, devtiUrusanId: 1, twId: 12,
    subAt: '2026-09-01 08:30:00', appAt: '2026-09-02 09:15:00', asgAt: '2026-09-02 13:30:00', comAt: '2026-11-10 16:30:00',
    targetHours: 1056, actualHours: 1224, slaMet: 0, pauseHours: 0, hold: false
  }
];

// Generate SQL script
let sql = `-- ==============================================================================
-- SIPPA: Script Seed Data Permintaan Pengembangan Aplikasi (PRD Aligned)
-- Periode: Q1 - Q4 2026 (Total 43 Requests: Q1=20, Q2=10, Q3=5, Q4=8)
-- SLA: 80% Tercapai (34 Requests), 20% Melampaui (9 Requests)
-- Tables Populated:
--   1. request_applications (10 Aplikasi Master PRD + 22 Aplikasi Baru dari New App)
--   2. requests (43 Requests: 22 NEW_APPLICATION, 21 RFC)
--   3. request_team_assignments (Penugasan tim pengembang: SA, TW, BE, FE, QA, DM)
--   4. request_status_histories (Riwayat transisi status alur workflow)
--   5. request_progress (Update progress pengerjaan 50% dan 100%)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABEL: request_applications
-- Master Aplikasi Universitas dari PRD (ID 11-20) dan Aplikasi Baru (ID 21-42)
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
// 2. TABEL: requests
// ------------------------------------------------------------------------------
sql += `-- ------------------------------------------------------------------------------
-- 2. TABEL: requests (43 Records)
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
  const onHoldReason = req.hold ? 'Menunggu konfirmasi kebutuhan tambahan dari pihak fakultas dan unit pemohon.' : null;
  const slaPausedAt = req.hold ? `'${req.asgAt}'` : 'NULL';

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
    `${req.targetHours}, ${req.actualHours}, ${req.slaMet}, ${slaPausedAt}, ${req.pauseHours}, ` +
    `NULL, '${completionNote}', ${onHoldReason ? `'${onHoldReason}'` : 'NULL'}, '${req.subAt}', '${req.comAt}')`;
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
// Penugasan tim pengembang:
//   - Team Leader: Ahmad Fauzi (id=10, role=1/SA)
//   - Technical Writer: Siti Nurhaliza (id=11, role=2/TW) atau Dewi Lestari (id=12, role=2/TW)
//   - Back End: Budi Santoso (id=13, role=3) atau Andi Wijaya (id=14, role=3)
//   - Front End: Rina Kusuma (id=15, role=4) atau Dian Pratama (id=16, role=4)
//   - Quality Assurance: Yudi Setiawan (id=17, role=5) atau Maya Sari (id=18, role=5)
//   - Data Management: Rudi Hartono (id=19, role=6) atau Lisa Anggraini (id=20, role=6)
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

  // Optional Hold Cycle
  if (req.hold) {
    historyRows.push(`  (${req.id}, 'ongoing', 'on_hold', 1, 'Admin User', 'ADMIN', 'Pengerjaan ditahan sementara menunggu konfirmasi regulasi fakultas', '{"reason":"Menunggu konfirmasi regulasi fakultas"}', '${req.asgAt}')`);
    historyRows.push(`  (${req.id}, 'on_hold', 'ongoing', 1, 'Admin User', 'ADMIN', 'Konfirmasi regulasi telah diterima, pekerjaan dilanjutkan', NULL, '${req.asgAt}')`);
  }

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
  // 50% Progress at assigned_at + a few days
  progressRows.push(`  (${req.id}, 50, 'Analisis proses bisnis, perancangan basis data, dan implementasi endpoint API backend selesai 50%', 10, 'Ahmad Fauzi', '${req.asgAt}')`);
  // 100% Progress at completed_at
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
