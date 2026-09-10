import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Store,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth } from '../api/api';

export default function Login() {
  const navigate = useNavigate();
  const { business, staff, setActiveUser } = useApp();

  const [authMode, setAuthMode] = useState('email'); // 'email' | 'pin'
  const [email, setEmail] = useState('jane@vanillasalon.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'pin' && pin.length !== 4) {
        setError('Please enter a valid 4-digit staff PIN.');
        setIsLoading(false);
        return;
      }
      
      const payload = authMode === 'pin' 
        ? { pin } 
        : { email, password };
        
      const user = await auth.login(payload);
      setActiveUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const user = await auth.login({ email, password });
      setActiveUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = async (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setIsLoading(true);
        try {
          const user = await auth.login({ pin: newPin });
          setActiveUser(user);
          navigate('/dashboard');
        } catch (err) {
          setError(err.message || 'Invalid PIN');
          setPin(''); // Reset on failure
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />
      <div className="absolute -top-20 right-10 w-72 h-72 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">LocalOS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                v2.4 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">All-in-One Local Business Operating System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/portal"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 transition-colors py-1.5 px-3 rounded-lg bg-slate-900/80 border border-slate-800"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Client Booking Portal
          </Link>
          <Link
            to="/onboarding"
            className="text-xs text-slate-300 hover:text-white font-medium py-1.5 px-3 rounded-lg hover:bg-slate-900 transition-colors"
          >
            Register Location
          </Link>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 text-xs font-medium mb-3">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>{business?.name || 'Vanilla Spa & Salon'}</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to your workplace</h1>
              <p className="text-xs text-slate-400 mt-1.5">
                Access point-of-sale, appointments, inventory and real-time team schedule
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode('email'); setError(''); }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'email'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('pin'); setError(''); }}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'pin'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Staff Quick PIN
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Email/Password Form */}
            {authMode === 'email' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@business.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    <a href="#reset" onClick={(e) => { e.preventDefault(); alert('Demo environment: Simply click Sign In or choose a 1-Click Demo role below.'); }} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500" />
                    <span>Keep station signed in</span>
                  </label>
                  <span className="text-emerald-400/80 font-medium">SSL 256-Bit Encrypted</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Open Register & Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Staff PIN Keypad */
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-3">Enter your 4-digit station PIN</p>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-11 h-12 rounded-xl border flex items-center justify-center text-lg font-bold transition-all ${
                          pin.length > idx
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-105'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                      >
                        {pin.length > idx ? '●' : ''}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handlePinInput(digit)}
                      className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-base font-semibold border border-slate-800/80 transition-all active:scale-95"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPin('')}
                    className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-800/80 transition-all active:scale-95"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinInput('0')}
                    className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 text-base font-semibold border border-slate-800/80 transition-all active:scale-95"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => setPin(pin.slice(0, -1))}
                    className="h-12 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-medium border border-slate-800/80 transition-all active:scale-95"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            )}

            {/* Quick 1-Click Demo Profiles */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  1-Click Demo Personas
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Instant Access</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('jane@vanillasalon.com', 'password123')}
                  className="p-2 rounded-xl bg-slate-950/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700/50 text-left transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold mb-1 group-hover:scale-110 transition-transform">
                    JD
                  </div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">Jane Doe</div>
                  <div className="text-[10px] text-slate-500 truncate">Owner</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('sarah@vanillasalon.com', 'password123')}
                  className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-700/50 text-left transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold mb-1 group-hover:scale-110 transition-transform">
                    SJ
                  </div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-sky-300 truncate">Sarah J.</div>
                  <div className="text-[10px] text-slate-500 truncate">Front Desk</div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom quick switchers */}
          <div className="mt-4 text-center">
            <Link
              to="/portal"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <span>Looking to schedule an appointment? Open Client Booking Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 text-center sm:flex sm:justify-between text-xs text-slate-500">
        <div>© 2026 LocalOS Enterprise. All rights reserved.</div>
        <div className="mt-2 sm:mt-0 flex justify-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Security Compliance</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Hardware Drivers</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Support Desk</span>
        </div>
      </footer>
    </div>
  );
}
