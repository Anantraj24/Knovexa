import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { ChatPage } from '../pages/ChatPage';
import { CollectionsPage } from '../pages/CollectionsPage';
import { SearchPage } from '../pages/SearchPage';
import { SettingsPage } from '../pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
      {
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
