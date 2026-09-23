'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface RequestSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function RequestSearch({ value, onChange }: RequestSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Cari berdasarkan nomor atau judul request..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
