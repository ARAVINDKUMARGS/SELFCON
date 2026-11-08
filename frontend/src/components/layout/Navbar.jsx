import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  User,
  Heart,
  Calendar,
  MessageSquare,
  Shield,
  Layers,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Bell,
  Scale
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { notificationAPI } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout, switchRole, role } = useAuth();
  const { currency, setCurrency, openAiWithPrompt, comparisonList } = useUI();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      notificationAPI
        .getNotifications()
        .then(res => {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = async newRole => {
    try {
      await switchRole(newRole);
      setUserMenuOpen(false);
      // Navigate to respective dashboard
      if (newRole === 'admin') navigate('/dashboard/admin');
      else if (newRole === 'owner' || newRole === 'seller') navigate('/dashboard/owner');
      else navigate('/dashboard/user');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const roleColors = {
    guest: 'bg-stone-100 text-stone-700',
    tenant: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    buyer: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    owner: 'bg-orange-50 text-orange-700 border border-orange-200',
    seller: 'bg-purple-50 text-purple-700 border border-purple-200',
    admin: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-brand-700 bg-clip-text text-transparent">
                SELFCON
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                Real Estate Redefined
              </span>
            </div>
          </Link>

          {/* Center Navigation - Stay, Rent, Buy Mode Tabs */}
          <nav className="hidden md:flex items-center bg-neutral-100/90 p-1 rounded-full border border-neutral-200/60 shadow-inner">
            <Link
              to="/properties?mode=stay"
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                location.search.includes('mode=stay')
                  ? 'bg-white text-stay-600 shadow-sm'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Short Stay
            </Link>
            <Link
              to="/properties?mode=rent"
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                location.search.includes('mode=rent')
                  ? 'bg-white text-rent-600 shadow-sm'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              Long Rent
            </Link>
            <Link
              to="/properties?mode=buy"
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                location.search.includes('mode=buy')
                  ? 'bg-white text-buy-600 shadow-sm'
                  : 'text-neutral-600 hover:text-slate-900'
              }`}
            >
              For Sale
            </Link>
          </nav>

          {/* Right Action Icons & User Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            {/* SelfCon AI Assistant Pill */}
            <button
              onClick={() => openAiWithPrompt()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/25 hover:scale-[1.02] transition-all duration-200 animate-glow"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SelfCon AI</span>
            </button>

            {/* Currency Selector */}
            <div className="flex bg-neutral-100 rounded-lg p-0.5 text-xs font-semibold text-neutral-600">
              {['USD', 'INR', 'EUR'].map(curr => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    currency === curr ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Property Comparison Counter */}
            {comparisonList.length > 0 && (
              <Link
                to="/compare"
                className="relative p-2.5 rounded-full bg-neutral-100 text-slate-700 hover:bg-neutral-200 transition-colors"
                title="Compare Properties"
              >
                <Scale className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {comparisonList.length}
                </span>
              </Link>
            )}

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 rounded-full bg-neutral-100 text-slate-700 hover:bg-neutral-200 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Flyout */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-neutral-100">
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-50">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-neutral-400">No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            className={`p-3 text-xs transition-colors ${
                              n.isRead ? 'bg-white' : 'bg-brand-50/50'
                            }`}
                          >
                            <div className="font-semibold text-slate-900">{n.title}</div>
                            <p className="text-neutral-600 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-neutral-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-neutral-200 hover:shadow-md transition-all duration-150"
                >
                  {/* Current Active Role Badge */}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[role] || 'bg-stone-100'}`}>
                    {role}
                  </span>
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                  />
                  <ChevronDown className="w-4 h-4 text-neutral-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-3 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <div className="font-bold text-slate-900 truncate">{user?.name}</div>
                      <div className="text-xs text-neutral-400 truncate">{user?.email}</div>
                    </div>

                    {/* Switch Role Section */}
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Switch Platform Role
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        {['guest', 'tenant', 'buyer', 'owner', 'seller', 'admin'].map(r => (
                          <button
                            key={r}
                            onClick={() => handleRoleChange(r)}
                            className={`px-2 py-1 text-xs rounded-md capitalize font-medium transition-all ${
                              role === r
                                ? 'bg-slate-900 text-white font-bold'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1 text-sm">
                      <Link
                        to="/dashboard/user"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                      >
                        <User className="w-4 h-4 text-neutral-400" />
                        <span>User Dashboard</span>
                      </Link>

                      {(role === 'owner' || role === 'seller' || role === 'admin') && (
                        <Link
                          to="/dashboard/owner"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                        >
                          <Layers className="w-4 h-4 text-orange-500" />
                          <span>Owner Dashboard</span>
                        </Link>
                      )}

                      {role === 'admin' && (
                        <Link
                          to="/dashboard/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                        >
                          <Shield className="w-4 h-4 text-rose-500" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to="/messages"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                      >
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                        <span>Messages</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
                      >
                        <Heart className="w-4 h-4 text-neutral-400" />
                        <span>Saved Properties</span>
                      </Link>
                    </div>

                    <div className="border-t border-neutral-100 pt-2 px-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => openAiWithPrompt()}
              className="p-2 rounded-full bg-brand-600 text-white"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Link
              to="/properties?mode=stay"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 bg-neutral-100 rounded-lg text-xs font-semibold text-stay-600"
            >
              Short Stay
            </Link>
            <Link
              to="/properties?mode=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 bg-neutral-100 rounded-lg text-xs font-semibold text-rent-600"
            >
              Long Rent
            </Link>
            <Link
              to="/properties?mode=buy"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 bg-neutral-100 rounded-lg text-xs font-semibold text-buy-600"
            >
              For Sale
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{user?.name}</div>
                  <span className="text-xs text-neutral-400 capitalize">Role: {role}</span>
                </div>
              </div>
              <Link
                to="/dashboard/user"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-neutral-700"
              >
                User Dashboard
              </Link>
              <Link
                to="/dashboard/owner"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-neutral-700"
              >
                Owner Portal
              </Link>
              {role === 'admin' && (
                <Link
                  to="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-rose-600"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 text-sm text-red-600 font-semibold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-neutral-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg border border-neutral-300 text-sm font-semibold"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

