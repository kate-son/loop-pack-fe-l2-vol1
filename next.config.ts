import type { NextConfig } from 'next';

/* AI-generated : Week 7 Part 1 — DPR 2 화면에서 실제 렌더 폭(1200px)의 2배(2400px)가 필요한데 기본 deviceSizes(1920/2048 다음이 3840)엔 맞는 후보가 없어 3840까지 건너뛰던 문제를 완화하기 위해 2400을 추가 */
/* AI-generated : Week 7 Part 1 — AVIF 지원 브라우저에는 WebP보다 더 작은 AVIF를 우선 협상하도록 images.formats에 추가(미지원 브라우저는 자동으로 WebP/원본 폴백) */
/* AI-generated : Week 7 Part 1 Round 4 — DPR 1.25~1.5(스케일된 레티나 디스플레이에서 흔함)일 때 필요 폭(1200×DPR=1500~1800)에 맞는 후보가 1200과 1920 사이에 없어 1920까지 건너뛰던 문제를 완화하기 위해 1800(=1200×1.5)을 추가 */
const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1800, 1920, 2048, 2400, 3840],
    formats: ['image/avif', 'image/webp'],
    /* AI-generated : Week 7 Part 2 Round 11 — hero(LCP 요소)를 q=65로 낮춰 전송량을 167,195 → 108,965 bytes로
       34.8% 줄인다. 1200×514로 표시되는 사진이라 육안 비교에서 q=75와 차이가 확인되지 않았다.
       Next 16은 여기 나열된 값만 허용하므로, 카드 이미지가 쓰는 기본값 75도 함께 남긴다 */
    qualities: [65, 75],
  },
  compiler: {
    // 프로덕션 빌드에서 console.* 호출 제거 (error는 남겨서 실제 장애 로그는 유지)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
