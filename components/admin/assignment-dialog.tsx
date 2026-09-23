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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UserCheck } from 'lucide-react';
import { assignRequest } from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AssignmentDialogProps {
  requestId: number;
  requestNo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Array<{ id: number; name: string }>;
  developers: Array<{ id: number; name: string; email: string }>;
}

export function AssignmentDialog({
  requestId,
  requestNo,
  open,
  onOpenChange,
  teams,
  developers,
}: AssignmentDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teamId, setTeamId] = useState<string>('');
  const [developerId, setDeveloperId] = useState<string>('');
  const [note, setNote] = useState('');

  const handleAssign = () => {
    if (!teamId && !developerId) {
      toast.error('Pilih minimal team atau developer');
      return;
    }

    startTransition(async () => {
      const result = await assignRequest({
        requestId,
        teamId: teamId ? parseInt(teamId) : undefined,
        developerId: developerId ? parseInt(developerId) : undefined,
        note: note || undefined,
      });
      
      if (result.success) {
        toast.success('Request berhasil di-assign');
        onOpenChange(false);
        setTeamId('');
        setDeveloperId('');
        setNote('');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal meng-assign request');
      }
    });
  };

  const selectedTeam = teams.find(t => t.id.toString() === teamId);
  const selectedDeveloper = developers.find(d => d.id.toString() === developerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Request
          </DialogTitle>
          <DialogDescription>
            Assign request {requestNo} ke team atau developer. Request akan berpindah ke status ASSIGNED.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select value={teamId} onValueChange={(val) => setTeamId(val || '')} disabled={isPending}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Pilih team (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="developer">Developer</Label>
            <Select value={developerId} onValueChange={(val) => setDeveloperId(val || '')} disabled={isPending}>
              <SelectTrigger id="developer">
                <SelectValue placeholder="Pilih developer (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev.id} value={dev.id.toString()}>
                    {dev.name} ({dev.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan (Opsional)</Label>
            <Textarea
              id="note"
              placeholder="Tambahkan catatan assignment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {(selectedTeam || selectedDeveloper) && (
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm font-medium">Preview Assignment:</p>
              {selectedTeam && (
                <p className="text-sm text-muted-foreground">
                  Team: {selectedTeam.name}
                </p>
              )}
              {selectedDeveloper && (
                <p className="text-sm text-muted-foreground">
                  Developer: {selectedDeveloper.name}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setTeamId('');
              setDeveloperId('');
              setNote('');
            }}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isPending || (!teamId && !developerId)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
