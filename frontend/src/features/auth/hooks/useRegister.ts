'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { registerUser } from '../api/authApi';
import type { RegisterRequest } from '../types';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => registerUser(data),
    onSuccess: () => {
      router.push('/dashboard');
    },
  });
}
