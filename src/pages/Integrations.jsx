import React, { useState } from 'react';
import { 
  Blocks, 
  CreditCard, 
  MessageCircle, 
  Calendar, 
  Smartphone, 
  Share2, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  ExternalLink,
  RefreshCw,
  Printer,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Integrations() {
  const { integrations, toggleIntegration } = useApp();

  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [apiKey, setApiKey] = useState('sk_live_9482938491029348');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const getIcon = (name) => {
    switch (name) {
      case 'CreditCard': return CreditCard;
      case 'MessageCircle': return MessageCircle;
      case 'Calendar': return Calendar;
      case 'Smartphone': return Smartphone;
      case 'Share2': return Share2;
      case 'FileSpreadsheet': return FileSpreadsheet;
      default: return Blocks;
    }
  };

  const handleOpenConfig = (item) => {
    setSelectedIntegration(item);
    setTestResult('');
  };

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult('Ping successful! Latency: 42ms. Webhooks active.');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integrations & Hardware Hub</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Connect card readers, automated SMS gateways, accounting software, and social booking links.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map(item => {
          const IconComp = getIcon(item.icon);
          const isConnected = item.status === 'Connected';

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => toggleIntegration(item.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isConnected ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isConnected ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {item.category}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">
                  Last Sync: <strong className="text-gray-600">{item.lastSync}</strong>
                </span>
                <button
                  onClick={() => handleOpenConfig(item)}
                  className="px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" /> Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* POS Hardware Devices Subsection */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Connected Countertop Hardware</h2>
            <p className="text-xs text-gray-500">Local POS peripherals paired over Bluetooth / LAN</p>
          </div>
          <button className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> Scan Peripherals
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-emerald-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Star Micronics TSP143III (Thermal)</h4>
                <p className="text-[11px] text-gray-500">LAN IP: 192.168.1.144 • Paper: 80mm Roll (OK)</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Online
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">BBPOS WisePOS E (Smart Reader)</h4>
                <p className="text-[11px] text-gray-500">Stripe Terminal ID: tm_49201948 • Battery: 94%</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Paired
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        title={selectedIntegration ? `Configure ${selectedIntegration.name}` : ''}
        subtitle="Manage API keys, environment settings, and connection status"
        maxWidth="max-w-md"
      >
        {selectedIntegration && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Production API Key / Secret</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Webhook Endpoint URL</label>
              <input
                type="text"
                readOnly
                value="https://api.localos.io/v1/webhooks/vanilla-spa"
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg outline-none text-gray-600 font-mono text-[11px]"
              />
            </div>

            {testResult && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestConnection}
                className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Test API Link
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
