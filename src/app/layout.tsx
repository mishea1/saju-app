import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter 폰트 설정
const inter = Inter({ subsets: ['latin'] });

// 메타데이터 설정
export const metadata: Metadata = {
  title: '사주성명풀이 - 정통 명리학 분석',
  description: '정통 명리학과 성명학을 바탕으로 한 사주풀이 및 이름 분석 서비스입니다.',
  keywords: '사주, 성명학, 명리학, 사주풀이, 이름분석, 운세',
  authors: [{ name: '사주성명풀이' }],
  creator: '사주성명풀이',
  publisher: '사주성명풀이',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: '사주성명풀이 - 정통 명리학 분석',
    description: '정통 명리학과 성명학을 바탕으로 한 사주풀이 및 이름 분석 서비스',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: '사주성명풀이',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '사주성명풀이',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '사주성명풀이 - 정통 명리학 분석',
    description: '정통 명리학과 성명학을 바탕으로 한 사주풀이 및 이름 분석 서비스',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        {/* 파비콘 설정 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* 폰트 프리로드 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '사주성명풀이',
              description: '정통 명리학과 성명학을 바탕으로 한 사주풀이 및 이름 분석 서비스',
              url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
        style={{
          backgroundImage: "url('/saju-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* 어두운 몽환적 오버레이 */}
        <div
          style={{
            position: 'absolute',
            zIndex: 0,
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(10,0,20,0.92) 0%, rgba(0,0,0,0.92) 70%, rgba(40,0,60,0.85) 100%)',
            opacity: 0.92,
          }}
        />
        {/* 메인 컨텐츠 */}
        <main className="min-h-screen" style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </main>
        {/* Google Analytics (선택사항) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
} 