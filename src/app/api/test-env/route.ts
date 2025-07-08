// 테스트용 API - 배포 시 주석처리
/*
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // 기본 환경변수 정보
  const envInfo = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('NEXT'))
  };

  // API 키가 없으면 기본 정보만 반환
  if (!apiKey) {
    return NextResponse.json({ ...envInfo, apiTest: 'API 키가 없습니다' });
  }

  // OpenAI API 테스트
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: '테스트' }],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        ...envInfo,
        apiTest: '실패',
        status: response.status,
        error: errorData
      });
    }

    const data = await response.json();
    return NextResponse.json({
      ...envInfo,
      apiTest: '성공',
      message: data.choices[0].message.content
    });

  } catch (error) {
    return NextResponse.json({
      ...envInfo,
      apiTest: '네트워크 오류',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}
*/ 