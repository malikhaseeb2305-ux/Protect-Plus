'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAlertStream } from '@/features/alerts/hooks/useAlertStream';

import NotificationBell from './NotificationBell';
import styles from './AppShell.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useAlertStream();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuButton}
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileNavOpen}
            >
              <span className={styles.menuIcon} />
            </button>
            <Link href="/dashboard" className={styles.brand}>
              Weather Intel
            </Link>
            <nav className={styles.desktopNav} aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.headerRight}>
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <main className={styles.main}>{children}</main>
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    const { apiClient } = await import('@/lib/apiClient');
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // proceed to redirect even if API call fails
    }
    window.location.href = '/login';
  }

  return (
    <div className={styles.userMenu} ref={ref}>
      <button
        className={styles.userMenuButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
      {open && (
        <div className={styles.dropdown} role="menu">
          <Link
            href="/settings"
            className={styles.dropdownItem}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Settings
          </Link>
          <button
            className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
            onClick={handleLogout}
            role="menuitem"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
