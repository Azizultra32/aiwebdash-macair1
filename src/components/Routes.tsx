import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Dashboard from '@/views/Dashboard';
import Login from '@/views/Login';
import Register from '@/views/Register';
import AuthRoute from './AuthRoute';
import ChangePassword from '@/views/ChangePassword';
import Reset from '@/views/Reset';
import MoaDashboard from '@/views/MoaDashboard';
import PromptEditor from '@/views/PromptEditor';
import Billing from '@/views/Billing';

const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/reset',
    Component: Reset,
  },
  {
    path: '/password',
    Component: ChangePassword,
  },
  {
    Component: AuthRoute,
    children: [
      {
        path: '/',
        Component: Dashboard,
      },
      {
        path: '/tasks',
        Component: MoaDashboard,
      },
      {
        path: '/prompt-editor',
        Component: PromptEditor,
      },
      {
        path: '/billing',
        Component: Billing,
      },
    ],
  },
]);

const Routes = () => {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
};

export default Routes;
