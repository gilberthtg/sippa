import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.roleCode !== 'developer') {
    redirect('/login');
  }

  return (
    <AppShell
      user={session.user}
      role="developer"
    >
      {children}
    </AppShell>
  );
}
