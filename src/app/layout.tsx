import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from './providers';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A modern task and project management app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Todo App',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffecd2' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1625' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster
          richColors
          closeButton
          position="top-center"
          toastOptions={{
            className: 'font-sans',
          }}
        />
      </body>
    </html>
  );
}
