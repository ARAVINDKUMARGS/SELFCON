import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/dashboard/admin');
      else if (loggedUser.role === 'owner' || loggedUser.role === 'seller') navigate('/dashboard/owner');
      else navigate('/dashboard/user');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo role accounts
  const demoAccounts = [
    { label: 'Admin', email: 'admin@selfcon.com', role: 'admin' },
    { label: 'Property Owner', email: 'owner@selfcon.com', role: 'owner' },
    { label: 'Seller', email: 'seller@selfcon.com', role: 'seller' },
    { label: 'Tenant', email: 'tenant@selfcon.com', role: 'tenant' },
    { label: 'Buyer', email: 'buyer@selfcon.com', role: 'buyer' },
    { label: 'Guest', email: 'guest@selfcon.com', role: 'guest' }
  ];

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">SELFCON</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-neutral-500">Sign in to access your properties, bookings & offers.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-600 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="pt-4 border-t border-neutral-100">
          <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center mb-2.5">
            1-Click Demo Roles
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            {demoAccounts.map(demo => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleDemoLogin(demo.email)}
                className="p-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border text-neutral-700 font-semibold"
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

