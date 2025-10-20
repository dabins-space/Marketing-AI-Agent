import { Send, Sparkles, Calendar, TrendingUp, Users, Gift, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { StrategyModal, type ScheduledAction } from './StrategyModal';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  showStrategyButton?: boolean;
  isConfirmation?: boolean;
  strategyName?: string;
}

interface ChatSectionProps {
  onScheduleRegister?: (actions: ScheduledAction[]) => void;
}

export function ChatSection({ onScheduleRegister }: ChatSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '안녕하세요! 👋\n\n저는 당신의 비즈니스 성장을 돕는 마케팅 AI 에이전트입니다. 구글 캘린더와 연동하여 개인 일정을 확인하면서 마케팅 전략을 함께 세울 수 있어요.\n\n💡 더 정확한 전략을 원하신다면?\n업종, 고객층, 목표, 예산 등 자세한 정보를 알려주실수록 더욱 맞춤형 마케팅 전략을 만들어 드릴 수 있어요!\n\n어떤 도움이 필요하신가요?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { icon: TrendingUp, text: '이번 주 매출 올릴 마케팅 뭐 할까?', color: 'from-orange-400 to-orange-500' },
    { icon: Users, text: '신규 고객 유치 전략 추천해줘', color: 'from-blue-400 to-blue-500' },
    { icon: Gift, text: '기존 고객 재방문 이벤트 만들어줘', color: 'from-purple-400 to-purple-500' },
    { icon: Calendar, text: '다음 달 마케팅 캘린더 계획', color: 'from-green-400 to-green-500' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectStrategy = (id: number) => {
    setSelectedStrategy(id);
    
    // Add confirmation message to chat
    const confirmationMessage: Message = {
      id: Date.now(),
      type: 'ai',
      content: '선택한 전략을 일정에 반영했습니다\n\n✅ 사진 한 장으로 완성하는 신상 홍보이(가) 캘린더에 등록되었습니다.\n\n오른쪽 캘린더에서 일정을 확인하실 수 있어요! 📅',
      isConfirmation: true,
      strategyName: '사진 한 장으로 완성하는 신상 홍보'
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    // Close modal
    setTimeout(() => {
      setIsModalOpen(false);
    }, 600);
  };

  const handleStrategyGeneration = () => {
    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: 'AI 전략 생성하기'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Add AI response after a short delay
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: '전략을 분석 중입니다... ✨\n\n현재 캘린더 일정과 비즈니스 데이터를 종합하여 맞춤형 마케팅 전략을 생성했습니다.\n\n아래 버튼을 클릭하여 상세 전략을 확인하세요!',
        showStrategyButton: true
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Smart AI Response Generator based on user input
  const generateAIResponse = (userInput: string): { content: string; showStrategyButton?: boolean } => {
    const input = userInput.toLowerCase();
    
    // Keywords for different types of questions
    const salesKeywords = ['매출', '수익', '판매', '돈', '수입'];
    const newCustomerKeywords = ['신규', '새로운 고객', '고객 유치', '신규고객', '신고객'];
    const existingCustomerKeywords = ['재방문', '기존 고객', '단골', '재구매', '충성'];
    const snsKeywords = ['sns', '소셜', '인스타', '페이스북', '블로그', '온라인'];
    const eventKeywords = ['이벤트', '프로모션', '할인', '쿠폰', '세일'];
    const strategyKeywords = ['전략', '계획', '추천', '제안', '아이디어'];
    const calendarKeywords = ['일정', '스케줄', '달', '주', '캘린더'];
    const contentKeywords = ['콘텐츠', '사진', '촬영', '영상', '포스팅'];
    
    // Check for sales-related questions
    if (salesKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '매출 증대를 위한 조언을 드릴게요! 📈\n\n현재 데이터를 보면:\n• 신규 고객 유입이 28% 감소\n• 기존 고객 재방문율 42% 유지\n• 평균 객단가는 안정적\n\n추천 방향:\n1️⃣ 신상 홍보로 신규 고객 유치\n2️⃣ SNS 집중 마케팅으로 브랜드 노출 극대화\n3️⃣ 인플루언서 협업으로 바이럴 효과\n\n💡 구체적인 실행 전략이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼을 눌러 상세한 액션 플랜을 확인해보세요!',
        showStrategyButton: false
      };
    }
    
    // Check for new customer acquisition
    if (newCustomerKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '신규 고객 유치 아이디어입니다! 🎯\n\n효과적인 방법:\n• 🎬 인스타그램 릴스로 시선 끌기 (도달률 3배 ↑)\n• 📸 전문 사진으로 첫인상 강화\n• ⭐ 인플루언서 협업으로 신뢰도 UP\n• 🎁 첫 방문 고객 특별 혜택\n\n가을 시즌은 신메뉴 관심도가 가장 높은 시기입니다. 지금이 기회예요!\n\n💡 단계별 실행 플랜이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼으로 14일 완성 전략을 받아보세요!',
        showStrategyButton: false
      };
    }
    
    // Check for existing customer retention
    if (existingCustomerKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '기존 고객 재방문 유도 팁입니다! 💝\n\n데이터 분석 결과:\n• 2주 이상 미방문 고객 42%\n• 화요일 메시지 오픈율 35% 높음\n• 개인화 메시지 효과 2배\n\n추천 액션:\n✉️ 개인화된 감사 메시지 (고객명 + 선호 메뉴)\n🎫 20% 할인 쿠폰 제공\n⭐ VIP 고객 특별 혜택 (음료 1+1)\n📱 카카오톡 알림톡 발송\n\n재방문율 40% 향상이 기대됩니다!\n\n💡 더 체계적인 고객 유지 전략이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼을 눌러주세요!',
        showStrategyButton: false
      };
    }
    
    // Check for SNS/Social media marketing
    if (snsKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: 'SNS 마케팅 가이드입니다! 📱\n\n효과적인 채널:\n• 📸 Instagram: 가장 높은 참여율 (메인 채널 추천)\n• 📝 네이버 블로그: 검색 유입 최적화\n• 👥 Facebook: 지역 커뮤니티 타겟팅\n\n콘텐츠 아이디어:\n1️⃣ 릴스 3종 세트 (시즌 메뉴, 매장 분위기, 고객 후기)\n2️⃣ 스토리 시리즈 (일일 카운트다운 + 이벤트)\n3️⃣ 해시태그 전략 (#주말맛집 #신메뉴)\n\n💡 SNS 통합 전략과 일정이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼으로 전문 플랜을 확인하세요!',
        showStrategyButton: false
      };
    }
    
    // Check for event/promotion questions
    if (eventKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '이벤트 기획 아이디어입니다! 🎉\n\n트렌디한 이벤트:\n• 🎬 릴스 공유 이벤트 (10% 할인 쿠폰)\n• 📸 인증샷 이벤트 (음료 1+1)\n• ⏰ 플래시 세일 (긴박감 조성, 전환율 52% ↑)\n• 🎁 선착순 30명 특별 혜택\n\n타이밍:\n주말 직전 (금-일)이 가장 효과적입니다.\n고객 SNS 활동이 28% 증가하는 시기예요!\n\n💡 이벤트 실행 전략과 타임라인이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼을 눌러주세요!',
        showStrategyButton: false
      };
    }
    
    // Check for content creation questions
    if (contentKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '콘텐츠 제작 가이드입니다! 📸\n\n전문 콘텐츠 전략:\n• 🎨 메뉴컷 + 라이프컷 촬영\n• 🌈 색감 통일 편집 (브랜드 일관성)\n• 🎬 릴스 3종 제작\n• 📱 하이라이트 "New 메뉴" 추가\n\n촬영 팁:\n- 자연광 활용 (오전 10-11시 최적)\n- 다양한 앵글 (위에서, 옆에서, 클로즈업)\n- 스토리가 있는 사진 (손, 사람 포함)\n\n💡 전문가 지원과 상세 콘텐츠 전략이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼으로 확인하세요!',
        showStrategyButton: false
      };
    }
    
    // Check for calendar/schedule questions
    if (calendarKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '마케팅 일정 계획 팁입니다! 📅\n\n효과적인 일정 관리:\n• 주간 단위로 캠페인 구분\n• 개인 일정과 마케팅 일정 분리\n• SNS 포스팅 최적 시간대 활용\n• 이벤트는 최소 3일 전 홍보 시작\n\n추천 타임라인:\n1주차: 기획 및 콘텐츠 제작\n2주차: 홍보 및 실행\n3주차: 효과 분석 및 개선\n\n💡 AI가 자동으로 만든 마케팅 캘린더가 필요하시다면?\n아래 "AI 전략 생성하기" 버튼을 눌러 14일 일정을 받아보세요!',
        showStrategyButton: false
      };
    }
    
    // Check for general strategy questions
    if (strategyKeywords.some(keyword => input.includes(keyword))) {
      return {
        content: '맞춤 전략 추천입니다! ✨\n\n현재 상황 분석:\n• 신규 고객 유입 28% 감소 추세\n• 재방문율은 42%로 안정적\n• 가을 시즌 = 신메뉴 관심도 최고\n\n추천 방향:\n"사진 한 장으로 완성하는 신상 홍보"\n\n🎯 핵심 포인트:\n• 신제품 기획 및 개발\n• 사전 반응 테스트\n• 전문 사진 촬영\n• SNS·블로그 통합 홍보\n• 인플루언서 협업\n\n💡 6단계 체크리스트와 상세 실행 플랜이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼을 눌러 전체 전략을 확인하세요!',
        showStrategyButton: false
      };
    }
    
    // Greeting responses
    if (input.includes('안녕') || input.includes('하이') || input.includes('헬로')) {
      return {
        content: '안녕하세요! 😊\n\n마케팅 AI 에이전트입니다.\n오늘은 어떤 마케팅 고민이 있으신가요?\n\n💡 이런 것들을 도와드릴 수 있어요:\n• 매출 증대 전략\n• 신규 고객 유치 방법\n• SNS 마케팅 기획\n• 이벤트 아이디어\n• 콘텐츠 제작 가이드\n\n편하게 물어보세요!\n\n📌 구체적인 실행 전략이 필요하시다면 아래 "AI 전략 생성하기" 버튼을 눌러주세요.',
        showStrategyButton: false
      };
    }
    
    // Default response for general questions
    return {
      content: '흥미로운 질문이네요! 🤔\n\n관련 정보를 분석하고 있습니다...\n\n💡 더 구체적으로 말씀해주시면:\n• "매출 올리는 방법 알려줘"\n• "신규 고객 유치 전략 추천해줘"\n• "SNS 마케팅 어떻게 해?"\n• "이벤트 아이디어 필요해"\n\n이런 식으로 질문하시면 더 정확한 답변을 드릴 수 있어요!\n\n📌 종합적인 마케팅 전략이 필요하시다면?\n아래 "AI 전략 생성하기" 버튼을 눌러 맞춤 전략을 받아보세요!',
      showStrategyButton: false
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setIsTyping(false);
      const aiResponseData = generateAIResponse(currentInput);
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseData.content,
        showStrategyButton: aiResponseData.showStrategyButton
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  const handleQuickQuestion = (questionText: string) => {
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: questionText
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate AI response based on question
    setTimeout(() => {
      setIsTyping(false);
      const aiResponseData = generateAIResponse(questionText);
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponseData.content,
        showStrategyButton: aiResponseData.showStrategyButton
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">AI 마케팅 상담</h2>
            <p className="text-sm text-gray-500">언제든지 물어보세요</p>
          </div>
        </div>
      </div>

      {/* Chat Messages - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === 'ai' ? (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className={`rounded-2xl rounded-tl-sm p-4 shadow-sm ${
                    message.isConfirmation
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
                      : 'bg-[#FFF7F0]'
                  }`}>
                    {message.isConfirmation && (
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-900">선택한 전략을 일정에 반영했습니다</p>
                      </div>
                    )}
                    {message.content.split('\n').map((line, idx) => (
                      <p 
                        key={idx} 
                        className={`${
                          message.isConfirmation ? 'text-green-800' : 'text-gray-800'
                        } ${idx > 0 ? 'mt-2' : ''} ${
                          line.startsWith('💡') || line.startsWith('✅') || line.startsWith('📌') ? 'font-medium' : ''
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                    
                    {message.showStrategyButton && (
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 w-full px-5 py-3 bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        AI가 제안한 전략 보기 🔍
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-gradient-to-br from-[#FFA45B] to-[#FFB878] rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-[80%]">
                    {message.content.split('\n').map((line, idx) => (
                      <p key={idx} className={`text-white ${idx > 0 ? 'mt-2' : ''}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="rounded-2xl rounded-tl-sm p-4 shadow-sm bg-[#FFF7F0]">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#FFA45B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#FFB878] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#FFCB9A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Question Chips */}
        <div className="pt-4">
          <p className="text-xs text-gray-500 mb-3">💡 추천 질문</p>
          <div className="grid grid-cols-1 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question.text)}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-[#FFA45B] hover:bg-[#FFF7F0] transition-all text-left group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${question.color} flex items-center justify-center flex-shrink-0`}>
                  <question.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{question.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer for better scrolling experience */}
        <div className="h-4"></div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input - Fixed at Bottom */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex flex-col gap-3">
          {/* Input with Send Button */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="마케팅 전략을 물어보세요... (예: 매출 올리는 방법 알려줘)"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA45B] focus:border-transparent text-sm"
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
              className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${
                isTyping || !inputValue.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white hover:shadow-md'
              }`}
              title="메시지 보내기"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* AI Strategy Generation Button */}
          <button 
            onClick={handleStrategyGeneration}
            disabled={isTyping}
            className={`w-full px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              isTyping
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white hover:shadow-lg'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>AI 전략 생성하기</span>
          </button>
        </div>
      </div>

      {/* Strategy Selection Modal */}
      <StrategyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedStrategy={selectedStrategy}
        onSelectStrategy={handleSelectStrategy}
        onScheduleRegister={onScheduleRegister}
      />
    </div>
  );
}
