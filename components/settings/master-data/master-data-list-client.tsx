'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MasterDataTable } from './master-data-table';
import { MasterDataFilters } from './master-data-filters';
import { MasterDataSearch } from './master-data-search';
import { MasterDataDialog } from './master-data-dialog';
import { useRouter, useSearchParams } from 'next/navigation';

type MasterDataItem = {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  type: 'units' | 'teams' | 'priorities';
  initialData: {
    units?: MasterDataItem[];
    teams?: MasterDataItem[];
    priorities?: MasterDataItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const typeLabels = {
  units: { singular: 'Unit', plural: 'Units' },
  teams: { singular: 'Team', plural: 'Teams' },
  priorities: { singular: 'Priority', plural: 'Priorities' },
};

export function MasterDataListClient({ type, initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | null>(null);

  const items = initialData[type] || [];
  const label = typeLabels[type];

  const handleEdit = (item: MasterDataItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/${type}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <MasterDataSearch type={type} />
          <MasterDataFilters />
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add {label.singular}
        </Button>
      </div>

      <MasterDataTable
        type={type}
        items={items}
        onEdit={handleEdit}
        pagination={{
          page: initialData.page,
          totalPages: initialData.totalPages,
          total: initialData.total,
          onPageChange: handlePageChange,
        }}
      />

      <MasterDataDialog
        type={type}
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedItem && (
        <MasterDataDialog
          type={type}
          mode="edit"
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedItem}
        />
      )}
    </div>
  );
}
