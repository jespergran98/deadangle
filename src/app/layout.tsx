import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CRTOverlay from '@/components/CRTOverlay/CRTOverlay';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'DEAD ANGLE',
  description: 'Two-player neon arcade shooter',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* CRT overlay — mounted once, persists across all screens */}
        <CRTOverlay />
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}