'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  UserCheck,
  Flag
} from 'lucide-react';
import { useState } from 'react';
import { VerifyDialog } from './verify-dialog';
import { ApproveDialog } from './approve-dialog';
import { RejectDialog } from './reject-dialog';
import { AssignmentDialog } from './assignment-dialog';
import { PrioritySelector } from './priority-selector';
import { REQUEST_STATUSES } from '@/lib/constants';

interface RequestAdminActionsProps {
  request: {
    id: number;
    requestNo: string;
    status: string;
    priorityId: number | null;
  };
  priorities: Array<{ id: number; code: string; name: string }>;
  teams: Array<{ id: number; name: string }>;
  developers: Array<{ id: number; name: string; email: string }>;
}

export function RequestAdminActions({
  request,
  priorities,
  teams,
  developers,
}: RequestAdminActionsProps) {
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const canVerify = request.status === REQUEST_STATUSES.SUBMITTED;
  const canApproveReject = request.status === REQUEST_STATUSES.VERIFICATION;
  const canSetPriority = 
    request.status === REQUEST_STATUSES.APPROVED || 
    request.status === REQUEST_STATUSES.ASSIGNED;
  const canAssign = request.status === REQUEST_STATUSES.APPROVED;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verify */}
          {canVerify && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Request baru diajukan. Verifikasi kelengkapan dokumen dan informasi.
                </p>
                <Button
                  onClick={() => setVerifyDialogOpen(true)}
                  className="w-full"
                  variant="default"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Verifikasi Request
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Approve / Reject */}
          {canApproveReject && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Request dalam verifikasi. Setujui atau tolak request ini.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    variant="default"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setujui
                  </Button>
                  <Button
                    onClick={() => setRejectDialogOpen(true)}
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Set Priority */}
          {canSetPriority && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Atur Priority</p>
                </div>
                <PrioritySelector
                  requestId={request.id}
                  currentPriorityId={request.priorityId}
                  priorities={priorities}
                />
              </div>
              <Separator />
            </>
          )}

          {/* Assign */}
          {canAssign && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Request disetujui. Assign ke team atau developer.
                </p>
                <Button
                  onClick={() => setAssignDialogOpen(true)}
                  className="w-full"
                  variant="default"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign Request
                </Button>
              </div>
            </>
          )}

          {!canVerify && !canApproveReject && !canSetPriority && !canAssign && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Tidak ada aksi yang tersedia untuk status saat ini
            </p>
          )}
        </CardContent>
      </Card>

      <VerifyDialog
        requestId={request.id}
        requestNo={request.requestNo}
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
      />

      <ApproveDialog
        requestId={request.id}
        requestNo={request.requestNo}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
      />

      <RejectDialog
        requestId={request.id}
        requestNo={request.requestNo}
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      />

      <AssignmentDialog
        requestId={request.id}
        requestNo={request.requestNo}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        teams={teams}
        developers={developers}
      />
    </>
  );
}
