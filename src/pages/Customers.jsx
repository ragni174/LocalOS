import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  ChevronRight,
  MessageSquare,
  Sparkles,
  Edit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Customers() {
  const { customers, addCustomer, updateCustomer, appointments, sendCustomNotification } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form State
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    tag: 'New',
    notes: ''
  });

  const [editNotes, setEditNotes] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');
  const [sentAlert, setSentAlert] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || c.tag.toUpperCase() === selectedTag.toUpperCase();
    return matchesSearch && matchesTag;
  });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name) return;
    addCustomer(newCust);
    setIsAddModalOpen(false);
    setNewCust({ name: '', phone: '', email: '', tag: 'New', notes: '' });
  };

  const handleOpenDetail = (cust) => {
    setSelectedCustomer(cust);
    setEditNotes(cust.notes || '');
    setSentAlert(false);
    setNotificationMsg('');
  };

  const handleSaveNotes = () => {
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, { notes: editNotes });
      setSelectedCustomer({ ...selectedCustomer, notes: editNotes });
    }
  };

  const handleSendClientMessage = (e) => {
    e.preventDefault();
    if (!notificationMsg || !selectedCustomer) return;
    sendCustomNotification(selectedCustomer.name, 'SMS', notificationMsg);
    setSentAlert(true);
    setNotificationMsg('');
    setTimeout(() => setSentAlert(false), 3000);
  };

  // Get customer's appointment history
  const customerAppointments = selectedCustomer 
    ? appointments.filter(a => a.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Relationship Directory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your client profiles, visit cadence, formulas, and lifetime value.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-96 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="bg-transparent border-none outline-none text-xs w-full text-gray-900"
          />
        </div>

        {/* Tags filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {['ALL', 'VIP', 'LOYAL', 'NEW', 'AT-RISK'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Segment Tag</th>
                <th className="py-3 px-4 text-center">Visits</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No customers found matching your query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(c)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block text-sm font-semibold">{c.name}</span>
                          <span className="text-[11px] text-gray-400 font-normal">ID: {c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.tag === 'VIP' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        c.tag === 'Loyal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        c.tag === 'At-Risk' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}>
                        {c.tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                      {c.visits}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                      ${c.totalSpend.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      {c.lastVisit || 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenDetail(c); }}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? selectedCustomer.name : 'Client Details'}
        subtitle={selectedCustomer ? `Customer record & service log (${selectedCustomer.tag} Client)` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            {/* Top Summary Info */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <div>
                <span className="text-[11px] text-gray-500 block">Total Visits</span>
                <span className="text-base font-bold text-gray-900">{selectedCustomer.visits}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">Lifetime Spend</span>
                <span className="text-base font-bold text-emerald-700">${selectedCustomer.totalSpend.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">Last Appointment</span>
                <span className="text-base font-bold text-gray-900">{selectedCustomer.lastVisit}</span>
              </div>
            </div>

            {/* Direct Contact Info */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedCustomer.phone}
                </p>
                <p className="text-gray-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedCustomer.email}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                selectedCustomer.tag === 'VIP' ? 'bg-purple-100 text-purple-800' :
                selectedCustomer.tag === 'Loyal' ? 'bg-emerald-100 text-emerald-800' :
                selectedCustomer.tag === 'At-Risk' ? 'bg-amber-100 text-amber-800' :
                'bg-sky-100 text-sky-800'
              }`}>
                {selectedCustomer.tag} Status
              </span>
            </div>

            {/* Client Notes / Styling Formulas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                  Stylist Notes, Color Formulas & Allergies
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Save Notes
                </button>
              </div>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>

            {/* Appointment History */}
            <div>
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Service History with Vanilla Spa
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {customerAppointments.length === 0 ? (
                  <p className="text-gray-400 italic p-3 bg-gray-50 rounded-lg text-center">No past appointment history logged.</p>
                ) : (
                  customerAppointments.map(a => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-gray-50 flex items-center justify-between border border-gray-100">
                      <div>
                        <span className="font-semibold text-gray-800 block">{a.serviceName}</span>
                        <span className="text-[11px] text-gray-500">{a.date} at {a.time} • Provider: {a.staffName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 block">${a.price}</span>
                        <span className="text-[10px] text-emerald-700 font-medium capitalize">{a.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Send Direct SMS */}
            <form onSubmit={handleSendClientMessage} className="pt-3 border-t border-gray-100">
              <label className="block font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                Send Direct SMS / WhatsApp to {selectedCustomer.name}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  placeholder="e.g. Hi Sophia, we have an opening this Friday at 2 PM if you'd like to book!"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0"
                >
                  Send
                </button>
              </div>
              {sentAlert && (
                <p className="text-emerald-700 text-[11px] font-semibold mt-1">Message dispatched via Twilio SMS carrier!</p>
              )}
            </form>

          </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
        subtitle="Create a customer profile for CRM tracking"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              placeholder="e.g. Emma Stone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                placeholder="+1 206-555-0100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email</label>
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
            <label className="block font-medium text-gray-700 mb-1">Stylist Notes / Allergies</label>
            <textarea
              rows={3}
              value={newCust.notes}
              onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
              placeholder="Formula details, preferred drinks, scalp sensitivities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Add Client
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
