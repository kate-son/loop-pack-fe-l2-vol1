import type { Metadata } from 'next';
import './globals.css';
/* AI-generated : Week 7 Part 2 — layout.css를 HomeView/ProductView 각각에서 import하면 Turbopack이 페이지별로 별도 CSS 청크를 만들어 render-blocking 요청이 2개(globals.css 계열 1개 + layout.css 1개)로 늘어난다(Lighthouse render-blocking-insight에서 확인). 루트 레이아웃에서 한 번만 import해 globals.css와 같은 청크로 묶는다 */
import './layout.css';
import '@/shared/ui/dialog/dialog_style.css';
import '@/shared/ui/select/select_style.css';
import { MainProvider } from './providers';

/* AI-generated : Week 7 Part 2 Round 12 — create-next-app 템플릿에서 온 Geist/Geist_Mono 설정을 제거.
   최초 커밋부터 globals.css의 body는 `Arial, Helvetica, sans-serif`였고 --font-geist-* 변수를 참조하는
   CSS가 한 줄도 없어, 화면은 계속 Arial로 렌더되면서 woff2 2개(약 52KB)만 매 요청 받고 있었다.
   next/font가 이들을 preload까지 걸어 hero(LCP 요소)와 같은 시점에 High 우선순위로 출발했고,
   대역폭을 나눠 쓰며 hero 다운로드를 늦추고 있었다. 렌더 결과는 바뀌지 않는다 */

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
    <html lang="ko">
      <body>
        <MainProvider>{children}</MainProvider>
      </body>
    </html>
  );
}
