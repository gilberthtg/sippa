import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  return (
    <AppShell
      user={session.user}
      role="admin"
    >
      {children}
    </AppShell>
  );
}
