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
import { Loader2, CheckCircle } from 'lucide-react';
import { completeRequest } from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CompleteDialogProps {
  requestId: number;
  requestNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompleteDialog({
  requestId,
  requestNo,
  open,
  onOpenChange,
}: CompleteDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState('');

  const handleComplete = () => {
    startTransition(async () => {
      const result = await completeRequest(requestId, note || undefined);

      if (result.success) {
        toast.success('Request berhasil diselesaikan');
        onOpenChange(false);
        setNote('');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal menyelesaikan request');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Selesaikan Request
          </DialogTitle>
          <DialogDescription>
            Tandai request {requestNo} sebagai DONE. Status akan berubah ke DONE dan SLA akan selesai.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">
              Catatan Penyelesaian (Opsional)
            </Label>
            <Textarea
              id="note"
              placeholder="Tambahkan catatan penyelesaian..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Catatan ini akan dicatat di status history.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setNote('');
            }}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="default"
            onClick={handleComplete}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Selesaikan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
