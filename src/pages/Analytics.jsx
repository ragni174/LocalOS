import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  ArrowUpRight, 
  PieChart as PieIcon,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';

const monthlyData = [
  { month: 'Oct', revenue: 14200, appointments: 130 },
  { month: 'Nov', revenue: 16800, appointments: 155 },
  { month: 'Dec', revenue: 22400, appointments: 198 },
  { month: 'Jan', revenue: 15600, appointments: 140 },
  { month: 'Feb', revenue: 18900, appointments: 168 },
  { month: 'Mar', revenue: 24500, appointments: 210 },
];

const peakHoursData = [
  { time: '9 AM', clients: 8 },
  { time: '10 AM', clients: 16 },
  { time: '11 AM', clients: 22 },
  { time: '12 PM', clients: 18 },
  { time: '1 PM', clients: 12 },
  { time: '2 PM', clients: 10 },
  { time: '3 PM', clients: 14 },
  { time: '4 PM', clients: 24 },
  { time: '5 PM', clients: 26 },
  { time: '6 PM', clients: 19 },
];

const categoryData = [
  { name: 'Hair Treatments', value: 42, color: '#15803d' },
  { name: 'Skin & Facial', value: 25, color: '#3b82f6' },
  { name: 'Nails Care', value: 18, color: '#a855f7' },
  { name: 'Massage & Body', value: 15, color: '#f59e0b' },
];

const staffLeaderboard = [
  { name: 'Elena Rostova', role: 'Lead Hair Stylist', revenue: 8450, rating: 4.9, bookings: 62 },
  { name: 'David Kim', role: 'Massage Therapist', revenue: 6120, rating: 5.0, bookings: 44 },
  { name: 'Marcus Vance', role: 'Senior Aesthetician', revenue: 5380, rating: 4.8, bookings: 48 },
  { name: 'Chloe Bennet', role: 'Nail Artist', revenue: 4550, rating: 4.9, bookings: 56 },
];

export default function Analytics() {
  const { business } = useApp();
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business Intelligence & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Revenue trends, peak utilization curves, service performance, and staff metrics.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs self-start sm:self-auto text-xs">
          {['Last 7 Days', 'Last 30 Days', 'Quarter to Date', 'Year to Date'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value="$24,500"
          change="+29.6%"
          isPositive={true}
          icon={DollarSign}
          subtitle="vs previous month"
        />
        <StatCard
          title="Total Client Bookings"
          value="210"
          change="+25.0%"
          isPositive={true}
          icon={Calendar}
          subtitle="94% chair occupancy"
        />
        <StatCard
          title="Client Retention Rate"
          value="78.4%"
          change="+4.2%"
          isPositive={true}
          icon={Users}
          subtitle="Returning within 60 days"
        />
        <StatCard
          title="Retail Cross-Sell Ratio"
          value="31.8%"
          change="+6.1%"
          isPositive={true}
          icon={Sparkles}
          subtitle="Products added to service"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Revenue & Bookings Growth AreaChart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Revenue & Bookings Trajectory</h2>
              <p className="text-xs text-gray-500">6-Month historical performance trend</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Revenue ($)
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Bookings
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Gross Revenue' : 'Bookings'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Revenue by Service Category (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Revenue Breakdown by Department</h2>
            <p className="text-xs text-gray-500">Service department contribution</p>
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'Share']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-gray-700">{cat.name}</span>
                </div>
                <span className="font-bold text-gray-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Second Charts Row: Peak Hours Heatmap & Staff Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Peak Hours Distribution BarChart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Hourly Client Traffic Pattern</h2>
              <p className="text-xs text-gray-500">Average chair occupancy by hour of day</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium">
              <Clock className="w-3.5 h-3.5" /> Rush: 4 - 6 PM
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(val) => [`${val} clients`, 'Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="clients" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Sales Leaderboard (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Provider Sales & Performance Leaderboard</h2>
              <p className="text-xs text-gray-500">Top revenue generating stylists and therapists</p>
            </div>
            <span className="text-xs text-emerald-700 font-semibold">March Leaderboard</span>
          </div>

          <div className="space-y-3">
            {staffLeaderboard.map((stylist, index) => {
              const maxRev = 10000;
              const pct = Math.min(100, Math.round((stylist.revenue / maxRev) * 100));
              return (
                <div key={stylist.name} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        index === 0 ? 'bg-amber-100 text-amber-800' :
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="font-bold text-gray-900">{stylist.name}</span>
                      <span className="text-gray-400 font-normal">({stylist.role})</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-sm">${stylist.revenue.toLocaleString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>{stylist.bookings} Completed Treatments</span>
                    <span className="font-medium text-amber-600">★ {stylist.rating} Client Rating</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
