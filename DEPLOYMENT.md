# 🚀 배포 가이드

사주성명풀이 앱을 실제 서비스로 배포하는 방법을 단계별로 안내합니다.

## 📋 사전 준비사항

### 1. 필수 계정 및 도구
- [GitHub](https://github.com) 계정
- [OpenAI](https://openai.com) API 키
- [Vercel](https://vercel.com) 계정 (추천)
- 또는 [Netlify](https://netlify.com), [AWS](https://aws.amazon.com) 등

### 2. 개발 환경 확인
```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# npm 버전 확인
npm --version
```

## 🎯 배포 방법 선택

### 방법 1: Vercel (추천) - 가장 간단

#### 1단계: Vercel 가입 및 프로젝트 연결
1. [Vercel](https://vercel.com)에 가입
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 선택 후 "Import" 클릭

#### 2단계: 환경변수 설정
Vercel 대시보드에서 다음 환경변수를 설정:

```env
# 필수 설정
OPENAI_API_KEY=sk-your-openai-api-key-here

# 선택 설정
NEXT_PUBLIC_APP_NAME=사주성명풀이
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### 3단계: 배포 설정
- **Framework Preset**: Next.js (자동 감지)
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

#### 4단계: 배포 실행
- "Deploy" 버튼 클릭
- 자동으로 빌드 및 배포 진행
- 배포 완료 후 제공되는 URL로 접속 가능

### 방법 2: Netlify

#### 1단계: Netlify 설정
1. [Netlify](https://netlify.com)에 가입
2. "New site from Git" 클릭
3. GitHub 저장소 연결

#### 2단계: 빌드 설정
```bash
# 빌드 명령어
npm run build

# 배포 디렉토리
.next
```

#### 3단계: 환경변수 설정
Netlify 대시보드 → Site settings → Environment variables에서 설정

### 방법 3: AWS Amplify

#### 1단계: AWS Amplify 설정
1. AWS 콘솔에서 Amplify 서비스 선택
2. "New app" → "Host web app" 선택
3. GitHub 저장소 연결

#### 2단계: 빌드 설정
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## 🔧 환경별 설정

### 개발 환경 (.env.local)
```env
# OpenAI API 설정
OPENAI_API_KEY=sk-your-openai-api-key-here

# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=사주성명풀이
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 보안 설정
NEXTAUTH_SECRET=your-development-secret
NEXTAUTH_URL=http://localhost:3000
```

### 프로덕션 환경 (Vercel/Netlify 등)
```env
# OpenAI API 설정
OPENAI_API_KEY=sk-your-openai-api-key-here

# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=사주성명풀이
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 보안 설정
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com

# 모니터링 (선택사항)
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🌐 도메인 설정

### 커스텀 도메인 연결 (Vercel)

#### 1단계: 도메인 추가
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Domains
3. "Add Domain" 클릭
4. 도메인 입력 (예: `saju.yourdomain.com`)

#### 2단계: DNS 설정
도메인 제공업체에서 다음 DNS 레코드 추가:

```
Type: CNAME
Name: saju (또는 원하는 서브도메인)
Value: cname.vercel-dns.com
```

#### 3단계: SSL 인증서
- Vercel에서 자동으로 SSL 인증서 발급
- HTTPS 리다이렉션 자동 설정

## 🔒 보안 설정

### 1. 환경변수 보안
- API 키는 절대 Git에 커밋하지 않음
- 프로덕션 환경변수는 배포 플랫폼에서만 설정
- 정기적으로 API 키 로테이션

### 2. 보안 헤더 설정
`next.config.js`에서 이미 설정됨:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
}
```

### 3. Rate Limiting
API 라우트에서 이미 구현됨:
- 15분당 최대 10회 요청 제한
- IP 기반 요청 추적

## 📊 모니터링 설정

### 1. Vercel Analytics (무료)
```bash
npm install @vercel/analytics
```

### 2. Google Analytics
```javascript
// layout.tsx에 이미 포함됨
{process.env.NODE_ENV === 'production' && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
    <script dangerouslySetInnerHTML={{...}} />
  </>
)}
```

### 3. Sentry (에러 추적)
```bash
npm install @sentry/nextjs
```

## 🚨 문제 해결

### 일반적인 배포 문제

#### 1. 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 문제 해결
rm -rf node_modules package-lock.json
npm install
```

#### 2. 환경변수 오류
- 모든 필수 환경변수가 설정되었는지 확인
- 환경변수 이름이 정확한지 확인
- API 키가 유효한지 확인

#### 3. API 호출 실패
- OpenAI API 키 유효성 확인
- API 사용량 한도 확인
- 네트워크 연결 상태 확인

### 디버깅 방법

#### 1. 로그 확인
```bash
# Vercel 로그 확인
vercel logs

# 로컬 개발 서버 로그
npm run dev
```

#### 2. 환경변수 확인
```javascript
// 개발 중 환경변수 확인
console.log('API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not Set');
```

## 📈 성능 최적화

### 1. 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP/AVIF 포맷 지원
- 자동 리사이징

### 2. 번들 최적화
- Tree shaking 자동 적용
- 코드 스플리팅
- 압축 및 최소화

### 3. 캐싱 전략
- 정적 자산 캐싱
- API 응답 캐싱
- CDN 활용

## 🔄 CI/CD 파이프라인

### GitHub Actions 예시
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run lint
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:
1. 프로젝트 이슈 페이지에 문의
2. 로그 파일 첨부
3. 환경변수 설정 상태 확인
4. 에러 메시지 상세 기록

---

**참고**: 이 가이드는 Vercel을 기준으로 작성되었습니다. 다른 플랫폼을 사용할 경우 해당 플랫폼의 공식 문서를 참조하세요. 