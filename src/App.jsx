import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Notifications from './pages/Notifications';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import CustomerPortal from './pages/CustomerPortal';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/portal" element={<CustomerPortal />} />
        
        {/* Protected App Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="services" element={<Services />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="payments" element={<Payments />} />
          <Route path="staff" element={<Staff />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="insights" element={<Insights />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AppProvider>
  );
}

export default App;
