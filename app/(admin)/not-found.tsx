import { ErrorState } from '@/components/shared/error-state';

export default function AdminNotFound() {
  return (
    <ErrorState
      type="404"
      title="Halaman Admin Tidak Ditemukan"
      message="Modul atau halaman admin yang Anda cari tidak tersedia."
      backUrl="/admin/dashboard"
      backLabel="Kembali ke Dashboard Admin"
    />
  );
}
