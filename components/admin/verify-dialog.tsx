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
import { verifyRequest } from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VerifyDialogProps {
  requestId: number;
  requestNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyDialog({
  requestId,
  requestNo,
  open,
  onOpenChange,
}: VerifyDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('');

  const handleVerify = () => {
    startTransition(async () => {
      const result = await verifyRequest(requestId, note || undefined);
      
      if (result.success) {
        toast.success('Request berhasil diverifikasi');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal memverifikasi request');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifikasi Request</DialogTitle>
          <DialogDescription>
            Verifikasi kelengkapan request {requestNo}. Request akan berpindah ke status VERIFICATION.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Catatan (Opsional)</Label>
            <Textarea
              id="note"
              placeholder="Tambahkan catatan verifikasi..."
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
          <Button onClick={handleVerify} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verifikasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
