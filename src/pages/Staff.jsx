import React, { useState } from 'react';
import { 
  UserCog, 
  UserPlus, 
  Star, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

export default function Staff() {
  const { staff, addStaffMember, updateStaffStatus, appointments, services } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Hair Stylist',
    email: '',
    phone: '',
    commission: 20
  });

  const activeCount = staff.filter(s => s.active).length;
  const avgRating = (staff.reduce((sum, s) => sum + (s.rating || 5.0), 0) / staff.length).toFixed(1);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name) return;
    addStaffMember(newMember);
    setIsAddModalOpen(false);
    setNewMember({
      name: '',
      role: 'Hair Stylist',
      email: '',
      phone: '',
      commission: 20
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff & Team Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage provider schedules, floor check-ins, commission splits, and performance ratings.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Team Member
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff"
          value={staff.length}
          icon={UserCog}
          subtitle="Full-time & contractors"
        />
        <StatCard
          title="On Duty Today"
          value={`${activeCount} / ${staff.length}`}
          change="Available for bookings"
          isPositive={true}
          icon={Clock}
          subtitle="Active stations"
        />
        <StatCard
          title="Avg Client Satisfaction"
          value={`${avgRating} ★`}
          change="Top 5% salon benchmark"
          isPositive={true}
          icon={Star}
          subtitle="From 140+ reviews"
        />
        <StatCard
          title="Avg Commission Split"
          value="18%"
          icon={Award}
          subtitle="Performance incentive"
        />
      </div>

      {/* Staff Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staff.map(member => {
          const bookedCount = appointments.filter(a => a.staffId === member.id).length;
          const assignedServices = services.filter(s => (s.staffIds || []).includes(member.id));

          return (
            <div 
              key={member.id}
              className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar & Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{member.name}</h3>
                      <span className="text-xs text-gray-500 font-medium block">{member.role}</span>
                    </div>
                  </div>
                  
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => updateStaffStatus(member.id, !member.active)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                      member.active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {member.active ? 'On Duty' : 'Off Duty'}
                  </button>
                </div>

                {/* Contact details */}
                <div className="space-y-1 text-xs text-gray-500 mb-4 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Performance stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-gray-100 mb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Commission</span>
                    <span className="font-bold text-gray-900">{member.commission}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Rating</span>
                    <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {member.rating}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Today Booked</span>
                    <span className="font-bold text-emerald-700">{bookedCount} appts</span>
                  </div>
                </div>
              </div>

              {/* Qualified treatments */}
              <div className="pt-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Qualified Specialties:
                </span>
                <div className="flex flex-wrap gap-1">
                  {assignedServices.length === 0 ? (
                    <span className="text-[11px] text-gray-400 italic">General Salon Services</span>
                  ) : (
                    assignedServices.slice(0, 3).map(s => (
                      <span key={s.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium truncate max-w-[140px]">
                        {s.name}
                      </span>
                    ))
                  )}
                  {assignedServices.length > 3 && (
                    <span className="text-[10px] text-gray-400 px-1 py-0.5 font-medium">+{assignedServices.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Team Member"
        subtitle="Invite a stylist, aesthetician, or front-desk staff member"
      >
        <form onSubmit={handleAddMember} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="e.g. Maya Lin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Role Title</label>
              <input
                type="text"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="e.g. Master Colorist"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Commission Split (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newMember.commission}
                onChange={(e) => setNewMember({ ...newMember, commission: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="staff@vanillasalon.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="+1 (206) 555-0150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
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
              Add Member
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
