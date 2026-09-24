'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
          <div className="w-full max-w-md space-y-6 rounded-lg border-2 bg-card p-8 text-center shadow-lg">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <svg
                  className="h-10 w-10 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Terjadi Kesalahan Fatal
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Aplikasi mengalami masalah serius. Silakan muat ulang halaman atau hubungi administrator sistem.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={reset}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Muat Ulang Aplikasi
              </button>
              <a
                href="/"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
