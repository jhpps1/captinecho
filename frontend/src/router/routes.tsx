import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/mainpage.tsx';
import AdventurePage1 from '../pages/adventurepage1.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/adventure1',
    element: <AdventurePage1 />,
  },
]);

export default router;