'use client';

import { InputHTMLAttributes } from 'react';

import Label from './Label';
import Input from './Input';
import styles from './FormField.module.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.field}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} error={error} {...inputProps} />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
