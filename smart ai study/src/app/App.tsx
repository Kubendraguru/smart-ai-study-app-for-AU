import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './components/AppContext';
import '../styles/fonts.css';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#08081A]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <RouterProvider router={router} />
      </div>
    </AppProvider>
  );
}
