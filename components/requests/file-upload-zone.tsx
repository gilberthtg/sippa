'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { validateFile, formatFileSize } from '@/lib/utils/file-upload';
import { FILE_UPLOAD } from '@/lib/constants';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface FileUploadZoneProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
}

export function FileUploadZone({ files, onFilesChange, maxFiles = FILE_UPLOAD.MAX_FILES }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles);
    const validFiles: FileWithPreview[] = [];

    for (const file of filesArray) {
      if (files.length + validFiles.length >= maxFiles) {
        alert(`Maksimal ${maxFiles} file dapat diunggah`);
        break;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      const fileWithPreview = Object.assign(file, {
        id: `${Date.now()}-${Math.random()}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      });

      validFiles.push(fileWithPreview);
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  }, [files, onFilesChange, maxFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  }, [files, onFilesChange]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          Drag & drop file di sini atau klik untuk memilih
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Maksimal {maxFiles} file, {formatFileSize(FILE_UPLOAD.MAX_FILE_SIZE)} per file
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Format: {FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}
        </p>
        <input
          type="file"
          multiple
          accept={FILE_UPLOAD.ALLOWED_EXTENSIONS.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
            Pilih File
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">File yang dipilih ({files.length}/{maxFiles})</p>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {file.preview ? (
                  <Image
                    src={file.preview}
                    alt={file.name}
                    width={40}
                    height={40}
                    className="object-cover rounded"
                  />
                ) : (
                  <FileText className="w-10 h-10 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
