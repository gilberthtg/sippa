'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Upload, Download, Trash2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { uploadRequestDocument, deleteRequestDocument } from '@/app/actions/request-documents';
import { useRouter } from 'next/navigation';
import { FILE_UPLOAD } from '@/lib/constants';

type RequiredDoc = {
  id: number;
  documentTypeId: number;
  documentTypeName: string | null;
  isRequired: boolean;
  sortOrder: number;
};

type UploadedDoc = {
  id: number;
  documentTypeId: number;
  documentTypeName: string | null;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: Date;
};

type Props = {
  requestId: number;
  requiredDocs: RequiredDoc[];
  uploadedDocs: UploadedDoc[];
  canUpload: boolean;
};

function UploadButton({
  documentTypeId,
  uploading,
  onUpload,
}: {
  documentTypeId: number;
  uploading: boolean;
  onUpload: (documentTypeId: number, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={FILE_UPLOAD.ALLOWED_EXTENSIONS.join(',')}
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(documentTypeId, f);
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-1 h-4 w-4" />
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </>
  );
}

export function RequestDocumentsSection({ requestId, requiredDocs, uploadedDocs, canUpload }: Props) {
  const router = useRouter();
  const [uploadingTypeId, setUploadingTypeId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const uploadedByType = new Map(uploadedDocs.map((d) => [d.documentTypeId, d]));

  const handleUpload = async (documentTypeId: number, file: File) => {
    setUploadingTypeId(documentTypeId);
    try {
      const formData = new FormData();
      formData.append('requestId', String(requestId));
      formData.append('documentTypeId', String(documentTypeId));
      formData.append('file', file);
      const result = await uploadRequestDocument(formData);
      if (result.success) {
        toast.success('Dokumen berhasil di-upload');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal upload dokumen');
      }
    } catch (error) {
      console.error('Upload dokumen gagal:', error);
      toast.error('Gagal upload dokumen');
    } finally {
      setUploadingTypeId(null);
    }
  };

  const handleDelete = async (docId: number) => {
    setDeletingId(docId);
    try {
      const result = await deleteRequestDocument(docId);
      if (result.success) {
        toast.success('Dokumen dihapus');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal menghapus dokumen');
      }
    } catch (error) {
      console.error('Hapus dokumen gagal:', error);
      toast.error('Gagal menghapus dokumen');
    } finally {
      setDeletingId(null);
    }
  };

  if (requiredDocs.length === 0) {
    return (
      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        Tidak ada dokumen yang diperlukan untuk tipe request ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requiredDocs.map((rd) => {
        const uploaded = uploadedByType.get(rd.documentTypeId);
        const isUploading = uploadingTypeId === rd.documentTypeId;
        return (
          <div
            key={rd.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">{rd.documentTypeName}</div>
                {uploaded ? (
                  <div className="text-xs text-muted-foreground">
                    {uploaded.originalName} · {new Date(uploaded.uploadedAt).toLocaleDateString('id-ID')}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {rd.isRequired ? 'Wajib' : 'Opsional'} · Belum di-upload
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {uploaded ? (
                <>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Terupload
                  </Badge>
                  <a
                    href={`/api/documents/${uploaded.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2.5 py-1.5 text-sm hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {canUpload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(uploaded.id)}
                      disabled={deletingId === uploaded.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Badge variant="outline" className="gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    Belum
                  </Badge>
                  {canUpload && (
                    <UploadButton
                      documentTypeId={rd.documentTypeId}
                      uploading={isUploading}
                      onUpload={handleUpload}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}