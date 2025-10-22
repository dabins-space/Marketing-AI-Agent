import { useState } from 'react';
import { X, Sparkles, RefreshCw, Calendar as CalendarIcon, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Resizable } from 're-resizable';
import { toast } from 'sonner';

interface ActionPlan {
  category: 'content' | 'channel' | 'event';
  section: 'preparation' | 'content' | 'event' | 'promotion';
  title: string;
  description: string;
  icon: string;
  daysFromStart?: number; // Days offset from strategy start date
}

export interface ScheduledAction {
  strategyId: number;
  strategyTitle: string;
  strategyCode: string; // Unique code like "PHOTO", "VIP", etc.
  actionIndex: number;
  actionTitle: string;
  actionIcon: string;
  actionDescription: string;
  date: Date;
  mode: 'direct' | 'expert';
  section: 'preparation' | 'content' | 'event' | 'promotion';
}

interface Strategy {
  id: number;
  code: string; // Unique code for this strategy
  title: string;
  duration: string;
  startDate: string;
  endDate: string;
  summary: string;
  reason: string;
  expectedEffect: string;
  actionPlans: ActionPlan[];
}

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStrategy: number | null;
  onSelectStrategy: (id: number) => void;
  onScheduleRegister?: (actions: ScheduledAction[]) => void;
}

export function StrategyModal({ isOpen, onClose, selectedStrategy, onSelectStrategy, onScheduleRegister }: StrategyModalProps) {
  // Define strategies first so we can use it in initial state
  const strategies: Strategy[] = [
    {
      id: 1,
      code: 'PHOTO',
      title: '사진 한 장으로 완성하는 신상 홍보',
      duration: '14일',
      startDate: '10월 20일 (일)',
      endDate: '11월 2일 (토)',
      summary: '신제품 기획부터 인플루언서 협업까지 완벽한 신상 홍보 전략입니다. SNS와 블로그를 통합 활용하여 브랜드 인지도를 극대화하고, 신규 고객 유입을 촉진합니다.',
      reason: '가을 시즌은 신메뉴 관심도가 가장 높은 시기입니다. 사전 반응 테스트와 전문 촬영을 통해 완성도 높은 콘텐츠를 제작하고, 인플루언서 협업으로 바이럴 효과를 극대화할 수 있습니다.',
      expectedEffect: '브랜드 인지도 3배 증가, 신메뉴 주문률 70% 이상, SNS 팔로워 40% 증가, 검색 유입 2.5배 상승 예상',
      actionPlans: [
        {
          category: 'content',
          section: 'preparation',
          title: '신제품 기획 및 개발',
          description: '트렌드 조사, 원가/타깃 설정, 메뉴명·콘셉트 문구 확정',
          icon: '💡',
          daysFromStart: 0
        },
        {
          category: 'content',
          section: 'preparation',
          title: '사전 반응 테스트',
          description: '시음회, 인스타 투표, 후기 수집 및 리포트',
          icon: '📊',
          daysFromStart: 3
        },
        {
          category: 'content',
          section: 'content',
          title: '사진 및 콘텐츠 제작',
          description: '메뉴컷/라이프컷 촬영, 색감 통일 편집, 릴스 3종',
          icon: '📸',
          daysFromStart: 6
        },
        {
          category: 'channel',
          section: 'promotion',
          title: '인스타그램 홍보',
          description: '출시 D-3 티저~오픈 게시, 해시태그 #가을신상 #카페신제품, 하이라이트 "New 메뉴" 추가',
          icon: '📱',
          daysFromStart: 9
        },
        {
          category: 'channel',
          section: 'promotion',
          title: '블로그·네이버 홍보',
          description: '플레이스 사진 업데이트, 블로그 포스팅 2회, 후기 이벤트',
          icon: '📝',
          daysFromStart: 11
        },
        {
          category: 'event',
          section: 'event',
          title: '인플루언서 협업',
          description: '지역 인플루언서 3명 초청, 릴스 업로드, 해시태그 캠페인',
          icon: '⭐',
          daysFromStart: 12
        }
      ]
    },
    {
      id: 2,
      code: 'VIP',
      title: '단골 고객 VIP 프로그램으로 재방문율 2배 늘리기',
      duration: '12일',
      startDate: '10월 21일 (월)',
      endDate: '11월 1일 (금)',
      summary: '기존 고객 데이터 분석을 통해 맞춤형 VIP 혜택을 제공하는 로열티 프로그램입니다. 개인화된 리워드와 감사 메시지로 고객 충성도를 높이고 재방문을 유도합니다.',
      reason: '현재 2주 이상 미방문 고객이 42%로 높은 상황입니다. 개인화된 메시지와 VIP 등급제를 도입하면 재방문율을 40% 향상시킬 수 있습니다. 화요일은 메시지 오픈율이 35% 높아 최적의 발송 타이밍입니다.',
      expectedEffect: '재방문율 40% 향상, 월 평균 방문 횟수 2.3회→3.8회 증가, 고객 생애 가치(LTV) 25% 상승, 고객 만족도 85% 이상 예상',
      actionPlans: [
        {
          category: 'content',
          section: 'preparation',
          title: 'VIP 등급제 설계',
          description: '실버/골드/플래티넘 3단계 등급, 방문 횟수별 혜택 차등화, 등급별 전용 특전 기획',
          icon: '👑',
          daysFromStart: 0
        },
        {
          category: 'content',
          section: 'preparation',
          title: '고객 데이터 분석',
          description: '2주+ 미방문 고객 추출, 선호 메뉴·방문 패턴 분석, 개인화 메시지 템플릿 제작',
          icon: '📊',
          daysFromStart: 2
        },
        {
          category: 'content',
          section: 'content',
          title: '개인화 메시지 작성',
          description: '고객명+선호메뉴 포함, 감사 카드 디자인, 쿠폰 디자인 제작',
          icon: '✍️',
          daysFromStart: 4
        },
        {
          category: 'channel',
          section: 'promotion',
          title: '개인화 감사 메시지 발송',
          description: '카카오톡 알림톡 발송, SMS 백업 메시지',
          icon: '💌',
          daysFromStart: 6
        },
        {
          category: 'event',
          section: 'event',
          title: 'VIP 전용 쿠폰 제공',
          description: '실버 10% / 골드 20% / 플래티넘 30% 할인, 유효기간 7일, 음료 1+1 추가 혜택',
          icon: '🎫',
          daysFromStart: 8
        },
        {
          category: 'event',
          section: 'event',
          title: 'VIP 데이 이벤트',
          description: '월 1회 VIP 전용 시음회, 신메뉴 사전 체험, 특별 할인 20% 추가',
          icon: '🎉',
          daysFromStart: 10
        },
        {
          category: 'channel',
          section: 'promotion',
          title: '리워드 프로그램 홍보',
          description: '매장 내 포스터 부착, 인스타 스토리 안내, 카운터 직원 안내 교육',
          icon: '📣',
          daysFromStart: 11
        }
      ]
    },
    {
      id: 3,
      code: 'LOCAL',
      title: '지역 커뮤니티 제휴로 주말 매출 50% 올리기',
      duration: '10일',
      startDate: '10월 22일 (화)',
      endDate: '10월 31일 (목)',
      summary: '지역 헬스장, 요가센터, 독서모임 등과 제휴하여 상호 고객을 공유하는 윈윈 전략입니다. 제휴 할인과 크로스 프로모션으로 신규 고객층을 확보합니다.',
      reason: '주말 공석률이 35%로 높고, 지역 커뮤니티 회원들의 카페 이용률이 평균 2.8배 높습니다. 제휴를 통해 신뢰도 있는 추천 효과를 얻고, 지역 밀착형 브랜드 이미지를 구축할 수 있습니다.',
      expectedEffect: '주말 매출 50% 증대, 신규 고객 유입 200명+, 제휴처 회원 전환율 45%, 지역 커뮤니티 인지도 3배 상승 예상',
      actionPlans: [
        {
          category: 'content',
          section: 'preparation',
          title: '제휴처 발굴 및 협상',
          description: '반경 1km 내 헬스장 3곳, 요가센터 2곳, 독서모임/스터디카페 컨택, 상호 혜택 조율',
          icon: '🤝',
          daysFromStart: 0
        },
        {
          category: 'content',
          section: 'preparation',
          title: '제휴 할인 프로그램 설계',
          description: '제휴처 회원증 제시 시 15% 할인, 크로스 쿠폰 교환, 스탬프 2배 적립',
          icon: '💳',
          daysFromStart: 2
        },
        {
          category: 'channel',
          section: 'content',
          title: '제휴 포스터 및 POP 제작',
          description: '양측 매장 포스터 부착, 카운터 스탠드 배치, QR코드 할인 쿠폰 발급',
          icon: '🖼️',
          daysFromStart: 4
        },
        {
          category: 'channel',
          section: 'promotion',
          title: '제휴처 SNS 크로스 홍보',
          description: '인스타 서로 태그, 스토리 공유, 공동 이벤트 릴스 제작',
          icon: '📱',
          daysFromStart: 6
        },
        {
          category: 'event',
          section: 'event',
          title: '제휴 런칭 이벤트',
          description: '첫 방문 고객 음료 1+1, 제휴 3곳 모두 방문 시 특별 선물, 추첨 이벤트',
          icon: '🎁',
          daysFromStart: 7
        },
        {
          category: 'event',
          section: 'event',
          title: '제휴처 공동 챌린지',
          description: '운동 후 카페 인증샷 이벤트, 독서 후 카페 리뷰 이벤트, 참여자 추첨 경품',
          icon: '🏆',
          daysFromStart: 9
        }
      ]
    },
    {
      id: 4,
      code: 'REELS',
      title: '인스타 릴스 챌린지로 바이럴 마케팅 성공하기',
      duration: '14일',
      startDate: '10월 23일 (수)',
      endDate: '11월 5일 (화)',
      summary: '트렌디한 릴스 챌린지를 기획하여 고객 참여를 유도하고 자연스러운 바이럴 효과를 만드는 전략입니다. 해시태그 캠페인과 경품 이벤트로 폭발적인 도달율을 달성합니다.',
      reason: '릴스는 일반 ��시물 대비 도달률이 3배 높고, 챌린지 형식은 참여율을 52% 증가시킵니다. Z세대와 MZ세대 타겟층이 가장 활발하게 참여하는 콘텐츠 형식으로, 브랜드 인지도를 빠르게 확산시킬 수 있습니다.',
      expectedEffect: '릴스 도달률 2만+, 해시태그 사용 500회+, 신규 팔로워 800명 증가, 참여 고객 방문 전환율 60% 이상 예상',
      actionPlans: [
        {
          category: 'content',
          section: 'preparation',
          title: '챌린지 콘셉트 기획',
          description: '트렌디한 음악 선정, 간단한 동작/포즈 디자인, 재현 가능한 난이도 설정',
          icon: '🎬',
          daysFromStart: 0
        },
        {
          category: 'channel',
          section: 'preparation',
          title: '해시태그 전략 수립',
          description: '#OO카페챌린지 메인 태그, 서브 태그 5개 선정, 태그 가이드 제작',
          icon: '#️⃣',
          daysFromStart: 2
        },
        {
          category: 'content',
          section: 'content',
          title: '시드 릴스 제작',
          description: '매장 직원 참여 영상 3종, 고퀄리티 편집, BGM 삽입, 자막 및 이모티콘 효과',
          icon: '🎥',
          daysFromStart: 5
        },
        {
          category: 'channel',
          section: 'promotion',
          title: '인스타그램 집중 운영',
          description: '릴스 D-7부터 티저, D-Day 시드 릴스 발행, 스토리 리포스트, 참여자 태그',
          icon: '📱',
          daysFromStart: 8
        },
        {
          category: 'event',
          section: 'event',
          title: '참여 고객 경품 이벤트',
          description: '릴스 업로드 후 매장 방문 시 음료 무료, 베스트 릴스 3명 선정 상품권 5만원',
          icon: '🎁',
          daysFromStart: 10
        },
        {
          category: 'event',
          section: 'event',
          title: '인플루언서 시드 배포',
          description: '마이크로 인플루언서 10명 섭외, 시드 릴스 동시 발행, 팔로워 참여 유도',
          icon: '⭐',
          daysFromStart: 12
        }
      ]
    }
  ];

  // Initialize selected actions with all action plans checked by default
  const initializeSelectedActions = () => {
    const initialState: { [strategyId: number]: Set<number> } = {};
    strategies.forEach(strategy => {
      const actionIndices = new Set<number>();
      strategy.actionPlans.forEach((_, index) => {
        actionIndices.add(index);
      });
      initialState[strategy.id] = actionIndices;
    });
    return initialState;
  };

  // Initialize all strategy modes to 'direct' (기본은 직접 실행)
  const initializeStrategyModes = () => {
    const initialState: { [strategyId: number]: 'direct' | 'expert' } = {};
    strategies.forEach(strategy => {
      initialState[strategy.id] = 'direct';
    });
    return initialState;
  };

  // Initialize all action modes to 'direct' (기본은 직접 실행)
  const initializeActionModes = () => {
    const initialState: { [strategyId: number]: { [actionIndex: number]: 'direct' | 'expert' } } = {};
    strategies.forEach(strategy => {
      const actionModes: { [actionIndex: number]: 'direct' | 'expert' } = {};
      strategy.actionPlans.forEach((_, index) => {
        actionModes[index] = 'direct';
      });
      initialState[strategy.id] = actionModes;
    });
    return initialState;
  };

  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedActions, setSelectedActions] = useState<{ [strategyId: number]: Set<number> }>(initializeSelectedActions);
  // Strategy mode: 'direct' = 내가 직접 실행하기, 'expert' = 전문가 요청하기 (기본값: direct)
  const [strategyModes, setStrategyModes] = useState<{ [strategyId: number]: 'direct' | 'expert' }>(initializeStrategyModes);
  // Action-level modes: each action can have its own mode (기본값: direct)
  const [actionModes, setActionModes] = useState<{ [strategyId: number]: { [actionIndex: number]: 'direct' | 'expert' } }>(initializeActionModes);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [expandedStrategies, setExpandedStrategies] = useState<Set<number>>(new Set());
  const [strategyDates, setStrategyDates] = useState<{ [strategyId: number]: { startDate: Date | undefined; endDate: Date | undefined } }>({});
  const [openPopover, setOpenPopover] = useState<{ strategyId: number | null; field: 'start' | 'end' | null }>({ strategyId: null, field: null });
  const [modalSize, setModalSize] = useState({ width: 1400, height: 850 }); // Larger size for better visibility without scrolling
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Google Calendar integration functions
  const createCalendarEvent = async (action: ScheduledAction) => {
    try {
      // Check if Google Calendar is connected
      const storedTokens = localStorage.getItem('google_calendar_tokens');
      if (!storedTokens) {
        toast.error('구글 캘린더에 먼저 연결해주세요.');
        return;
      }

      const tokens = JSON.parse(storedTokens);

      // Format dates for the event
      const startDate = new Date(action.date);
      const endDate = new Date(action.date);
      endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

      const eventData = {
        title: action.actionTitle,
        description: `${action.actionDescription}\n\n전략: ${action.strategyTitle}\n실행 모드: ${action.mode === 'expert' ? '전문가 요청' : '직접 실행'}`,
        location: '', // Add location if needed
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString(),
        attendees: [] // Add attendees if needed
      };

      const response = await fetch('/api/gcal/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.stringify(tokens)}`
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('캘린더에 일정이 추가되었습니다!');
      } else if (result.code === 'AUTH_EXPIRED') {
        toast.error('인증이 만료되었습니다. 다시 연결해주세요.');
        localStorage.removeItem('google_calendar_tokens');
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Calendar event creation error:', error);
      toast.error('캘린더 일정 생성에 실패했습니다.');
    }
  };

  // Get current mode for a strategy (default is 'direct')
  const getStrategyMode = (strategyId: number): 'direct' | 'expert' => {
    return strategyModes[strategyId] || 'direct';
  };

  // Toggle mode between direct and expert
  const toggleStrategyMode = (strategyId: number) => {
    setStrategyModes(prev => {
      const currentMode = prev[strategyId] || 'direct';
      const newMode = currentMode === 'direct' ? 'expert' : 'direct';
      return {
        ...prev,
        [strategyId]: newMode
      };
    });
  };

  // Get action mode (default is 'direct')
  const getActionMode = (strategyId: number, actionIndex: number): 'direct' | 'expert' => {
    return actionModes[strategyId]?.[actionIndex] || 'direct';
  };

  // Toggle action mode
  const toggleActionMode = (strategyId: number, actionIndex: number) => {
    setActionModes(prev => {
      const strategyActions = prev[strategyId] || {};
      const currentMode = strategyActions[actionIndex] || 'direct';
      const newMode = currentMode === 'direct' ? 'expert' : 'direct';
      
      return {
        ...prev,
        [strategyId]: {
          ...strategyActions,
          [actionIndex]: newMode
        }
      };
    });
  };

  const toggleAction = (strategyId: number, actionIndex: number) => {
    setSelectedActions(prev => {
      const newState = { ...prev };
      if (!newState[strategyId]) {
        newState[strategyId] = new Set();
      }
      const strategyActions = new Set(newState[strategyId]);
      
      if (strategyActions.has(actionIndex)) {
        strategyActions.delete(actionIndex);
      } else {
        strategyActions.add(actionIndex);
      }
      
      newState[strategyId] = strategyActions;
      return newState;
    });
  };

  const getSelectedCount = (strategyId: number) => {
    return selectedActions[strategyId]?.size || 0;
  };

  const toggleStrategy = (strategyId: number) => {
    setExpandedStrategies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(strategyId)) {
        newSet.delete(strategyId);
      } else {
        newSet.add(strategyId);
      }
      return newSet;
    });
  };

  const updateStrategyDate = (strategyId: number, field: 'start' | 'end', value: Date | undefined) => {
    setStrategyDates(prev => ({
      ...prev,
      [strategyId]: {
        ...(prev[strategyId] || {}),
        [field === 'start' ? 'startDate' : 'endDate']: value
      }
    }));
    setOpenPopover({ strategyId: null, field: null });
  };

  const formatDate = (date: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  // Parse Korean date string like "10월 20일 (일)" to Date object
  const parseKoreanDate = (dateStr: string): Date => {
    const match = dateStr.match(/(\d+)월\s*(\d+)일/);
    if (match) {
      const month = parseInt(match[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(match[2]);
      return new Date(2025, month, day); // Using 2025 as the year
    }
    return new Date(); // Fallback to today
  };

  // Check if any action is selected across all strategies
  const hasAnySelectedAction = (): boolean => {
    return Object.values(selectedActions).some(actionSet => actionSet.size > 0);
  };

  // Get total count of selected actions across all strategies
  const getTotalSelectedCount = (): number => {
    return Object.values(selectedActions).reduce((total, actionSet) => total + actionSet.size, 0);
  };

  // Register selected actions to schedule
  const handleScheduleRegister = async () => {
    const scheduledActions: ScheduledAction[] = [];

    // Iterate through each strategy
    strategies.forEach(strategy => {
      const selectedIndices = selectedActions[strategy.id];
      if (!selectedIndices || selectedIndices.size === 0) return;

      // Get start date (custom or default)
      const customDates = strategyDates[strategy.id];
      const startDate = customDates?.startDate || parseKoreanDate(strategy.startDate);

      // Iterate through selected actions
      selectedIndices.forEach(actionIndex => {
        const action = strategy.actionPlans[actionIndex];
        if (!action) return;

        // Calculate action date based on daysFromStart
        const actionDate = new Date(startDate);
        actionDate.setDate(actionDate.getDate() + (action.daysFromStart || 0));

        // Get action mode
        const mode = getActionMode(strategy.id, actionIndex);

        scheduledActions.push({
          strategyId: strategy.id,
          strategyTitle: strategy.title,
          strategyCode: strategy.code,
          actionIndex,
          actionTitle: action.title,
          actionIcon: action.icon,
          actionDescription: action.description,
          date: actionDate,
          mode,
          section: action.section
        });
      });
    });

    // Call the callback to send scheduled actions to parent
    if (onScheduleRegister) {
      onScheduleRegister(scheduledActions);
    }

    // Create Google Calendar events for all selected actions
    const isGoogleConnected = localStorage.getItem('google_calendar_tokens');
    if (isGoogleConnected) {
      toast.info('구글 캘린더에 일정을 추가하는 중...');
      
      // Create events one by one to avoid rate limiting
      for (const action of scheduledActions) {
        await createCalendarEvent(action);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Close modal
    onClose();
  };

  const getDisplayDate = (strategy: Strategy, field: 'start' | 'end'): string => {
    const customDate = strategyDates[strategy.id];
    if (field === 'start') {
      return customDate?.startDate ? formatDate(customDate.startDate) : strategy.startDate;
    }
    return customDate?.endDate ? formatDate(customDate.endDate) : strategy.endDate;
  };

  const getDateValue = (strategy: Strategy, field: 'start' | 'end'): Date | undefined => {
    const customDate = strategyDates[strategy.id];
    if (field === 'start') {
      return customDate?.startDate;
    }
    return customDate?.endDate;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  if (!isOpen) return null;

  // Mock schedule data
  const scheduleEvents = [
    { date: '10/11 (금)', title: '개인: 가족 모임', time: '19:00', type: 'personal' },
    { date: '10/15 (화)', title: '개인: 점검 예정', time: '15:00', type: 'personal' },
    { date: '10/20 (일)', title: 'AI 제안: 신제품 기획 시작', time: '10:00', type: 'ai' },
    { date: '10/23 (수)', title: 'AI 제안: 사전 반응 테스트', time: '14:00', type: 'ai' },
    { date: '10/27 (일)', title: '전략: 전문 촬영', time: '09:00', type: 'strategy' },
    { date: '10/30 (수)', title: 'AI 제안: SNS 홍보 시작', time: '11:00', type: 'ai' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Orange Blur */}
      <div 
        className="absolute inset-0 bg-[#FFF3E8] bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content - Resizable */}
      <Resizable
        size={isFullscreen ? { width: '90vw', height: '90vh' } : { width: modalSize.width, height: modalSize.height }}
        onResizeStop={(e, direction, ref, d) => {
          if (!isFullscreen) {
            setModalSize({
              width: modalSize.width + d.width,
              height: modalSize.height + d.height,
            });
          }
        }}
        minWidth={800}
        minHeight={500}
        maxWidth="90vw"
        maxHeight="90vh"
        className="relative z-10"
        enable={isFullscreen ? false : undefined}
        handleStyles={{
          right: { cursor: 'ew-resize' },
          bottom: { cursor: 'ns-resize' },
          bottomRight: { cursor: 'nwse-resize' },
          left: { cursor: 'ew-resize' },
          top: { cursor: 'ns-resize' },
          topRight: { cursor: 'nesw-resize' },
          bottomLeft: { cursor: 'nesw-resize' },
          topLeft: { cursor: 'nwse-resize' }
        }}
        handleClasses={{
          right: 'hover:bg-[#FFA45B] transition-colors',
          bottom: 'hover:bg-[#FFA45B] transition-colors',
          bottomRight: 'hover:bg-[#FFA45B] transition-colors',
          left: 'hover:bg-[#FFA45B] transition-colors',
          top: 'hover:bg-[#FFA45B] transition-colors',
          topRight: 'hover:bg-[#FFA45B] transition-colors',
          bottomLeft: 'hover:bg-[#FFA45B] transition-colors',
          topLeft: 'hover:bg-[#FFA45B] transition-colors'
        }}
      >
        <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#FFF7F0] to-[#FDF3EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900">AI가 추천하는 이번 주 마케팅 전략 🔍</h2>
                <p className="text-sm text-gray-600">원하는 전략을 선택하고 캘린더에 등록하세요</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Overall Strategy Summary - Collapsible */}
        <div className="px-6 py-3 bg-gradient-to-br from-amber-50 to-orange-50 border-b border-orange-100">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="w-full flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-gray-900">전체 데이터 분석 & AI 추천 요약</h4>
              </div>
              <p className="text-sm text-[#FFA45B] font-medium">
                {showAnalysis ? '클릭하여 숨기기' : '클릭하여 자세히 보기'}
              </p>
            </div>
            {showAnalysis ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {showAnalysis && (
            <div className="space-y-4 mt-4 animate-fadeIn">
              {/* Data Analysis */}
              <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-1">데이터 분석 결과</h4>
                    <p className="text-sm text-gray-700">
                      이번 주 신규 매출이 저번 주 대비 <span className="text-red-600">15% 감소</span>했습니다. 
                      기존 고객의 재방문율은 42%로 유지되고 있으나, 신규 고객 유입이 <span className="text-red-600">28% 하락</span>한 상태입니다.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">신규 고객</p>
                    <p className="text-red-600">-28%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">재방문율</p>
                    <p className="text-green-600">42%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">전체 매출</p>
                    <p className="text-red-600">-15%</p>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Summary */}
              <div className="bg-gradient-to-br from-[#FFF7F0] to-[#FDF3EB] rounded-xl p-4 border-2 border-[#FFA45B] shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">AI 추천 전략</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      이런 분석 결과를 바탕으로 <span className="text-[#FFA45B]">맞춤 신상 홍보 전략</span>을 준비했습니다. 
                      신제품 기획부터 인플루언서 협업까지, 신규 고객 유치와 브랜드 인지도 향상에 최적화되어 있습니다.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFA45B]"></div>
                        <span className="text-gray-700">신제품 기획 및 개발 - 트렌드 기반 완성도</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFB878]"></div>
                        <span className="text-gray-700">사전 반응 테스트 - 데이터 기반 검증</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFCB9A]"></div>
                        <span className="text-gray-700">전문 촬영 및 콘텐츠 제작 - 퀄리티 극대화</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFA45B]"></div>
                        <span className="text-gray-700">SNS·블로그 통합 홍보 - 바이럴 마케팅</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFB878]"></div>
                        <span className="text-gray-700">인플루언서 협업 - 신뢰도 및 도달 범위 확대</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Strategy Cards List - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
          onDoubleClick={toggleFullscreen}
          title="더블 클릭하여 전체화면 전환"
        >
          {/* Section Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl bg-gradient-to-r from-[#FFA45B] to-[#FFB878] bg-clip-text text-transparent">추천 마케팅 액션 플랜</h3>
              {isFullscreen && (
                <span className="text-sm text-gray-500 ml-auto">💡 더블 클릭하여 축소</span>
              )}
            </div>
            
            {/* 간단한 요약 */}
            <div className="ml-13 mb-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                원하는 액션을 선택하면 <strong className="text-gray-900">Google 캘린더에 자동 등록</strong>되고 <strong className="text-gray-900">알람이 발송</strong>됩니다. 
                각 액션은 <span className="text-[#FFA45B]">직접 실행</span>(AI 도구 제공) 또는 <span className="text-blue-600">전문가 요청</span>(전문가 대행) 모드로 진행할 수 있습니다.
              </p>
            </div>

            {/* Collapsible 자세히 보기 */}
            <Collapsible className="ml-13">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-[#FFA45B] hover:text-[#FF8C00] transition-colors mb-3 group">
                <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                <span>자세한 사용 방법 보기</span>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 animate-fadeIn">
                {/* 액션 플랜 선택 안내 */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-[#FFA45B] rounded-lg p-4">
                  <h4 className="text-gray-900 mb-2">액션 플랜 선택하기</h4>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    아래 전략 카드에서 실행하고 싶은 액션 플랜을 개별적으로 선택할 수 있습니다.
                  </p>
                  <div className="bg-white/70 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFA45B] mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-800">
                        <strong>Google 캘린더 자동 등록:</strong> 선택한 액션 플랜만 실제 캘린더에 일정으로 추가됩니다
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFA45B] mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-800">
                        <strong>알람 발송:</strong> 각 액션 플랜의 실행 날짜에 맞춰 자동으로 알림이 전송됩니다
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFA45B] mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-800">
                        <strong>개별 선택 가능:</strong> 전체 전략 중 필요한 액션만 선택하여 진행할 수 있습니다
                      </p>
                    </div>
                  </div>
                </div>

                {/* 실행 모드 선택 안내 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-2">실행 모드 선택하기</h4>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    각 액션 플랜을 어떻게 실행할지 모드를 선택할 수 있습니다. 액션별로 다른 모드를 선택할 수도 있습니다.
                  </p>
                  
                  {/* 직접 선택 모드 */}
                  <div className="bg-white/70 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="px-2 py-0.5 bg-[#FFA45B] text-white rounded text-xs flex-shrink-0">직접 실행</div>
                      <p className="text-sm text-gray-900">내가 직접 실행하고 AI가 실행을 도와드립니다</p>
                    </div>
                    <div className="pl-4 space-y-1.5 text-sm text-gray-700">
                      <p>• 별도 탭에서 각 액션별로 상세한 가이드와 AI 도구를 제공합니다</p>
                      <p>• AI가 실제 마케팅 콘텐츠를 자동으로 생성해드립니다</p>
                      <p className="text-xs text-gray-600 pl-3">
                        예시: 마케팅 문구 자동 생성, SNS 해시태그/키워드 추천, 이미지 콘셉트 가이드, 
                        포스팅 최적 타이밍 분석, 타겟 고객 분석 리포트 등
                      </p>
                    </div>
                  </div>

                  {/* 전문가 요청 모드 */}
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs flex-shrink-0">전문가 요청</div>
                      <p className="text-sm text-gray-900">전문가가 직접 실행하고 결과를 공유해드립니다</p>
                    </div>
                    <div className="pl-4 space-y-1.5 text-sm text-gray-700">
                      <p>• 마케팅 전문가가 처음부터 끝까지 직접 진행합니다</p>
                      <p>• 완성된 결과물과 실행 리포트를 받아보실 수 있습니다</p>
                      <p className="text-xs text-gray-600 pl-3">
                        예시: 전문 콘텐츠 기획 및 제작, 광고 캠페인 운영, 인플루언서 섭외 및 협업 관리, 
                        전문 사진/영상 촬영, SNS 계정 운영 대행 등
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {strategies.map((strategy) => {
            const isSelected = selectedStrategy === strategy.id;
            const currentMode = getStrategyMode(strategy.id);
            
            return (
              <div
                key={strategy.id}
                className={`relative rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#FFA45B] bg-gradient-to-br from-[#FFF7F0] to-[#FDF3EB] shadow-xl'
                    : !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                      ? 'border-gray-300 bg-gray-100 hover:border-gray-400 hover:shadow-md'
                      : 'border-gray-200 bg-white hover:border-[#FFB878] hover:shadow-lg'
                }`}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white border-0 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      선택됨
                    </Badge>
                  </div>
                )}

                <div className="p-6">
                  {/* Strategy Header - Clickable Area */}
                  <div 
                    onClick={() => toggleStrategy(strategy.id)}
                    className="mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-2xl font-semibold mb-3 ${
                          !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                            ? 'text-gray-400'
                            : 'text-gray-900 bg-gradient-to-r from-[#FFA45B] to-[#FFB878] bg-clip-text text-transparent'
                        }`}>{strategy.title}</h3>
                        
                        {/* Duration Badge */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md ${
                            !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                              ? 'bg-gray-300'
                              : 'bg-gradient-to-r from-[#FFA45B] to-[#FFB878]'
                          }`}>
                            <CalendarIcon className={`w-4 h-4 ${
                              !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                                ? 'text-gray-500'
                                : 'text-white'
                            }`} />
                            <div className="flex items-center gap-2">
                              {/* Start Date Popover */}
                              <Popover 
                                open={openPopover.strategyId === strategy.id && openPopover.field === 'start'}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setOpenPopover({ strategyId: strategy.id, field: 'start' });
                                  } else {
                                    setOpenPopover({ strategyId: null, field: null });
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <button 
                                    className={`font-medium text-sm hover:underline cursor-pointer ${
                                      !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                                        ? 'text-gray-500'
                                        : 'text-white'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {getDisplayDate(strategy, 'start')}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                                  <Calendar
                                    mode="single"
                                    selected={getDateValue(strategy, 'start')}
                                    onSelect={(date) => updateStrategyDate(strategy.id, 'start', date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>

                              <span className={`font-medium text-sm ${
                                !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                                  ? 'text-gray-500'
                                  : 'text-white'
                              }`}>-</span>

                              {/* End Date Popover */}
                              <Popover 
                                open={openPopover.strategyId === strategy.id && openPopover.field === 'end'}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setOpenPopover({ strategyId: strategy.id, field: 'end' });
                                  } else {
                                    setOpenPopover({ strategyId: null, field: null });
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <button 
                                    className={`font-medium text-sm hover:underline cursor-pointer ${
                                      !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                                        ? 'text-gray-500'
                                        : 'text-white'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {getDisplayDate(strategy, 'end')}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                                  <Calendar
                                    mode="single"
                                    selected={getDateValue(strategy, 'end')}
                                    onSelect={(date) => updateStrategyDate(strategy.id, 'end', date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <Badge className={
                            !expandedStrategies.has(strategy.id) && getSelectedCount(strategy.id) === 0
                              ? 'bg-gray-200 text-gray-500 border border-gray-300'
                              : 'bg-orange-100 text-[#FFA45B] border border-[#FFA45B]'
                          }>
                            {strategy.duration} 진행
                          </Badge>
                        </div>
                      </div>

                      {/* Toggle Icon & Selection Status */}
                      <div className="flex-shrink-0 flex items-center gap-2 mt-1">
                        {/* Selection Status Badge (shown when collapsed) */}
                        {!expandedStrategies.has(strategy.id) && (
                          <Badge className={`border-0 ${
                            getSelectedCount(strategy.id) > 0
                              ? currentMode === 'expert'
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                                : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {getSelectedCount(strategy.id) > 0 
                              ? `✓ ${getSelectedCount(strategy.id)}개 선택됨`
                              : '선택안됨'
                            }
                          </Badge>
                        )}
                        
                        {expandedStrategies.has(strategy.id) ? (
                          <ChevronUp className="w-6 h-6 text-[#FFA45B]" />
                        ) : (
                          <ChevronDown className={`w-6 h-6 ${
                            getSelectedCount(strategy.id) === 0 ? 'text-gray-300' : 'text-gray-400'
                          }`} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedStrategies.has(strategy.id) && (
                    <div className="space-y-5 animate-fadeIn">
                      {/* Marketing Description */}
                      <div>
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-xs text-blue-600 mb-1">📌 어떤 마케팅인가요?</p>
                          <p className="text-sm text-gray-800">{strategy.reason}</p>
                        </div>
                      </div>

                      {/* Select & Mode Controls */}
                      {!isSelected && (
                        <div className="space-y-3">
                          {/* Select All Button - Moved to Top */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle all action plans for this strategy
                              setSelectedActions(prev => {
                                const newState = { ...prev };
                                const currentSelected = newState[strategy.id] || new Set();
                                const allSelected = currentSelected.size === strategy.actionPlans.length;
                                
                                if (allSelected) {
                                  // Deselect all
                                  newState[strategy.id] = new Set();
                                } else {
                                  // Select all
                                  const allIndices = new Set<number>();
                                  strategy.actionPlans.forEach((_, index) => {
                                    allIndices.add(index);
                                  });
                                  newState[strategy.id] = allIndices;
                                }
                                return newState;
                              });
                            }}
                            className={`w-full px-5 py-3 rounded-xl transition-all text-center ${
                              (selectedActions[strategy.id]?.size || 0) === strategy.actionPlans.length
                                ? 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200'
                                : currentMode === 'expert'
                                  ? 'bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
                                  : 'bg-white border-2 border-[#FFA45B] text-[#FFA45B] hover:bg-[#FFF7F0]'
                            }`}
                          >
                            {(selectedActions[strategy.id]?.size || 0) === strategy.actionPlans.length 
                              ? '✓ 전략 선택됨 - 선택 해제하기'
                              : currentMode === 'expert'
                                ? '👨‍💼 전문가 요청 - 전체 선택'
                                : '👤 직접 실행 - 전체 선택'
                            }
                          </button>



                          {/* Mode Tabs */}
                          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 rounded-xl">
                            {(() => {
                              // Check if all actions are in 'direct' mode
                              const allActionsDirect = strategy.actionPlans.every((_, idx) => 
                                getActionMode(strategy.id, idx) === 'direct'
                              );
                              
                              // Check if all actions are in 'expert' mode
                              const allActionsExpert = strategy.actionPlans.every((_, idx) => 
                                getActionMode(strategy.id, idx) === 'expert'
                              );
                              
                              const allSelected = (selectedActions[strategy.id]?.size || 0) === strategy.actionPlans.length;
                              
                              return (
                                <>
                                  {/* Direct Execution Tab */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!allSelected || allActionsDirect) return;
                                      
                                      // Update strategy mode
                                      setStrategyModes(prev => ({
                                        ...prev,
                                        [strategy.id]: 'direct'
                                      }));
                                      
                                      // Update all action modes to 'direct'
                                      setActionModes(prev => {
                                        const newActionModes: { [actionIndex: number]: 'direct' | 'expert' } = {};
                                        strategy.actionPlans.forEach((_, idx) => {
                                          newActionModes[idx] = 'direct';
                                        });
                                        return {
                                          ...prev,
                                          [strategy.id]: newActionModes
                                        };
                                      });
                                    }}
                                    disabled={!allSelected || allActionsDirect}
                                    className={`px-3 py-2.5 rounded-lg transition-all text-center ${
                                      !allSelected || allActionsDirect
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-gray-300 hover:border-orange-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-center gap-1.5">
                                      <span className="text-base">👤</span>
                                      <p className="text-sm">직접 실행 <span className="text-xs opacity-70">(전체선택)</span></p>
                                    </div>
                                  </button>

                                  {/* Expert Request Tab */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!allSelected || allActionsExpert) return;
                                      
                                      // Update strategy mode
                                      setStrategyModes(prev => ({
                                        ...prev,
                                        [strategy.id]: 'expert'
                                      }));
                                      
                                      // Update all action modes to 'expert'
                                      setActionModes(prev => {
                                        const newActionModes: { [actionIndex: number]: 'direct' | 'expert' } = {};
                                        strategy.actionPlans.forEach((_, idx) => {
                                          newActionModes[idx] = 'expert';
                                        });
                                        return {
                                          ...prev,
                                          [strategy.id]: newActionModes
                                        };
                                      });
                                    }}
                                    disabled={!allSelected || allActionsExpert}
                                    className={`px-3 py-2.5 rounded-lg transition-all text-center ${
                                      !allSelected || allActionsExpert
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-300 hover:border-blue-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-center gap-1.5">
                                      <span className="text-base">👨‍💼</span>
                                      <p className="text-sm">전문가 요청 <span className="text-xs opacity-70">(전체선택)</span></p>
                                    </div>
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Action Plans Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-gray-900">📋 액션 플랜 체크리스트</h5>
                          <div className="flex gap-2">
                            {getSelectedCount(strategy.id) > 0 && (
                              <Badge className={`border-0 ${
                                currentMode === 'expert'
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                                  : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white'
                              }`}>
                                ✓ {getSelectedCount(strategy.id)}개 {currentMode === 'expert' ? '전문가 요청' : '선택'}
                              </Badge>
                            )}
                            <Badge className="bg-gray-100 text-gray-700 border-0">
                              총 {strategy.actionPlans.length}개
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* 사전준비 단계 Section */}
                          {(() => {
                            const preparationActions = strategy.actionPlans.filter(action => 
                              action.section === 'preparation'
                            );
                            
                            if (preparationActions.length === 0) return null;
                            
                            return (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <span className="text-sm">🎯</span>
                                  </div>
                                  <h6 className="text-sm text-purple-700">사전준비 단계</h6>
                                  <div className="flex-1 h-px bg-purple-200"></div>
                                </div>
                                <div className="space-y-3">
                                  {preparationActions.map((action) => {
                                    const idx = strategy.actionPlans.indexOf(action);
                                    const isActionSelected = selectedActions[strategy.id]?.has(idx) || false;
                                    const actionMode = getActionMode(strategy.id, idx);
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-xl p-4 border-2 transition-all ${
                                          isActionSelected
                                            ? actionMode === 'expert'
                                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                                              : 'bg-gradient-to-r from-orange-50 to-amber-50 border-[#FFA45B] shadow-md'
                                            : 'bg-white border-gray-200 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="text-2xl flex-shrink-0 mt-1">
                                            {action.icon}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-sm text-gray-900 mb-1">
                                              {action.title}
                                            </h5>
                                            <p className="text-xs text-gray-600">
                                              {action.description}
                                            </p>
                                          </div>
                                          
                                          {/* Action Controls */}
                                          <div className="flex gap-2 flex-shrink-0">
                                            {/* Mode Toggle - Small */}
                                            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'direct'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'direct'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="내가 직접 실행"
                                              >
                                                <span>👤</span>
                                                <span className="text-[10px]">직접</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'expert'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'expert'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="전문가 요청"
                                              >
                                                <span>👨‍💼</span>
                                                <span className="text-[10px]">전문가</span>
                                              </button>
                                            </div>

                                            {/* Select Button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAction(strategy.id, idx);
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                                                isActionSelected
                                                  ? actionMode === 'expert'
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm'
                                                    : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-sm'
                                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                              }`}
                                            >
                                              {isActionSelected ? '선택됨 ✓' : '선택'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 콘텐츠 기획 단계 Section */}
                          {(() => {
                            const contentActions = strategy.actionPlans.filter(action => 
                              action.section === 'content'
                            );
                            
                            if (contentActions.length === 0) return null;
                            
                            return (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <span className="text-sm">✨</span>
                                  </div>
                                  <h6 className="text-sm text-green-700">콘텐츠 기획/제작 단계</h6>
                                  <div className="flex-1 h-px bg-green-200"></div>
                                </div>
                                <div className="space-y-3">
                                  {contentActions.map((action) => {
                                    const idx = strategy.actionPlans.indexOf(action);
                                    const isActionSelected = selectedActions[strategy.id]?.has(idx) || false;
                                    const actionMode = getActionMode(strategy.id, idx);
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-xl p-4 border-2 transition-all ${
                                          isActionSelected
                                            ? actionMode === 'expert'
                                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                                              : 'bg-gradient-to-r from-orange-50 to-amber-50 border-[#FFA45B] shadow-md'
                                            : 'bg-white border-gray-200 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="text-2xl flex-shrink-0 mt-1">
                                            {action.icon}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-sm text-gray-900 mb-1">
                                              {action.title}
                                            </h5>
                                            <p className="text-xs text-gray-600">
                                              {action.description}
                                            </p>
                                          </div>
                                          
                                          {/* Action Controls */}
                                          <div className="flex gap-2 flex-shrink-0">
                                            {/* Mode Toggle - Small */}
                                            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'direct'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'direct'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="내가 직접 실행"
                                              >
                                                <span>👤</span>
                                                <span className="text-[10px]">직접</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'expert'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'expert'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="전문가 요청"
                                              >
                                                <span>👨‍💼</span>
                                                <span className="text-[10px]">전문가</span>
                                              </button>
                                            </div>

                                            {/* Select Button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAction(strategy.id, idx);
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                                                isActionSelected
                                                  ? actionMode === 'expert'
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm'
                                                    : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-sm'
                                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                              }`}
                                            >
                                              {isActionSelected ? '선택됨 ✓' : '선택'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 이벤트 기획 단계 Section (선택적) */}
                          {(() => {
                            const eventActions = strategy.actionPlans.filter(action => 
                              action.section === 'event'
                            );
                            
                            if (eventActions.length === 0) return null;
                            
                            return (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <span className="text-sm">🎉</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <h6 className="text-sm text-amber-700">이벤트 기획 단계</h6>
                                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">선택적</span>
                                  </div>
                                  <div className="flex-1 h-px bg-amber-200"></div>
                                </div>
                                <div className="space-y-3">
                                  {eventActions.map((action) => {
                                    const idx = strategy.actionPlans.indexOf(action);
                                    const isActionSelected = selectedActions[strategy.id]?.has(idx) || false;
                                    const actionMode = getActionMode(strategy.id, idx);
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-xl p-4 border-2 transition-all ${
                                          isActionSelected
                                            ? actionMode === 'expert'
                                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                                              : 'bg-gradient-to-r from-orange-50 to-amber-50 border-[#FFA45B] shadow-md'
                                            : 'bg-white border-gray-200 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="text-2xl flex-shrink-0 mt-1">
                                            {action.icon}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-sm text-gray-900 mb-1">
                                              {action.title}
                                            </h5>
                                            <p className="text-xs text-gray-600">
                                              {action.description}
                                            </p>
                                          </div>
                                          
                                          {/* Action Controls */}
                                          <div className="flex gap-2 flex-shrink-0">
                                            {/* Mode Toggle - Small */}
                                            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'direct'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'direct'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="내가 직접 실행"
                                              >
                                                <span>👤</span>
                                                <span className="text-[10px]">직접</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'expert'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'expert'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="전문가 요청"
                                              >
                                                <span>👨‍💼</span>
                                                <span className="text-[10px]">전문가</span>
                                              </button>
                                            </div>

                                            {/* Select Button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAction(strategy.id, idx);
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                                                isActionSelected
                                                  ? actionMode === 'expert'
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm'
                                                    : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-sm'
                                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                              }`}
                                            >
                                              {isActionSelected ? '선택됨 ✓' : '선택'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 채널 홍보 단계 Section */}
                          {(() => {
                            const channelActions = strategy.actionPlans.filter(action => 
                              action.section === 'promotion'
                            );
                            
                            if (channelActions.length === 0) return null;
                            
                            return (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <span className="text-sm">📢</span>
                                  </div>
                                  <h6 className="text-sm text-blue-700">채널 홍보 단계</h6>
                                  <div className="flex-1 h-px bg-blue-200"></div>
                                </div>
                                <div className="space-y-3">
                                  {channelActions.map((action) => {
                                    const idx = strategy.actionPlans.indexOf(action);
                                    const isActionSelected = selectedActions[strategy.id]?.has(idx) || false;
                                    const actionMode = getActionMode(strategy.id, idx);
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`rounded-xl p-4 border-2 transition-all ${
                                          isActionSelected
                                            ? actionMode === 'expert'
                                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                                              : 'bg-gradient-to-r from-orange-50 to-amber-50 border-[#FFA45B] shadow-md'
                                            : 'bg-white border-gray-200 hover:shadow-sm'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="text-2xl flex-shrink-0 mt-1">
                                            {action.icon}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h5 className="text-sm text-gray-900 mb-1">
                                              {action.title}
                                            </h5>
                                            <p className="text-xs text-gray-600">
                                              {action.description}
                                            </p>
                                          </div>
                                          
                                          {/* Action Controls */}
                                          <div className="flex gap-2 flex-shrink-0">
                                            {/* Mode Toggle - Small */}
                                            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'direct'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'direct'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="내가 직접 실행"
                                              >
                                                <span>👤</span>
                                                <span className="text-[10px]">직접</span>
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActionModes(prev => ({
                                                    ...prev,
                                                    [strategy.id]: {
                                                      ...(prev[strategy.id] || {}),
                                                      [idx]: 'expert'
                                                    }
                                                  }));
                                                }}
                                                className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                                  actionMode === 'expert'
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                                title="전문가 요청"
                                              >
                                                <span>👨‍💼</span>
                                                <span className="text-[10px]">전문가</span>
                                              </button>
                                            </div>

                                            {/* Select Button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleAction(strategy.id, idx);
                                              }}
                                              className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap ${
                                                isActionSelected
                                                  ? actionMode === 'expert'
                                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm'
                                                    : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-sm'
                                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                              }`}
                                            >
                                              {isActionSelected ? '선택됨 ✓' : '선택'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end gap-3 flex-wrap mb-3">
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
              >
                닫기
              </button>
              <button 
                onClick={handleScheduleRegister}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                  hasAnySelectedAction()
                    ? 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!hasAnySelectedAction()}
              >
                <CalendarIcon className="w-5 h-5" />
                스케줄 등록하기 ({getTotalSelectedCount()}개)
              </button>
            </div>
          </div>

          {/* Schedule Preview */}
          {showSchedule && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 animate-fadeIn">
              <h4 className="text-gray-900 mb-3">이번 주 일정 미리보기</h4>
              <div className="space-y-2">
                {scheduleEvents.map((event, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'personal' ? 'bg-gray-400' :
                        event.type === 'ai' ? 'bg-[#FFA45B]' :
                        'bg-blue-400'
                      }`}></div>
                      <div>
                        <p className="text-sm text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{event.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </Resizable>
    </div>
  );
}
