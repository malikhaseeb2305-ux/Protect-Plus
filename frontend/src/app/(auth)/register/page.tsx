import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import RegisterForm from '@/features/auth/organisms/RegisterForm';

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (token?.value) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
}
