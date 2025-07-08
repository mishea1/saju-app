# 사주성명풀이 앱

정통 명리학과 성명학을 바탕으로 한 사주풀이 및 이름 분석 웹 애플리케이션입니다.

## 🚀 주요 기능

- **사주팔자 분석**: 일간, 오행, 십이운성 등 정통 명리학 분석
- **성명학 분석**: 한자 이름의 의미와 영향 분석
- **성격 및 적성 분석**: 개인의 성격적 특징과 직업 방향 제시
- **건강 및 운세 전망**: 건강상 주의사항과 향후 운세 분석
- **실시간 유효성 검사**: 입력값 실시간 검증 및 에러 메시지
- **다크모드 지원**: 사용자 선호에 따른 테마 변경
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, Lucide React
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4o-mini
- **Deployment**: Vercel

## 📋 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn
- OpenAI API 키

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd saju-name-app
```

### 2. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 3. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=사주성명풀이
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 보안 설정
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# 모니터링 설정 (선택사항)
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_GA_ID=your_google_analytics_id_here
```

### 4. 개발 서버 실행
```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🏗 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Vercel 배포
1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 환경변수 설정 (Vercel 대시보드에서)
4. 자동 배포 완료

### 환경변수 설정 (Vercel)
- `OPENAI_API_KEY`: OpenAI API 키
- `NEXT_PUBLIC_APP_NAME`: 앱 이름
- `NEXT_PUBLIC_APP_URL`: 배포된 URL

## 📁 프로젝트 구조

```
saju-name-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # ChatGPT API 라우트
│   │   ├── globals.css               # 전역 스타일
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── page.tsx                  # 메인 페이지
│   ├── components/
│   │   └── ui/                       # UI 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── textarea.tsx
│   └── lib/
│       └── utils.ts                  # 유틸리티 함수
├── public/                           # 정적 파일
├── package.json
├── next.config.js                    # Next.js 설정
├── tailwind.config.js                # Tailwind CSS 설정
├── tsconfig.json                     # TypeScript 설정
├── vercel.json                       # Vercel 배포 설정
└── README.md
```

## 🔧 주요 기능 설명

### 1. 입력값 검증
- **이름**: 한글 2-4글자 검증
- **한자 이름**: 선택사항, 2-4글자 한자 검증
- **생년월일**: YYYY-MM-DD 형식 검증
- **출생시간**: HH:MM 형식 검증
- **출생지**: 1-20글자 제한

### 2. API 보안
- **Rate Limiting**: 15분당 최대 10회 요청 제한
- **입력값 검증**: 서버 사이드 유효성 검사
- **에러 핸들링**: 상세한 에러 메시지 제공
- **타임아웃**: 30초 요청 타임아웃

### 3. 사용자 경험
- **로딩 상태**: 분석 중 로딩 인디케이터
- **에러 표시**: 실시간 에러 메시지
- **결과 저장**: 로컬 스토리지에 최근 5개 결과 저장
- **반응형**: 모든 디바이스 최적화

## 🔒 보안 고려사항

1. **API 키 보안**: 환경변수로 관리, Git에 커밋 금지
2. **입력값 검증**: 클라이언트/서버 양쪽에서 검증
3. **Rate Limiting**: API 남용 방지
4. **HTTPS**: 프로덕션에서 SSL/TLS 적용
5. **보안 헤더**: XSS, CSRF 등 공격 방지

## 📊 성능 최적화

1. **코드 스플리팅**: Next.js 자동 코드 분할
2. **이미지 최적화**: Next.js Image 컴포넌트 사용
3. **캐싱**: 정적 자산 캐싱
4. **번들 최적화**: Tree shaking 및 압축

## 🐛 문제 해결

### 일반적인 문제들

1. **API 키 오류**
   - 환경변수가 올바르게 설정되었는지 확인
   - OpenAI API 키가 유효한지 확인

2. **빌드 오류**
   - Node.js 버전이 18 이상인지 확인
   - 의존성 설치 완료 확인

3. **타입스크립트 오류**
   - `npm run type-check` 실행
   - 타입 정의 파일 확인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- OpenAI GPT-4o-mini API
- Next.js 팀
- Tailwind CSS 팀
- 모든 오픈소스 기여자들

---

**주의**: 이 앱은 엔터테인먼트 목적으로 제작되었습니다. 중요한 인생 결정에는 전문가의 조언을 구하시기 바랍니다. 