import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/MainPage.tsx';
import Introduction from '../pages/Introduce.tsx';
import Login from '../pages/Login.tsx';
import SelectProfile from '../pages/SelectProfile.tsx';
import Adventure1Page from '../pages/Adventure1Page.tsx';
import ProtectorDashboard from '../pages/ProtectorDashboard.tsx';
import LearningAnalysisDetailPage from '../pages/LearningAnalysisDetailPage.tsx';
import SettingsPage from '../pages/SettingsPage.tsx';
import AIAgentLogPage from '../pages/AIAgentLogPage.tsx';
import ManageStudentsPage from '../pages/ManageStudentsPage.tsx';

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
    path: '/select-profile',
    element: <SelectProfile />,
  },
  {
    path: '/adventure/1',
    element: <Adventure1Page />,
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
]);

export default router;