'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function DeveloperErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Developer application error:', error);
  }, [error]);

  return (
    <ErrorState
      type="error"
      title="Terjadi Kesalahan"
      message="Gagal memuat halaman developer workspace. Silakan coba lagi atau kembali ke dashboard."
      showReset
      onReset={reset}
      backUrl="/developer/dashboard"
      backLabel="Kembali ke Dashboard Developer"
    />
  );
}
