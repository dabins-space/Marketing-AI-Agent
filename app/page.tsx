'use client'

import { ChatSection } from '@/components/ChatSection'
import { CalendarSection } from '@/components/CalendarSection'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { ChevronLeft, ChevronRight, MessageSquare, Menu, LayoutDashboard, Bot, Activity, CalendarDays, Users, FolderOpen, Settings, Wrench, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { ScheduledAction } from '@/components/StrategyModal'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([])
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const [showDevDialog, setShowDevDialog] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState('')

  // Menu items
  const menuItems = [
    { icon: LayoutDashboard, label: '대시보드', color: 'from-blue-500 to-blue-600' },
    { icon: Bot, label: '마케팅코치(잘냥이)', color: 'from-purple-500 to-purple-600' },
    { icon: Activity, label: '마케팅 건강지수', color: 'from-green-500 to-green-600' },
    { icon: CalendarDays, label: '스케줄 관리', color: 'from-[#FFA45B] to-[#FFB878]' },
    { icon: Users, label: '전문가 찾기', color: 'from-indigo-500 to-indigo-600' },
    { icon: FolderOpen, label: '자료실', color: 'from-amber-500 to-amber-600' },
    { icon: Settings, label: '설정', color: 'from-gray-500 to-gray-600' },
  ]

  const handleScheduleRegister = (actions: ScheduledAction[]) => {
    console.log('Schedule register called:', actions);
    setScheduledActions(prev => [...prev, ...actions])
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#FFFBF7]">
      {/* Top Navigation Bar */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm flex-shrink-0 relative z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('Menu button clicked');
                setIsSideMenuOpen(true);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              title="메뉴 열기"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#FFA45B] italic">잘난가게</span>
              <span className="text-xs text-gray-500 -mt-1">AI Agent</span>
            </div>
          </div>
          
          {/* Right side - can add more items here if needed */}
          <div className="flex items-center gap-3">
            {/* Placeholder for future items like user profile, notifications, etc. */}
          </div>
        </div>
      </div>

      {/* Side Menu */}
      <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-6 pb-4 bg-gradient-to-br from-[#FFF7F0] to-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#FFA45B] italic">잘난가게</span>
                <span className="text-sm text-gray-500 -mt-1">Marketing AI Agent</span>
              </div>
            </div>
            <SheetTitle className="sr-only">메인 메뉴</SheetTitle>
          </SheetHeader>
          
          <div className="p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log('Menu item clicked:', item.label);
                  setSelectedMenu(item.label);
                  setIsSideMenuOpen(false);
                  setShowDevDialog(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-900 group-hover:text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-center">
              <p className="text-xs text-gray-500">© 2025 잘난가게</p>
              <p className="text-xs text-gray-400 mt-1">마케팅 AI 에이전트</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop Layout with Resizable Panels */}
        <div className="hidden lg:flex h-full relative">
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
        <div className="lg:hidden h-full flex flex-col">
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

      {/* Development Dialog */}
      <Dialog open={showDevDialog} onOpenChange={setShowDevDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#FFA45B] to-[#FFB878] opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-[#FFB878] to-[#FFCB9A] opacity-10 rounded-full blur-3xl"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <DialogHeader className="space-y-3">
                {/* Animated Icons */}
                <div className="flex justify-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFA45B] to-[#FFB878] rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <Wrench className="w-7 h-7 text-white" />
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFB878] to-[#FFCB9A] rounded-2xl flex items-center justify-center shadow-lg animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <DialogTitle className="text-center bg-gradient-to-r from-[#FFA45B] to-[#FFB878] bg-clip-text text-transparent">
                  페이지 개발 중
                </DialogTitle>
                <DialogDescription className="text-center space-y-2">
                  <p className="text-gray-600">
                    <span className="bg-gradient-to-r from-[#FFA45B] to-[#FFB878] bg-clip-text text-transparent">{selectedMenu}</span> 페이지는<br />
                    현재 개발 중입니다.
                  </p>
                  <p className="text-gray-500 text-sm">
                    더 나은 서비스를 준비하고 있습니다.<br />
                    곧 찾아뵙겠습니다.
                  </p>
                </DialogDescription>
              </DialogHeader>
              
              {/* Progress Bar */}
              <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FFA45B] to-[#FFB878] rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              
              {/* Close Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowDevDialog(false)}
                  className="px-6 py-2.5 bg-gradient-to-br from-[#FFA45B] to-[#FFB878] text-white rounded-xl hover:shadow-lg transition-all"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}

