import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // State initialization
  const [business, setBusiness] = useState(null);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [insights, setInsights] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  
  // Real auth user state (null means not logged in)
  const [activeUser, setActiveUser] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load business data once authenticated
  const fetchAppData = async () => {
    try {
      const [
        busRes, staffRes, servRes, custRes, apptRes, 
        invRes, ordRes, insRes, notifRes, intRes
      ] = await Promise.all([
        api.get('/api/business'),
        api.get('/api/staff'),
        api.get('/api/services'),
        api.get('/api/customers'),
        api.get('/api/appointments'),
        api.get('/api/inventory'),
        api.get('/api/orders'),
        api.get('/api/insights'),
        api.get('/api/notifications'),
        api.get('/api/integrations')
      ]);

      setBusiness(busRes);
      setStaff(staffRes);
      setServices(servRes);
      setCustomers(custRes);
      setAppointments(apptRes);
      setInventory(invRes);
      setOrders(ordRes);
      setInsights(insRes);
      setNotifications(notifRes);
      setIntegrations(intRes);
    } catch (err) {
      console.error('Failed to load application data', err);
      setError(err.message);
    }
  };

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await api.get('/api/auth/me');
        setActiveUser(user);
        await fetchAppData();
      } catch (err) {
        // Not authenticated
        setActiveUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // When activeUser changes (e.g. after login), fetch data if we don't have it
  useEffect(() => {
    if (activeUser && !business && !isLoading) {
      setIsLoading(true);
      fetchAppData().finally(() => setIsLoading(false));
    }
  }, [activeUser]);

  const addAppointment = async (newApt) => {
    try {
      const created = await api.post('/api/appointments', newApt);
      
      // The API returns the raw created appointment which doesn't perfectly match
      // the joined structure we get from GET /api/appointments. 
      // For a pessimistic update that keeps the UI perfect, it's safer to re-fetch 
      // the appointments and customers (since a customer might have been created/updated).
      const [apptRes, custRes, notifRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/customers'),
        api.get('/api/notifications')
      ]);
      setAppointments(apptRes);
      setCustomers(custRes);
      setNotifications(notifRes);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/appointments/${id}/status`, { status: newStatus });
      const apptRes = await api.get('/api/appointments');
      setAppointments(apptRes);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const created = await api.post('/api/orders', orderData);
      
      // Refetch orders, inventory, customers
      const [ordRes, invRes, custRes] = await Promise.all([
        api.get('/api/orders'),
        api.get('/api/inventory'),
        api.get('/api/customers')
      ]);
      
      setOrders(ordRes);
      setInventory(invRes);
      setCustomers(custRes);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addCustomer = async (cust) => {
    try {
      const created = await api.post('/api/customers', cust);
      setCustomers(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateCustomer = async (id, updates) => {
    try {
      const updated = await api.put(`/api/customers/${id}`, updates);
      setCustomers(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addService = async (srv) => {
    try {
      const created = await api.post('/api/services', srv);
      setServices(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateService = async (id, updates) => {
    try {
      const updated = await api.put(`/api/services/${id}`, updates);
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addInventoryItem = async (item) => {
    try {
      const created = await api.post('/api/inventory', item);
      setInventory(prev => [created, ...prev]);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const restockInventoryItem = async (id, addedQty) => {
    try {
      const updated = await api.put(`/api/inventory/${id}/restock`, { addedQty });
      setInventory(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addStaffMember = async (newStaff) => {
    try {
      const created = await api.post('/api/staff', newStaff);
      setStaff(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateStaffStatus = async (id, active) => {
    try {
      const updated = await api.put(`/api/staff/${id}/status`, { active });
      setStaff(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleIntegration = async (id) => {
    try {
      const updated = await api.put(`/api/integrations/${id}/toggle`);
      setIntegrations(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const sendCustomNotification = async (recipient, channel, message) => {
    try {
      const created = await api.post('/api/notifications', { recipient, channel, message });
      // To get the mapped structure that the frontend expects
      const notifRes = await api.get('/api/notifications');
      setNotifications(notifRes);
      return created;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const resetToDefaultData = async () => {
    console.warn("resetToDefaultData is no longer supported with the backend database.");
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading LocalOS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fef2f2' }}>
        <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      business,
      setBusiness, // kept for compatibility but should use backend mutations
      staff,
      services,
      customers,
      appointments,
      inventory,
      orders,
      insights,
      notifications,
      integrations,
      activeUser,
      setActiveUser,
      addAppointment,
      updateAppointmentStatus,
      createOrder,
      addCustomer,
      updateCustomer,
      addService,
      updateService,
      addInventoryItem,
      restockInventoryItem,
      addStaffMember,
      updateStaffStatus,
      toggleIntegration,
      sendCustomNotification,
      resetToDefaultData,
      isLoading,
      error
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
