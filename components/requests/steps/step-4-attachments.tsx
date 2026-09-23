'use client';

import { FileUploadZone } from '@/components/requests/file-upload-zone';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface Step4AttachmentsProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
}

export function Step4Attachments({ files, onFilesChange }: Step4AttachmentsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lampiran</h3>
        <p className="text-sm text-muted-foreground">
          Upload dokumen pendukung seperti proposal, mockup, atau dokumen lainnya (opsional)
        </p>
      </div>

      <FileUploadZone files={files} onFilesChange={onFilesChange} />
    </div>
  );
}
