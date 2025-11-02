import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/mainpage.tsx';
import Adventure1Page from '../pages/Adventure1Page.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/adventure/1',
    element: <Adventure1Page />,
  },
]);

export default router;