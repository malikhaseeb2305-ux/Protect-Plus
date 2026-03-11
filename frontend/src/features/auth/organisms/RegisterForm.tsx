'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

import Button from '@/shared/ui/atoms/Button';
import { extractApiError } from '@/shared/lib/extractApiError';
import { useToast } from '@/providers/ToastProvider';

import AuthFormFields from '../molecules/AuthFormFields';
import { useRegister } from '../hooks/useRegister';
import styles from './AuthForm.module.css';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const register = useRegister();
  const { showToast } = useToast();

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }
    if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    } else if (password !== confirmPassword) {
      errs.password = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    register.mutate({ email: email.trim(), password }, {
      onError: (err) => {
        const message = extractApiError(err);
        showToast(message, 'error');
      },
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <AuthFormFields
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        errors={fieldErrors}
        showConfirmPassword
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={setConfirmPassword}
      />

      <Button type="submit" loading={register.isPending}>
        Create account
      </Button>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
