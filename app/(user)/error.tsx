'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('User application error:', error);
  }, [error]);

  return (
    <ErrorState
      type="error"
      title="Terjadi Kesalahan"
      message="Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau kembali ke halaman utama."
      showReset
      onReset={reset}
      backUrl="/dashboard"
      backLabel="Kembali ke Dashboard"
    />
  );
}
