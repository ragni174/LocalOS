import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ArrowDownToLine, 
  CheckCircle2,
  Boxes,
  Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

export default function Inventory() {
  const { inventory, addInventoryItem, restockInventoryItem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedItemForRestock, setSelectedItemForRestock] = useState(null);
  const [restockQty, setRestockQty] = useState(10);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'Retail',
    stock: 10,
    minStock: 5,
    cost: 15,
    price: 35,
    supplier: ''
  });

  // Financial calculations
  const totalValue = inventory.reduce((sum, item) => sum + (item.cost * item.stock), 0);
  const totalRetailItems = inventory.filter(i => i.category === 'Retail').reduce((sum, i) => sum + i.stock, 0);
  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || item.stock <= item.minStock;
    return matchesSearch && matchesCat && matchesLowStock;
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    addInventoryItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({
      name: '',
      sku: '',
      category: 'Retail',
      stock: 10,
      minStock: 5,
      cost: 15,
      price: 35,
      supplier: ''
    });
  };

  const handleOpenRestock = (item) => {
    setSelectedItemForRestock(item);
    setRestockQty(10);
    setIsRestockModalOpen(true);
  };

  const handleConfirmRestock = (e) => {
    e.preventDefault();
    if (selectedItemForRestock) {
      restockInventoryItem(selectedItemForRestock.id, restockQty);
    }
    setIsRestockModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory & Supply Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor retail shelves, backbar dispensary supplies, and automated reorder points.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Valuation (Cost)"
          value={`$${totalValue.toFixed(2)}`}
          icon={DollarSign}
          subtitle="At wholesale cost"
        />
        <StatCard
          title="Retail Units on Hand"
          value={totalRetailItems}
          icon={Package}
          subtitle="Across salon floor"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          change={lowStockCount > 0 ? "Reorder needed" : "All healthy"}
          isPositive={lowStockCount === 0}
          icon={AlertTriangle}
          subtitle="Below reorder safety"
        />
        <StatCard
          title="Total Catalog SKUs"
          value={inventory.length}
          icon={Boxes}
          subtitle="Active product lines"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-96 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, product name, or vendor..."
            className="bg-transparent border-none outline-none text-xs w-full text-gray-900"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
          {/* Category Tabs */}
          <div className="flex items-center gap-1">
            {['ALL', 'Retail', 'Backbar', 'Equipment'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showLowStockOnly
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Stock Only
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Product Name & Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Cost / Retail</th>
                <th className="py-3 px-4 text-right">Profit Margin</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No inventory items matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isLow = item.stock <= item.minStock;
                  const marginPct = Math.round(((item.price - item.cost) / item.price) * 100);
                  const progressPct = Math.min(100, Math.round((item.stock / (item.minStock * 3)) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">{item.name}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium inline-block mt-0.5">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-gray-900">{item.stock} units</span>
                          <span className="text-[11px] text-gray-400">Min: {item.minStock}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isLow 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-gray-500">${item.cost.toFixed(2)}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        +{marginPct}%
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {item.supplier || 'Direct'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenRestock(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        title="Receive Purchase Order / Restock"
        subtitle={selectedItemForRestock ? `Adding inventory for ${selectedItemForRestock.name}` : ''}
        maxWidth="max-w-md"
      >
        {selectedItemForRestock && (
          <form onSubmit={handleConfirmRestock} className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Current Stock Level:</span>
                <span className="font-bold text-gray-900">{selectedItemForRestock.stock} units</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Reorder Alert Threshold:</span>
                <span className="font-medium">{selectedItemForRestock.minStock} units</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Supplier:</span>
                <span className="font-medium">{selectedItemForRestock.supplier}</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Units Received / Added *</label>
              <input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 font-bold text-sm"
              />
            </div>

            <p className="text-xs text-gray-500">
              New stock level will be: <strong className="text-emerald-700">{selectedItemForRestock.stock + Number(restockQty)} units</strong>
            </p>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inventory Product"
        subtitle="Catalog new retail item, backbar formula, or equipment"
      >
        <form onSubmit={handleAddItem} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g. Keratin Leave-In Silk Mist (150ml)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">SKU / Barcode</label>
              <input
                type="text"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                placeholder="e.g. KER-150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Retail">Retail Product (Sellable)</option>
                <option value="Backbar">Backbar (Internal Use)</option>
                <option value="Equipment">Salon Equipment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Initial Stock Count</label>
              <input
                type="number"
                value={newItem.stock}
                onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Reorder Safety Level</label>
              <input
                type="number"
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Wholesale Unit Cost ($)</label>
              <input
                type="number"
                step="0.5"
                value={newItem.cost}
                onChange={(e) => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Retail Shelf Price ($)</label>
              <input
                type="number"
                step="0.5"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Primary Supplier / Distributor</label>
            <input
              type="text"
              value={newItem.supplier}
              onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              placeholder="e.g. EcoBeauty Supply Corp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
            />
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
