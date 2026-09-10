import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/api';

export default function CustomerPortal() {
  const { business, services, staff, addAppointment } = useApp();

  const [step, setStep] = useState(1); // 1: Service, 2: Specialist, 3: Date/Time, 4: Details, 5: Confirmed
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('any');
  
  // Date & Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('11:00 AM');

  // Customer Contact Info
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter services by category
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(services.map(s => s.category || 'General'))];
    return cats;
  }, [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'All') return services;
    return services.filter(s => s.category === selectedCategory);
  }, [services, selectedCategory]);

  // Available Time Slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  React.useEffect(() => {
    if (step === 3 && selectedService && selectedDate) {
      const fetchSlots = async () => {
        setIsLoadingSlots(true);
        try {
          const res = await api.get(`/api/availability?date=${selectedDate}&serviceId=${selectedService.id}&staffId=${selectedStaff}`);
          setTimeSlots(res || []);
        } catch (err) {
          console.error("Failed to fetch slots", err);
          setTimeSlots([]);
        } finally {
          setIsLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [step, selectedDate, selectedService, selectedStaff]);

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    setStep(2);
  };

  const handleSelectStaff = (stId) => {
    setSelectedStaff(stId);
    setStep(3);
  };

  const handleSelectDateTime = (time) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError(null);

    const specialist = selectedStaff === 'any' 
      ? staff[0] 
      : staff.find(s => s.id === selectedStaff) || staff[0];

    try {
      const newBooking = await addAppointment({
        customerName: clientForm.name,
        customerPhone: clientForm.phone,
        customerEmail: clientForm.email,
        serviceName: selectedService.name,
        serviceId: selectedService.id,
        staffName: specialist?.name || 'Any Specialist',
        staffId: selectedStaff, // Send 'any' or real id
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        price: selectedService.price,
        notes: clientForm.notes
      });

      setConfirmedBooking(newBooking);
      setIsSubmitting(false);
      setStep(5);
    } catch (err) {
      console.error(err);
      setBookingError(err.message || 'Failed to book appointment. The slot might be taken.');
      setIsSubmitting(false);
      if (err.message && (err.message.includes('409') || err.message.toLowerCase().includes('taken'))) {
        setStep(3); // Go back to refresh slots
      }
    }
  };

  const downloadCalendarFile = () => {
    if (!confirmedBooking) return;
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LocalOS//Vanilla Spa Appointments//EN
BEGIN:VEVENT
SUMMARY:${confirmedBooking.serviceName} at ${business.name}
DESCRIPTION:Appointment with ${confirmedBooking.staffName}
LOCATION:${business.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-${confirmedBooking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        {/* Upper mini bar */}
        <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {business.address || 'Seattle, WA'}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                {business.phone || '+1 (555) 382-9912'}
              </span>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <span>Switch to Staff POS / Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Main Brand Header */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">{business.name || 'Vanilla Spa & Salon'}</h1>
              <p className="text-xs text-stone-500">{business.tagline || 'Boutique Wellness & Aesthetic Care'}</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-stone-600 bg-stone-100 py-1.5 px-3 rounded-full border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant Confirmation & SMS Reminders</span>
          </div>
        </div>

        {/* Step Progress bar */}
        {step < 5 && (
          <div className="border-t border-stone-100 bg-stone-50/70 px-4 py-2.5">
            <div className="max-w-5xl mx-auto flex items-center justify-between text-xs font-medium text-stone-500">
              <div className="flex items-center gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="p-1 rounded-md text-stone-600 hover:bg-stone-200 transition-colors flex items-center gap-1 text-xs font-semibold mr-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <span className={`px-2 py-0.5 rounded-md ${step === 1 ? 'bg-emerald-600 text-white font-bold' : step > 1 ? 'text-emerald-700 font-semibold' : ''}`}>
                  1. Service
                </span>
                <span>&rarr;</span>
                <span className={`px-2 py-0.5 rounded-md ${step === 2 ? 'bg-emerald-600 text-white font-bold' : step > 2 ? 'text-emerald-700 font-semibold' : ''}`}>
                  2. Specialist
                </span>
                <span>&rarr;</span>
                <span className={`px-2 py-0.5 rounded-md ${step === 3 ? 'bg-emerald-600 text-white font-bold' : step > 3 ? 'text-emerald-700 font-semibold' : ''}`}>
                  3. Date & Time
                </span>
                <span>&rarr;</span>
                <span className={`px-2 py-0.5 rounded-md ${step === 4 ? 'bg-emerald-600 text-white font-bold' : ''}`}>
                  4. Details
                </span>
              </div>

              {selectedService && (
                <div className="hidden md:block text-stone-700 font-semibold text-xs truncate">
                  {selectedService.name} • ${selectedService.price}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Booking Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">Select Your Experience</h2>
              <p className="text-sm text-stone-500 mt-1">
                Choose from our menu of luxury salon treatments, therapeutic massage, and clinical skincare.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => handleSelectService(srv)}
                  className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {srv.category || 'General'}
                      </span>
                      <span className="text-base font-bold text-stone-900">${srv.price}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {srv.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {srv.duration} minutes
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Book Now <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Specialist Picker */}
        {step === 2 && selectedService && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">Select Specialist</h2>
              <p className="text-xs text-stone-500 mt-1">
                Choose your preferred provider for {selectedService.name} ({selectedService.duration} mins).
              </p>
            </div>

            <div className="space-y-3">
              {/* Any available specialist option */}
              <div
                onClick={() => handleSelectStaff('any')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedStaff === 'any'
                    ? 'bg-emerald-50/50 border-emerald-600 ring-1 ring-emerald-600'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    ✨
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-900">Any Available Specialist</div>
                    <div className="text-xs text-stone-500">Maximum flexibility & earlier available slots</div>
                  </div>
                </div>
                <div className="text-emerald-700 font-semibold text-xs">Select &rarr;</div>
              </div>

              {/* Individual Staff Cards */}
              {staff.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSelectStaff(st.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStaff === st.id
                      ? 'bg-emerald-50/50 border-emerald-600 ring-1 ring-emerald-600'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-12 h-12 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <div className="font-bold text-sm text-stone-900">{st.name}</div>
                      <div className="text-xs text-stone-500">{st.role}</div>
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{st.rating || '4.9'} rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-emerald-700 font-semibold text-xs">Select &rarr;</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Date & Time Slot Picker */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">Choose Date & Time</h2>
              <p className="text-xs text-stone-500 mt-1">
                Real-time appointment availability based on staff schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Appointment Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Available Slots for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </label>
                {isLoadingSlots ? (
                  <div className="text-sm text-stone-500 py-4 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                    Finding available slots...
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleSelectDateTime(t)}
                        className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          selectedTime === t
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-emerald-500 hover:bg-emerald-50/30'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-stone-500 py-4 text-center bg-stone-50 rounded-xl border border-stone-200 border-dashed">
                    No slots available on this date for the selected provider. Try another date or specialist.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Client Contact Details & Confirmation */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">Your Contact Details</h2>
              <p className="text-xs text-stone-500 mt-1">
                We'll send your instant booking confirmation and reminder via SMS & Email.
              </p>
            </div>

            {/* Summary Ticket */}
            <div className="bg-emerald-900 text-emerald-50 p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                <div>
                  <div className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Appointment Summary</div>
                  <div className="text-base font-bold text-white mt-0.5">{selectedService?.name}</div>
                </div>
                <div className="text-xl font-bold text-white">${selectedService?.price}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-emerald-200">
                <div>
                  <span className="text-emerald-400 block text-[10px]">Date:</span>
                  <span className="font-semibold text-white">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[10px]">Time:</span>
                  <span className="font-semibold text-white">{selectedTime}</span>
                </div>
                <div>
                  <span className="text-emerald-400 block text-[10px]">Specialist:</span>
                  <span className="font-semibold text-white">
                    {selectedStaff === 'any' ? 'First Available Specialist' : staff.find(s => s.id === selectedStaff)?.name}
                  </span>
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium mb-4 flex items-start gap-2">
                <span>⚠️</span>
                <span>{bookingError}</span>
              </div>
            )}

            {/* Client Form */}
            <form onSubmit={handleConfirmBooking} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="e.g. Jessica Thompson"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Phone (for SMS updates) *</label>
                  <input
                    type="tel"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+1 (206) 555-0199"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="jessica@example.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Preferences or Sensitivities (Optional)</label>
                <textarea
                  rows="2"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="e.g. Sensitive scalp, prefer quiet appointment, etc."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-sm text-stone-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Booking & Reserve Slot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: Success Confirmation Screen */}
        {step === 5 && confirmedBooking && (
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Booking Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                You're all booked, {confirmedBooking.customerName}!
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Booking Reference: <strong className="text-stone-800 font-mono">{confirmedBooking.id}</strong>
              </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 text-left shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{confirmedBooking.serviceName}</h4>
                  <p className="text-xs text-stone-500">With {confirmedBooking.staffName}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-stone-900">${confirmedBooking.price}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Pay at venue</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px]">Date:</span>
                  <span className="font-medium text-stone-800">{confirmedBooking.date}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Time:</span>
                  <span className="font-medium text-stone-800">{confirmedBooking.time}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Location:</span>
                  <span className="font-medium text-stone-800">{business.address}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Phone:</span>
                  <span className="font-medium text-stone-800">{business.phone}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 flex items-center gap-2">
                <span>📱</span>
                <span>An instant SMS confirmation has been dispatched to {confirmedBooking.customerPhone || 'your mobile'}.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={downloadCalendarFile}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Add to Apple / Google Calendar (.ics)
              </button>

              <Link
                to="/dashboard"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>View in Business Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Client Portal Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Powered by LocalOS Client Suite • {business.name}</div>
          <div className="flex items-center gap-3">
            <span>Cancellation Policy: {business.cancellationHours || 24}h Notice</span>
            <span>•</span>
            <Link to="/login" className="text-emerald-700 hover:underline">Staff Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
