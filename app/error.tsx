'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <ErrorState
      type="error"
      title="Terjadi Kesalahan"
      message="Maaf, terjadi kesalahan pada aplikasi. Silakan coba lagi atau hubungi administrator jika masalah berlanjut."
      showReset
      onReset={reset}
      backUrl="/"
      backLabel="Kembali ke Beranda"
    />
  );
}
