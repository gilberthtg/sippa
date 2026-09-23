'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { StartRequestDialog } from './start-request-dialog';
import { UpdateProgressDialog } from './update-progress-dialog';
import { CompleteRequestDialog } from './complete-request-dialog';

interface DeveloperRequestActionsProps {
  requestId: number;
  status: string;
}

export function DeveloperRequestActions({
  requestId,
  status,
}: DeveloperRequestActionsProps) {
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const canStart = status === 'assigned';
  const canUpdate = status === 'in_progress';
  const canComplete = status === 'in_progress';
  const isCompleted = status === 'completed';

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Request telah selesai</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Developer Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canStart && (
            <Button
              onClick={() => setStartDialogOpen(true)}
              className="w-full"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Work
            </Button>
          )}

          {canUpdate && (
            <>
              <Button
                onClick={() => setUpdateDialogOpen(true)}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Progress
              </Button>

              <Button
                onClick={() => setCompleteDialogOpen(true)}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            </>
          )}

          {!canStart && !canUpdate && !canComplete && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No actions available for this status
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <StartRequestDialog
        requestId={requestId}
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
      />

      <UpdateProgressDialog
        requestId={requestId}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
      />

      <CompleteRequestDialog
        requestId={requestId}
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      />
    </>
  );
}
