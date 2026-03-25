import type { Metadata } from 'next';
import { Public_Sans, Inter, Space_Grotesk } from 'next/font/google';
import { DukeThemeProvider } from '@/theme/ThemeProvider';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '700', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-label',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Duke Vanguard — OML Optimizer',
  description: 'AI-powered Order of Merit List optimizer for Army ROTC cadets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${publicSans.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="bg-[var(--color-background)] text-[var(--color-on-surface)] antialiased">
        <DukeThemeProvider>
          {children}
        </DukeThemeProvider>
      </body>
    </html>
  );
}
