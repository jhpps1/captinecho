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
import FirstTestIntro from '../pages/FirstTestIntro.tsx';
import FirstTestPage from '../pages/FirstTestPage.tsx';
import FirstTestResult from '../pages/FirstTestResult.tsx';
import ParrotStore from '../pages/ParrotStore.tsx';
import { InitialAssessmentPage } from '../pages/InitialAssessmentPage.tsx';
import HangulJamoSVGPlayground from '../pages/hangul_jamo_svgplayground.tsx'; 


// Adventure 관련 페이지
import { DailyRunner } from '../pages/DailyRunner.tsx';
import { SuppleRunner } from '../pages/SuppleRunner.tsx';

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
    path: '/initial-assessment',
    element: <InitialAssessmentPage />,
  },
  {
    path: '/first-test-intro',
    element: <FirstTestIntro />,
  },
  {
    path: '/first-test',
    element: <FirstTestPage />,
  },
  {
    path: '/first-test-result',
    element: <FirstTestResult />,
  },
  {
    path: '/student',
    element: <StudentDashboard />,
  },
  {
    path: '/parrot-store',
    element: <ParrotStore />,
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
    path: '/daily/:idx?',
    element: <DailyRunner />,
  },
  {
    path: '/adventure/:typeId',
    element: <SuppleRunner />,
  },
  {
    path: '/dev/hangul-svg',
    element: <HangulJamoSVGPlayground />,
  },
]);

export default router;