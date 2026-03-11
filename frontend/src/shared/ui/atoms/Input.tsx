'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className ?? ''}`}
        aria-invalid={!!error}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';
export default Input;
