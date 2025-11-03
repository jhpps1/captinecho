import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/MainPage.tsx';
import Introduction from '../pages/Introduce.tsx';
import Login from '../pages/Login.tsx';
import SelectProfile from '../pages/SelectProfile.tsx';
import Adventure1Page from '../pages/Adventure1Page.tsx';
import Adventure4Page from '../pages/Adventure4Page.tsx';

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
    path: '/adventure/4',
    element: <Adventure4Page />,
  },
]);

export default router;