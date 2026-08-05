import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NovelProvider } from '@/context/NovelContext';
import { AudioProvider } from '@/context/AudioContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AudioPlayer } from '@/components/player/AudioPlayer';
import { FullPlayerModal } from '@/components/player/FullPlayerModal';
import { AuthModal } from '@/components/auth/AuthModal';

const promptFont = Prompt({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'มาฟังนิยาย - เว็บไซต์ฟังนิยายเสียงภาษาไทยออนไลน์ 🎧📖',
  description: 'ฟังนิยายเสียงภาษาไทยคุณภาพสูง แปลสดใหม่ ฟังฟรีได้ทุกที่ทั้งบนมือถือและคอมพิวเตอร์ มีระบบบันทึกตำแหน่งการฟังอัตโนมัติ',
  keywords: ['นิยายเสียง', 'ฟังนิยาย', 'นิยายแปล', 'นิยายกำลังภายใน', 'มาฟังนิยาย', 'MaFangNiyai'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${promptFont.variable} dark h-full antialiased`}>
      <body className="bg-slate-950 text-slate-100 font-sans min-h-full flex flex-col selection:bg-purple-600 selection:text-white">
        <AuthProvider>
          <NovelProvider>
            <AudioProvider>
              <Navbar />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
              <AudioPlayer />
              <FullPlayerModal />
              <AuthModal />
            </AudioProvider>
          </NovelProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
