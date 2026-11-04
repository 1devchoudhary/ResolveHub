import { Outlet } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';

// Public pages (home, about, contact): marketing header + footer
export const Layout = () => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <div className="flex-1">
      <Outlet />
    </div>
    <Footer />
  </div>
);
