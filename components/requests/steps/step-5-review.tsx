'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { REQUEST_TYPES, URGENCY_LEVELS } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils/file-upload';
import { FileText } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface Step5ReviewProps {
  requestType: string;
  title: string;
  description: string;
  urgency: string;
  requesterPhone: string;
  businessNeed: string;
  objective: string;
  expectedOutput: string;
  files: FileWithPreview[];
}

export function Step5Review({
  requestType,
  title,
  description,
  urgency,
  requesterPhone,
  businessNeed,
  objective,
  expectedOutput,
  files,
}: Step5ReviewProps) {
  const getRequestTypeLabel = (type: string) => {
    return type === REQUEST_TYPES.NEW_APPLICATION ? 'New Application' : 'RFC';
  };

  const getUrgencyLabel = (level: string) => {
    if (level === URGENCY_LEVELS.LOW) return 'Rendah';
    if (level === URGENCY_LEVELS.MEDIUM) return 'Sedang';
    if (level === URGENCY_LEVELS.HIGH) return 'Tinggi';
    return '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Kirim</h3>
        <p className="text-sm text-muted-foreground">
          Pastikan semua informasi sudah benar sebelum mengirimkan request
        </p>
      </div>

      <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Jenis Permintaan</p>
          <Badge variant="outline">{getRequestTypeLabel(requestType)}</Badge>
        </div>

        <Separator />

        <div>
          <p className="text-xs text-muted-foreground mb-1">Judul</p>
          <p className="font-medium">{title}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Deskripsi</p>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>

        {urgency && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tingkat Urgensi</p>
            <Badge variant="secondary">{getUrgencyLabel(urgency)}</Badge>
          </div>
        )}

        {requesterPhone && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Nomor Telepon</p>
            <p className="text-sm">{requesterPhone}</p>
          </div>
        )}

        {businessNeed && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Kebutuhan Bisnis</p>
              <p className="text-sm whitespace-pre-wrap">{businessNeed}</p>
            </div>
          </>
        )}

        {objective && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tujuan</p>
            <p className="text-sm whitespace-pre-wrap">{objective}</p>
          </div>
        )}

        {expectedOutput && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Output yang Diharapkan</p>
            <p className="text-sm whitespace-pre-wrap">{expectedOutput}</p>
          </div>
        )}

        {files.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Lampiran ({files.length})</p>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
