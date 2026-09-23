'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/file-upload';
import { EmptyState } from '@/components/shared/empty-state';

interface Attachment {
  id: number;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
}

interface RequestAttachmentsListProps {
  attachments: Attachment[];
}

export function RequestAttachmentsList({ attachments }: RequestAttachmentsListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = `/api/attachments/${attachment.id}/download`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lampiran ({attachments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <EmptyState
            title="Tidak ada lampiran"
            description="Request ini tidak memiliki file lampiran"
          />
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.sizeBytes)} • {formatDate(attachment.uploadedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
