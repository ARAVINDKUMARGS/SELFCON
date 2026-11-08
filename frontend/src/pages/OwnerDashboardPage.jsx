import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  DollarSign,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  CalendarX,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { adminAPI, propertyAPI, bookingAPI, offerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const { formatPrice } = useUI();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calendar Block Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Owner Reservation / Maintenance');

  // Counter Offer Modal
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const [counterTerms, setCounterTerms] = useState('');

  const fetchDashboard = () => {
    setLoading(true);
    adminAPI
      .getOwnerDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDeleteProperty = async propertyId => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await propertyAPI.deleteProperty(propertyId);
      alert('Property deleted successfully.');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete property.');
    }
  };

  const handleBlockDates = async e => {
    e.preventDefault();
    if (!selectedPropertyId || !blockStart || !blockEnd) return;
    try {
      await propertyAPI.blockDates(selectedPropertyId, {
        startDate: blockStart,
        endDate: blockEnd,
        reason: blockReason
      });
      alert('Dates blocked successfully on property calendar.');
      setIsBlockModalOpen(false);
      setBlockStart('');
      setBlockEnd('');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block dates.');
    }
  };

  const handleOfferResponse = async (offerId, action) => {
    if (action === 'counter') {
      setSelectedOfferId(offerId);
      setIsCounterModalOpen(true);
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this purchase offer?`)) return;

    try {
      await offerAPI.respondToOffer(offerId, { action });
      alert(`Offer ${action}ed successfully.`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update offer.');
    }
  };

  const handleCounterSubmit = async e => {
    e.preventDefault();
    try {
      await offerAPI.respondToOffer(selectedOfferId, {
        action: 'counter',
        counterAmount: parseFloat(counterAmount),
        counterTerms
      });
      alert('Counter-offer sent to buyer!');
      setIsCounterModalOpen(false);
      setCounterAmount('');
      setCounterTerms('');
      fetchDashboard();
    } catch (err) {
      alert('Failed to send counter-offer.');
    }
  };

  if (loading) {
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

  const metrics = data?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Owner & Host Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-100 text-orange-700">
              Host Mode
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your properties, multi-mode pricing, availability calendars, and booking requests.
          </p>
        </div>

        <Link
          to="/properties/create"
          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Listing</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Total Listings</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{metrics.totalListings || 0}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">{metrics.activeListings || 0} Active</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Confirmed Stays</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{metrics.confirmedBookingsCount || 0}</span>
          <span className="text-[11px] text-neutral-400">{metrics.pendingBookings || 0} Pending</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Total Earnings</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">${metrics.totalEarnings?.toLocaleString() || 0}</span>
          <span className="text-[11px] text-neutral-400">Net revenue</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Listing Views</span>
          <span className="text-2xl font-extrabold text-brand-600 mt-1 block">{metrics.totalViews || 0}</span>
          <span className="text-[11px] text-neutral-400">Total impressions</span>
        </div>
        <div className="p-5 bg-white rounded-3xl border border-neutral-200 shadow-soft col-span-2 sm:col-span-1">
          <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Purchase Offers</span>
          <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">{metrics.totalOffers || 0}</span>
          <span className="text-[11px] text-neutral-400">Active inquiries</span>
        </div>
      </div>

      {/* Property Listings Management Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900">Your Properties</h3>
          <span className="text-xs text-neutral-400">{data?.properties?.length || 0} properties registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 uppercase font-bold text-[11px]">
                <th className="p-4">Property</th>
                <th className="p-4">Modes</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">Status</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-slate-700">
              {data?.properties?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-400">
                    You haven't listed any properties yet. Click "Create New Listing" above.
                  </td>
                </tr>
              ) : (
                data?.properties?.map(prop => (
                  <tr key={prop._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.images?.[0]?.url}
                          alt={prop.title}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div>
                          <Link to={`/properties/${prop._id}`} className="font-bold text-slate-900 hover:text-brand-600 line-clamp-1">
                            {prop.title}
                          </Link>
                          <span className="text-neutral-400 text-[11px] block">{prop.location?.city}, {prop.location?.state}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {prop.listingModes?.map(m => (
                          <span key={m} className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-neutral-100">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-900 space-y-0.5">
                      {prop.pricing?.nightly > 0 && <div>${prop.pricing.nightly} / nt</div>}
                      {prop.pricing?.monthly > 0 && <div>${prop.pricing.monthly} / mo</div>}
                      {prop.pricing?.salePrice > 0 && <div className="text-indigo-700">${prop.pricing.salePrice.toLocaleString()}</div>}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        prop.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {prop.status}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-slate-900">{prop.stats?.viewsCount || 0}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPropertyId(prop._id);
                            setIsBlockModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border text-neutral-600 hover:bg-neutral-100"
                          title="Block Dates on Calendar"
                        >
                          <CalendarX className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(prop._id)}
                          className="p-1.5 rounded-lg border text-neutral-600 hover:bg-red-50 hover:text-red-600"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming Buyer Purchase Offers Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <h3 className="font-extrabold text-lg text-slate-900">Received Purchase Offers</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 uppercase font-bold text-[11px]">
                <th className="p-4">Property</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Offer Amount</th>
                <th className="p-4">Financing</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-slate-700">
              {data?.recentOffers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-400">No purchase offers received yet.</td>
                </tr>
              ) : (
                data?.recentOffers?.map(offer => (
                  <tr key={offer._id}>
                    <td className="p-4 font-bold text-slate-900">{offer.property?.title}</td>
                    <td className="p-4">
                      <div>{offer.buyer?.name}</div>
                      <div className="text-neutral-400 text-[10px]">{offer.buyer?.email}</div>
                    </td>
                    <td className="p-4 font-extrabold text-indigo-700 text-sm">
                      ${offer.offerAmount?.toLocaleString()}
                    </td>
                    <td className="p-4 capitalize">{offer.financingType}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {offer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {offer.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOfferResponse(offer._id, 'accept')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOfferResponse(offer._id, 'counter')}
                            className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-bold"
                          >
                            Counter
                          </button>
                          <button
                            onClick={() => handleOfferResponse(offer._id, 'reject')}
                            className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold"
                          >
                            Reject
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

      {/* Calendar Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="font-extrabold text-base text-slate-900">Block Dates on Calendar</h3>
            <form onSubmit={handleBlockDates} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={blockStart}
                  onChange={e => setBlockStart(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={blockEnd}
                  onChange={e => setBlockEnd(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Reason</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Block Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Counter Offer Modal */}
      {isCounterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <h3 className="font-extrabold text-base text-slate-900">Submit Counter-Offer</h3>
            <form onSubmit={handleCounterSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Counter Price ($)</label>
                <input
                  type="number"
                  required
                  value={counterAmount}
                  onChange={e => setCounterAmount(e.target.value)}
                  placeholder="e.g. 1450000"
                  className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Counter Terms</label>
                <textarea
                  rows="3"
                  value={counterTerms}
                  onChange={e => setCounterTerms(e.target.value)}
                  placeholder="Specify closing timeframe or required earnest deposit..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCounterModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Send Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboardPage;

