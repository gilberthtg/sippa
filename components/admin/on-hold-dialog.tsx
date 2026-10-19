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
import { pauseRequest } from '@/app/actions/request-hold';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OnHoldDialogProps {
  requestId: number;
  requestNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnHoldDialog({
  requestId,
  requestNo,
  open,
  onOpenChange,
}: OnHoldDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState('');

  const handleHold = () => {
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error('Alasan penahanan minimal 10 karakter');
      return;
    }

    startTransition(async () => {
      const result = await pauseRequest({ requestId, reason: reason.trim() });

      if (result.success) {
        toast.success('Request berhasil ditahan');
        onOpenChange(false);
        setReason('');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal menahan request');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Tahan Request
          </DialogTitle>
          <DialogDescription>
            Tahan request {requestNo}. Status akan berubah ke ON_HOLD dan SLA akan dipause.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-destructive">
              Alasan Penahanan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Jelaskan alasan penahanan secara detail..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              Alasan ini akan dicatat di status history. Minimal 10 karakter.
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
            onClick={handleHold}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
