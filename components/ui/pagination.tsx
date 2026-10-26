'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 25,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // ponytail: visible window max 5 numbered buttons; upgrade to ellipsis for huge page counts
  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const endPage = Math.min(totalPages, Math.max(currentPage + 2, 5));
  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const from = totalItems !== undefined ? (currentPage - 1) * pageSize + 1 : null;
  const to = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <div className="text-sm text-muted-foreground">
        {totalItems !== undefined ? (
          <span>
            Menampilkan <span className="font-medium text-foreground">{from}</span> -{' '}
            <span className="font-medium text-foreground">{to}</span> dari{' '}
            <span className="font-medium text-foreground">{totalItems}</span> data
          </span>
        ) : (
          <span>
            Halaman <span className="font-medium text-foreground">{currentPage}</span> dari{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Sebelumnya</span>
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? 'default' : 'outline'}
            size="sm"
            className="w-8 p-0"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Halaman berikutnya"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Berikutnya</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
