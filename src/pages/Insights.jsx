import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Zap,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Insights() {
  const { insights, sendCustomNotification, restockInventoryItem, inventory } = useApp();

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [executingId, setExecutingId] = useState(null);
  const [completedActions, setCompletedActions] = useState({});

  const filteredInsights = insights.filter(ins => {
    return filterCategory === 'ALL' || ins.category === filterCategory;
  });

  const handleExecuteAction = (ins) => {
    setExecutingId(ins.id);
    setTimeout(() => {
      if (ins.id === 'ins-1') {
        sendCustomNotification('VIP Client Segment (14 contacts)', 'WhatsApp', 'Exclusive 15% off midweek recharge slots this Tuesday! Reply to book.');
      } else if (ins.id === 'ins-2') {
        sendCustomNotification('Noah Patel & 5 Inactive Clients', 'SMS', 'We miss you at Vanilla Spa! Enjoy a complimentary deep conditioning treatment on your next visit.');
      } else if (ins.id === 'ins-3') {
        const lavItem = inventory.find(i => i.name.includes('Lavender'));
        if (lavItem) {
          restockInventoryItem(lavItem.id, 5);
        }
      }

      setCompletedActions(prev => ({ ...prev, [ins.id]: true }));
      setExecutingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* AI Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
          <Sparkles className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> LocalOS Autonomous Business Copilot
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Intelligent Operational Recommendations
          </h1>
          <p className="text-sm text-emerald-100/80 mt-2 leading-relaxed">
            LocalOS continuously synthesizes appointment cadence, technician idle chairs, and stock turnover to surface actionable revenue-unlocking automations.
          </p>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {['ALL', 'Revenue Optimization', 'Client Retention', 'Inventory Health', 'Service Performance'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {filteredInsights.length} actionable suggestions identified
        </span>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map(ins => {
          const isDone = completedActions[ins.id];
          const isLoading = executingId === ins.id;

          return (
            <div
              key={ins.id}
              className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {ins.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      ins.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                      ins.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ins.priority} Priority
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {ins.impact}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {ins.title}
                </h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {ins.description}
                </p>
              </div>

              {/* Action Trigger Row */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {isDone ? 'Executed successfully' : 'One-click autonomous trigger'}
                </span>
                
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Action Completed
                  </span>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => handleExecuteAction(ins)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        {ins.actionText}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
