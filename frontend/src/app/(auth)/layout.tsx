import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1 className={styles.logo}>Weather Intel</h1>
          <p className={styles.tagline}>Intelligent weather monitoring & alerts</p>
        </div>
        {children}
      </div>
    </div>
  );
}
