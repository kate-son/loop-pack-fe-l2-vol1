import type { NextConfig } from 'next';

/* AI-generated : Week 7 Part 1 — DPR 2 화면에서 실제 렌더 폭(1200px)의 2배(2400px)가 필요한데 기본 deviceSizes(1920/2048 다음이 3840)엔 맞는 후보가 없어 3840까지 건너뛰던 문제를 완화하기 위해 2400을 추가 */
/* AI-generated : Week 7 Part 1 — AVIF 지원 브라우저에는 WebP보다 더 작은 AVIF를 우선 협상하도록 images.formats에 추가(미지원 브라우저는 자동으로 WebP/원본 폴백) */
const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2400, 3840],
    formats: ['image/avif', 'image/webp'],
  },
  compiler: {
    // 프로덕션 빌드에서 console.* 호출 제거 (error는 남겨서 실제 장애 로그는 유지)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
