import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Smartphone, 
  FileText, 
  Receipt, 
  Calendar,
  Sparkles,
  ExternalLink,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';

export default function Payments() {
  const { orders, business } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const grossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalTips = orders.reduce((sum, o) => sum + (o.tip || 0), 0);
  const estimatedFees = grossRevenue * 0.027;
  const netSettlement = grossRevenue - estimatedFees;
  const avgOrder = orders.length > 0 ? (grossRevenue / orders.length) : 0;

  const cardOrders = orders.filter(o => o.paymentMethod === 'Credit Card').length;
  const applePayOrders = orders.filter(o => o.paymentMethod === 'Apple Pay').length;
  const cashOrders = orders.filter(o => o.paymentMethod === 'Cash').length;

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSimulatePayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments & Settlement Ledger</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor payment gateway settlements, processing fees, tips, and bank payouts.
          </p>
        </div>
        <button
          onClick={handleSimulatePayout}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200 self-start sm:self-auto"
        >
          <ArrowUpRight className="w-4 h-4" />
          Transfer Payout to Bank
        </button>
      </div>

      {payoutSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="block font-bold">ACH Payout Initiated!</strong>
            <span>${netSettlement.toFixed(2)} is being dispatched to Chase Business Checking (...4821). Estimated arrival tomorrow morning.</span>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Processed Sales"
          value={`$${grossRevenue.toFixed(2)}`}
          change="+18.4%"
          isPositive={true}
          icon={DollarSign}
          subtitle="All transactions"
        />
        <StatCard
          title="Net Available Payout"
          value={`$${netSettlement.toFixed(2)}`}
          icon={CreditCard}
          subtitle="After gateway fees"
        />
        <StatCard
          title="Staff Tips Collected"
          value={`$${totalTips.toFixed(2)}`}
          icon={Sparkles}
          subtitle="Ready for payroll"
        />
        <StatCard
          title="Avg Transaction Ticket"
          value={`$${avgOrder.toFixed(2)}`}
          icon={Receipt}
          subtitle="Across services & retail"
        />
      </div>

      {/* Payment Gateway Split Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Stripe Terminal / Card</span>
              <span className="text-lg font-bold text-gray-900">{cardOrders} transactions</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
            {orders.length ? Math.round((cardOrders / orders.length) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Apple Pay / Contactless</span>
              <span className="text-lg font-bold text-gray-900">{applePayOrders} transactions</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
            {orders.length ? Math.round((applePayOrders / orders.length) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 block">Cash Register</span>
              <span className="text-lg font-bold text-gray-900">{cashOrders} transactions</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
            {orders.length ? Math.round((cashOrders / orders.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Transactions Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-96 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Order ID, client, or payment channel..."
            className="bg-transparent border-none outline-none text-xs w-full text-gray-900"
          />
        </div>
        <button 
          onClick={() => window.print()}
          className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Export Statement
        </button>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tip</th>
                <th className="py-3 px-4 text-right">Net Charged</th>
                <th className="py-3 px-4 text-center">Settlement</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {ord.date} {ord.time}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    {ord.customerName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-medium text-[11px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-600">
                    ${ord.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                    ${(ord.tip || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                    ${ord.total.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(ord)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.id}` : ''}
        subtitle={business.name}
        maxWidth="max-w-md"
      >
        {selectedInvoice && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <p className="font-bold text-gray-900">{business.name}</p>
              <p className="text-gray-500">{business.address}</p>
              <p className="text-gray-500">{business.phone}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Billed To:</span>
                <span className="font-bold text-gray-800">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date & Time:</span>
                <span>{selectedInvoice.date} {selectedInvoice.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span>{selectedInvoice.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <span className="font-bold text-gray-700 block mb-1">Purchased Line Items:</span>
              {selectedInvoice.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-gray-800">
                  <span>{i.qty}x {i.name}</span>
                  <span className="font-semibold">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>${selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax ({(business.taxRate * 100).toFixed(1)}%):</span>
                <span>${selectedInvoice.tax.toFixed(2)}</span>
              </div>
              {selectedInvoice.tip > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tip Gratuity:</span>
                  <span>${selectedInvoice.tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
                <span>Total Settled:</span>
                <span className="text-emerald-700">${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> PDF Receipt
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
