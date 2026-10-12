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
import { id as localeId } from 'date-fns/locale';
import { toggleUnitActive, togglePriorityActive } from '@/app/actions/master-data';
// Teams feature deprecated - toggleTeamActive removed
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  items: MasterDataItem[];
  onEdit: (item: MasterDataItem) => void;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

export function MasterDataTable({ type, items, onEdit, pagination }: Props) {
  const router = useRouter();

  const handleToggleActive = async (item: MasterDataItem) => {
    try {
      if (type === 'units') {
        await toggleUnitActive(item.id, !item.isActive);
      } else if (type === 'teams') {
        // Teams feature deprecated
        toast.error('Teams feature has been deprecated. Use individual developer assignments instead.');
        return;
      } else if (type === 'priorities') {
        await togglePriorityActive(item.id, !item.isActive);
      }

      toast.success(
        item.isActive
          ? `${type.slice(0, -1)} deactivated successfully`
          : `${type.slice(0, -1)} activated successfully`
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to update ${type.slice(0, -1)}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No {type} found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              {type === 'priorities' && <TableHead>Sort Order</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.code}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                {type === 'priorities' && (
                  <TableCell className="text-sm text-muted-foreground">{item.sortOrder}</TableCell>
                )}
                <TableCell>
                  {item.isActive ? (
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(item.createdAt), 'dd MMM yyyy', { locale: localeId })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleActive(item)}>
                        {item.isActive ? (
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
            {Math.min(pagination.page * 20, pagination.total)} of {pagination.total} items
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
