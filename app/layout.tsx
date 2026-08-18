import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExamVault — Online MCQ Exam Platform',
  description:
    'A premium, secure, and intelligent online exam management platform for schools and institutes.',
  keywords: 'online exam, MCQ, quiz platform, education, Bangladesh',
  openGraph: {
    title: 'ExamVault — Online MCQ Exam Platform',
    description: 'Premium online exam management for teachers and students.',
    type: 'website',
  },
};

import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
