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
import Adventure1Page from '../pages/Adventure1Page.tsx';
import Adventure3Page from '../pages/Adventure3Page.tsx';
import Adventure4Page from '../pages/Adventure4Page.tsx';
import NewUserTerms from '../pages/NewUserTerms.tsx';

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
  {
    path: '/adventure/1',
    element: <Adventure1Page />,
  },
      {
    path: '/adventure/3',
    element: <Adventure3Page />,
  },
  {
    path: '/adventure/4',
    element: <Adventure4Page />,
  },
]);

export default router;