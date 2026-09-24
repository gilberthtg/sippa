import { ErrorState } from '@/components/shared/error-state';

export default function NotFound() {
  return (
    <ErrorState
      type="404"
      title="Halaman Tidak Ditemukan"
      message="Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan."
      backUrl="/dashboard"
      backLabel="Kembali ke Dashboard"
    />
  );
}
