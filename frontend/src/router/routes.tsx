import { createBrowserRouter } from 'react-router-dom';
import MainPage from '../pages/MainPage.tsx';
import Introduction from '../pages/Introduce.tsx';
import Login from '../pages/Login.tsx';
import SelectProfile from '../pages/SelectProfile.tsx';

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
]);

export default router;