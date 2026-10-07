'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SLAPolicyTable } from './sla-policy-table';
import { SLAPolicyFilters } from './sla-policy-filters';
import { CreateSLAPolicyDialog } from './create-sla-policy-dialog';
import { EditSLAPolicyDialog } from './edit-sla-policy-dialog';
import { useRouter, useSearchParams } from 'next/navigation';

type SLAPolicy = {
  id: number;
  requestType: string | null;
  priorityId: number | null;
  priorityName: string | null;
  priorityCode: string | null;
  targetBusinessDays: number; // Changed from targetHours
  isActive: boolean;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Priority = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  initialData: {
    policies: SLAPolicy[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  priorities: Priority[];
};

export function SLAPolicyListClient({ initialData, priorities }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<SLAPolicy | null>(null);

  const handleEdit = (policy: SLAPolicy) => {
    setSelectedPolicy(policy);
    setEditDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/sla-policies?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SLAPolicyFilters priorities={priorities} />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add SLA Policy
        </Button>
      </div>

      <SLAPolicyTable
        policies={initialData.policies}
        onEdit={handleEdit}
        pagination={{
          page: initialData.page,
          totalPages: initialData.totalPages,
          total: initialData.total,
          onPageChange: handlePageChange,
        }}
      />

      <CreateSLAPolicyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        priorities={priorities}
      />

      {selectedPolicy && (
        <EditSLAPolicyDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          policy={selectedPolicy}
          priorities={priorities}
        />
      )}
    </div>
  );
}
