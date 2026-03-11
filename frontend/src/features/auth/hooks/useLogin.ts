'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { loginUser } from '../api/authApi';
import type { LoginRequest } from '../types';

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: () => {
      router.push('/dashboard');
    },
  });
}
