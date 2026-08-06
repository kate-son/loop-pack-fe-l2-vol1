import type { NextConfig } from 'next';

/* AI-generated : Week 7 Part 1 — DPR 2 화면에서 실제 렌더 폭(1200px)의 2배(2400px)가 필요한데 기본 deviceSizes(1920/2048 다음이 3840)엔 맞는 후보가 없어 3840까지 건너뛰던 문제를 완화하기 위해 2400을 추가 */
/* AI-generated : Week 7 Part 1 — AVIF 지원 브라우저에는 WebP보다 더 작은 AVIF를 우선 협상하도록 images.formats에 추가(미지원 브라우저는 자동으로 WebP/원본 폴백) */
/* AI-generated : Week 7 Part 1 Round 4 — DPR 1.25~1.5(스케일된 레티나 디스플레이에서 흔함)일 때 필요 폭(1200×DPR=1500~1800)에 맞는 후보가 1200과 1920 사이에 없어 1920까지 건너뛰던 문제를 완화하기 위해 1800(=1200×1.5)을 추가 */
/** 최적화된 이미지를 서버 캐시(.next/cache/images)에 유지할 최소 시간 — 1일
 *  더 길게 잡으면 캐시 히트율은 오르지만, 같은 경로에 이미지를 교체(예: 어드민 업로드)했을 때
 *  옛 이미지가 남는 기간도 그만큼 길어진다. 이 값은 브라우저·CDN에 내려가는 Cache-Control max-age에도
 *  함께 반영돼 회수가 어려우므로, 교체 반영 지연을 하루로 묶어두는 쪽을 택했다 */
const IMAGE_CACHE_TTL_SECONDS = 60 * 60 * 24;

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1800, 1920, 2048, 2400, 3840],
    formats: ['image/avif', 'image/webp'],
    /* AI-generated : Week 7 Part 2 Round 8 — Part 1 LCP breakdown에서 hero의 Resource load duration이
       2,560~2,684ms로 압도적으로 컸는데, 이 값에는 원본(7.5MB)을 매 요청마다 리사이즈·AVIF 재인코딩하는
       서버 처리 시간이 포함된다(실측: 변환 232ms vs 캐시 히트 1.6ms). 기본 minimumCacheTTL(60초)로는
       변환 결과가 금방 만료돼 재인코딩이 반복되므로 1일로 늘려 캐시 히트 시 변환을 건너뛰게 한다.
       첫 변환 비용은 그대로이며, 이미지 교체 반영 지연과의 트레이드오프는 위 상수 주석 참고 */
    minimumCacheTTL: IMAGE_CACHE_TTL_SECONDS,
  },
  compiler: {
    // 프로덕션 빌드에서 console.* 호출 제거 (error는 남겨서 실제 장애 로그는 유지)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
