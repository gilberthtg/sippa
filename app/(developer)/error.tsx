'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

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
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Terjadi Kesalahan</h1>
        <p className="max-w-[500px] text-muted-foreground">
          Gagal memuat halaman developer workspace.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Coba Lagi
        </Button>
        <Link href="/developer/dashboard">
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
