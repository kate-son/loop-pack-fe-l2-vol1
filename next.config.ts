import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    // 프로덕션 빌드에서 console.* 호출 제거 (error는 남겨서 실제 장애 로그는 유지)
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
};

export default nextConfig;
