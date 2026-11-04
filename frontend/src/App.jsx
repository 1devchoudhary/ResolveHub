import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { CustomerLayout } from './layouts/CustomerLayout';
import { Overview } from './pages/customer/Overview';
import { MyTickets } from './pages/customer/MyTickets';
import { NewTicket } from './pages/customer/NewTicket';
import { TicketDetail } from './pages/customer/TicketDetail';
import { Settings } from './pages/customer/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Customer portal — TODO: wrap in your <ProtectedRoutes /> guard once auth is wired */}
        <Route path="/app" element={<CustomerLayout />}>
          <Route index element={<Overview />} />
          <Route path="tickets" element={<MyTickets />} />
          <Route path="tickets/new" element={<NewTicket />} />
          <Route path="tickets/:ticketNumber" element={<TicketDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
