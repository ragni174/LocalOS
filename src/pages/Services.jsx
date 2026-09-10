import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Clock, 
  DollarSign, 
  Users, 
  Sparkles, 
  Edit3, 
  Check, 
  Trash2,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Services() {
  const { services, staff, addService, updateService } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hair',
    price: 65,
    duration: 60,
    buffer: 10,
    description: '',
    staffIds: []
  });

  const categories = ['ALL', 'Hair', 'Skin & Spa', 'Nails', 'Massage'];

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Hair',
      price: 65,
      duration: 60,
      buffer: 10,
      description: '',
      staffIds: [staff[0]?.id || '']
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      category: srv.category,
      price: srv.price,
      duration: srv.duration,
      buffer: srv.buffer || 10,
      description: srv.description || '',
      staffIds: srv.staffIds || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingService) {
      updateService(editingService.id, formData);
    } else {
      addService(formData);
    }
    setIsModalOpen(false);
  };

  const toggleStaffSelection = (staffId) => {
    setFormData(prev => {
      const exists = prev.staffIds.includes(staffId);
      return {
        ...prev,
        staffIds: exists ? prev.staffIds.filter(id => id !== staffId) : [...prev.staffIds, staffId]
      };
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Services & Treatment Menu</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure your menu pricing, treatment durations, and qualified staff assignments.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['Hair', 'Skin & Spa', 'Nails', 'Massage'].map(cat => {
          const count = services.filter(s => s.category === cat).length;
          return (
            <div 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeCategory === cat 
                  ? 'bg-emerald-50/80 border-emerald-500/80 shadow-xs' 
                  : 'bg-white border-gray-200/80 hover:border-emerald-300'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">{cat}</span>
              <span className="text-xl font-bold text-gray-900 mt-1 block">{count} offerings</span>
              <span className="text-[11px] text-gray-500">Click to filter</span>
            </div>
          );
        })}
      </div>

      {/* Search & Tabs Filter */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-96 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service name or description..."
            className="bg-transparent border-none outline-none text-xs w-full text-gray-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(srv => {
          const assignedStaff = staff.filter(st => (srv.staffIds || []).includes(st.id));
          return (
            <div 
              key={srv.id}
              className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {srv.category}
                  </span>
                  <span className="text-base font-bold text-gray-900">${srv.price}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{srv.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{srv.duration} mins (+{srv.buffer || 10}m buffer)</span>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(srv)}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>

                {/* Assigned specialists */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Specialists:</span>
                  <div className="flex items-center -space-x-1.5">
                    {assignedStaff.length === 0 ? (
                      <span className="text-gray-400 italic">All qualified staff</span>
                    ) : (
                      assignedStaff.map(st => (
                        <img
                          key={st.id}
                          src={st.avatar}
                          alt={st.name}
                          title={st.name}
                          className="w-6 h-6 rounded-full border border-white object-cover"
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? "Edit Service" : "Add New Service"}
        subtitle="Specify pricing, timing, and specialist allocations"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Service Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Japanese Head Spa & Scalp Detox"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Hair">Hair</option>
                <option value="Skin & Spa">Skin & Spa</option>
                <option value="Nails">Nails</option>
                <option value="Massage">Massage</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Clean-up / Buffer (Minutes)</label>
              <input
                type="number"
                step="5"
                value={formData.buffer}
                onChange={(e) => setFormData({ ...formData, buffer: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What makes this service special? Products used, expected results..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1.5">Assign Providers / Specialists</label>
            <div className="grid grid-cols-2 gap-2">
              {staff.map(st => {
                const selected = formData.staffIds.includes(st.id);
                return (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => toggleStaffSelection(st.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                      selected 
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <img src={st.avatar} alt={st.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="truncate flex-1 text-xs">{st.name}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
            >
              {editingService ? "Update Service" : "Add Service"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
