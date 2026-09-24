import { ErrorState } from '@/components/shared/error-state';

export default function DeveloperNotFound() {
  return (
    <ErrorState
      type="404"
      title="Halaman Tidak Ditemukan"
      message="Modul workspace yang Anda cari tidak tersedia."
      backUrl="/developer/dashboard"
      backLabel="Kembali ke Dashboard Developer"
    />
  );
}
