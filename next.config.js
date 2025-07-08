/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Strict Mode 활성화 (개발 시 이중 렌더링 방지)
  reactStrictMode: true,
  
  // 이미지 최적화 설정
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 환경변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API 라우트 타임아웃 설정
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // 빌드 최적화
  swcMinify: true,
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 