'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { rejectRequest } from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RejectDialogProps {
  requestId: number;
  requestNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectDialog({
  requestId,
  requestNo,
  open,
  onOpenChange,
}: RejectDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState('');

  const handleReject = () => {
    if (!reason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    startTransition(async () => {
      const result = await rejectRequest(requestId, reason);
      
      if (result.success) {
        toast.success('Request berhasil ditolak');
        onOpenChange(false);
        setReason('');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal menolak request');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Tolak Request
          </DialogTitle>
          <DialogDescription>
            Tolak request {requestNo}. Request akan berpindah ke status REJECTED dan tidak dapat dilanjutkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-destructive">
              Alasan Penolakan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Jelaskan alasan penolakan secara detail..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Alasan ini akan dikirimkan ke pemohon
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setReason('');
            }}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending || !reason.trim()}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tolak Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
