import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import LoginForm from '@/features/auth/organisms/LoginForm';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (token?.value) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
