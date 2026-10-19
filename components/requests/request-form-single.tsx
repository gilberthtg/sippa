'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createRequest, getApplicationList } from '@/app/actions/requests';
import { validateVersionProgression, suggestNextVersion } from '@/lib/utils/version';
import { REQUEST_TYPES, FILE_UPLOAD } from '@/lib/constants';
import {
  Send,
  Loader2,
  Info,
  AlertCircle,
} from 'lucide-react';

interface Application {
  id: number;
  name: string;
  description: string;
  currentVersion: string;
  label: string;
}

export function RequestFormSingle() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  // Form fields
  const [requestType, setRequestType] = useState<string>(REQUEST_TYPES.NEW_APPLICATION);
  
  // NEW_APPLICATION fields
  const [title, setTitle] = useState('');
  
  // RFC fields
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [requestedVersion, setRequestedVersion] = useState('');
  const [versionError, setVersionError] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  
  // Common fields
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [businessNeed, setBusinessNeed] = useState('');
  const [objective, setObjective] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [permintaanAplikasiFile, setPermintaanAplikasiFile] = useState<File | null>(null);

  // Load applications when RFC is selected
  useEffect(() => {
    if (requestType === REQUEST_TYPES.RFC && applications.length === 0) {
      setLoadingApps(true);
      getApplicationList()
        .then((result) => {
          if (result.success && result.applications) {
            setApplications(result.applications);
          }
        })
        .finally(() => setLoadingApps(false));
    }
  }, [requestType, applications.length]);

  // Clear RFC-specific fields when switching to NEW_APPLICATION
  useEffect(() => {
    if (requestType === REQUEST_TYPES.NEW_APPLICATION) {
      setApplicationId(null);
      setSelectedApp(null);
      setRequestedVersion('');
      setVersionError('');
    } else {
      setTitle('');
    }
  }, [requestType]);

  // Validate version when it changes
  useEffect(() => {
    if (requestType === REQUEST_TYPES.RFC && requestedVersion && selectedApp) {
      const validation = validateVersionProgression(
        selectedApp.currentVersion,
        requestedVersion
      );
      if (!validation.isValid) {
        setVersionError(validation.error || 'Versi tidak valid');
      } else {
        setVersionError('');
      }
    }
  }, [requestedVersion, selectedApp, requestType]);

  const handleApplicationChange = (value: string | null) => {
    if (!value) return;
    
    const appId = parseInt(value, 10);
    setApplicationId(appId);
    
    const app = applications.find((a) => a.id === appId);
    setSelectedApp(app || null);
    
    // Auto-suggest next patch version
    if (app) {
      const suggested = suggestNextVersion(app.currentVersion, 'patch');
      if (suggested) {
        setRequestedVersion(suggested);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate based on request type
    if (requestType === REQUEST_TYPES.NEW_APPLICATION) {
      if (!title || title.length < 3) {
        newErrors.title = 'Nama aplikasi minimal 3 karakter';
      }
    } else if (requestType === REQUEST_TYPES.RFC) {
      if (!applicationId) {
        newErrors.applicationId = 'Aplikasi harus dipilih';
      }
      if (!requestedVersion) {
        newErrors.requestedVersion = 'Versi baru harus diisi';
      } else if (versionError) {
        newErrors.requestedVersion = versionError;
      }
    }

    // Common validations
    if (!description || description.length < 50) {
      newErrors.description = 'Deskripsi minimal 50 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setGeneralError('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('requestType', requestType);
      
      if (requestType === REQUEST_TYPES.NEW_APPLICATION) {
        formData.append('title', title);
      } else if (requestType === REQUEST_TYPES.RFC) {
        if (applicationId) {
          formData.append('applicationId', applicationId.toString());
        }
        formData.append('requestedVersion', requestedVersion);
      }
      
      formData.append('description', description);
      if (urgency) formData.append('urgency', urgency);
      if (requesterPhone) formData.append('requesterPhone', requesterPhone);
      if (businessNeed) formData.append('businessNeed', businessNeed);
      if (objective) formData.append('objective', objective);
      if (expectedOutput) formData.append('expectedOutput', expectedOutput);

      if (permintaanAplikasiFile) {
        formData.append('permintaanAplikasi', permintaanAplikasiFile);
      }

      const result = await createRequest(formData);

      if (result.success) {
        router.push(`/requests/${result.requestId}`);
        router.refresh(); // Force refresh to get fresh data
      } else {
        setGeneralError(result.error || 'Terjadi kesalahan');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Request Type */}
      <Card>
        <CardHeader>
          <CardTitle>1. Jenis Permintaan</CardTitle>
          <CardDescription>
            Pilih jenis permintaan yang ingin Anda ajukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={requestType} onValueChange={setRequestType}>
            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
              <RadioGroupItem value={REQUEST_TYPES.NEW_APPLICATION} id="new_app" />
              <Label htmlFor="new_app" className="flex-1 cursor-pointer">
                <div className="font-medium">New Application</div>
                <div className="text-sm text-muted-foreground">
                  Pengajuan aplikasi baru yang belum pernah ada sebelumnya
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
              <RadioGroupItem value={REQUEST_TYPES.RFC} id="rfc" />
              <Label htmlFor="rfc" className="flex-1 cursor-pointer">
                <div className="font-medium">RFC (Request for Change)</div>
                <div className="text-sm text-muted-foreground">
                  Perubahan atau pengembangan pada aplikasi yang sudah ada
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Section 2: Application Information */}
      <Card>
        <CardHeader>
          <CardTitle>2. Informasi Aplikasi</CardTitle>
          <CardDescription>
            {requestType === REQUEST_TYPES.NEW_APPLICATION
              ? 'Masukkan nama dan detail aplikasi baru'
              : 'Pilih aplikasi yang akan diubah dan tentukan versi baru'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* NEW_APPLICATION: Title Input */}
          {requestType === REQUEST_TYPES.NEW_APPLICATION && (
            <div className="space-y-2">
              <Label htmlFor="title">
                Nama Aplikasi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: SIPPA HR Management"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
              <p className="text-sm text-muted-foreground">
                <Info className="inline h-3 w-3 mr-1" />
                Versi awal akan otomatis di-set sebagai 1.0.0
              </p>
            </div>
          )}

          {/* RFC: Application Selector */}
          {requestType === REQUEST_TYPES.RFC && (
            <>
              <div className="space-y-2">
                <Label htmlFor="application">
                  Pilih Aplikasi <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={applicationId?.toString() || ''}
                  onValueChange={handleApplicationChange}
                  disabled={loadingApps}
                >
                  <SelectTrigger
                    id="application"
                    className={`w-full ${errors.applicationId ? 'border-destructive' : ''}`}
                  >
                    <SelectValue placeholder={loadingApps ? 'Memuat...' : 'Pilih aplikasi'}>
                      {selectedApp ? selectedApp.name : loadingApps ? 'Memuat...' : 'Pilih aplikasi'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.id} value={app.id.toString()}>
                        <div className="flex flex-col py-1">
                          <span className="font-medium">{app.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Versi: {app.currentVersion}
                            {app.description && ` • ${app.description}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.applicationId && (
                  <p className="text-sm text-destructive">{errors.applicationId}</p>
                )}
              </div>

              {/* Current Version Display */}
              {selectedApp && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Versi saat ini:</strong> {selectedApp.currentVersion}
                    <br />
                    {selectedApp.description && (
                      <>
                        <strong>Deskripsi:</strong> {selectedApp.description}
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Requested Version Input */}
              <div className="space-y-2">
                <Label htmlFor="requestedVersion">
                  Versi Baru yang Diminta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="requestedVersion"
                  value={requestedVersion}
                  onChange={(e) => setRequestedVersion(e.target.value)}
                  placeholder="Contoh: 1.2.1"
                  className={errors.requestedVersion || versionError ? 'border-destructive' : ''}
                  disabled={!selectedApp}
                />
                {(errors.requestedVersion || versionError) && (
                  <p className="text-sm text-destructive">
                    {errors.requestedVersion || versionError}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  <Info className="inline h-3 w-3 mr-1" />
                  Format: x.y.z (contoh: 1.2.3). Versi harus lebih besar dari versi saat ini.
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi {requestType === REQUEST_TYPES.RFC ? 'Perubahan' : 'Aplikasi'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                requestType === REQUEST_TYPES.RFC
                  ? 'Jelaskan perubahan apa saja yang dibutuhkan...'
                  : 'Jelaskan secara detail tentang aplikasi yang akan dibuat...'
              }
              rows={5}
              className={errors.description ? 'border-destructive' : ''}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{errors.description || 'Minimal 50 karakter'}</span>
              <span>{description.length} / 5000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>3. Detail Kebutuhan</CardTitle>
          <CardDescription>
            Informasi tambahan untuk memperjelas permintaan (opsional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">Tingkat Urgensi</Label>
            <Select value={urgency} onValueChange={(value) => setUrgency(value || '')}>
              <SelectTrigger id="urgency" className="w-full">
                <SelectValue placeholder="Pilih tingkat urgensi">
                  {urgency === 'low' && 'Rendah - Tidak mendesak, bisa ditangani sesuai jadwal normal'}
                  {urgency === 'medium' && 'Sedang - Perlu perhatian, tapi tidak kritis'}
                  {urgency === 'high' && 'Tinggi - Mendesak dan memerlukan penanganan prioritas'}
                  {!urgency && 'Pilih tingkat urgensi'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex flex-col py-1">
                    <span className="font-medium">Rendah</span>
                    <span className="text-xs text-muted-foreground">
                      Tidak mendesak, bisa ditangani sesuai jadwal normal
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex flex-col py-1">
                    <span className="font-medium">Sedang</span>
                    <span className="text-xs text-muted-foreground">
                      Perlu perhatian, tapi tidak kritis
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex flex-col py-1">
                    <span className="font-medium">Tinggi</span>
                    <span className="text-xs text-muted-foreground">
                      Mendesak dan memerlukan penanganan prioritas
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="requesterPhone">Nomor Telepon</Label>
            <Input
              id="requesterPhone"
              value={requesterPhone}
              onChange={(e) => setRequesterPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
            />
          </div>

          <Separator />

          {/* Business Need */}
          <div className="space-y-2">
            <Label htmlFor="businessNeed">Kebutuhan Bisnis</Label>
            <Textarea
              id="businessNeed"
              value={businessNeed}
              onChange={(e) => setBusinessNeed(e.target.value)}
              placeholder="Jelaskan kebutuhan bisnis yang mendorong permintaan ini..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {businessNeed.length} / 2000
            </p>
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective">Tujuan</Label>
            <Textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Apa tujuan yang ingin dicapai dari permintaan ini..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {objective.length} / 2000
            </p>
          </div>

          {/* Expected Output */}
          <div className="space-y-2">
            <Label htmlFor="expectedOutput">Output yang Diharapkan</Label>
            <Textarea
              id="expectedOutput"
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              placeholder="Jelaskan output atau hasil yang diharapkan..."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {expectedOutput.length} / 2000
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Document */}
      <Card>
        <CardHeader>
          <CardTitle>4. Dokumen Permintaan Aplikasi</CardTitle>
          <CardDescription>
            Upload dokumen permintaan aplikasi (opsional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="permintaanAplikasi">
              Dokumen Permintaan Aplikasi (opsional)
            </Label>
            <Input
              id="permintaanAplikasi"
              type="file"
              onChange={(e) => setPermintaanAplikasiFile(e.target.files?.[0] || null)}
              accept={FILE_UPLOAD.ALLOWED_TYPES.join(',')}
            />
            {permintaanAplikasiFile && (
              <p className="text-sm text-muted-foreground">
                Terpilih: {permintaanAplikasiFile.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Format yang diterima: PDF, Word, Excel, PowerPoint, gambar
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* General Error */}
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Kirim Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
