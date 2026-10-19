import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getRequestById } from '@/app/actions/requests';
import { getRequiredDocumentTypes, getRequestDocuments } from '@/app/actions/request-documents';
import { RequestDetailHeader } from '@/components/requests/request-detail-header';
import { RequestDetailInfo } from '@/components/requests/request-detail-info';
import { RequestDetailTimeline } from '@/components/requests/request-detail-timeline';
import { RequestAttachmentsList } from '@/components/requests/request-attachments-list';
import { RequestDocumentsSection } from '@/components/requests/request-documents-section';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const requestId = parseInt(id, 10);
  const result = await getRequestById(requestId);

  if (!result.success || !result.data) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Link href="/requests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{result.error || 'Request tidak ditemukan'}</p>
        </div>
      </PageContainer>
    );
  }

  const request = result.data;

  const requestType = request.requestType as 'new_application' | 'rfc';
  const [requiredDocs, uploadedDocs] = await Promise.all([
    getRequiredDocumentTypes(requestType).catch(() => []),
    getRequestDocuments(requestId).catch(() => []),
  ]);

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href="/requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar Request
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <RequestDetailHeader
          requestNo={request.requestNo}
          title={request.title}
          status={request.status}
          priorityId={request.priorityId}
          requestType={request.requestType}
          submittedAt={request.submittedAt}
          updatedAt={request.updatedAt}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <RequestDetailInfo
              description={request.description}
              businessNeed={request.businessNeed}
              objective={request.objective}
              expectedOutput={request.expectedOutput}
              urgency={request.urgency}
              requesterName={request.requesterName}
              requesterEmail={request.requesterEmail}
              requesterPhone={request.requesterPhone}
            />

            <RequestAttachmentsList attachments={request.attachments} />

            <div className="rounded-md border p-4 space-y-3">
              <h3 className="font-semibold">Kelengkapan Dokumen</h3>
              <RequestDocumentsSection
                requestId={requestId}
                requiredDocs={requiredDocs as any}
                uploadedDocs={uploadedDocs as any}
                canUpload={false}
              />
            </div>
          </div>

          <div>
            <RequestDetailTimeline histories={request.histories} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
