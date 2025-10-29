import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/mainpage.tsx';
import Introduction from '../pages/introduce.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/introduction',
    element: <Introduction />,
  },
]);

export default router;