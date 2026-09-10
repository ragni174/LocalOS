import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Wrench,
  Calendar,
  Package,
  CreditCard,
  UserCog,
  BarChart2,
  Lightbulb,
  Bell,
  Blocks,
  Settings,
  Search,
  ExternalLink,
  Sparkles,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Customers', to: '/customers', icon: Users },
  { name: 'Sales & POS', to: '/orders', icon: ShoppingCart },
  { name: 'Services', to: '/services', icon: Wrench },
  { name: 'Appointments', to: '/appointments', icon: Calendar },
  { name: 'Inventory', to: '/inventory', icon: Package },
  { name: 'Payments', to: '/payments', icon: CreditCard },
  { name: 'Staff', to: '/staff', icon: UserCog },
  { name: 'Analytics', to: '/analytics', icon: BarChart2 },
  { name: 'Insights', to: '/insights', icon: Lightbulb, badge: 'AI' },
  { name: 'Notifications', to: '/notifications', icon: Bell },
  { name: 'Integrations', to: '/integrations', icon: Blocks },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export default function Layout() {
  const { business, notifications, activeUser, setActiveUser } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const unreadCount = notifications ? notifications.filter(n => n.status === 'Unread' || n.status === 'Delivered').length : 0;

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(err) {}
    setActiveUser(null);
    setShowUserMenu(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200/80 flex flex-col shrink-0">
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black shadow-xs shadow-emerald-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-gray-900 leading-none block">LOCALOS</span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">Business Suite</span>
            </div>
          </Link>
        </div>

        {/* Customer Portal Banner */}
        <div className="px-3 pt-3">
          <Link
            to="/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100/70 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Client Booking Portal</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-emerald-600 text-white font-semibold shadow-xs" 
                    : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide",
                      isActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Business Card Footer */}
        <div className="p-3 border-t border-gray-200/70 bg-gray-50/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-200/60 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              VS
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-gray-900 truncate">{business.name}</span>
              <span className="text-[11px] text-emerald-600 font-medium">Pro Business Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/60">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 z-20 shrink-0">
          {/* Search bar */}
          <div className="flex items-center bg-gray-100/90 rounded-lg px-3 py-1.5 w-80 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients, orders, services..." 
              className="bg-transparent border-none outline-none text-xs w-full text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Direct Link to Onboarding setup */}
            <Link
              to="/onboarding"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors"
            >
              <span>Setup Wizard</span>
            </Link>

            {/* Notifications toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200/80 p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <span className="font-semibold text-xs text-gray-900">Recent Notifications</span>
                    <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-[11px] text-emerald-600 hover:underline">View all</Link>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {notifications.slice(0, 4).map(n => (
                      <div key={n.id} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100/80 text-xs transition-colors">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <span className="font-semibold text-gray-800">{n.recipient}</span>
                          <span>{n.time}</span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile button / menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-100">
                  JD
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-900">{activeUser.name}</span>
                  <span className="text-[10px] text-gray-500">{activeUser.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1.5 z-50 animate-fadeIn text-xs">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{activeUser.name}</p>
                    <p className="text-gray-500 text-[11px]">{activeUser.email}</p>
                  </div>
                  <Link 
                    to="/settings" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Business Settings
                  </Link>
                  <Link 
                    to="/portal" 
                    target="_blank" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    Customer Portal
                  </Link>
                  <a 
                    href="#logout" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Switch User / Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route View */}
        <div className="flex-1 overflow-auto p-6 md:p-8 relative custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
