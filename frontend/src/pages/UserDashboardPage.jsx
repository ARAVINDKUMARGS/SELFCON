import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Calendar,
  Heart,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Settings,
  Sparkles,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { userAPI, bookingAPI, offerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const UserDashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const { formatPrice, openAiWithPrompt } = useUI();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'offers', 'saved', 'settings'
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileMsg, setProfileMsg] = useState('');

  const fetchDashboard = () => {
    setLoading(true);
    userAPI
      .getDashboard()
      .then(res => setDashboardData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCancelBooking = async bookingId => {
    if (!confirm('Are you sure you want to cancel this booking? Refund policy will apply.')) return;
    try {
      await bookingAPI.cancelBooking(bookingId, 'Requested by tenant');
      alert('Booking cancelled successfully.');
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleUpdateProfile = async e => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone, bio });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-neutral-200 gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-neutral-100 text-slate-700">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-4 text-center">
          <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs min-w-24">
            <span className="text-xs text-neutral-400 font-bold uppercase">Bookings</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {dashboardData?.totalBookings || 0}
            </span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs min-w-24">
            <span className="text-xs text-neutral-400 font-bold uppercase">Offers</span>
            <span className="text-xl font-extrabold text-indigo-700 block mt-0.5">
              {dashboardData?.totalOffers || 0}
            </span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs min-w-24">
            <span className="text-xs text-neutral-400 font-bold uppercase">Wishlist</span>
            <span className="text-xl font-extrabold text-rose-600 block mt-0.5">
              {dashboardData?.savedPropertiesCount || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 mt-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          My Bookings ({dashboardData?.bookings?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'offers'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          Submitted Purchase Offers ({dashboardData?.offers?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          Saved Properties ({dashboardData?.favorites?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-neutral-500 hover:text-slate-900'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-8">
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {dashboardData?.bookings?.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 bg-white rounded-3xl border border-neutral-200">
                <Calendar className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                <p className="text-sm font-semibold">No bookings recorded yet.</p>
                <Link to="/properties" className="text-brand-600 text-xs font-bold mt-2 inline-block">
                  Explore Short Stays & Rentals →
                </Link>
              </div>
            ) : (
              dashboardData?.bookings?.map(b => (
                <div
                  key={b._id}
                  className="p-5 bg-white rounded-3xl border border-neutral-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={b.property?.images?.[0]?.url}
                      alt={b.property?.title}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs text-neutral-400 capitalize">Mode: {b.bookingMode}</span>
                      </div>
                      <Link to={`/properties/${b.property?._id}`}>
                        <h4 className="font-bold text-slate-900 text-base hover:text-brand-600 transition-colors mt-1">
                          {b.property?.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {new Date(b.checkInDate).toLocaleDateString()} — {new Date(b.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:text-right">
                    <div>
                      <span className="text-xs text-neutral-400 block font-semibold">Total Paid</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ${b.pricing?.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-4">
            {dashboardData?.offers?.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 bg-white rounded-3xl border border-neutral-200">
                <DollarSign className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                <p className="text-sm font-semibold">No purchase offers submitted yet.</p>
                <Link to="/properties?mode=buy" className="text-brand-600 text-xs font-bold mt-2 inline-block">
                  Browse Properties For Sale →
                </Link>
              </div>
            ) : (
              dashboardData?.offers?.map(offer => (
                <div
                  key={offer._id}
                  className="p-5 bg-white rounded-3xl border border-neutral-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={offer.property?.images?.[0]?.url}
                      alt={offer.property?.title}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          offer.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : offer.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : offer.status === 'countered'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          Status: {offer.status}
                        </span>
                        <span className="text-xs text-neutral-400 capitalize">Financing: {offer.financingType}</span>
                      </div>
                      <Link to={`/properties/${offer.property?._id}`}>
                        <h4 className="font-bold text-slate-900 text-base hover:text-brand-600 transition-colors mt-1">
                          {offer.property?.title}
                        </h4>
                      </Link>
                      {offer.scheduledVisit?.status !== 'none' && (
                        <p className="text-xs text-brand-700 font-semibold mt-0.5">
                          Tour: {new Date(offer.scheduledVisit?.requestedDate).toLocaleDateString()} ({offer.scheduledVisit?.timeSlot}) - {offer.scheduledVisit?.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block font-semibold">Offer Amount</span>
                    <span className="text-xl font-extrabold text-indigo-700">
                      ${offer.offerAmount?.toLocaleString()}
                    </span>
                    {offer.counterOffer?.amount && (
                      <span className="block text-xs text-amber-600 font-bold mt-0.5">
                        Counter: ${offer.counterOffer.amount?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData?.favorites?.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-neutral-400 bg-white rounded-3xl border border-neutral-200">
                <Heart className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                <p className="text-sm font-semibold">Your wishlist is currently empty.</p>
              </div>
            ) : (
              dashboardData?.favorites?.map(prop => (
                <div key={prop._id} className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-soft">
                  <img src={prop.images?.[0]?.url} alt={prop.title} className="w-full h-44 object-cover" />
                  <div className="p-4 space-y-2">
                    <Link to={`/properties/${prop._id}`}>
                      <h4 className="font-bold text-sm text-slate-900 hover:text-brand-600 line-clamp-1">{prop.title}</h4>
                    </Link>
                    <p className="text-xs text-neutral-500">{prop.location?.city}</p>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">
                        {prop.pricing?.nightly ? `${formatPrice(prop.pricing.nightly)}/nt` : formatPrice(prop.pricing?.monthly || prop.pricing?.salePrice)}
                      </span>
                      <Link to={`/properties/${prop._id}`} className="text-xs font-bold text-brand-600">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-soft">
            <h3 className="font-extrabold text-lg text-slate-900 mb-4">Edit Profile Information</h3>
            {profileMsg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold mb-4">{profileMsg}</div>}
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;

