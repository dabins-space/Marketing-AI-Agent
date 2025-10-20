import { ChatSection } from './components/ChatSection';
import { CalendarSection } from './components/CalendarSection';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { Menu, X, ChevronLeft, ChevronRight, MessageSquare, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { ScheduledAction } from './components/StrategyModal';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const handleScheduleRegister = (actions: ScheduledAction[]) => {
    setScheduledActions(prev => [...prev, ...actions]);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#FFFBF7]">
      
      {/* Desktop Layout with Resizable Panels */}
      <div className="hidden lg:flex flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Chat */}
          {!isChatCollapsed && (
            <>
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
                <div className="h-full border-r border-gray-200 flex flex-col relative">
                  <ChatSection onScheduleRegister={handleScheduleRegister} />
                  
                  {/* Collapse Button - Inside Chat Panel */}
                  <button
                    onClick={() => setIsChatCollapsed(true)}
                    className="absolute top-4 right-4 z-20 p-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FFA45B] hover:bg-[#FFF7F0] transition-all shadow-md group"
                    title="채팅 상담 접기"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-[#FFA45B]" />
                  </button>
                </div>
              </ResizablePanel>

              {/* Resize Handle */}
              <ResizableHandle 
                withHandle 
                className="w-2 bg-transparent hover:bg-[#FFA45B] transition-all z-10 hover:z-[9999] opacity-0 hover:opacity-100 cursor-col-resize group relative" 
              />
            </>
          )}

          {/* Right Panel - Calendar & Strategy */}
          <ResizablePanel defaultSize={isChatCollapsed ? 100 : 65} minSize={50}>
            <div className="h-full flex flex-col overflow-hidden relative">
              <CalendarSection scheduledActions={scheduledActions} />
              
              {/* Expand Chat Button - Shows when chat is collapsed */}
              {isChatCollapsed && (
                <button
                  onClick={() => setIsChatCollapsed(false)}
                  className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#FFA45B] hover:bg-[#FFF7F0] transition-all shadow-lg group"
                  title="채팅 상담 열기"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-[#FFA45B]" />
                  <span className="text-gray-700 group-hover:text-[#FFA45B]">AI 상담 열기</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#FFA45B]" />
                </button>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Mobile Tab Bar */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`flex-1 py-4 text-center transition-all ${
              !mobileMenuOpen
                ? 'border-b-2 border-[#FFA45B] text-[#FFA45B]'
                : 'text-gray-500'
            }`}
          >
            AI 상담
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex-1 py-4 text-center transition-all ${
              mobileMenuOpen
                ? 'border-b-2 border-[#FFA45B] text-[#FFA45B]'
                : 'text-gray-500'
            }`}
          >
            캘린더 & 전략
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {!mobileMenuOpen ? (
            <ChatSection onScheduleRegister={handleScheduleRegister} />
          ) : (
            <CalendarSection scheduledActions={scheduledActions} />
          )}
        </div>
      </div>
    </div>
  );
}
