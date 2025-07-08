import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/utils';

// OpenAI API 설정
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MAX_TOKENS = 4000; // 더 자세한 분석을 위해 토큰 수 증가
const TIMEOUT_MS = 30000; // 30초 타임아웃

// 요청 제한 설정
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15분
  max: 10, // 최대 10회 요청
};

// 메모리 기반 요청 카운터 (프로덕션에서는 Redis 사용 권장)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// IP 주소 추출 함수
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

// 요청 제한 확인 함수
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip);

  if (!userRequests || now > userRequests.resetTime) {
    // 새로운 윈도우 시작
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (userRequests.count >= RATE_LIMIT.max) {
    return false;
  }

  userRequests.count++;
  return true;
}

// OpenAI API 호출 함수
async function callOpenAI(messages: any[]): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // 모델명을 gpt-4o로 변경
        messages,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API 오류 상세:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      throw new Error(
        `OpenAI API 오류: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
      throw error;
    }
    
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}

// POST 요청 처리
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 클라이언트 IP 확인
    const clientIP = getClientIP(request);
    
    // 요청 제한 확인
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          success: false,
          error: '요청이 너무 많습니다. 15분 후에 다시 시도해주세요.',
        },
        { status: 429 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { messages } = body;

    // 입력값 검증
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '올바른 메시지 형식이 아닙니다.',
        },
        { status: 400 }
      );
    }

    // 메시지 길이 제한 확인
    const totalLength = messages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0);
    if (totalLength > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 텍스트가 너무 깁니다. 더 간단하게 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // OpenAI API 호출
    const result = await callOpenAI(messages);

    // 응답 검증
    if (!result.choices || !result.choices[0]?.message?.content) {
      throw new Error('OpenAI API에서 올바른 응답을 받지 못했습니다.');
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        content: result.choices[0].message.content,
        usage: result.usage,
      },
    });

  } catch (error) {
    console.error('API 오류:', error);

    // 에러 타입에 따른 응답
    if (error instanceof Error) {
      if (error.message.includes('API 키')) {
        return NextResponse.json(
          {
            success: false,
            error: '서버 설정 오류가 발생했습니다.',
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('시간이 초과')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 408 }
        );
      }
      
      if (error.message.includes('OpenAI API 오류')) {
        return NextResponse.json(
          {
            success: false,
            error: '분석 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 