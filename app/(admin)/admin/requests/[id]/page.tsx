import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  getRequestByIdAdmin, 
  getPriorities,
} from '@/app/actions/admin-requests';
import { getRequiredDocumentTypes, getRequestDocuments } from '@/app/actions/request-documents';
import { RequestDetailHeader } from '@/components/requests/request-detail-header';
import { RequestDetailInfo } from '@/components/requests/request-detail-info';
import { RequestDetailTimeline } from '@/components/requests/request-detail-timeline';
import { RequestAttachmentsList } from '@/components/requests/request-attachments-list';
import { RequestAdminActions } from '@/components/admin/request-admin-actions';
import { RequestDocumentsSection } from '@/components/requests/request-documents-section';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const requestId = parseInt(id);

  const [requestResult, prioritiesResult] = await Promise.all([
    getRequestByIdAdmin(requestId),
    getPriorities(),
  ]);

  if (!requestResult.success || !requestResult.data) {
    redirect('/admin/requests');
  }

  const request = requestResult.data;
  const priorities = prioritiesResult.success && prioritiesResult.data ? prioritiesResult.data : [];

  const requestType = request.requestType as 'new_application' | 'rfc';
  const [requiredDocs, uploadedDocs] = await Promise.all([
    getRequiredDocumentTypes(requestType),
    getRequestDocuments(requestId),
  ]);

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href="/admin/requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke List
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Detail Request"
        description="Informasi lengkap request dan aksi admin"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RequestDetailHeader
            requestNo={request.requestNo}
            title={request.title}
            requestType={request.requestType}
            status={request.status}
            priorityId={request.priorityId}
            submittedAt={request.submittedAt}
            updatedAt={request.updatedAt}
          />

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

          {request.attachments && request.attachments.length > 0 && (
            <RequestAttachmentsList attachments={request.attachments} />
          )}

          <div className="rounded-md border p-4 space-y-3">
            <h3 className="font-semibold">Kelengkapan Dokumen</h3>
            <RequestDocumentsSection
              requestId={requestId}
              requiredDocs={requiredDocs as any}
              uploadedDocs={uploadedDocs as any}
              canUpload={true}
            />
          </div>

          <RequestDetailTimeline histories={request.histories || []} />
        </div>

        <div className="lg:col-span-1">
          <RequestAdminActions
            request={{
              id: request.id,
              requestNo: request.requestNo,
              status: request.status,
              priorityId: request.priorityId,
            }}
            priorities={priorities}
            assignments={request.assignments || []}
            teamLeader={request.teamLeader || null}
            technicalWriter={request.technicalWriter || null}
            devtiUrusan={request.devtiUrusan || null}
          />
        </div>
      </div>
    </PageContainer>
  );
}
