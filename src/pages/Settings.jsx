import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Settings() {
  const { business, setBusiness, resetToDefaultData } = useApp();

  const [formData, setFormData] = useState({ ...business });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleUpdateHour = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setBusiness(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmReset = () => {
    resetToDefaultData();
    setIsResetModalOpen(false);
    setFormData(business);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem('localos_business') || '{}');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "localos_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business Settings & Policies</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure your salon brand profile, weekly operating schedule, tax rules, and system data.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Backup JSON
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 animate-fadeIn font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Business settings and schedule updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Business Identity */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">Business Identity & Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Company / Brand Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Business Slogan / Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Owner / Principal In Charge</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Business Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Public Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Physical Location Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Hours */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">Operating Schedule & Chair Availability</h2>
          </div>

          <div className="space-y-2 text-xs">
            {daysOfWeek.map(day => {
              const dayConfig = formData.hours?.[day] || { open: "09:00", close: "18:00", closed: false };
              return (
                <div key={day} className="p-3 rounded-lg bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-4">
                  <div className="w-28 font-semibold text-gray-900">{day}</div>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                      <input
                        type="checkbox"
                        checked={dayConfig.closed}
                        onChange={(e) => handleUpdateHour(day, 'closed', e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Closed</span>
                    </label>

                    {!dayConfig.closed && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayConfig.open}
                          onChange={(e) => handleUpdateHour(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded bg-white"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={dayConfig.close}
                          onChange={(e) => handleUpdateHour(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Booking Policies & Financials */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">Financial Rules & Booking Policies</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={(formData.taxRate * 100).toFixed(1)}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) / 100 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Online Booking Deposit (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.depositPercent}
                onChange={(e) => setFormData({ ...formData, depositPercent: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Cancellation Notice Window (Hours)</label>
              <input
                type="number"
                value={formData.cancellationHours}
                onChange={(e) => setFormData({ ...formData, cancellationHours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit & Reset Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Seed Data
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" /> Save All Settings
          </button>
        </div>

      </form>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset LocalOS Demo Database?"
        subtitle="This will restore all default customers, services, inventory, and appointments."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to clear your local storage modifications and restore the pristine Vanilla Spa & Salon seed records?
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
