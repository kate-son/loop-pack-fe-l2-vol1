import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
/* AI-generated : Week 7 Part 2 — layout.css를 HomeView/ProductView 각각에서 import하면 Turbopack이 페이지별로 별도 CSS 청크를 만들어 render-blocking 요청이 2개(globals.css 계열 1개 + layout.css 1개)로 늘어난다(Lighthouse render-blocking-insight에서 확인). 루트 레이아웃에서 한 번만 import해 globals.css와 같은 청크로 묶는다 */
import './layout.css';
import '@/shared/ui/dialog/dialog_style.css';
import '@/shared/ui/select/select_style.css';
import { MainProvider } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Commerce',
  description: 'Loopers 커머스 - 4주차부터 여기에 쌓아갑니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <MainProvider>{children}</MainProvider>
      </body>
    </html>
  );
}
