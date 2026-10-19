import { PageContainer } from '@/components/layout/page-container';
import { getRequestByIdDeveloper, getProgressHistory } from '@/app/actions/developer-requests';
import { getRequestStatusHistories } from '@/app/actions/requests';
import { getRequiredDocumentTypes, getRequestDocuments } from '@/app/actions/request-documents';
import { db } from '@/lib/db';
import { requestAttachments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RequestDetailHeader } from '@/components/requests/request-detail-header';
import { RequestDetailInfo } from '@/components/requests/request-detail-info';
import { RequestDetailTimeline } from '@/components/requests/request-detail-timeline';
// import { RequestAttachmentsList } from '@/components/requests/request-attachments-list';
import { RequestDocumentsSection } from '@/components/requests/request-documents-section';
import { ProgressTimeline } from '@/components/requests/progress-timeline';
import { DeveloperRequestActions } from '@/components/developer/developer-request-actions';
import { TeamInfoCard } from '@/components/shared/team-info-card';
import { redirect } from 'next/navigation';
import { ErrorState } from '@/components/shared/error-state';
import { auth } from '@/lib/auth/config';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DeveloperRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const requestId = parseInt(id);

  if (isNaN(requestId)) {
    return (
      <PageContainer>
        <ErrorState title="Invalid Request" message="Request ID tidak valid" />
      </PageContainer>
    );
  }

  const result = await getRequestByIdDeveloper(requestId);

  if (!result.success) {
    if (result.error === 'Request tidak di-assign ke Anda') {
      return (
        <PageContainer>
          <ErrorState title="Access Denied" message="Request ini tidak di-assign kepada Anda" />
        </PageContainer>
      );
    }
    redirect('/login');
  }

  const request = result.data!;
  const session = await auth();

  const [historiesResult, progressResult, attachments] = await Promise.all([
    getRequestStatusHistories(requestId),
    getProgressHistory(requestId),
    db.select().from(requestAttachments).where(eq(requestAttachments.requestId, requestId)),
  ]);

  const requestType = request.requestType as 'new_application' | 'rfc';
  const [requiredDocs, uploadedDocs] = await Promise.all([
    getRequiredDocumentTypes(requestType),
    getRequestDocuments(requestId),
  ]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <RequestDetailHeader
          requestNo={request.requestNo}
          title={request.title}
          status={request.status}
          priorityId={request.priorityId}
          requestType={request.requestType}
          submittedAt={request.submittedAt || new Date()}
          updatedAt={new Date()}
        />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            <Tabs defaultValue="informasi" className="gap-6">
              <TabsList>
                <TabsTrigger value="informasi">Informasi</TabsTrigger>
                <TabsTrigger value="progres">Progres</TabsTrigger>
                <TabsTrigger value="riwayat">Riwayat Status</TabsTrigger>
                <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
              </TabsList>

              {/* Request Info */}
              <TabsContent value="informasi">
                <RequestDetailInfo
                  description={request.description}
                  businessNeed={request.businessNeed}
                  objective={request.objective}
                  expectedOutput={request.expectedOutput}
                  urgency={request.urgency}
                  requesterName={request.requesterName || ''}
                  requesterEmail={request.requesterEmail || ''}
                  requesterPhone={request.phoneNumber}
                />
              </TabsContent>

              {/* Progress Timeline */}
              <TabsContent value="progres">
                {progressResult.success && progressResult.data ? (
                  <ProgressTimeline progressHistory={progressResult.data} />
                ) : (
                  <div className="rounded-md border p-4 text-sm text-muted-foreground text-center py-6">
                    Belum ada riwayat progres
                  </div>
                )}
              </TabsContent>

              {/* Status Timeline */}
              <TabsContent value="riwayat">
                {historiesResult.success && historiesResult.data ? (
                  <RequestDetailTimeline histories={historiesResult.data} />
                ) : (
                  <div className="rounded-md border p-4 text-sm text-muted-foreground text-center py-6">
                    Belum ada riwayat status
                  </div>
                )}
              </TabsContent>

              {/* Document Checklist */}
              <TabsContent value="dokumen">
                <div className="rounded-md border p-4 space-y-3">
                  <h3 className="font-semibold">Kelengkapan Dokumen</h3>
                  <RequestDocumentsSection
                    requestId={requestId}
                    requiredDocs={requiredDocs as any}
                    uploadedDocs={uploadedDocs as any}
                    canUpload={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Developer Actions */}
            <DeveloperRequestActions requestId={requestId} status={request.status} />
            
            {/* Team Information */}
            <TeamInfoCard
              devtiUrusan={request.devtiUrusan}
              teamLeader={request.teamLeader}
              technicalWriter={request.technicalWriter}
              teamMembers={request.teamMembers}
              currentUserId={session?.user?.id}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
