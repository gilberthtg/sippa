import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Redirect based on role
  const roleCode = session.user.roleCode;
  
  if (roleCode === 'admin') {
    redirect('/admin/dashboard');
  } else if (roleCode === 'developer') {
    redirect('/developer/dashboard');
  } else {
    redirect('/dashboard');
  }
}
