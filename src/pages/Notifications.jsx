import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';

export default function Notifications() {
  const { notifications, sendCustomNotification, customers } = useApp();

  const [broadcastRecipient, setBroadcastRecipient] = useState('ALL_VIP');
  const [broadcastChannel, setBroadcastChannel] = useState('SMS');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Automated trigger toggle states
  const [triggers, setTriggers] = useState({
    reminder24h: true,
    confirmImmediate: true,
    postReview: true,
    staffAlerts: true
  });

  const toggleTrigger = (key) => {
    setTriggers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage) return;

    setIsSending(true);
    setTimeout(() => {
      let recipientName = 'All VIP Clients (18 recipients)';
      if (broadcastRecipient === 'ALL') recipientName = 'All Client Directory (140+ recipients)';
      if (broadcastRecipient === 'AT_RISK') recipientName = 'At-Risk Inactive Clients (6 recipients)';

      sendCustomNotification(recipientName, broadcastChannel, broadcastMessage);
      setIsSending(false);
      setSendSuccess(true);
      setBroadcastMessage('');
      setTimeout(() => setSendSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Messaging & Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Automated SMS reminders, WhatsApp confirmations, and mass client campaign broadcasts.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Messages Dispatched"
          value="1,482"
          change="+12.4%"
          isPositive={true}
          icon={Send}
          subtitle="This billing cycle"
        />
        <StatCard
          title="Delivery Success Rate"
          value="99.6%"
          change="Tier 1 carrier routes"
          isPositive={true}
          icon={ShieldCheck}
          subtitle="10DLC compliant"
        />
        <StatCard
          title="Automated Triggers"
          value="4 Active"
          icon={Bell}
          subtitle="Real-time webhooks"
        />
        <StatCard
          title="Review Feedback Ratio"
          value="42.8%"
          change="+5.0%"
          isPositive={true}
          icon={MessageSquare}
          subtitle="Google reviews generated"
        />
      </div>

      {/* Two Column Layout: Automated Triggers & Broadcast Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Automated Rule Triggers (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Automated Notification Workflows</h2>
            <p className="text-xs text-gray-500">Autonomous triggers executed on appointment lifecycle events</p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'reminder24h',
                title: '24-Hour Pre-Appointment Reminder',
                description: 'Sends SMS with date, specialist name, address, and 1-tap confirmation link.',
                channel: 'SMS'
              },
              {
                id: 'confirmImmediate',
                title: 'Instant Booking Confirmation',
                description: 'Immediate WhatsApp receipt with calendar .ics invite upon schedule.',
                channel: 'WhatsApp'
              },
              {
                id: 'postReview',
                title: 'Post-Visit Review & Tip Request',
                description: 'Dispatches automated feedback request 2 hours after service completion.',
                channel: 'SMS'
              },
              {
                id: 'staffAlerts',
                title: 'Internal Stylist Schedule Change Alerts',
                description: 'Notifies staff immediately when an appointment is rescheduled or cancelled.',
                channel: 'Push / SMS'
              }
            ].map(trigger => (
              <div key={trigger.id} className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200/70 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-gray-900">{trigger.title}</h3>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {trigger.channel}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    {trigger.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTrigger(trigger.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    triggers[trigger.id] ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      triggers[trigger.id] ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Broadcast SMS / WhatsApp Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Broadcast Campaign Composer</h2>
              <p className="text-xs text-gray-500">Send an instant announcement or promotional offer to selected client groups</p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
              Twilio & WhatsApp Active
            </span>
          </div>

          {sendSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Broadcast dispatched successfully! Log updated below.</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Recipient Audience</label>
                <select
                  value={broadcastRecipient}
                  onChange={(e) => setBroadcastRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="ALL_VIP">VIP Clients Only (High LTV)</option>
                  <option value="ALL">Entire Customer Directory</option>
                  <option value="AT_RISK">At-Risk Clients (No visits in 60d)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Delivery Channel</label>
                <select
                  value={broadcastChannel}
                  onChange={(e) => setBroadcastChannel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="SMS">SMS Text Message</option>
                  <option value="WhatsApp">WhatsApp Business API</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Message Content *</label>
              <textarea
                rows={4}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your message here... e.g. Spring into radiant glow! Enjoy $20 off any facial booked this week at Vanilla Spa. Book online at vanillasalon.com/portal"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>Variables available: [ClientName], [ServiceName], [BookingLink]</span>
                <span>{broadcastMessage.length} / 160 characters</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || !broadcastMessage}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Transmitting Carrier Packets...' : 'Transmit Broadcast Campaign'}
            </button>
          </form>
        </div>

      </div>

      {/* Notifications & Carrier Dispatch Log */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Recent Carrier Transmission Log</h2>
          <span className="text-xs text-gray-500">Real-time status</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Trigger Type</th>
                <th className="py-3 px-4">Message Body</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Carrier Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notifications.map(n => (
                <tr key={n.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {n.recipient}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      n.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                      n.channel === 'SMS' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {n.channel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">
                    {n.type}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-sm truncate">
                    {n.message}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {n.time}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {n.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
