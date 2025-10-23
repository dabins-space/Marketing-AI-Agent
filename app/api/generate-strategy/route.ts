import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { conversationHistory = [] } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Create conversation context for strategy generation (optimized for speed)
    const systemPrompt = `소상공인/스타트업을 위한 2가지 창의적이고 실행 가능한 마케팅 전략을 생성하세요. 각 전략은 단계별로 2-3개의 구체적인 액션을 포함해야 합니다:

전략 1: [창의적이고 구체적인 실행 아이디어 제목]
개요: [1문장으로 전략 설명]
사전단계:
1. [구체적 행동 1] - [소요시간] - [실행방법]
2. [구체적 행동 2] - [소요시간] - [실행방법]
3. [구체적 행동 3] - [소요시간] - [실행방법]
기획단계:
1. [구체적 행동 1] - [소요시간] - [실행방법]
2. [구체적 행동 2] - [소요시간] - [실행방법]
3. [구체적 행동 3] - [소요시간] - [실행방법]
실행단계:
1. [구체적 행동 1] - [소요시간] - [실행방법]
2. [구체적 행동 2] - [소요시간] - [실행방법]
3. [구체적 행동 3] - [소요시간] - [실행방법]
효과: [구체적인 예상 결과]

전략 2: [창의적이고 구체적인 실행 아이디어 제목]
[동일 형식 - 각 단계별로 2-3개 액션]

각 전략은 다음과 같은 창의적인 실행 아이디어를 포함해야 합니다:
- 바이럴 콘텐츠 제작 (릴스, 챌린지, 해시태그 캠페인)
- 고객 참여 이벤트 (포토 콘테스트, 리뷰 이벤트, 추첨)
- 지역 커뮤니티 마케팅 (협업, 제휴, 이벤트 참여)
- 디지털 마케팅 (SNS 광고, 인플루언서 협업, 이메일 마케팅)
- 고객 유지 프로그램 (로열티, VIP 혜택, 개인화 서비스)
- 신제품/신메뉴 런칭 (사전 홍보, 출시 이벤트, 후속 마케팅)

모든 액션은 창의적이고 실제로 바로 실행할 수 있는 구체적인 행동이어야 하며, 각 단계별로 최소 2-3개의 세부 액션을 포함해야 합니다.`;

    // Prepare conversation context
    const conversationText = conversationHistory
      .map((msg: any) => `${msg.type === 'user' ? '사용자' : 'AI'}: ${msg.content}`)
      .join('\n\n');

    // Check if there's meaningful conversation content
    const hasUserInput = conversationHistory.some((msg: any) => 
      msg.type === 'user' && 
      msg.content && 
      msg.content.trim().length > 0 && 
      !msg.content.includes('AI 전략 생성하기')
    );

    let userPrompt;
    
    if (hasUserInput) {
      userPrompt = `대화 내용: ${conversationText}\n\n위 내용을 바탕으로 창의적이고 실행 가능한 마케팅 전략 2개를 생성해주세요. 각 전략은 단계별로 2-3개의 구체적인 액션을 포함하고, 실제로 바로 실행할 수 있는 창의적인 행동 아이디어여야 합니다.\n\n전략 제목은 창의적이고 구체적인 실행 아이디어를 간결하게 표현해주세요. 예: "인스타그램 릴스 챌린지 바이럴 마케팅"\n\n다음과 같은 창의적인 아이디어를 포함해주세요:\n- 바이럴 콘텐츠 제작 (릴스, 챌린지, 해시태그 캠페인)\n- 고객 참여 이벤트 (포토 콘테스트, 리뷰 이벤트, 추첨)\n- 지역 커뮤니티 마케팅 (협업, 제휴, 이벤트 참여)\n- 디지털 마케팅 (SNS 광고, 인플루언서 협업, 이메일 마케팅)\n- 고객 유지 프로그램 (로열티, VIP 혜택, 개인화 서비스)\n- 신제품/신메뉴 런칭 (사전 홍보, 출시 이벤트, 후속 마케팅)\n- 창의적 이벤트 기획 (테마 데이, 콜라보레이션, 특별 경험 제공)\n- 고객 참여형 마케팅 (투표, 설문, 커뮤니티 챌린지)\n- 트렌드 활용 마케팅 (최신 트렌드, 계절성, 특별한 날 활용)\n- 스토리텔링 마케팅 (브랜드 스토리, 고객 스토리, 감성 마케팅)`;
    } else {
      userPrompt = `소상공인/스타트업을 위한 창의적이고 실행 가능한 마케팅 전략 2개를 생성해주세요. 각 전략은 단계별로 2-3개의 구체적인 액션을 포함해야 합니다.\n\n전략 제목은 창의적이고 구체적인 실행 아이디어를 간결하게 표현해주세요. 예: "인스타그램 릴스 챌린지 바이럴 마케팅"\n\n다음과 같은 창의적인 실행 아이디어를 포함해주세요:\n- 바이럴 콘텐츠 제작 (릴스, 챌린지, 해시태그 캠페인)\n- 고객 참여 이벤트 (포토 콘테스트, 리뷰 이벤트, 추첨)\n- 지역 커뮤니티 마케팅 (협업, 제휴, 이벤트 참여)\n- 디지털 마케팅 (SNS 광고, 인플루언서 협업, 이메일 마케팅)\n- 고객 유지 프로그램 (로열티, VIP 혜택, 개인화 서비스)\n- 신제품/신메뉴 런칭 (사전 홍보, 출시 이벤트, 후속 마케팅)\n- 창의적 이벤트 기획 (테마 데이, 콜라보레이션, 특별 경험 제공)\n- 고객 참여형 마케팅 (투표, 설문, 커뮤니티 챌린지)\n- 트렌드 활용 마케팅 (최신 트렌드, 계절성, 특별한 날 활용)\n- 스토리텔링 마케팅 (브랜드 스토리, 고객 스토리, 감성 마케팅)\n\n각 전략은 창의적이고 실제로 바로 실행할 수 있는 구체적인 행동이어야 하며, 각 단계별로 최소 2-3개의 세부 액션을 포함해야 합니다.`;
    }

    // Call OpenAI API with optimized settings for speed
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1200, // Increased for more complete strategies
      temperature: 0.7, // Higher temperature for more creative responses
      stream: false
    });

    const strategyContent = completion.choices[0]?.message?.content || '전략 생성에 실패했습니다.';

    // Parse the strategy content to extract structured data
    const strategyData = parseStrategyContent(strategyContent);

    const processingTime = Math.round((Date.now() - startTime) / 1000);
    
    return NextResponse.json({ 
      success: true, 
      strategy: strategyData,
      rawContent: strategyContent,
      processingTime: processingTime
    });

  } catch (error: any) {
    console.error('Strategy generation error:', error);
    
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
      error: '전략 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
    }, { status: 500 });
  }
}

// Helper function to generate strategy reason based on title
function getStrategyReasonFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('릴스') || titleLower.includes('챌린지')) {
    return '고객 참여형 바이럴 마케팅 전략입니다. 인스타그램 릴스의 높은 도달률과 참여율을 활용하여 자연스러운 바이럴 효과를 만듭니다. 고객이 직접 콘텐츠에 참여함으로써 브랜드 인지도를 높이고 신규 고객을 유치할 수 있습니다.';
  }
  
  if (titleLower.includes('쿠폰') || titleLower.includes('할인')) {
    return '신규 고객 유치를 위한 할인 마케팅 전략입니다. 지역 커뮤니티와 연계하여 타겟 고객에게 직접적인 혜택을 제공합니다. 할인 쿠폰을 통해 고객의 첫 방문을 유도하고, 추가 혜택으로 재방문을 유도하는 효과적인 고객 확보 전략입니다.';
  }
  
  if (titleLower.includes('ugc') || titleLower.includes('후기') || titleLower.includes('사진')) {
    return '고객 생성 콘텐츠(UGC) 마케팅 전략입니다. 고객이 직접 제작한 콘텐츠를 활용하여 신뢰도 높은 마케팅을 진행합니다. 고객 참여를 유도하는 이벤트를 통해 자연스러운 브랜드 노출과 입소문 효과를 얻을 수 있습니다.';
  }
  
  if (titleLower.includes('신메뉴') || titleLower.includes('출시') || titleLower.includes('런칭')) {
    return '신제품/신메뉴 출시 마케팅 전략입니다. 다양한 채널을 활용한 종합적인 홍보로 신제품에 대한 관심을 높입니다. 사전 홍보부터 출시 이벤트, 후속 마케팅까지 체계적인 접근으로 신제품의 성공적인 런칭을 지원합니다.';
  }
  
  if (titleLower.includes('sns') || titleLower.includes('인스타그램') || titleLower.includes('소셜')) {
    return '소셜미디어 마케팅 전략입니다. SNS 플랫폼의 특성을 활용하여 타겟 고객과 직접적인 소통을 통해 브랜드 인지도를 높입니다. 다양한 콘텐츠 형식을 통해 고객의 관심을 끌고 참여를 유도하는 디지털 마케팅 접근법입니다.';
  }
  
  if (titleLower.includes('커뮤니티') || titleLower.includes('지역') || titleLower.includes('협업')) {
    return '지역 커뮤니티 마케팅 전략입니다. 지역 내 다른 비즈니스나 커뮤니티와의 협업을 통해 상호 고객을 공유하고 신뢰도를 높입니다. 지역 밀착형 마케팅으로 입소문 효과와 지속적인 고객 관계를 구축할 수 있습니다.';
  }
  
  if (titleLower.includes('이벤트') || titleLower.includes('프로모션')) {
    return '이벤트 마케팅 전략입니다. 고객 참여를 유도하는 다양한 이벤트를 통해 브랜드와의 상호작용을 높입니다. 재미있고 혜택이 있는 이벤트로 고객의 관심을 끌고 브랜드 인지도를 높이는 효과적인 마케팅 방법입니다.';
  }
  
  // Default reason
  return '대화 내용을 바탕으로 생성된 맞춤형 마케팅 전략입니다. 현재 상황과 목표에 최적화된 실행 가능한 마케팅 아이디어를 제공합니다.';
}

// Helper function to parse strategy content into structured data
function parseStrategyContent(content: string) {
  const strategies: Array<{
    title: string;
    overview: string;
    reason: string;
    actions: Array<{
      title: string;
      duration: string;
      method: string;
      section: 'preparation' | 'content' | 'execution';
    }>;
    expectedEffect: string;
    requiredResources: string;
  }> = [];

  // Split content by strategy sections
  const strategySections = content.split(/전략 \d+:/);
  
  for (let i = 1; i < strategySections.length; i++) { // Skip first empty section
    const section = strategySections[i];
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    console.log(`Processing strategy ${i}:`, lines.slice(0, 5)); // Debug log
    
    let title = '';
    let overview = '';
    const actions: Array<{
      title: string;
      duration: string;
      method: string;
      section: 'preparation' | 'content' | 'execution';
    }> = [];
    let expectedEffect = '';
    let requiredResources = '';

    let currentSection = '';
    
    for (const line of lines) {
      // Check for section headers
      if (line.includes('개요:')) {
        currentSection = 'overview';
        const overviewText = line.replace('개요:', '').trim();
        if (overviewText) overview += overviewText + ' ';
      } else if (line.includes('사전단계:')) {
        currentSection = 'preparation';
      } else if (line.includes('기획단계:')) {
        currentSection = 'content';
      } else if (line.includes('실행단계:')) {
        currentSection = 'execution';
      } else if (line.includes('효과:')) {
        currentSection = 'effect';
        const effectText = line.replace('효과:', '').trim();
        if (effectText) expectedEffect += effectText + ' ';
      } else if (line.match(/^\d+\./)) {
        // Parse action items
        const actionText = line.replace(/^\d+\.\s*/, '');
        const parts = actionText.split(' - ');
        if (parts.length >= 3) {
          actions.push({
            title: parts[0].trim(),
            duration: parts[1].trim(),
            method: parts[2].trim(),
            section: currentSection as 'preparation' | 'content' | 'execution'
          });
        } else if (parts.length >= 1) {
          // Handle cases where duration and method might be missing
          actions.push({
            title: parts[0].trim(),
            duration: '1-2일',
            method: '직접 실행',
            section: currentSection as 'preparation' | 'content' | 'execution'
          });
        }
      } else if (currentSection === 'overview' && line && !line.includes(':')) {
        overview += line + ' ';
      } else if (currentSection === 'effect' && line && !line.includes(':')) {
        expectedEffect += line + ' ';
      } else if (currentSection === 'resources' && line) {
        requiredResources += line + ' ';
      } else if (!title && line && !line.includes(':') && !line.match(/^\d+\./) && !line.startsWith('**')) {
        // First non-markdown line is the title - clean it up
        title = line.replace(/["""]/g, '').trim();
      }
    }

    strategies.push({
      title: title || `전략 ${i}`,
      overview: overview.trim(),
      reason: getStrategyReasonFromTitle(title || ''),
      actions: actions.length > 0 ? actions : [
        { title: '전략 분석 및 기획', duration: '1-2일', method: '직접 실행', section: 'preparation' },
        { title: '콘텐츠 제작', duration: '3-5일', method: '직접 실행', section: 'content' },
        { title: 'SNS 마케팅 실행', duration: '7-14일', method: '직접 실행', section: 'execution' },
        { title: '효과 분석 및 개선', duration: '2-3일', method: '직접 실행', section: 'execution' }
      ],
      expectedEffect: expectedEffect.trim() || '매출 증대 및 고객 유치 효과 기대',
      requiredResources: requiredResources.trim() || '기본적인 마케팅 도구 및 SNS 계정'
    });
  }

  // If no strategies were parsed, create fallback strategies
  if (strategies.length === 0) {
    strategies.push(
      {
        title: '인스타그램 릴스 챌린지 바이럴 마케팅',
        overview: '고객 참여형 릴스 챌린지를 통해 바이럴 마케팅 효과를 얻는 창의적 전략',
        reason: '고객 참여형 바이럴 마케팅 전략입니다. 인스타그램 릴스의 높은 도달률과 참여율을 활용하여 자연스러운 바이럴 효과를 만듭니다. 고객이 직접 콘텐츠에 참여함으로써 브랜드 인지도를 높이고 신규 고객을 유치할 수 있습니다.',
        actions: [
          { title: '챌린지 콘셉트 기획 및 해시태그 #카페챌린지 설정', duration: '1일', method: '직접 실행', section: 'preparation' },
          { title: '참여 가이드 영상 제작 및 매장 내 안내 포스터 부착', duration: '1일', method: '직접 실행', section: 'preparation' },
          { title: '시드 릴스 3개 제작 (직원 참여, 고객 후기, 메뉴 소개)', duration: '2일', method: '직접 실행', section: 'content' },
          { title: '인스타그램 피드에 챌린지 소개 포스팅 2개 업로드', duration: '1일', method: '직접 실행', section: 'content' },
          { title: '참여 고객에게 음료 무료 제공 및 추가 혜택 지급', duration: '7일', method: '직접 실행', section: 'execution' },
          { title: '참여 릴스 리포스트 및 베스트 3명 선정하여 상품권 지급', duration: '3일', method: '직접 실행', section: 'execution' }
        ],
        expectedEffect: '릴스 도달률 2만+, 신규 팔로워 500명 증가, 참여 고객 200명+',
        requiredResources: '인스타그램 계정, 촬영 도구, 이벤트 상품, 포스터'
      },
      {
        title: '테마 데이 특별 경험 마케팅',
        overview: '매주 특별한 테마의 날을 만들어 고객에게 독특한 경험을 제공하는 창의적 전략',
        reason: '고객에게 특별한 경험을 제공하는 창의적 마케팅 전략입니다. 매주 다른 테마의 특별한 날을 만들어 고객의 관심을 끌고, SNS에서 자연스럽게 공유되도록 유도합니다. 독특한 경험을 통해 브랜드 차별화와 고객 충성도를 높일 수 있습니다.',
        actions: [
          { title: '월간 테마 데이 캘린더 제작 (예: 고양이데이, 커피데이, 친구데이)', duration: '1일', method: '직접 실행', section: 'preparation' },
          { title: '각 테마별 특별 메뉴 및 장식 아이템 준비', duration: '2일', method: '직접 실행', section: 'preparation' },
          { title: '테마별 포토존 설치 및 인스타그램 필터 제작', duration: '1일', method: '직접 실행', section: 'content' },
          { title: '테마 데이 안내 포스터 및 SNS 콘텐츠 제작', duration: '1일', method: '직접 실행', section: 'content' },
          { title: '테마 데이 당일 특별 서비스 제공 및 고객 참여 유도', duration: '1일', method: '직접 실행', section: 'execution' },
          { title: '고객 참여 사진 리포스트 및 다음 테마 데이 예고', duration: '1일', method: '직접 실행', section: 'execution' }
        ],
        expectedEffect: '고객 참여도 3배 증가, SNS 공유량 200% 상승, 재방문율 40% 향상',
        requiredResources: '테마 소품, 포토존, SNS 계정, 장식 아이템'
      }
    );
  }

  // Return the first strategy for backward compatibility, but include all strategies
  return {
    strategies: strategies,
    title: strategies[0]?.title || '맞춤형 마케팅 전략',
    overview: strategies[0]?.overview || '',
    actions: strategies[0]?.actions || [],
    expectedEffect: strategies[0]?.expectedEffect || '매출 증대 및 고객 유치 효과 기대',
    requiredResources: strategies[0]?.requiredResources || '기본적인 마케팅 도구 및 SNS 계정'
  };
}
