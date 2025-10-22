import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Star, Copy, Sparkles, X, CalendarIcon, Users, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import type { ScheduledAction } from '@/components/StrategyModal';

interface EventDetail {
  id: number;
  title: string;
  date: string;
  duration: string;
  type: 'personal' | 'ai' | 'strategy' | 'reservation';
  description: string;
  details?: string;
  actions?: string[];
  expectedEffect?: string;
  customerInfo?: {
    name: string;
    people: number;
    phone?: string;
    request?: string;
  };
}

interface CalendarSectionProps {
  scheduledActions?: ScheduledAction[];
}

export function CalendarSection({ scheduledActions = [] }: CalendarSectionProps) {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set(['personal', 'ai', 'strategy']));
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 18)); // October 18, 2025 (month is 0-indexed)
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleTokens, setGoogleTokens] = useState<any>(null);
  const [selectedStrategyFilter, setSelectedStrategyFilter] = useState<string>('all'); // 'all' or strategyCode
  const [isDevelopmentModalOpen, setIsDevelopmentModalOpen] = useState(false);
  const [developmentModalType, setDevelopmentModalType] = useState<'ai' | 'expert'>('ai');

  // Check for Google Calendar connection on component mount
  useEffect(() => {
    // Check URL parameters for connection success
    const urlParams = new URLSearchParams(window.location.search);
    const gcalConnected = urlParams.get('gcal_connected');
    
    if (gcalConnected === 'true') {
      // Check for tokens in URL hash
      const hash = window.location.hash;
      const tokenMatch = hash.match(/tokens=([^&]+)/);
      
      if (tokenMatch) {
        try {
          const tokens = JSON.parse(decodeURIComponent(tokenMatch[1]));
          setGoogleTokens(tokens);
          setIsGoogleConnected(true);
          toast.success('구글 캘린더가 성공적으로 연결되었습니다!');
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Failed to parse tokens:', error);
          toast.error('토큰 파싱에 실패했습니다.');
        }
      }
    }
    
    // Check for stored tokens in localStorage
    const storedTokens = localStorage.getItem('google_calendar_tokens');
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        setGoogleTokens(tokens);
        setIsGoogleConnected(true);
      } catch (error) {
        console.error('Failed to parse stored tokens:', error);
        localStorage.removeItem('google_calendar_tokens');
      }
    }
  }, []);

  // Store tokens when they change
  useEffect(() => {
    if (googleTokens) {
      localStorage.setItem('google_calendar_tokens', JSON.stringify(googleTokens));
    }
  }, [googleTokens]);

  // Google Calendar connection functions
  const handleGoogleConnect = async () => {
    try {
      console.log('Attempting to connect to Google Calendar...');
      const response = await fetch('/api/gcal/auth');
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.authUrl) {
        console.log('Redirecting to auth URL:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        console.error('No auth URL in response:', data);
        throw new Error(data.error || 'Failed to get auth URL');
      }
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      toast.error(`구글 캘린더 연결에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGoogleDisconnect = () => {
    setGoogleTokens(null);
    setIsGoogleConnected(false);
    localStorage.removeItem('google_calendar_tokens');
    toast.success('구글 캘린더 연결이 해제되었습니다.');
  };

  // Create calendar event function
  const createCalendarEvent = async (action: ScheduledAction) => {
    if (!googleTokens) {
      toast.error('구글 캘린더에 먼저 연결해주세요.');
      return;
    }

    try {
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
          'Authorization': `Bearer ${JSON.stringify(googleTokens)}`
        },
        body: JSON.stringify(eventData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('캘린더에 일정이 추가되었습니다!');
      } else if (result.code === 'AUTH_EXPIRED') {
        toast.error('인증이 만료되었습니다. 다시 연결해주세요.');
        handleGoogleDisconnect();
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Calendar event creation error:', error);
      toast.error('캘린더 일정 생성에 실패했습니다.');
    }
  };

  // Mock calendar data with IDs
  const baseCalendarEvents: Array<{
    id: number;
    date: number;
    title: string;
    type: 'personal' | 'ai' | 'strategy' | 'reservation';
    color: string;
  }> = [
    { id: 1, date: 11, title: '개인: 가족 모임', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 4, date: 15, title: '개인: 점검 예정', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 11, date: 8, title: '개인: 은행 업무', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 12, date: 13, title: '개인: 재료 구매', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 13, date: 17, title: '개인: 휴무', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 14, date: 21, title: '개인: 직원 회의', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 15, date: 24, title: '개인: 세무사 상담', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 16, date: 28, title: '개인: 장비 수리', type: 'personal' as const, color: 'bg-gray-400' },
    { id: 17, date: 31, title: '개인: 월말 결산', type: 'personal' as const, color: 'bg-gray-400' },
  ];

  // Get unique strategies from scheduledActions
  const availableStrategies = useMemo(() => {
    const strategiesMap = new Map<string, string>();
    scheduledActions.forEach(action => {
      if (!strategiesMap.has(action.strategyCode)) {
        strategiesMap.set(action.strategyCode, action.strategyTitle);
      }
    });
    return Array.from(strategiesMap.entries()).map(([code, title]) => ({ code, title }));
  }, [scheduledActions]);

  // Merge scheduled actions with calendar events
  const calendarEvents = useMemo(() => {
    const scheduledEvents = scheduledActions
      .filter(action => {
        // Filter by selected strategy
        if (selectedStrategyFilter !== 'all' && action.strategyCode !== selectedStrategyFilter) {
          return false;
        }
        return true;
      })
      .map((action, index) => {
        const date = action.date.getDate();
        const month = action.date.getMonth();
        const year = action.date.getFullYear();
        
        // Only show events for the current month being viewed
        if (year !== currentDate.getFullYear() || month !== currentDate.getMonth()) {
          return null;
        }

        return {
          id: 1000 + index, // Use high ID to avoid conflicts
          date,
          title: `${action.mode === 'expert' ? '👨‍💼' : '👤'} ${action.actionIcon} ${action.actionTitle}`,
          type: 'strategy' as const,
          color: action.mode === 'expert' ? 'bg-blue-500' : 'bg-[#FFA45B]',
          scheduledAction: action
        };
      }).filter(Boolean);

    return [...baseCalendarEvents, ...scheduledEvents];
  }, [scheduledActions, currentDate, selectedStrategyFilter]);

  // Event details data
  const eventDetails: { [key: number]: EventDetail } = {
    1: {
      id: 1,
      title: '가족 모임',
      date: '10월 11일 (금)',
      duration: '저녁 7시 ~ 10시',
      type: 'personal',
      description: '가족과 함께하는 저녁 식사 시간입니다.',
    },
    4: {
      id: 4,
      title: '매장 정기 점검',
      date: '10월 15일 (화)',
      duration: '오후 3시 ~ 5시',
      type: 'personal',
      description: '매장 설비 및 위생 상태를 점검하는 정기 일정입니다.',
    },
    11: {
      id: 11,
      title: '은행 업무',
      date: '10월 8일 (화)',
      duration: '오전 10시 ~ 11시',
      type: 'personal',
      description: '매장 대출 관련 은행 방문 예정입니다.',
    },
    12: {
      id: 12,
      title: '재료 구매',
      date: '10월 13일 (일)',
      duration: '오전 9시 ~ 12시',
      type: 'personal',
      description: '도매시장에서 이번 주 식자재를 구매합니다.',
    },
    13: {
      id: 13,
      title: '휴무',
      date: '10월 17일 (목)',
      duration: '종일',
      type: 'personal',
      description: '개인 휴무일입니다. 매장 운영 없음.',
    },
    14: {
      id: 14,
      title: '직원 회의',
      date: '10월 21일 (월)',
      duration: '오후 2시 ~ 3시',
      type: 'personal',
      description: '이번 달 실적 공유 및 다음 달 목표 설정을 위한 직원 미팅입니다.',
    },
    15: {
      id: 15,
      title: '세무사 상담',
      date: '10월 24일 (목)',
      duration: '오후 4시 ~ 5시',
      type: 'personal',
      description: '연말 정산 및 부가세 신고 관련 세무 상담입니다.',
    },
    16: {
      id: 16,
      title: '장비 수리',
      date: '10월 28일 (월)',
      duration: '오전 11시 ~ 1시',
      type: 'personal',
      description: '커피머신 정기 점검 및 수리가 예정되어 있습니다.',
    },
    17: {
      id: 17,
      title: '월말 결산',
      date: '10월 31일 (목)',
      duration: '오후 6시 ~ 8시',
      type: 'personal',
      description: '10월 매출 정산 및 장부 정리 작업입니다.',
    },
  };

  const eventRecords: Array<{
    id: number;
    title: string;
    rating: number;
    category: string;
    description: string;
    date: string;
    tags: string[];
  }> = [];

  const filters = ['전체', 'SNS', '고객유지', '세일', '신규캠페인'];

  const toggleFilter = (filterType: string) => {
    setSelectedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filterType)) {
        newSet.delete(filterType);
      } else {
        newSet.add(filterType);
      }
      return newSet;
    });
  };

  const isFilterActive = (filterType: string) => {
    return selectedFilters.has(filterType);
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 9, 18)); // Reset to October 18, 2025
  };

  // Get calendar information
  const getCalendarInfo = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday, 6 = Saturday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(2025, 9, 18); // October 18, 2025
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    
    return { year, month, firstDay, daysInMonth, isCurrentMonth, todayDate: today.getDate() };
  };

  const formatMonthYear = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  const formatDate = (date: Date): string => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  const handleEventClick = (eventId: number) => {
    // Check if it's a scheduled action
    const event = calendarEvents.find(e => e?.id === eventId);
    if (event && 'scheduledAction' in event && event.scheduledAction) {
      const action = event.scheduledAction as ScheduledAction;
      const detail: EventDetail = {
        id: eventId,
        title: action.actionTitle,
        date: formatDate(action.date),
        duration: '일정 등록됨',
        type: 'strategy',
        description: action.actionDescription,
        details: action.mode === 'expert' 
          ? '전문가가 이 작업을 대행하여 진행합니다. 완성된 결과물과 실행 리포트를 받아보실 수 있습니다.' 
          : 'AI 도구와 가이드를 활용하여 직접 실행하실 수 있습니다. 상세한 실행 가이드가 제공됩니다.',
        expectedEffect: `전략: ${action.strategyTitle}`
      };
      setSelectedEvent(detail);
      setIsEventDialogOpen(true);
      return;
    }

    // Original eventDetails lookup
    const detail = eventDetails[eventId];
    if (detail) {
      setSelectedEvent(detail);
      setIsEventDialogOpen(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <Tabs defaultValue="calendar" className="h-full flex flex-col">
        <TabsContent value="calendar" className="flex-1 flex flex-col p-6 mt-0">
          {/* Calendar Header */}
          <div className="mb-4 flex items-center justify-between flex-shrink-0">
            <h3 className="text-gray-900">{formatMonthYear()}</h3>
            <div className="flex gap-2">
              <button 
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={goToToday}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-all"
              >
                오늘
              </button>
              <button 
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Google Calendar Connection - Top */}
          <div className="mb-4 flex justify-end flex-shrink-0">
            {!isGoogleConnected ? (
              <button 
                onClick={handleGoogleConnect}
                className="px-3 py-2 bg-white border border-gray-300 hover:border-[#FFA45B] rounded-lg transition-all flex items-center gap-1.5 group"
              >
                <CalendarIcon className="w-4 h-4 text-gray-600 group-hover:text-[#FFA45B] transition-colors" />
                <span className="text-sm text-gray-700 group-hover:text-[#FFA45B] transition-colors">구글 달력 연동하기</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-green-50 border border-green-300 rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-700">연결됨</span>
                </div>
                <button 
                  onClick={handleGoogleDisconnect}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                  title="연결 해제"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Legend/Filter */}
          <div className="mb-4 flex items-center gap-3 text-sm flex-shrink-0">
            <button
              onClick={() => toggleFilter('ai')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                isFilterActive('ai')
                  ? 'bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] border-2 border-[#FF8C00] shadow-lg'
                  : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] border-2 border-transparent opacity-50 hover:opacity-80 hover:shadow-md'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isFilterActive('ai') ? 'text-white' : 'text-white/70'}`} />
              <span className={`${isFilterActive('ai') ? 'text-white' : 'text-white/80'}`}>전략 실행 일정</span>
            </button>
            <button
              onClick={() => toggleFilter('personal')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                isFilterActive('personal')
                  ? 'bg-gray-100 border-2 border-gray-400 shadow-sm'
                  : 'bg-gray-50 border-2 border-transparent opacity-40 hover:opacity-60'
              }`}
            >
              <div className="w-4 h-4 rounded bg-gray-400"></div>
              <span className="text-gray-900">개인 일정</span>
            </button>
            <button
              onClick={() => toggleFilter('reservation')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                isFilterActive('reservation')
                  ? 'bg-slate-50 border-2 border-slate-400 shadow-sm'
                  : 'bg-slate-50 border-2 border-transparent opacity-40 hover:opacity-60'
              }`}
            >
              <div className="w-4 h-4 rounded bg-slate-400"></div>
              <span className="text-gray-900">예약 손님 스케줄</span>
            </button>

            {/* Spacer - pushes dropdown to the right */}
            <div className="flex-1 min-w-4"></div>

            {/* Strategy Filter Dropdown - Right aligned with fixed width */}
            <div className="flex-shrink-0">
              <Select value={selectedStrategyFilter} onValueChange={setSelectedStrategyFilter}>
                <SelectTrigger className="w-[110px] flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border-2 border-transparent whitespace-nowrap bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-lg hover:shadow-xl">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">전략</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFA45B]" />
                      <span>전체 전략 보기</span>
                    </div>
                  </SelectItem>
                  {availableStrategies.map(strategy => (
                    <SelectItem key={strategy.code} value={strategy.code}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#FFA45B]"></div>
                        <span className="truncate">{strategy.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calendar Grid - Fully responsive, fits screen */}
          <div className="flex-1 bg-[#FDF3EB] rounded-2xl p-3 shadow-sm flex flex-col min-h-0 overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5 flex-shrink-0">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div key={i} className="text-center text-xs text-gray-600 py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days - Dynamic grid that always fits */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0 overflow-hidden" style={{ gridAutoRows: '1fr' }}>
              {(() => {
                const { firstDay, daysInMonth, isCurrentMonth, todayDate } = getCalendarInfo();
                
                return (
                  <>
                    {/* Empty cells for alignment */}
                    {[...Array(firstDay)].map((_, i) => (
                      <div key={`empty-${i}`} className=""></div>
                    ))}
                    
                    {/* Days */}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const dayNum = i + 1;
                      const events = calendarEvents
                        .filter(e => e?.date === dayNum)
                        .filter(e => e && selectedFilters.has(e.type));
                      const isToday = isCurrentMonth && dayNum === todayDate;
                      
                      return (
                        <div
                          key={dayNum}
                          className={`bg-white rounded-lg p-1.5 border transition-all hover:shadow-sm flex flex-col min-h-0 h-full overflow-hidden ${
                            isToday ? 'border-[#FFA45B] border-2' : 'border-gray-200'
                          }`}
                        >
                          <div className={`text-xs mb-0.5 flex-shrink-0 ${isToday ? 'text-[#FFA45B]' : 'text-gray-700'}`}>
                            {dayNum}
                          </div>
                          <div className="space-y-0.5 flex-1 min-h-0 overflow-hidden">
                            {/* Show only first 2 events */}
                            {events.slice(0, 2).map((event, idx) => {
                              if (!event) return null;
                              // Format title for better readability
                              let displayTitle = event.title;
                              let fullTitle = event.title;
                              
                              // For scheduled actions, use action title only
                              if ('scheduledAction' in event && event.scheduledAction) {
                                const action = event.scheduledAction as ScheduledAction;
                                
                                // Full title for tooltip (no strategy code)
                                fullTitle = action.actionTitle;
                                // Display title (no strategy code)
                                displayTitle = action.actionTitle;
                              }
                              
                              // Truncate if too long (show up to 15 characters)
                              const maxLength = 15;
                              const needsTruncate = displayTitle.length > maxLength;
                              if (needsTruncate) {
                                displayTitle = displayTitle.substring(0, maxLength) + '...';
                              }
                              
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleEventClick(event.id)}
                                  className={`${event.color} text-white text-[10px] leading-tight px-1.5 py-1 rounded cursor-pointer hover:opacity-90 hover:shadow-md transition-all relative group hover:z-[10000]`}
                                  title={fullTitle}
                                >
                                  <div className="truncate">{displayTitle}</div>
                                  
                                  {/* Hover Tooltip - Shows full title */}
                                  {needsTruncate && (
                                    <div className="absolute left-0 bottom-full mb-1 z-[10001] hidden group-hover:block">
                                      <div className="bg-gray-900 text-white text-xs px-2 py-1.5 rounded-lg shadow-xl whitespace-nowrap min-w-max">
                                        {fullTitle}
                                        {/* Tooltip Arrow */}
                                        <div className="absolute -bottom-1 left-2 w-1.5 h-1.5 bg-gray-900 transform rotate-45"></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* Show "More" button if there are more than 2 events */}
                            {events.length > 2 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] px-1.5 py-1 rounded transition-all flex items-center justify-center gap-0.5">
                                    <MoreHorizontal className="w-2.5 h-2.5" />
                                    <span>+{events.length - 2}</span>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3" align="start">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                                      <h4 className="text-sm text-gray-900">{dayNum}일 일정</h4>
                                      <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
                                        {events.length}개
                                      </Badge>
                                    </div>
                                    {events.map((event, idx) => {
                                      if (!event) return null;
                                      // Format title for better readability
                                      let displayTitle = event.title;
                                      let fullTitle = event.title;
                                      
                                      // For scheduled actions, use action title only
                                      if ('scheduledAction' in event && event.scheduledAction) {
                                        const action = event.scheduledAction as ScheduledAction;
                                        fullTitle = action.actionTitle;
                                        displayTitle = action.actionTitle;
                                      }
                                      
                                      return (
                                        <div
                                          key={idx}
                                          onClick={() => {
                                            handleEventClick(event.id);
                                          }}
                                          className={`${event.color} text-white text-sm px-3 py-2 rounded cursor-pointer hover:opacity-90 hover:shadow-md transition-all`}
                                        >
                                          <div className="truncate">{displayTitle}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>

        </TabsContent>

        {/* Event Detail Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      selectedEvent.type === 'ai' 
                        ? 'bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] shadow-lg'
                        : selectedEvent.type === 'strategy'
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                        : selectedEvent.type === 'reservation'
                        ? 'bg-slate-500'
                        : 'bg-gray-400'
                    }`}>
                      {selectedEvent.type === 'ai' ? (
                        <Sparkles className="w-6 h-6 text-white" />
                      ) : selectedEvent.type === 'strategy' ? (
                        <TrendingUp className="w-6 h-6 text-white" />
                      ) : selectedEvent.type === 'reservation' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <CalendarIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={
                          selectedEvent.type === 'ai'
                            ? 'bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] text-white border-0'
                            : selectedEvent.type === 'strategy'
                            ? 'bg-blue-100 text-blue-600 border-blue-400'
                            : selectedEvent.type === 'reservation'
                            ? 'bg-slate-100 text-slate-600 border-slate-400'
                            : 'bg-gray-100 text-gray-600 border-gray-400'
                        }>
                          {selectedEvent.type === 'ai' ? '전략 실행' : selectedEvent.type === 'strategy' ? '전략 실행' : selectedEvent.type === 'reservation' ? '예약 손님' : '개인 일정'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DialogDescription className="sr-only">
                    {selectedEvent.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Date and Duration */}
                  <div className="bg-gradient-to-r from-[#FFF7F0] to-[#FDF3EB] rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">📅 일정</p>
                        <p className="text-gray-900">{selectedEvent.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">⏱️ 기간</p>
                        <p className="text-gray-900">{selectedEvent.duration}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-gray-900 mb-2">📋 설명</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Customer Info (for reservations) */}
                  {selectedEvent.type === 'reservation' && selectedEvent.customerInfo && (
                    <div>
                      <h4 className="text-gray-900 mb-3">👥 예약 정보</h4>
                      <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">예약자명</p>
                            <p className="text-gray-900">{selectedEvent.customerInfo.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">인원</p>
                            <p className="text-gray-900">{selectedEvent.customerInfo.people}명</p>
                          </div>
                        </div>
                        {selectedEvent.customerInfo.phone && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-600 mb-1">연락처</p>
                            <p className="text-gray-900">{selectedEvent.customerInfo.phone}</p>
                          </div>
                        )}
                        {selectedEvent.customerInfo.request && (
                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-600 mb-1">요청사항</p>
                            <p className="text-sm text-gray-800">{selectedEvent.customerInfo.request}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Execution Mode Guide */}
                  {selectedEvent.details && (
                    <div>
                      <h4 className="text-gray-900 mb-3">📌 실행 방법 안내</h4>
                      
                      {/* Check if it's expert mode or direct mode based on details content */}
                      {selectedEvent.details.includes('전문가') ? (
                        // Expert Mode Guide
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-xl p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">👨‍💼</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-blue-900 mb-2">전문가 요청 모드</h5>
                              <p className="text-sm text-blue-800 mb-3">
                                {selectedEvent.details}
                              </p>
                              
                              <div className="bg-white/70 rounded-lg p-3 space-y-2 text-sm text-blue-900">
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600 flex-shrink-0">•</span>
                                  <span>전문가가 처음부터 끝까지 직접 진행합니다</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600 flex-shrink-0">•</span>
                                  <span>완성된 결과물과 실행 리포트를 받아보실 수 있습니다</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600 flex-shrink-0">•</span>
                                  <span>별도의 작업 없이 결과만 확인하시면 됩니다</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <button 
                            onClick={() => {
                              setDevelopmentModalType('expert');
                              setIsDevelopmentModalOpen(true);
                            }}
                            className="w-full px-5 py-3 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span>👨‍💼</span>
                            <span>전문가 요청 페이지로 이동</span>
                          </button>
                        </div>
                      ) : (
                        // Direct Mode Guide
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-[#FFA45B] rounded-xl p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">👤</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-[#FF8C00] mb-2">직접 실행 모드</h5>
                              <p className="text-sm text-gray-800 mb-3">
                                {selectedEvent.details}
                              </p>
                              
                              <div className="bg-white/70 rounded-lg p-3 space-y-2 text-sm text-gray-900">
                                <div className="flex items-start gap-2">
                                  <span className="text-[#FFA45B] flex-shrink-0">•</span>
                                  <span>AI가 실제 마케팅 콘텐츠를 자동으로 생성해드립니다</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[#FFA45B] flex-shrink-0">•</span>
                                  <span>단계별 가이드와 AI 도구를 제공합니다</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[#FFA45B] flex-shrink-0">•</span>
                                  <span>SNS 해시태그, 마케팅 문구, 타이밍 분석 등을 자동 추천합니다</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <button 
                            onClick={() => {
                              setDevelopmentModalType('ai');
                              setIsDevelopmentModalOpen(true);
                            }}
                            className="w-full px-5 py-3 bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <span>✨</span>
                            <span>AI 도구 페이지로 이동</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Plans */}
                  {selectedEvent.actions && selectedEvent.actions.length > 0 && (
                    <div>
                      <h4 className="text-gray-900 mb-3">🎯 액션 플랜</h4>
                      <div className="space-y-2">
                        {selectedEvent.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-[#FFA45B] transition-all"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFA45B] to-[#FFB878] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-700 flex-1">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons for AI suggestions */}
                {selectedEvent.type === 'ai' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setIsEventDialogOpen(false)}
                      className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      닫기
                    </button>
                    <button 
                      onClick={() => {
                        // Find the corresponding scheduled action
                        const action = scheduledActions.find(a => 
                          a.actionTitle === selectedEvent.title && 
                          a.actionDescription === selectedEvent.description
                        );
                        if (action) {
                          createCalendarEvent(action);
                        } else {
                          toast.error('해당 액션을 찾을 수 없습니다.');
                        }
                        setIsEventDialogOpen(false);
                      }}
                      className="flex-1 px-5 py-3 bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      캘린더에 등록
                    </button>
                  </div>
                )}

                {/* Action Buttons for Reservations */}
                {selectedEvent.type === 'reservation' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setIsEventDialogOpen(false)}
                      className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      닫기
                    </button>
                    <button 
                      className="flex-1 px-5 py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Users className="w-5 h-5" />
                      예약 확인 완료
                    </button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        <TabsContent value="actions" className="flex-1 overflow-y-auto p-6 mt-0 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900">예정된 마케팅 액션</h4>
              <button className="px-4 py-2 bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white rounded-xl text-sm hover:shadow-lg transition-all">
                + 새 액션 추가
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FFA45B] mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-gray-900">SNS 이벤트 런칭</h5>
                      <span className="text-xs text-gray-500">10월 13일</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">인스타그램 릴스 콘텐츠 업로드 및 스토리 홍보</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">SNS</Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">신규고객</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#FFB878] mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-gray-900">리워드 발송</h5>
                      <span className="text-xs text-gray-500">10월 14일</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">기존 고객 대상 쿠폰 및 감사 메시지 발송</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">고객유지</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-gray-900">주말 프로모션</h5>
                      <span className="text-xs text-gray-500">10월 18일</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">주말 특별 할인 이벤트 시작</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">세일</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 overflow-y-auto p-6 mt-0 custom-scrollbar">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900">과거 이벤트 기록</h4>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                    index === 0
                      ? 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Event Cards */}
            <div className="space-y-4">
              {eventRecords.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-gray-900">{event.title}</h5>
                        <div className="flex items-center gap-1">
                          {[...Array(event.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {event.tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm hover:bg-gray-100 transition-all">
                      <Copy className="w-4 h-4" />
                      복사
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white rounded-xl text-sm hover:shadow-lg transition-all">
                      <Sparkles className="w-4 h-4" />
                      AI 분석
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Development Modal */}
      <Dialog open={isDevelopmentModalOpen} onOpenChange={setIsDevelopmentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                developmentModalType === 'expert'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878]'
              } shadow-lg`}>
                <span className="text-2xl">{developmentModalType === 'expert' ? '👨‍💼' : '✨'}</span>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {developmentModalType === 'expert' ? '전문가 요청 페이지' : 'AI 도구 페이지'}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="sr-only">
              {developmentModalType === 'expert'
                ? '전문가 요청 기능은 현재 개발 중입니다.'
                : 'AI 도구 기능은 현재 개발 중입니다.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Development Message */}
            <div className={`rounded-xl p-6 text-center ${
              developmentModalType === 'expert'
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300'
                : 'bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-[#FFA45B]'
            }`}>
              <div className="text-6xl mb-4">🚧</div>
              <h3 className={`text-xl mb-2 ${
                developmentModalType === 'expert' ? 'text-blue-900' : 'text-gray-900'
              }`}>
                개발 중입니다
              </h3>
              <p className={`text-sm ${
                developmentModalType === 'expert' ? 'text-blue-800' : 'text-gray-700'
              }`}>
                {developmentModalType === 'expert'
                  ? '전문가 요청 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다!'
                  : 'AI 도구 기능은 현재 개발 중입니다. 곧 만나보실 수 있습니다!'
                }
              </p>
            </div>

            {/* Preview Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm text-gray-900 mb-3">💡 예정된 기능</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {developmentModalType === 'expert' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <span>전문가 매칭 및 상담 신청</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <span>실시간 진행 상황 모니터링</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <span>결과물 리포트 및 피드백</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FFA45B] flex-shrink-0">•</span>
                      <span>마케팅 문구 자동 생성</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FFA45B] flex-shrink-0">•</span>
                      <span>SNS 해시태그 추천 및 분석</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FFA45B] flex-shrink-0">•</span>
                      <span>포스팅 최적 타이밍 분석</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FFA45B] flex-shrink-0">•</span>
                      <span>이미지 콘셉트 가이드 제공</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsDevelopmentModalOpen(false)}
              className={`px-6 py-3 rounded-xl transition-all ${
                developmentModalType === 'expert'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-lg'
                  : 'bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white hover:shadow-lg'
              }`}
            >
              확인
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
