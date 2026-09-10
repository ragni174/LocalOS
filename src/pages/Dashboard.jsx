import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { Link, useNavigate } from 'react-router-dom';

const chartData = [
  { time: '9 AM', revenue: 120 },
  { time: '11 AM', revenue: 260 },
  { time: '1 PM', revenue: 490 },
  { time: '3 PM', revenue: 730 },
  { time: '5 PM', revenue: 950 },
  { time: '7 PM', revenue: 1180 },
];

export default function Dashboard() {
  const { 
    business, 
    appointments, 
    orders, 
    staff, 
    inventory, 
    insights, 
    updateAppointmentStatus, 
    addAppointment, 
    addCustomer,
    services 
  } = useApp();
  const navigate = useNavigate();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: services[0]?.id || '',
    staffId: staff[0]?.id || '',
    time: '02:00 PM',
    notes: ''
  });

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    tag: 'New',
    notes: ''
  });

  // Metrics calculation
  const todayRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const todayAppointments = appointments.length;
  const activeStaffCount = staff.filter(s => s.active).length;
  const lowStockItems = inventory.filter(i => i.stock <= i.minStock);

  const handleCreateBooking = (e) => {
    e.preventDefault();
    const selectedService = services.find(s => s.id === newBooking.serviceId) || services[0];
    const selectedStaff = staff.find(s => s.id === newBooking.staffId) || staff[0];

    addAppointment({
      customerName: newBooking.customerName,
      customerPhone: newBooking.customerPhone,
      serviceName: selectedService.name,
      serviceId: selectedService.id,
      staffName: selectedStaff.name,
      staffId: selectedStaff.id,
      price: selectedService.price,
      duration: selectedService.duration,
      time: newBooking.time,
      notes: newBooking.notes
    });

    setIsBookingModalOpen(false);
    setNewBooking({
      customerName: '',
      customerPhone: '',
      serviceId: services[0]?.id || '',
      staffId: staff[0]?.id || '',
      time: '02:00 PM',
      notes: ''
    });
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name) return;
    addCustomer(newCust);
    setIsCustomerModalOpen(false);
    setNewCust({ name: '', phone: '', email: '', tag: 'New', notes: '' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Good morning, {business.owner}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here is what's happening today at <span className="font-semibold text-emerald-700">{business.name}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <UserPlus className="w-4 h-4 text-gray-500" />
            Add Client
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100/70 transition-colors shadow-2xs"
          >
            <DollarSign className="w-4 h-4 text-emerald-700" />
            Walk-in POS Sale
          </button>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Gross Sales"
          value={`$${todayRevenue.toFixed(2)}`}
          change="+14.8%"
          isPositive={true}
          icon={DollarSign}
          subtitle="vs yesterday"
        />
        <StatCard
          title="Scheduled Appointments"
          value={todayAppointments}
          change={`${appointments.filter(a => a.status === 'completed').length} completed`}
          isPositive={true}
          icon={Calendar}
          subtitle="today"
        />
        <StatCard
          title="Active Floor Staff"
          value={`${activeStaffCount} / ${staff.length}`}
          change="All stations ready"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Stock Alerts"
          value={lowStockItems.length}
          change={lowStockItems.length > 0 ? "Requires reorder" : "Stock healthy"}
          isPositive={lowStockItems.length === 0}
          icon={AlertTriangle}
          subtitle="items low"
        />
      </div>

      {/* Main Grid: Left Column (Schedule & Chart) | Right Column (AI Insight & Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Live Schedule */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Today's Appointment Schedule</h2>
                <p className="text-xs text-gray-500">Live chair status and real-time check-ins</p>
              </div>
              <Link to="/appointments" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                Full Calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No appointments scheduled today.</div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-14 text-center shrink-0">
                        <span className="text-xs font-bold text-gray-900 block">{apt.time}</span>
                        <span className="text-[11px] text-gray-400">{apt.duration}m</span>
                      </div>
                      <div className="h-8 w-[2px] bg-emerald-500 rounded-full hidden sm:block"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{apt.customerName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                            apt.status === 'in-service' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                              : apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {apt.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span>{apt.serviceName}</span>
                          <span className="mx-1.5">•</span>
                          <span className="text-gray-700 font-medium">{apt.staffName}</span>
                          <span className="mx-1.5">•</span>
                          <span className="font-semibold text-gray-900">${apt.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'in-service')}
                          className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      {apt.status === 'in-service' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Complete
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Finished
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Intraday Sales Trend */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Today's Revenue Trajectory</h3>
                <p className="text-xs text-gray-500">Cumulative sales throughout business hours</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                Target: $1,200 (98%)
              </div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          
          {/* Priority AI Insight Card */}
          {insights.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-24 h-24 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">LocalOS Smart Insight</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{insights[0].title}</h3>
                <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                  {insights[0].description}
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-800/80 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300">{insights[0].impact}</span>
                  <Link
                    to="/insights"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-xs transition-colors"
                  >
                    Take Action <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Staff On Floor */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Today's Stylists & Staff</h3>
              <Link to="/staff" className="text-xs text-emerald-700 hover:underline">Manage</Link>
            </div>
            <div className="space-y-3">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block leading-tight">{member.name}</span>
                      <span className="text-[11px] text-gray-500">{member.role}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    member.active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {member.active ? 'On Duty' : 'Off Shift'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Stream */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Latest Transactions</h3>
              <Link to="/orders" className="text-xs text-emerald-700 hover:underline">All Sales</Link>
            </div>
            <div className="space-y-2.5">
              {orders.slice(0, 4).map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{ord.customerName}</span>
                    <span className="text-[10px] text-gray-400">{ord.id} • {ord.paymentMethod}</span>
                  </div>
                  <span className="font-bold text-gray-900">${ord.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* New Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Schedule New Appointment"
        subtitle="Book a client with automated SMS confirmation"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Client Full Name *</label>
            <input
              type="text"
              required
              value={newBooking.customerName}
              onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
              placeholder="e.g. Jessica Adams"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Client Phone (for SMS reminder)</label>
            <input
              type="text"
              value={newBooking.customerPhone}
              onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Service *</label>
              <select
                value={newBooking.serviceId}
                onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (${s.price} - {s.duration}m)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Stylist / Specialist *</label>
              <select
                value={newBooking.staffId}
                onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
              >
                {staff.map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Time Slot</label>
              <input
                type="text"
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Notes / Formula</label>
              <input
                type="text"
                value={newBooking.notes}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                placeholder="Special requests or styling notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* New Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add New Customer"
        subtitle="Create a client record with preferences and contact details"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              placeholder="e.g. Charlotte Miller"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                placeholder="+1 (206) 555-0199"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                placeholder="client@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Client Tag</label>
            <select
              value={newCust.tag}
              onChange={(e) => setNewCust({ ...newCust, tag: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
            >
              <option value="New">New Client</option>
              <option value="Loyal">Loyal Regular</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Preferences & Notes</label>
            <textarea
              rows={3}
              value={newCust.notes}
              onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
              placeholder="Color formulas, allergies, preferences..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Save Client
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
