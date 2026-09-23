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
import { Loader2 } from 'lucide-react';
import { approveRequest } from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ApproveDialogProps {
  requestId: number;
  requestNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveDialog({
  requestId,
  requestNo,
  open,
  onOpenChange,
}: ApproveDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('');

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveRequest(requestId, note || undefined);
      
      if (result.success) {
        toast.success('Request berhasil disetujui');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal menyetujui request');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setujui Request</DialogTitle>
          <DialogDescription>
            Setujui request {requestNo}. Request akan berpindah ke status APPROVED dan siap untuk di-assign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Catatan (Opsional)</Label>
            <Textarea
              id="note"
              placeholder="Tambahkan catatan persetujuan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button onClick={handleApprove} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Setujui
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
