import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  Receipt, 
  CheckCircle2, 
  Printer, 
  User, 
  Sparkles,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function Orders() {
  const { 
    services, 
    inventory, 
    orders, 
    customers, 
    business, 
    createOrder 
  } = useApp();

  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'
  const [catalogCategory, setCatalogCategory] = useState('ALL');
  const [searchItem, setSearchItem] = useState('');
  
  // POS Cart State
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [customTip, setCustomTip] = useState('');
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cashTendered, setCashTendered] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);

  // Selected Order for Receipt View
  const [viewReceiptOrder, setViewReceiptOrder] = useState(null);

  // Combined Catalog (Services + Retail Items)
  const retailItems = inventory.filter(i => i.category === 'Retail');
  
  const catalog = [
    ...services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      type: 'Service',
      category: s.category,
      badge: `${s.duration} min`
    })),
    ...retailItems.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      type: 'Retail',
      category: 'Retail Product',
      badge: `${r.stock} in stock`
    }))
  ];

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchItem.toLowerCase());
    const matchesCategory = catalogCategory === 'ALL' || item.type === catalogCategory || item.category === catalogCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId('');
    setTipPercent(18);
    setCustomTip('');
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * business.taxRate;
  const tipAmount = customTip !== '' 
    ? Number(customTip) || 0 
    : (subtotal * (tipPercent / 100));
  const total = subtotal + tax + tipAmount;

  const handleCompletePayment = async (e) => {
    e.preventDefault();
    setCheckoutError(null);
    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : 'Walk-in Guest';

    try {
      const newOrder = await createOrder({
        customerName,
        items: cart.map(i => ({ id: i.id, type: i.type, name: i.name, price: i.price, qty: i.qty })),
        subtotal,
        tax,
        tip: tipAmount,
        total,
        paymentMethod
      });

      setCompletedOrder(newOrder);
      clearCart();
      setIsCheckoutModalOpen(false);
    } catch (error) {
      setCheckoutError(error.response?.data?.error || error.message || 'An error occurred during checkout.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Point of Sale & Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Process checkout transactions, scan retail items, and track sales revenue.
          </p>
        </div>
        <div className="flex bg-gray-200/80 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'pos' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            POS Register
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'history' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Order Ledger ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        /* POS Layout: Left Catalog / Right Cart */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Catalog Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search & Filter Categories */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchItem}
                  onChange={(e) => setSearchItem(e.target.value)}
                  placeholder="Search service or retail product..."
                  className="bg-transparent border-none outline-none text-xs w-full text-gray-900"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {['ALL', 'Service', 'Retail', 'Hair', 'Skin & Spa', 'Nails', 'Massage'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      catalogCategory === cat 
                        ? 'bg-emerald-600 text-white font-semibold' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
              {filteredCatalog.map(item => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs hover:shadow-md hover:border-emerald-500/60 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-gray-400">{item.badge}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">${item.price.toFixed(2)}</span>
                    <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-emerald-600 group-hover:text-white text-gray-600 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Cart Ticket Column (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col min-h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-900">Current Register Ticket</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Customer Selector */}
            <div className="mt-3">
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Assign Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
              >
                <option value="">Walk-in Client (Guest)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.tag} • {c.phone})</option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 my-3 overflow-y-auto max-h-52 custom-scrollbar space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mb-2 stroke-[1.5] text-gray-300" />
                  <p className="text-xs">Ticket is empty.</p>
                  <p className="text-[11px] text-gray-400">Click items from catalog to add.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-gray-900 block truncate">{item.name}</span>
                      <span className="text-[11px] text-gray-500">${item.price.toFixed(2)} each</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-gray-200 rounded-md bg-white">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="p-1 text-gray-500 hover:text-gray-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-gray-900 text-xs">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="p-1 text-gray-500 hover:text-gray-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900 w-14 text-right">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Tip Selection */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Gratuity / Tip</span>
                  <span className="text-xs font-bold text-gray-900">${tipAmount.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[15, 18, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => { setTipPercent(pct); setCustomTip(''); }}
                      className={`py-1.5 rounded-lg border font-medium ${
                        customTip === '' && tipPercent === pct
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="Custom $"
                    className="px-2 py-1 border border-gray-200 rounded-lg text-center outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax ({(business.taxRate * 100).toFixed(1)}%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Due</span>
                <span className="text-emerald-700">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Trigger */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
              className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              Charge ${total.toFixed(2)}
            </button>
          </div>

        </div>
      ) : (
        /* Order Ledger / History Table */
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(ord => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {ord.date} • {ord.time}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {ord.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                      {ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        ord.status === 'REFUNDED'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {ord.status === 'COMPLETED' ? 'Completed' : ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewReceiptOrder(ord)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Complete Checkout"
        subtitle={`Charging total of $${total.toFixed(2)} for ${selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : 'Walk-in'}`}
      >
        <form onSubmit={handleCompletePayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Credit Card', icon: CreditCard },
                { name: 'Apple Pay', icon: Smartphone },
                { name: 'Cash', icon: DollarSign }
              ].map(method => (
                <button
                  type="button"
                  key={method.name}
                  onClick={() => setPaymentMethod(method.name)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                    paymentMethod === method.name
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <method.icon className="w-5 h-5 text-emerald-700" />
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'Cash' && (
            <div>
              <label className="block font-medium text-gray-700 mb-1">Cash Tendered ($)</label>
              <input
                type="number"
                step="0.01"
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                placeholder={`Minimum $${total.toFixed(2)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
              {Number(cashTendered) > total && (
                <p className="mt-1 text-xs font-bold text-emerald-700">
                  Change Due: ${(Number(cashTendered) - total).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax + Tip</span>
              <span>${(tax + tipAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200 text-sm">
              <span>Final Total</span>
              <span className="text-emerald-700">${total.toFixed(2)}</span>
            </div>
          </div>

          {checkoutError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200">
              {checkoutError}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* Completed Order / Receipt Modal */}
      <Modal
        isOpen={!!completedOrder || !!viewReceiptOrder}
        onClose={() => { setCompletedOrder(null); setViewReceiptOrder(null); }}
        title="Transaction Receipt"
        subtitle={business.name}
        maxWidth="max-w-md"
      >
        {(() => {
          const ord = completedOrder || viewReceiptOrder;
          if (!ord) return null;
          return (
            <div className="space-y-4 text-xs font-mono">
              <div className="text-center pb-3 border-b border-dashed border-gray-300 font-sans">
                <h3 className="font-bold text-base text-gray-900">{business.name}</h3>
                <p className="text-[11px] text-gray-500">{business.address}</p>
                <p className="text-[11px] text-gray-500">{business.phone}</p>
                <p className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 py-1 rounded-md">
                  Receipt #{ord.id} • {ord.status}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-gray-500">
                  <span>Date/Time:</span>
                  <span>{ord.date} {ord.time}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Customer:</span>
                  <span className="font-bold text-gray-800">{ord.customerName}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Payment:</span>
                  <span>{ord.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-gray-300 space-y-2">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.qty}x {item.name}</span>
                    <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-gray-300 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${ord.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Sales Tax</span>
                  <span>${ord.tax.toFixed(2)}</span>
                </div>
                {ord.tip > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Tip</span>
                    <span>${ord.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-900">
                  <span>TOTAL PAID</span>
                  <span>${ord.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between font-sans">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  onClick={() => { setCompletedOrder(null); setViewReceiptOrder(null); }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
}
