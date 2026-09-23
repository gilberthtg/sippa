'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';
import { toggleSLAPolicyActive } from '@/app/actions/sla-policies';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type SLAPolicy = {
  id: number;
  requestType: string | null;
  priorityId: number | null;
  priorityName: string | null;
  priorityCode: string | null;
  targetHours: number;
  isActive: boolean;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  policies: SLAPolicy[];
  onEdit: (policy: SLAPolicy) => void;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  new_application: 'New Application',
  rfc: 'RFC',
};

export function SLAPolicyTable({ policies, onEdit, pagination }: Props) {
  const router = useRouter();

  const handleToggleActive = async (policy: SLAPolicy) => {
    try {
      await toggleSLAPolicyActive(policy.id, !policy.isActive);
      toast.success(
        policy.isActive
          ? 'SLA policy deactivated successfully'
          : 'SLA policy activated successfully'
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update SLA policy');
    }
  };

  if (policies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No SLA policies found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Target (Hours)</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">
                  {policy.requestType ? REQUEST_TYPE_LABELS[policy.requestType] : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{policy.priorityName || '-'}</Badge>
                </TableCell>
                <TableCell>{policy.targetHours}h</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {policy.effectiveFrom ? format(new Date(policy.effectiveFrom), 'dd MMM yyyy') : '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {policy.effectiveTo ? format(new Date(policy.effectiveTo), 'dd MMM yyyy') : 'Indefinite'}
                </TableCell>
                <TableCell>
                  {policy.isActive ? (
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(policy)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(policy)}>
                        {policy.isActive ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * 20 + 1} to{' '}
            {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} policies
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
