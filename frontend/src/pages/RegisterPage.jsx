import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant'); // 'guest', 'tenant', 'buyer', 'owner', 'seller'
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await register({ name, email, password, role, phone });
      if (newUser.role === 'owner' || newUser.role === 'seller') navigate('/dashboard/owner');
      else navigate('/dashboard/user');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    { id: 'tenant', title: 'Tenant', desc: 'Looking for monthly rentals' },
    { id: 'guest', title: 'Guest', desc: 'Short vacation stays' },
    { id: 'buyer', title: 'Buyer', desc: 'Purchasing properties' },
    { id: 'owner', title: 'Property Owner', desc: 'Rent or host homes' },
    { id: 'seller', title: 'Seller', desc: 'Sell properties directly' }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">SELFCON</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-xs text-neutral-500">Join the unified real estate community powered by AI.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role Selector Pills */}
          <div>
            <label className="block font-bold text-neutral-600 uppercase mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roleCards.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === r.id
                      ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-2xs font-bold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="text-xs">{r.title}</div>
                  <div className="text-[10px] text-neutral-400 font-normal leading-tight mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

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
            <label className="block font-bold text-neutral-600 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 555-0199"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-600 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

