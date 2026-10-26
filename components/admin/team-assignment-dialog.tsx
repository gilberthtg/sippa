'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserCheck, Users, FileText, User } from 'lucide-react';
import { 
  assignTeamToRequest, 
  getDevelopersByRole, 
  getTeamLeaderOptions, 
  getTechnicalWriters, 
  getDeveloperRoles,
  getDevteamUnits
} from '@/app/actions/admin-requests';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface TeamAssignmentDialogProps {
  requestId: number;
  requestNo: string;
  priorityId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Developer {
  id: number;
  name: string;
  email: string;
  developerRoleId: number | null;
  developerRoleCode: string | null;
  developerRoleName: string | null;
}

interface DeveloperRole {
  id: number;
  code: string;
  name: string;
}

interface DeveloperAssignment {
  userId: number;
  developerRoleId: number;
  userName: string;
  developerRoleName: string;
}

export function TeamAssignmentDialog({
  requestId,
  requestNo,
  priorityId,
  open,
  onOpenChange,
}: TeamAssignmentDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [devtiUrusanId, setDevtiUrusanId] = useState<string>('');
  const [teamLeaderId, setTeamLeaderId] = useState<string>('');
  const [technicalWriterId, setTechnicalWriterId] = useState<string>('');
  const [selectedDevelopers, setSelectedDevelopers] = useState<Set<number>>(new Set());
  const [note, setNote] = useState('');

  // Data state
  const [teamLeaders, setTeamLeaders] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [technicalWriters, setTechnicalWriters] = useState<Developer[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [developerRoles, setDeveloperRoles] = useState<DeveloperRole[]>([]);
  const [devteamUnits, setDevteamUnits] = useState<Array<{ id: number; name: string }>>([]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [leadersResult, writersResult, devsResult, rolesResult, devteamUnitsResult] = await Promise.all([
        getTeamLeaderOptions(),
        getTechnicalWriters(),
        getDevelopersByRole(),
        getDeveloperRoles(),
        getDevteamUnits(),
      ]);

      if (leadersResult.success && leadersResult.data) {
        setTeamLeaders(leadersResult.data);
      }

      if (writersResult.success && writersResult.data) {
        setTechnicalWriters(writersResult.data as Developer[]);
      }

      if (devsResult.success && devsResult.data) {
        setDevelopers(devsResult.data as Developer[]);
      }

      if (rolesResult.success && rolesResult.data) {
        setDeveloperRoles(rolesResult.data as DeveloperRole[]);
      }

      if (devteamUnitsResult.success && devteamUnitsResult.data) {
        setDevteamUnits(devteamUnitsResult.data as Array<{ id: number; name: string }>);
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Auto-deselect developers yang dipilih sebagai Ketua Tim atau Technical Writer
  useEffect(() => {
    const excluded = new Set<number>();
    if (teamLeaderId) excluded.add(parseInt(teamLeaderId));
    if (technicalWriterId) excluded.add(parseInt(technicalWriterId));
    if (excluded.size === 0) return;

    setSelectedDevelopers(prev => {
      const next = new Set(prev);
      let changed = false;
      prev.forEach(id => {
        if (excluded.has(id)) {
          next.delete(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [teamLeaderId, technicalWriterId]);

  const handleDeveloperToggle = (developerId: number) => {
    const newSelected = new Set(selectedDevelopers);
    if (newSelected.has(developerId)) {
      newSelected.delete(developerId);
    } else {
      newSelected.add(developerId);
    }
    setSelectedDevelopers(newSelected);
  };

  const handleAssign = () => {
    // Validation
    if (!priorityId) {
      toast.error('Priority harus diatur sebelum assign tim');
      return;
    }

    if (!devtiUrusanId) {
      toast.error('DevTI Urusan wajib dipilih');
      return;
    }

    if (!teamLeaderId) {
      toast.error('Ketua Tim wajib dipilih');
      return;
    }

    if (!technicalWriterId) {
      toast.error('Technical Writer wajib dipilih');
      return;
    }

    if (selectedDevelopers.size === 0) {
      toast.error('Minimal 1 developer harus di-assign');
      return;
    }

    // Build developer assignments
    const developerAssignments: Array<{ userId: number; developerRoleId: number }> = [];
    
    selectedDevelopers.forEach(developerId => {
      const developer = developers.find(d => d.id === developerId);
      if (developer && developer.developerRoleId) {
        developerAssignments.push({
          userId: developer.id,
          developerRoleId: developer.developerRoleId,
        });
      }
    });

    if (developerAssignments.length === 0) {
      toast.error('Developer yang dipilih harus memiliki developer role');
      return;
    }

    startTransition(async () => {
      const result = await assignTeamToRequest({
        requestId,
        devtiUrusanId: parseInt(devtiUrusanId),
        teamLeaderId: parseInt(teamLeaderId),
        technicalWriterId: parseInt(technicalWriterId),
        developerAssignments,
        note: note.trim() || undefined,
      });
      
      if (result.success) {
        toast.success('Tim berhasil di-assign ke request');
        handleClose();
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal assign tim');
      }
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form
    setDevtiUrusanId('');
    setTeamLeaderId('');
    setTechnicalWriterId('');
    setSelectedDevelopers(new Set());
    setNote('');
  };

  // Get selected data for preview
  const selectedDevteamUnit = devteamUnits.find(u => u.id.toString() === devtiUrusanId);
  const selectedTeamLeader = teamLeaders.find(tl => tl.id.toString() === teamLeaderId);
  const selectedTechnicalWriter = technicalWriters.find(tw => tw.id.toString() === technicalWriterId);
  const selectedDevelopersList = developers.filter(d => selectedDevelopers.has(d.id));

  // Developers yang tersedia untuk di-assign: kecualikan yg sudah jadi Ketua Tim / Technical Writer
  const assignedRoleUserIds = new Set<number>();
  if (teamLeaderId) assignedRoleUserIds.add(parseInt(teamLeaderId));
  if (technicalWriterId) assignedRoleUserIds.add(parseInt(technicalWriterId));
  const availableDevelopers = developers.filter(d => !assignedRoleUserIds.has(d.id));

  // Group developers by role
  const developersByRole = developerRoles.reduce((acc, role) => {
    acc[role.code] = availableDevelopers.filter(d => d.developerRoleCode === role.code);
    return acc;
  }, {} as Record<string, Developer[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[50vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Tim ke Request
          </DialogTitle>
          <DialogDescription>
            Assign request {requestNo} ke tim dengan ketua tim, technical writer, dan developers.
            Request akan berpindah ke status ASSIGNED.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* DevTI Urusan */}
            <div className="space-y-2">
              <Label htmlFor="devti-urusan" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                DevTI Urusan <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={devtiUrusanId} 
                onValueChange={(val) => setDevtiUrusanId(val || '')} 
                disabled={isPending}
              >
                <SelectTrigger id="devti-urusan" className="w-full">
                  <SelectValue placeholder="Pilih DevTI Urusan...">
                    {selectedDevteamUnit ? selectedDevteamUnit.name : 'Pilih DevTI Urusan...'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {devteamUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      <span className="font-medium">{u.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Urusan/divisi di DevTI yang menangani request ini
              </p>
            </div>

            <Separator />

            {/* Team Leader */}
            <div className="space-y-2">
              <Label htmlFor="team-leader" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Ketua Tim <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={teamLeaderId} 
                onValueChange={(val) => setTeamLeaderId(val || '')} 
                disabled={isPending}
              >
                <SelectTrigger id="team-leader" className="w-full">
                  <SelectValue placeholder="Pilih ketua tim">
                    {selectedTeamLeader ? `${selectedTeamLeader.name} (${selectedTeamLeader.email})` : 'Pilih ketua tim'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teamLeaders.length === 0 ? (
                    <SelectItem value="none" disabled>
                      <span className="text-muted-foreground italic">Tidak ada user dengan role System Analyst tersedia</span>
                    </SelectItem>
                  ) : (
                    teamLeaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id.toString()}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{leader.name}</span>
                          <span className="text-xs text-muted-foreground">{leader.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Hanya user dengan role System Analyst (SA) yang dapat dipilih sebagai ketua tim
              </p>
            </div>

            {/* Technical Writer */}
            <div className="space-y-2">
              <Label htmlFor="technical-writer" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Technical Writer <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={technicalWriterId} 
                onValueChange={(val) => setTechnicalWriterId(val || '')} 
                disabled={isPending}
              >
                <SelectTrigger id="technical-writer" className="w-full">
                  <SelectValue placeholder="Pilih technical writer">
                    {selectedTechnicalWriter ? `${selectedTechnicalWriter.name} (${selectedTechnicalWriter.email})` : 'Pilih technical writer'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {technicalWriters.length === 0 ? (
                    <SelectItem value="none" disabled>
                      <span className="text-muted-foreground italic">Tidak ada Technical Writer tersedia</span>
                    </SelectItem>
                  ) : (
                    technicalWriters.map((writer) => (
                      <SelectItem key={writer.id} value={writer.id.toString()}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{writer.name}</span>
                          <span className="text-xs text-muted-foreground">{writer.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Technical Writer membuat dokumentasi teknis
              </p>
            </div>

            <Separator />

            {/* Developers */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assign Developers <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Pilih minimal 1 developer untuk di-assign ke request ini. User yang sudah dipilih sebagai
                Ketua Tim atau Technical Writer tidak muncul di daftar ini. Role System Analyst (SA)
                dan Technical Writer (TW) tidak tersedia untuk developer assignment.
              </p>

              {/* Developers grouped by role */}
              <div className="space-y-4 rounded-lg border p-4 max-h-[300px] overflow-y-auto">
                {developerRoles.map((role) => {
                  const roleDevs = developersByRole[role.code] || [];
                  if (roleDevs.length === 0) return null;

                  return (
                    <div key={role.code} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {role.name} ({role.code})
                      </p>
                      <div className="space-y-2 pl-4">
                        {roleDevs.map((dev) => (
                          <div key={dev.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedDevelopers.has(dev.id)}
                              onCheckedChange={() => handleDeveloperToggle(dev.id)}
                              disabled={isPending}
                            />
                            <Label
                              htmlFor={`dev-${dev.id}`}
                              className="text-sm font-normal cursor-pointer"
                              onClick={() => !isPending && handleDeveloperToggle(dev.id)}
                            >
                              {dev.name} ({dev.email})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {availableDevelopers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tidak ada developer tersedia
                  </p>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Catatan Assignment (Opsional)</Label>
              <Textarea
                id="note"
                placeholder="Tambahkan catatan khusus untuk tim..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                disabled={isPending}
              />
            </div>

            {/* Preview */}
            {(selectedTeamLeader || selectedTechnicalWriter || selectedDevelopersList.length > 0) && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Preview Assignment:</p>
                
                {devtiUrusanId && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">DevTI Urusan:</span> {selectedDevteamUnit?.name || ''}
                  </p>
                )}
                
                {selectedTeamLeader && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Ketua Tim:</span> {selectedTeamLeader.name}
                  </p>
                )}
                
                {selectedTechnicalWriter && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Technical Writer:</span> {selectedTechnicalWriter.name}
                  </p>
                )}
                
                {selectedDevelopersList.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Developers ({selectedDevelopersList.length}):</span>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {selectedDevelopersList.map(dev => (
                        <li key={dev.id}>
                          {dev.name} - {dev.developerRoleName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isPending || isLoading || !devtiUrusanId || !teamLeaderId || !technicalWriterId || selectedDevelopers.size === 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Tim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
