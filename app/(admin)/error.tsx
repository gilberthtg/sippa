'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin application error:', error);
  }, [error]);

  return (
    <ErrorState
      type="error"
      title="Terjadi Kesalahan Sistem"
      message="Terjadi kesalahan saat memproses permintaan Anda. Error telah dicatat dalam log sistem."
      showReset
      onReset={reset}
      backUrl="/admin/dashboard"
      backLabel="Kembali ke Dashboard Admin"
    />
  );
}
