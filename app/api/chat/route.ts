import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Create conversation context for the AI
    const systemPrompt = `당신은 친근하고 전문적인 마케팅 AI 에이전트입니다. 

답변 규칙:
- 짧고 간결하게 답변하세요 (2-3문장 이내)
- 마크다운 문법(**, ##, ### 등)을 사용하지 마세요
- 일반 텍스트로만 답변하세요
- 친근하고 도움이 되는 톤으로 답변하세요
- 구체적이고 실행 가능한 조언을 제공하세요

마케팅 관련 질문에 대해서만 답변하고, 다른 주제는 "마케팅 관련 질문을 해주세요"라고 안내하세요.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: 300, // 짧은 답변을 위해 토큰 수 대폭 감소
      temperature: 0.5, // 더 일관된 답변을 위해 낮춤
      stream: false,
    });

    const aiResponse = completion.choices[0]?.message?.content || '죄송합니다. 응답을 생성할 수 없습니다.';

    return NextResponse.json({ 
      success: true, 
      response: aiResponse 
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.' 
      }, { status: 429 });
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        error: 'API 키가 올바르지 않습니다.' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'AI 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }, { status: 500 });
  }
}
