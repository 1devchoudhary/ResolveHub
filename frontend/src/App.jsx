import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { NotFound } from './pages/NotFound';
import { RequireRole } from './components/RequireRole';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AgentLayout } from './layouts/AgentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Overview } from './pages/customer/Overview';
import { MyTickets } from './pages/customer/MyTickets';
import { NewTicket } from './pages/customer/NewTicket';
import { TicketDetail } from './pages/customer/TicketDetail';
import { Settings } from './pages/Settings';

// Staff and admin screens load on demand: customers never download them (or the charting
// library the admin dashboard needs)
const named = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));
const TicketQueue = named(() => import('./pages/staff/TicketQueue'), 'TicketQueue');
const TicketWorkspace = named(() => import('./pages/staff/TicketWorkspace'), 'TicketWorkspace');
const Dashboard = named(() => import('./pages/admin/Dashboard'), 'Dashboard');
const Team = named(() => import('./pages/admin/Team'), 'Team');
const Categories = named(() => import('./pages/admin/Categories'), 'Categories');

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth: one login page per portal */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login portal="customer" />} />
        <Route path="/agent/login" element={<Login portal="agent" />} />
        <Route path="/admin/login" element={<Login portal="admin" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Customer portal */}
        <Route element={<RequireRole role="customer" />}>
          <Route path="/app" element={<CustomerLayout />}>
            <Route index element={<Overview />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="tickets/new" element={<NewTicket />} />
            <Route path="tickets/:ticketNumber" element={<TicketDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Agent portal */}
        <Route element={<RequireRole role="agent" />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<TicketQueue portal="agent" />} />
            <Route path="tickets/:ticketNumber" element={<TicketWorkspace portal="agent" />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin portal */}
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<TicketQueue portal="admin" />} />
            <Route path="tickets/:ticketNumber" element={<TicketWorkspace portal="admin" />} />
            <Route path="team" element={<Team />} />
            <Route path="categories" element={<Categories />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
