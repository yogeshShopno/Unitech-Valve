import type { Metadata } from 'next';
import { Inter, Work_Sans, Libre_Baskerville } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre-baskerville',
});

export const metadata: Metadata = {
  title: 'Industrial Ledger | Engineering Precision',
  description: 'Engineering Precision & Technical Excellence. Manage clients, quotations, and industrial workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${workSans.variable} ${libreBaskerville.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-surface">
        {children}
      </body>
    </html>
  );
}
