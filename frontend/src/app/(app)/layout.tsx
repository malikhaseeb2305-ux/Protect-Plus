import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AppShell from '@/shared/ui/organisms/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token?.value) {
    redirect('/login');
  }

  return <AppShell>{children}</AppShell>;
}
