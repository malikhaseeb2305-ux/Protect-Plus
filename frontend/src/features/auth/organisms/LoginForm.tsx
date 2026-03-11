'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import Button from '@/shared/ui/atoms/Button';
import { extractApiError } from '@/shared/lib/extractApiError';

import AuthFormFields from '../molecules/AuthFormFields';
import { useLogin } from '../hooks/useLogin';
import styles from './AuthForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const login = useLogin();

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    login.mutate({ email: email.trim(), password });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <AuthFormFields
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        errors={fieldErrors}
      />

      {login.error && (
        <p className={styles.serverError} role="alert">
          {extractApiError(login.error)}
        </p>
      )}

      <Button type="submit" loading={login.isPending}>
        Sign in
      </Button>

      <p className={styles.footer}>
        Don&apos;t have an account?{' '}
        <Link href="/register">Create one</Link>
      </p>
    </form>
  );
}
