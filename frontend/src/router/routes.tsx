import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/mainpage.tsx';
import AdventurePage from '../pages/adventurepage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/adventure',
    element: <AdventurePage />,
  },
]);

export default router;