'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Flag, 
  Users, 
  FileText, 
  User, 
  Play,
  RefreshCw
} from 'lucide-react';
import { VerifyDialog } from './verify-dialog';
import { ApproveDialog } from './approve-dialog';
import { RejectDialog } from './reject-dialog';
import { TeamAssignmentDialog } from './team-assignment-dialog';
import { OnHoldDialog } from './on-hold-dialog';
import { CompleteDialog } from './complete-dialog';
import { PrioritySelector } from './priority-selector';
import { UpdateProgressDialog } from '@/components/developer/update-progress-dialog';
import { REQUEST_STATUSES } from '@/lib/constants';
import { resumeRequest } from '@/app/actions/request-hold';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Assignment {
  id: number;
  assignedUserId: number;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
  developerRoleId: number;
  developerRoleCode: string | null;
  developerRoleName: string | null;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface RequestAdminActionsProps {
  request: {
    id: number;
    requestNo: string;
    status: string;
    priorityId: number | null;
  };
  priorities: Array<{ id: number; code: string; name: string }>;
  assignments?: Assignment[];
  teamLeader?: TeamMember | null;
  technicalWriter?: TeamMember | null;
  devtiUrusan?: string | null;
}

export function RequestAdminActions({
  request,
  priorities,
  assignments = [],
  teamLeader,
  technicalWriter,
  devtiUrusan,
}: RequestAdminActionsProps) {
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [updateProgressDialogOpen, setUpdateProgressDialogOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canVerify = request.status === REQUEST_STATUSES.SUBMITTED;
  const canApproveReject = request.status === REQUEST_STATUSES.IN_REVIEW;
  const canSetPriority = 
    request.status === REQUEST_STATUSES.APPROVED || 
    request.status === REQUEST_STATUSES.ONGOING;
  const canAssign = request.status === REQUEST_STATUSES.APPROVED;
  const hasPriority = request.priorityId !== null && request.priorityId !== undefined;
  const canHold = request.status === REQUEST_STATUSES.ONGOING;
  const canResume = request.status === REQUEST_STATUSES.ON_HOLD;
  const canUpdateProgress = request.status === REQUEST_STATUSES.ONGOING;
  const canComplete = request.status === REQUEST_STATUSES.ONGOING;
  const isAssigned = request.status === REQUEST_STATUSES.ONGOING || 
                     request.status === REQUEST_STATUSES.ON_HOLD ||
                     request.status === REQUEST_STATUSES.DONE;
  const isTerminal = request.status === REQUEST_STATUSES.REJECTED ||
                     request.status === REQUEST_STATUSES.DONE;

  const developerAssignments = assignments.filter(
    (assignment) =>
      (!teamLeader || assignment.id !== teamLeader.id) &&
      (!technicalWriter || assignment.id !== technicalWriter.id)
  );

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeRequest({ requestId: request.id });
      if (result.success) {
        toast.success('Request berhasil dilanjutkan');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal melanjutkan request');
      }
    });
  };

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
                  status={request.status}
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
                  Request disetujui. Assign tim untuk menangani request ini.
                </p>
                <Button
                  onClick={() => setAssignDialogOpen(true)}
                  className="w-full"
                  variant="default"
                  disabled={!hasPriority}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign Tim
                </Button>
                {!hasPriority && (
                  <p className="text-xs text-destructive">
                    Atur Priority terlebih dahulu sebelum assign tim.
                  </p>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Hold Request */}
          {canHold && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Request sedang berlangsung. Tahan jika ada kendala.
                </p>
                <Button
                  onClick={() => setHoldDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Tahan Request
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Resume Request */}
          {canResume && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Request dalam status ON_HOLD. Lanjutkan pengerjaan.
                </p>
                <Button
                  onClick={handleResume}
                  className="w-full"
                  variant="default"
                  disabled={isPending}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Lanjutkan Request
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Update Progress */}
          {canUpdateProgress && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Perbarui progres pengerjaan request ini.
                </p>
                <Button
                  onClick={() => setUpdateProgressDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Progress
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Complete Request */}
          {canComplete && (
            <>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Request siap diselesaikan. Tandai sebagai DONE.
                </p>
                <Button
                  onClick={() => setCompleteDialogOpen(true)}
                  className="w-full"
                  variant="default"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Selesaikan Request
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Show Assignment Info */}
          {isAssigned && (devtiUrusan || teamLeader || technicalWriter || assignments.length > 0) && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Informasi Tim</p>
                </div>

                {devtiUrusan && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1">DevTI Urusan:</p>
                    <p className="font-medium">{devtiUrusan}</p>
                  </div>
                )}

                {teamLeader && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Ketua Tim:
                    </p>
                    <p className="font-medium">{teamLeader.name}</p>
                    <p className="text-muted-foreground text-xs">{teamLeader.email}</p>
                  </div>
                )}

                {technicalWriter && (
                  <div className="text-sm">
                    <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Technical Writer:
                    </p>
                    <p className="font-medium">{technicalWriter.name}</p>
                    <p className="text-muted-foreground text-xs">{technicalWriter.email}</p>
                  </div>
                )}
                {(() => {
                  const filteredDevelopers = developerAssignments.filter(
                    (assignment) =>
                      assignment.assignedUserId !== teamLeader?.id &&
                      assignment.assignedUserId !== technicalWriter?.id
                  );

                  return filteredDevelopers.length > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Developers ({filteredDevelopers.length}):
                      </p>

                      <div className="space-y-2">
                        {filteredDevelopers.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-start gap-2 p-2 rounded bg-muted/50"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {assignment.assignedUserName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {assignment.assignedUserEmail}
                              </p>
                            </div>

                            {assignment.developerRoleName && (
                              <Badge variant="secondary" className="text-xs">
                                {assignment.developerRoleCode}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <Separator />
            </>
          )}

          {!canVerify && !canApproveReject && !canSetPriority && !canAssign && !canHold && !canResume && !canComplete && !isAssigned && (
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

      <OnHoldDialog
        requestId={request.id}
        requestNo={request.requestNo}
        open={holdDialogOpen}
        onOpenChange={setHoldDialogOpen}
      />

      <TeamAssignmentDialog
        requestId={request.id}
        requestNo={request.requestNo}
        priorityId={request.priorityId}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />

      <CompleteDialog
        requestId={request.id}
        requestNo={request.requestNo}
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      />

      <UpdateProgressDialog
        requestId={request.id}
        open={updateProgressDialogOpen}
        onOpenChange={setUpdateProgressDialogOpen}
      />
    </>
  );
}
