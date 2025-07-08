// 테스트용 OpenAI API - 배포 시 주석처리
/*
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 없습니다' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: '안녕하세요' }],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        error: 'OpenAI API 오류',
        status: response.status,
        statusText: response.statusText,
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.choices[0].message.content
    });

  } catch (error) {
    return NextResponse.json({
      error: '네트워크 오류',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
*/ 