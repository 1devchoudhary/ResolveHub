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
import { Settings } from './pages/customer/Settings';
import { PortalWelcome } from './pages/staff/PortalWelcome';

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
            <Route index element={<PortalWelcome />} />
          </Route>
        </Route>

        {/* Admin portal */}
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<PortalWelcome />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
