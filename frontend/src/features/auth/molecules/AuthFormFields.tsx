'use client';

import FormField from '@/shared/ui/atoms/FormField';

interface AuthFormFieldsProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  errors?: { email?: string; password?: string };
  showConfirmPassword?: boolean;
  confirmPassword?: string;
  onConfirmPasswordChange?: (value: string) => void;
}

export default function AuthFormFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  errors,
  showConfirmPassword,
  confirmPassword,
  onConfirmPasswordChange,
}: AuthFormFieldsProps) {
  return (
    <>
      <FormField
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        error={errors?.email}
        autoComplete="email"
        required
      />
      <FormField
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        error={errors?.password}
        autoComplete={showConfirmPassword ? 'new-password' : 'current-password'}
        required
      />
      {showConfirmPassword && (
        <FormField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword ?? ''}
          onChange={(e) => onConfirmPasswordChange?.(e.target.value)}
          error={errors?.password && confirmPassword !== password ? 'Passwords do not match' : undefined}
          autoComplete="new-password"
          required
        />
      )}
    </>
  );
}
