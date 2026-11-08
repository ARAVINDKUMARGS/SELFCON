import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'reports'
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getUsers({ search: userSearch }),
      adminAPI.getReports()
    ])
      .then(([statsRes, usersRes, reportsRes]) => {
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
        setReports(reportsRes.data.reports);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, [userSearch]);

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      alert(`User role updated to ${newRole}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  const handleToggleUserVerification = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { verified: !currentStatus });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update verification status.');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      await adminAPI.resolveReport(reportId, { status, resolutionNotes: 'Reviewed by administrator' });
      alert(`Report marked as ${status}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to resolve report.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-10 bg-neutral-200 rounded-2xl w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-neutral-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Operations Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800">
              Root Access
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Platform governance, user verification, listing moderation, and trust & safety reporting.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Total Users</span>
          <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{stats?.totalUsers || 0}</span>
          <span className="text-[11px] text-neutral-400">Registered across 6 roles</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Marketplace Listings</span>
          <span className="text-3xl font-extrabold text-brand-600 mt-1 block">{stats?.totalProperties || 0}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{stats?.pendingProperties || 0} pending review</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Total Bookings</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{stats?.totalBookings || 0}</span>
          <span className="text-[11px] text-neutral-400">{stats?.totalOffers || 0} purchase offers</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Platform GMV</span>
          <span className="text-3xl font-extrabold text-indigo-700 mt-1 block">${stats?.totalGMV?.toLocaleString() || 0}</span>
          <span className="text-[11px] text-neutral-400">Total transaction volume</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          Trust & Safety Reports ({reports.length})
        </button>
      </div>

      {/* Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Distribution by Role */}
          <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-soft">
            <h3 className="font-extrabold text-base text-slate-900 mb-4">Users by Role</h3>
            <div className="space-y-3">
              {(stats?.usersByRole || []).map(r => (
                <div key={r._id} className="flex items-center justify-between text-xs">
                  <span className="capitalize font-bold text-slate-700">{r._id}</span>
                  <span className="px-2.5 py-1 rounded-full bg-neutral-100 font-extrabold text-slate-900">
                    {r.count} users
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Listing Distribution by Mode */}
          <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-soft">
            <h3 className="font-extrabold text-base text-slate-900 mb-4">Listings by Mode</h3>
            <div className="space-y-3">
              {(stats?.propertiesByMode || []).map(m => (
                <div key={m._id} className="flex items-center justify-between text-xs">
                  <span className="capitalize font-bold text-slate-700">
                    {m._id === 'stay' ? 'Short Stay' : m._id === 'rent' ? 'Long Rent' : 'For Sale'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-extrabold">
                    {m.count} properties
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="px-3.5 py-2 bg-neutral-50 border rounded-xl text-xs w-72 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 uppercase font-bold text-[11px]">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-slate-700">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-neutral-400 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={e => handleUpdateUserRole(u._id, e.target.value)}
                        className="px-2.5 py-1 border rounded-lg text-xs font-bold capitalize cursor-pointer"
                      >
                        {['guest', 'tenant', 'buyer', 'owner', 'seller', 'admin'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">{u.phone || '—'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleUserVerification(u._id, u.verified)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {u.verified ? 'Verified ✓' : 'Unverified'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-[11px] text-neutral-400">ID: {u._id.slice(-6)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="font-extrabold text-base text-slate-900">Fraud & Safety Moderation</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 uppercase font-bold text-[11px]">
                  <th className="p-4">Property</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-slate-700">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-neutral-400">
                      No reports currently submitted.
                    </td>
                  </tr>
                ) : (
                  reports.map(rep => (
                    <tr key={rep._id}>
                      <td className="p-4 font-bold text-slate-900">{rep.property?.title}</td>
                      <td className="p-4">{rep.reporter?.name}</td>
                      <td className="p-4 capitalize font-semibold text-rose-700">{rep.reason?.replace(/_/g, ' ')}</td>
                      <td className="p-4 max-w-xs truncate">{rep.details}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {rep.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveReport(rep._id, 'resolved')}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep._id, 'dismissed')}
                              className="px-2.5 py-1 bg-neutral-200 text-slate-700 rounded-lg font-bold"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

