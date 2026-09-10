import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Filter, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { api } from '../api/api';

export default function Appointments() {
  const { 
    appointments, 
    staff, 
    services, 
    customers, 
    updateAppointmentStatus, 
    addAppointment 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // New Booking State
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: services[0]?.id || '',
    staffId: staff[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    notes: ''
  });

  const timelineSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM'
  ];

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isBookModalOpen && newBooking.date && newBooking.serviceId && newBooking.staffId) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        try {
          const res = await api.get(`/api/availability?date=${newBooking.date}&serviceId=${newBooking.serviceId}&staffId=${newBooking.staffId}`);
          setAvailableSlots(res || []);
          if (res && res.length > 0 && !res.includes(newBooking.time)) {
             setNewBooking(prev => ({ ...prev, time: res[0] }));
          }
        } catch (err) {
          setAvailableSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [isBookModalOpen, newBooking.date, newBooking.serviceId, newBooking.staffId]);

  const filteredAppointments = appointments.filter(apt => {
    const matchesStaff = selectedStaffFilter === 'ALL' || apt.staffId === selectedStaffFilter || apt.staffName.toLowerCase().includes(selectedStaffFilter.toLowerCase());
    return matchesStaff;
  });

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError(null);
    const service = services.find(s => s.id === newBooking.serviceId) || services[0];
    const provider = staff.find(s => s.id === newBooking.staffId) || staff[0];

    try {
      await addAppointment({
        customerName: newBooking.customerName,
        customerPhone: newBooking.customerPhone,
        serviceName: service.name,
        serviceId: service.id,
        staffName: provider.name,
        staffId: provider.id,
        price: service.price,
        duration: service.duration,
        date: newBooking.date,
        time: newBooking.time,
        notes: newBooking.notes
      });
      setIsBookModalOpen(false);
      setNewBooking({
        customerName: '',
        customerPhone: '',
        serviceId: services[0]?.id || '',
        staffId: staff[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: '11:00 AM',
        notes: ''
      });
    } catch (err) {
      console.error(err);
      setBookingError(err.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointment Scheduling</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time calendar management, chair occupancy, and client confirmations.
          </p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Book Appointment
        </button>
      </div>

      {/* Date Navigation & Controls Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Date Chooser & Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-gray-900 cursor-pointer text-xs"
            />
          </div>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Specialist Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white font-medium"
          >
            <option value="ALL">All Staff Members</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium ml-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'timeline' ? 'bg-white font-bold text-gray-900 shadow-2xs' : 'text-gray-600'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white font-bold text-gray-900 shadow-2xs' : 'text-gray-600'
              }`}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* Main Schedule Content */}
      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Schedule for {currentDate}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Confirmed</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In-Service</span>
              <span className="flex items-center gap-1 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {timelineSlots.map(slot => {
              const matchingApts = filteredAppointments.filter(a => a.time === slot);
              return (
                <div key={slot} className="flex min-h-[85px] hover:bg-gray-50/40 transition-colors">
                  {/* Time label */}
                  <div className="w-28 p-4 border-r border-gray-100 text-xs font-bold text-gray-500 shrink-0 flex flex-col justify-start">
                    <span>{slot}</span>
                  </div>

                  {/* Booking Slots */}
                  <div className="flex-1 p-2.5 flex items-center gap-3 overflow-x-auto custom-scrollbar">
                    {matchingApts.length === 0 ? (
                      <div 
                        onClick={() => {
                          setNewBooking(prev => ({ ...prev, time: slot }));
                          setIsBookModalOpen(true);
                        }}
                        className="h-full w-full rounded-lg border border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-center text-gray-400 text-xs font-medium transition-all group py-3"
                      >
                        <span className="opacity-0 group-hover:opacity-100 text-emerald-700 flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Book {slot}
                        </span>
                      </div>
                    ) : (
                      matchingApts.map(apt => (
                        <div
                          key={apt.id}
                          className={`p-3 rounded-xl border flex-1 min-w-[280px] max-w-md shadow-2xs transition-all ${
                            apt.status === 'in-service' 
                              ? 'bg-amber-50/80 border-amber-300/80' 
                              : apt.status === 'completed'
                              ? 'bg-emerald-50/80 border-emerald-300/80'
                              : 'bg-white border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-bold text-xs text-gray-900">{apt.customerName}</h4>
                              <p className="text-[11px] text-gray-600">{apt.serviceName}</p>
                            </div>
                            <span className="font-bold text-xs text-gray-900">${apt.price}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-100/60">
                            <span className="font-medium text-gray-700">Specialist: {apt.staffName}</span>
                            <div className="flex items-center gap-1.5">
                              {apt.status === 'confirmed' && (
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'in-service')}
                                  className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-colors"
                                >
                                  Check In
                                </button>
                              )}
                              {apt.status === 'in-service' && (
                                <button
                                  onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center gap-0.5"
                                >
                                  <CheckCircle2 className="w-3 h-3" /> Complete
                                </button>
                              )}
                              {apt.status === 'completed' && (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Done
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Time & Duration</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Specialist</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {apt.time} <span className="text-gray-400 font-normal">({apt.duration}m)</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {apt.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {apt.serviceName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {apt.staffName}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                      ${apt.price}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        apt.status === 'in-service' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'in-service')}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 transition-colors font-medium"
                        >
                          Check In
                        </button>
                      )}
                      {apt.status === 'in-service' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors font-semibold"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Appointment"
        subtitle="Reserve a chair and dispatch client SMS confirmation"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
          {bookingError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
              {bookingError}
            </div>
          )}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Select Client or Enter Name *</label>
            <input
              type="text"
              required
              value={newBooking.customerName}
              onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
              placeholder="e.g. Jessica Alba"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Phone (for automated SMS reminder)</label>
            <input
              type="text"
              value={newBooking.customerPhone}
              onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
              placeholder="+1 (206) 555-0199"
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
                  <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Specialist *</label>
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
              <label className="block font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Time Slot</label>
              <select
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
                disabled={isLoadingSlots || availableSlots.length === 0}
              >
                {isLoadingSlots ? (
                  <option value="">Loading slots...</option>
                ) : availableSlots.length > 0 ? (
                  availableSlots.map(ts => (
                    <option key={ts} value={ts}>{ts}</option>
                  ))
                ) : (
                  <option value="">No slots available</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Notes / Preferences</label>
            <input
              type="text"
              value={newBooking.notes}
              onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
              placeholder="Allergies, formula, requests..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableSlots.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs"
            >
              Confirm & Book
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
