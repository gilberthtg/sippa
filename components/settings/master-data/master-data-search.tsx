'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type Props = {
  type: 'units' | 'teams' | 'priorities' | 'developer-roles' | 'applications' | 'sla-holidays' | 'document-types' | 'service-document-types';
};

export function MasterDataSearch({ type }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    
    params.delete('page');
    
    router.push(`/admin/settings/${type}?${params.toString()}`);
  }, 500);

  useEffect(() => {
    handleSearch(value);
  }, [value, handleSearch]);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by code or name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
