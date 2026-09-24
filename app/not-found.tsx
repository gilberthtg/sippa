import { ErrorState } from '@/components/shared/error-state';

export default function RootNotFound() {
  return (
    <ErrorState
      type="404"
      title="Halaman Tidak Ditemukan"
      message="Maaf, halaman yang Anda cari tidak ada. Silakan periksa kembali URL atau kembali ke halaman utama."
      backUrl="/"
      backLabel="Kembali ke Beranda"
    />
  );
}
