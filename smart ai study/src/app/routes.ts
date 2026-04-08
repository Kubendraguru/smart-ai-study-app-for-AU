import { createBrowserRouter, redirect } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { MaterialsPage } from './components/MaterialsPage';
import { AIStudyPage } from './components/AIStudyPage';
import { NewsPage } from './components/NewsPage';
import { RemindersPage } from './components/RemindersPage';
import { ProfilePage } from './components/ProfilePage';
import { SubjectDetail } from './components/SubjectDetail';
import { StudentAssignment } from './components/StudentAssignment';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: AuthPage,
  },
  {
    path: '/assignment',
    Component: StudentAssignment,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        loader: () => redirect('/home'),
      },
      { path: 'home', Component: HomePage },
      { path: 'materials', Component: MaterialsPage },
      { path: 'ai-study', Component: AIStudyPage },
      { path: 'news', Component: NewsPage },
      { path: 'reminders', Component: RemindersPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'subject/:id', Component: SubjectDetail },
    ],
  },
]);
