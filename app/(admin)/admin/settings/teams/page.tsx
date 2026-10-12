import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AlertCircle } from 'lucide-react';

// DEPRECATED: Teams feature removed in Phase 1 restructure
// Team assignments replaced with individual developer assignments
// See: .ai/PHASE_1_COMPLETE.md for details

export default async function TeamsPage() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Teams Management (Deprecated)"
        description="This feature has been replaced with individual developer assignments"
      />

      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Teams Feature Deprecated</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          The team-based assignment system has been replaced with individual developer assignments.
          Admins now assign developers directly to requests with specific roles (Backend, Frontend, QA, etc.).
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          To assign developers to requests, go to the request detail page and use the &quot;Assign Team&quot; button.
        </p>
      </div>
    </PageContainer>
  );
}
