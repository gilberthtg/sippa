'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Package } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MasterDataSearch } from '../master-data/master-data-search';
import { ApplicationHistoryDialog } from './application-history-dialog';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

type Application = {
  id: number;
  applicationName: string;
  description: string | null;
  currentVersion: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  creatorName: string | null;
  creatorEmail: string | null;
  rfcCount: number;
};

type Props = {
  initialData: {
    applications: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function ApplicationListClient({ initialData }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  const handleViewHistory = (appId: number) => {
    setSelectedAppId(appId);
    setHistoryDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/settings/applications?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <MasterDataSearch type="applications" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{initialData.total} Applications</span>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left font-medium">Application Name</th>
                <th className="p-3 text-left font-medium">Current Version</th>
                <th className="p-3 text-left font-medium">Created By</th>
                <th className="p-3 text-left font-medium">Total RFCs</th>
                <th className="p-3 text-left font-medium">Created</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialData.applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No applications found. Applications are created when NEW_APPLICATION requests
                    are approved.
                  </td>
                </tr>
              ) : (
                initialData.applications.map((app) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{app.applicationName}</div>
                        {app.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {app.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        v{app.currentVersion}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{app.creatorName || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {app.creatorEmail || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{app.rfcCount}</span>
                      <span className="text-muted-foreground"> RFCs</span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDistanceToNow(new Date(app.createdAt), {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(app.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(initialData.page - 1) * 20 + 1} to{' '}
            {Math.min(initialData.page * 20, initialData.total)} of {initialData.total}{' '}
            applications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {initialData.page} of {initialData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page === initialData.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selectedAppId && (
        <ApplicationHistoryDialog
          applicationId={selectedAppId}
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
        />
      )}
    </div>
  );
}
