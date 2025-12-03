import type { Metadata } from 'next';
import { Roboto, Roboto_Mono } from 'next/font/google';
import '../src/index.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Sunstudio Config Portal',
    template: '%s | Sunstudio Config Portal',
  },
  description: 'Manage game configurations with ease',
  keywords: ['game', 'config', 'management', 'sunstudio'],
  authors: [{ name: 'Sunstudio' }],
  creator: 'Sunstudio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://config.sunstudio.com',
    title: 'Sunstudio Config Portal',
    description: 'Manage game configurations with ease',
    siteName: 'Sunstudio Config Portal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sunstudio Config Portal',
    description: 'Manage game configurations with ease',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster 
            theme="light" 
            position="top-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#202124',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

