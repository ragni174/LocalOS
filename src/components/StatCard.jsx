import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, isPositive = true, icon: Icon, subtitle }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-gray-900">{value}</span>
      </div>
      {(change !== undefined || subtitle) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {change !== undefined && (
            <span className={`inline-flex items-center gap-0.5 font-medium ${isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-gray-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
