import { Home, Users, CreditCard, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsMenuProps {
  isExpanded: boolean;
  onLogout: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export default function SettingsMenu({ isExpanded, onLogout }: SettingsMenuProps) {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    {
      icon: <Home size={20} />,
      label: '대시보드',
      onClick: () => {
        navigate('/protector');
      },
    },
    {
      icon: <Users size={20} />,
      label: '학생 관리',
      onClick: () => {
        navigate('/protector/manage-students');
      },
    },
    {
      icon: <CreditCard size={20} />,
      label: '결제 관리',
      onClick: () => {
        // Navigate to payment management
        console.log('Navigate to payment management');
      },
    },
    {
      icon: <Settings size={20} />,
      label: '계정 설정',
      onClick: () => {
        navigate('/protector/settings');
      },
    },
    {
      icon: <LogOut size={20} />,
      label: '나가기',
      onClick: () => {
        navigate('/select-profile');
      },
      variant: 'danger',
    },
  ];

  return (
    <nav className="p-2">
      {menuItems.map((item, index) => (
        <div key={index}>
          {/* 로그아웃 버튼 위에 구분선 추가 */}
          {item.variant === 'danger' && (
            <div className="my-2 border-t border-neutral-200" />
          )}
          <button
            onClick={item.onClick}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200
              hover:bg-neutral-100 cursor-pointer
              ${item.variant === 'danger' ? 'text-error hover:bg-error/10' : 'text-neutral-700'}
              ${!isExpanded ? 'justify-center' : ''}
            `}
          >
            <span className={item.variant === 'danger' ? 'text-error' : 'text-neutral-600'}>
              {item.icon}
            </span>
            {isExpanded && (
              <>
                <span className="flex-1 text-left text-sm font-medium font-pretendard">
                  {item.label}
                </span>
                {item.variant !== 'danger' && (
                  <ChevronRight size={16} className="text-neutral-400" />
                )}
              </>
            )}
          </button>
        </div>
      ))}
    </nav>
  );
}
