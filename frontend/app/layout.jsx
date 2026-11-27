import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Smart Campus Library',
  description: 'Sistem manajemen perpustakaan kampus — katalog buku, anggota, dan sirkulasi.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
