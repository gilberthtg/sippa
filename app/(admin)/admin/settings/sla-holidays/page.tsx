import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { SLAHolidayListClient } from '@/components/settings/sla-holidays/sla-holiday-list-client';
import { getSLAHolidays } from '@/app/actions/master-data';

export const dynamic = 'force-dynamic';

export default async function SLAHolidaysPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || '';
  const year = Number(params.year) || new Date().getFullYear();
  const isActive =
    params.isActive === 'true' ? true : params.isActive === 'false' ? false : null;

  const holidaysData = await getSLAHolidays({ page, search, year, isActive });

  return (
    <PageContainer>
      <PageHeader
        title="SLA Holidays"
        description="Manage non-working days for SLA business days calculation"
      />

      <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">ℹ️ About SLA Holidays</p>
        <p className="mt-1">
          SLA calculations use business days (Monday-Friday) and exclude weekends and holidays
          defined here. Add national holidays and company-specific non-working days to ensure
          accurate SLA tracking.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SLAHolidayListClient initialData={holidaysData} />
      </Suspense>
    </PageContainer>
  );
}
