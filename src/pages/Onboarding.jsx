import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const INDUSTRIES = [
  { id: 'salon', name: 'Hair & Beauty Salon', icon: '✂️', description: 'Stylists, colorists, chair rentals and retail' },
  { id: 'spa', name: 'Day Spa & Massage', icon: '💆‍♀️', description: 'Facials, body treatments, estheticians & wellness' },
  { id: 'nails', name: 'Nail Lounge & Art', icon: '💅', description: 'Manicures, pedicures, acrylics & gel art' },
  { id: 'barber', name: 'Barbershop & Grooming', icon: '💈', description: 'Cuts, beard trims, hot towel shaves' },
  { id: 'clinic', name: 'MedSpa & Aesthetic Clinic', icon: '🩺', description: 'Dermatology, injectables, laser & clinical care' },
  { id: 'pet', name: 'Pet Grooming & Spa', icon: '🐕', description: 'Full grooms, washes, nail trims & day stays' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { business, setBusiness, services, setServices, staff, setStaff } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('salon');

  // Step 1: Business Profile
  const [bizForm, setBizForm] = useState({
    name: business.name || 'Vanilla Spa & Salon',
    tagline: business.tagline || 'Boutique Wellness, Hair & Aesthetic Care',
    phone: business.phone || '+1 (555) 382-9912',
    email: business.email || 'hello@vanillasalon.com',
    address: business.address || '142 Orchard Grove Blvd, Seattle, WA',
    currency: business.currency || '$',
    taxRate: (business.taxRate ? business.taxRate * 100 : 8.5)
  });

  // Step 2: Hours
  const [hours, setHours] = useState(business.hours || {
    Monday: { open: "09:00", close: "19:00", closed: false },
    Tuesday: { open: "09:00", close: "19:00", closed: false },
    Wednesday: { open: "09:00", close: "19:00", closed: false },
    Thursday: { open: "09:00", close: "20:00", closed: false },
    Friday: { open: "09:00", close: "20:00", closed: false },
    Saturday: { open: "10:00", close: "18:00", closed: false },
    Sunday: { open: "10:00", close: "16:00", closed: true }
  });

  // Step 3: Starter Services
  const [starterServices, setStarterServices] = useState(services.slice(0, 4));
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('60');

  // Step 4: Team
  const [teamMembers, setTeamMembers] = useState(staff.slice(0, 3));
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      setBusiness(prev => ({
        ...prev,
        ...bizForm,
        taxRate: Number(bizForm.taxRate) / 100,
        hours
      }));
      setServices(starterServices);
      setStaff(teamMembers);
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const item = {
      id: `srv-${Date.now()}`,
      category: 'General',
      name: newServiceName,
      price: Number(newServicePrice),
      duration: Number(newServiceDuration) || 60,
      buffer: 10,
      description: 'Custom added service'
    };
    setStarterServices(prev => [...prev, item]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveService = (id) => {
    setStarterServices(prev => prev.filter(s => s.id !== id));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaffName) return;
    const item = {
      id: `st-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole || 'Specialist',
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: '+1 555-0199',
      commission: 15,
      rating: 5.0,
      active: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setTeamMembers(prev => [...prev, item]);
    setNewStaffName('');
    setNewStaffRole('');
  };

  const handleRemoveStaff = (id) => {
    setTeamMembers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">LocalOS Setup Wizard</span>
          </div>

          <Link
            to="/dashboard"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip wizard & launch demo &rarr;
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Step Progress Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Step {currentStep} of 4
            </span>
            <span className="text-xs text-slate-400">
              {currentStep === 1 && 'Business Identity & Industry'}
              {currentStep === 2 && 'Operating Schedule & Hours'}
              {currentStep === 3 && 'Menu of Services'}
              {currentStep === 4 && 'Team Members & Launch'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Cards */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* STEP 1: Business Profile */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Tell us about your business</h2>
                <p className="text-xs text-slate-400 mt-1">
                  We will configure your POS register, online booking portal, and client notification receipts with these details.
                </p>
              </div>

              {/* Industry Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Select Your Industry
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedIndustry === ind.id
                          ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">{ind.icon}</div>
                      <div className="text-xs font-bold truncate">{ind.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{ind.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={bizForm.name}
                    onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Haven Hair & Beauty Studio"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tagline or Subtitle</label>
                  <input
                    type="text"
                    value={bizForm.tagline}
                    onChange={(e) => setBizForm({ ...bizForm, tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Modern Balayage & Wellness"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Store Phone</label>
                  <input
                    type="text"
                    value={bizForm.phone}
                    onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Store Public Email</label>
                  <input
                    type="email"
                    value={bizForm.email}
                    onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="contact@yourbusiness.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Physical Location Address</label>
                  <input
                    type="text"
                    value={bizForm.address}
                    onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="123 Main Street, Suite 400, City, State"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Currency Symbol</label>
                  <select
                    value={bizForm.currency}
                    onChange={(e) => setBizForm({ ...bizForm, currency: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="CA$">CAD (CA$)</option>
                    <option value="A$">AUD (A$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimated Sales Tax (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bizForm.taxRate}
                    onChange={(e) => setBizForm({ ...bizForm, taxRate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Operating Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Set your operating schedule</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Clients on your booking portal can only schedule appointments during these configured open hours.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(hours).map(([day, config]) => (
                  <div
                    key={day}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      config.closed ? 'bg-slate-900/40 border-slate-800/60 opacity-60' : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="w-28 font-medium text-sm text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{day}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer mr-2">
                        <input
                          type="checkbox"
                          checked={!config.closed}
                          onChange={(e) => {
                            setHours({
                              ...hours,
                              [day]: { ...config, closed: !e.target.checked }
                            });
                          }}
                          className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>{config.closed ? 'Closed' : 'Open'}</span>
                      </label>

                      {!config.closed && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={config.open}
                            onChange={(e) => {
                              setHours({
                                ...hours,
                                [day]: { ...config, open: e.target.value }
                              });
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          />
                          <span className="text-xs text-slate-500">to</span>
                          <input
                            type="time"
                            value={config.close}
                            onChange={(e) => {
                              setHours({
                                ...hours,
                                [day]: { ...config, close: e.target.value }
                              });
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Core Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Confirm initial service menu</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Add the services your clients can book online and staff can ring up at the POS checkout.
                </p>
              </div>

              {/* Service list */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {starterServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{srv.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>⏱️ {srv.duration} mins</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">${srv.price}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(srv.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Service form */}
              <form onSubmit={handleAddService} className="pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  + Add Another Service
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="Service Name"
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="Price ($)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Staff & Launch */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Add your staff specialists</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Team members can have their own calendars, commission tracking, and client rosters.
                </p>
              </div>

              {/* Staff List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{member.name}</div>
                        <div className="text-[11px] text-emerald-400">{member.role}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(member.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Staff form */}
              <form onSubmit={handleAddStaff} className="pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  + Invite Team Member
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="Full Name"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    placeholder="Role / Title (e.g. Senior Colorist)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                </div>
              </form>

              {/* Summary Readiness Box */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Your system is fully configured!</div>
                  <div className="text-slate-400 mt-0.5">
                    Click "Complete Setup & Launch" to enter your live LocalOS operations center. You can adjust all settings at any time in the Settings tab.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-98"
            >
              <span>{currentStep === 4 ? 'Complete Setup & Launch' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500">
        LocalOS Setup • Need assistance? Support line: 1-800-555-LOCL
      </footer>
    </div>
  );
}
