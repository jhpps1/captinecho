import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/MainPage.tsx';
import Introduction from '../pages/Introduce.tsx';
import Login from '../pages/Login.tsx';
import SelectProfile from '../pages/SelectProfile.tsx';
import ProtectorDashboard from '../pages/ProtectorDashboard.tsx';
import LearningAnalysisDetailPage from '../pages/LearningAnalysisDetailPage.tsx';
import SettingsPage from '../pages/SettingsPage.tsx';
import AIAgentLogPage from '../pages/AIAgentLogPage.tsx';
import ManageStudentsPage from '../pages/ManageStudentsPage.tsx';
import StudentDashboard from '../pages/StudentDashboard.tsx';
import NewUserTerms from '../pages/NewUserTerms.tsx';

// Adventure 관련 컴포넌트 (새 구조)
import { AdventureLayout } from '../components/adventure/AdventureLayout.tsx';
import { DailyRunner } from '../components/adventure/DailyRunner.tsx';
import { SuppleRunner } from '../components/adventure/SuppleRunner.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/introduction',
    element: <Introduction />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/new-user-terms',
    element: <NewUserTerms />,
  },
  {
    path: '/select-profile',
    element: <SelectProfile />,
  },
  {
    path: '/student',
    element: <StudentDashboard />,
  },
    {
    path: '/protector',
    element: <ProtectorDashboard />,
  },
  {
    path: '/protector/learning-analysis',
    element: <LearningAnalysisDetailPage />,
  },
  {
    path: '/protector/settings',
    element: <SettingsPage />,
  },
  {
    path: '/protector/ai-agent-log',
    element: <AIAgentLogPage />,
  },
  {
    path: '/protector/manage-students',
    element: <ManageStudentsPage />,
  },
  // 새로운 Adventure 라우트 (설계 문서 기반)
  {
    path: '/daily/:studentId/:idx?',
    element: (
      <AdventureLayout>
        <DailyRunner />
      </AdventureLayout>
    ),
  },
  {
    path: '/adventure/:studentId/:typeId',
    element: (
      <AdventureLayout>
        <SuppleRunner />
      </AdventureLayout>
    ),
  },
]);

export default router;