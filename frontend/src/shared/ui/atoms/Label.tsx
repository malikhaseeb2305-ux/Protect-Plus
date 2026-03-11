import { LabelHTMLAttributes } from 'react';

import styles from './Label.module.css';

export default function Label({
  children,
  className,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`${styles.label} ${className ?? ''}`} {...rest}>
      {children}
    </label>
  );
}
