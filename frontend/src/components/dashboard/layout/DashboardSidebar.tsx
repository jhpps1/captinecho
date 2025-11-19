import { useState } from 'react';
import StudentCard from './StudentCard';
import SettingsMenu from './SettingsMenu';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SIDEBAR_TAB_KEY = 'dashboard-sidebar-active-tab';

interface Student {
  id: number;
  name: string;
  level: number;
  streak: number;
  isActive?: boolean;
  profileImage?: string;
}

interface DashboardSidebarProps {
  students: Student[];
  selectedStudentId: number;
  onStudentSelect: (studentId: number) => void;
  onLogout: () => void;
  title?: string;
}

export default function DashboardSidebar({
  students,
  selectedStudentId,
  onStudentSelect,
  onLogout,
  title = '대시보드',
}: DashboardSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'settings'>(() => {
    const saved = localStorage.getItem(SIDEBAR_TAB_KEY);
    return (saved as 'students' | 'settings') || 'students';
  });

  const handleTabChange = (tab: 'students' | 'settings') => {
    setActiveTab(tab);
    localStorage.setItem(SIDEBAR_TAB_KEY, tab);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-neutral-200 z-40
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-60' : 'w-16'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center hover:bg-neutral-50 transition-colors"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            {isExpanded ? (
              <h1 className="text-lg font-bold font-pretendard text-neutral-800">
                {title}
              </h1>
            ) : (
              <div className="w-8 h-8 bg-primary rounded-lg mx-auto" />
            )}
          </div>

          {/* Tab Navigation */}
          {isExpanded && (
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => handleTabChange('students')}
                className={`
                  flex-1 py-3 text-sm font-medium font-pretendard transition-colors
                  ${
                    activeTab === 'students'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }
                `}
              >
                학생 목록
              </button>
              <button
                onClick={() => handleTabChange('settings')}
                className={`
                  flex-1 py-3 text-sm font-medium font-pretendard transition-colors
                  ${
                    activeTab === 'settings'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }
                `}
              >
                메뉴
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'students' ? (
              <div className="p-2">
                {students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    isSelected={student.id === selectedStudentId}
                    isExpanded={isExpanded}
                    onClick={() => {
                      onStudentSelect(student.id);
                      setIsMobileOpen(false);
                    }}
                  />
                ))}
              </div>
            ) : (
              <SettingsMenu
                isExpanded={isExpanded}
                onLogout={() => {
                  onLogout();
                  setIsMobileOpen(false);
                }}
              />
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
