import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Dashboard from '@/views/Dashboard';
import Login from '@/views/Login';
import Register from '@/views/Register';
import AuthRoute from './AuthRoute';
import ChangePassword from '@/views/ChangePassword';
import Reset from '@/views/Reset';
import MoaDashboard from '@/views/MoaDashboard';
import MoaWorkflow from '@/views/MoaWorkflow';
import PromptEditor from '@/views/PromptEditor';
import PromptPlayground from '@/views/PromptPlayground';
import PromptVisualizerPage from '@/views/PromptVisualizerPage';
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
        path: '/moa-workflow',
        Component: MoaWorkflow,
      },
      {
        path: '/prompt-editor',
        Component: PromptEditor,
      },
      {
        path: '/prompt-playground',
        Component: PromptPlayground,
      },
      {
        path: '/prompt-visualizer',
        Component: PromptVisualizerPage,
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
