import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Heart,
  Scale,
  ShieldCheck,
  BedDouble,
  Bath,
  Square,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Flag,
  Sparkles,
  DollarSign,
  X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { propertyAPI, bookingAPI, offerAPI, reviewAPI, userAPI, messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice, toggleComparison, comparisonList } = useUI();

  const [property, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Booking / Offer State
  const [bookingMode, setBookingMode] = useState('stay'); // 'stay', 'rent', 'buy'
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Rental Mode State
  const [leaseMonths, setLeaseMonths] = useState(6);

  // Buy Mode State (Offer Modal)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [financingType, setFinancingType] = useState('cash');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(null);

  // Schedule Visit State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTimeSlot, setVisitTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitSuccess, setVisitSuccess] = useState(null);

  // Review Submission Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('inaccurate_listing');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Direct Message Modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  // Lightbox Modal
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    propertyAPI
      .getPropertyById(id)
      .then(res => {
        const prop = res.data.property;
        setProperties(prop);
        if (prop.listingModes?.length > 0) {
          setBookingMode(prop.listingModes[0]);
        }
        if (prop.pricing?.salePrice) {
          setOfferAmount(prop.pricing.salePrice);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    reviewAPI
      .getReviews(id)
      .then(res => setReviews(res.data.reviews || []))
      .catch(() => {});

    if (isAuthenticated) {
      userAPI
        .getFavorites()
        .then(res => {
          const ids = (res.data.favorites || []).map(f => f._id);
          setIsFavorited(ids.includes(id));
        })
        .catch(() => {});
    }
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-10 bg-neutral-200 rounded-2xl w-1/2" />
        <div className="h-[450px] bg-neutral-200 rounded-3xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <Link to="/properties" className="mt-4 inline-block text-brand-600 font-bold">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save properties to your wishlist.');
      return;
    }
    try {
      const res = await userAPI.toggleFavorite(property._id);
      setIsFavorited(res.data.isFavorited);
    } catch (err) {
      console.error(err);
    }
  };

  // Pricing calculations
  const calculatePricing = () => {
    if (bookingMode === 'stay') {
      if (!checkInDate || !checkOutDate) return null;
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diff <= 0) return null;

      const rate = property.pricing?.nightly || 100;
      const subtotal = rate * diff;
      const cleaningFee = property.pricing?.cleaningFee || 0;
      const serviceFee = Math.round(subtotal * 0.1);
      const securityDeposit = property.pricing?.securityDeposit || 0;
      const total = subtotal + cleaningFee + serviceFee + securityDeposit;

      return { diff, rate, subtotal, cleaningFee, serviceFee, securityDeposit, total };
    } else if (bookingMode === 'rent') {
      const rate = property.pricing?.monthly || 1000;
      const subtotal = rate * leaseMonths;
      const serviceFee = Math.round(rate * 0.1);
      const securityDeposit = property.pricing?.securityDeposit || rate;
      const total = rate + serviceFee + securityDeposit;
      return { leaseMonths, rate, subtotal, serviceFee, securityDeposit, total };
    }
    return null;
  };

  const pricingDetails = calculatePricing();

  // Booking Submission
  const handleBookingSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in or create an account to book this property.');
      navigate('/login');
      return;
    }

    if (bookingMode === 'stay' && (!checkInDate || !checkOutDate)) {
      alert('Please select both check-in and check-out dates.');
      return;
    }

    setBookingLoading(true);
    try {
      let checkIn = checkInDate;
      let checkOut = checkOutDate;

      if (bookingMode === 'rent') {
        const today = new Date();
        checkIn = checkInDate || today.toISOString().split('T')[0];
        const out = new Date(checkIn);
        out.setMonth(out.getMonth() + parseInt(leaseMonths, 10));
        checkOut = out.toISOString().split('T')[0];
      }

      const res = await bookingAPI.createBooking({
        propertyId: property._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        bookingMode,
        guests: { adults: guestsCount, children: 0, pets: 0 },
        specialRequests,
        provider: 'test'
      });

      const { booking, paymentOrder } = res.data;

      const confirmRes = await bookingAPI.confirmPayment(booking._id, {
        orderId: paymentOrder.orderId,
        paymentId: `pay_sim_${Date.now()}`,
        signature: 'sim_sig_verified'
      });

      setBookingSuccess(confirmRes.data.booking);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try different dates.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Submit Purchase Offer
  const handleOfferSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit purchase offers.');
      navigate('/login');
      return;
    }

    setOfferLoading(true);
    try {
      const res = await offerAPI.submitOffer({
        propertyId: property._id,
        offerAmount: parseFloat(offerAmount),
        financingType,
        preApproved: true,
        message: offerMessage
      });
      setOfferSuccess(res.data.offer);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit offer.');
    } finally {
      setOfferLoading(false);
    }
  };

  // Schedule Visit
  const handleVisitSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to schedule a property visit.');
      navigate('/login');
      return;
    }

    try {
      const res = await offerAPI.scheduleVisit({
        propertyId: property._id,
        requestedDate: visitDate,
        timeSlot: visitTimeSlot,
        notes: visitNotes
      });
      setVisitSuccess(res.data.offer);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule visit.');
    }
  };

  // Send Direct Message
  const handleSendMessage = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to contact the host.');
      navigate('/login');
      return;
    }
    if (!messageText.trim()) return;

    setMessageLoading(true);
    try {
      await messageAPI.sendMessage({
        recipientId: property.owner?._id,
        propertyId: property._id,
        text: messageText.trim()
      });
      alert('Message sent successfully to host!');
      setIsMessageModalOpen(false);
      setMessageText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setMessageLoading(false);
    }
  };

  // Submit Review
  const handleReviewSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to leave a review.');
      navigate('/login');
      return;
    }

    setReviewLoading(true);
    try {
      const res = await reviewAPI.addReview(property._id, {
        rating: newRating,
        comment: newReviewComment
      });
      setReviews(prev => [res.data.review, ...prev]);
      setIsReviewModalOpen(false);
      setNewReviewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post review.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Submit Fraud Report
  const handleReportSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to report listings.');
      return;
    }
    try {
      await userAPI.reportProperty({
        propertyId: property._id,
        reason: reportReason,
        details: reportDetails
      });
      setReportSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {property.listingModes?.map(mode => (
              <span
                key={mode}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  mode === 'stay'
                    ? 'bg-orange-100 text-orange-700'
                    : mode === 'rent'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {mode === 'stay' ? 'Short Stay' : mode === 'rent' ? 'Long Rent' : 'For Sale'}
              </span>
            ))}
            {property.isVerified && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Listing</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleComparison(property)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-slate-700 hover:bg-neutral-100 transition-colors"
            >
              <Scale className="w-4 h-4" />
              <span>Compare</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                isFavorited
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'border-neutral-200 text-slate-700 hover:bg-neutral-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              <span>{isFavorited ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2 rounded-xl border border-neutral-200 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 transition-colors"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {property.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-600">
          <div className="flex items-center gap-1 font-bold text-slate-900">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{property.stats?.averageRating || 4.8}</span>
            <span className="text-neutral-400 font-normal">({reviews.length} reviews)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span>{property.location?.address}, {property.location?.city}, {property.location?.state}, {property.location?.country}</span>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden mb-10 h-[380px] sm:h-[480px]">
        <div
          onClick={() => setIsLightboxOpen(true)}
          className="md:col-span-2 relative h-full cursor-pointer overflow-hidden group bg-neutral-100"
        >
          <img
            src={property.images?.[0]?.url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>

        <div className="hidden md:grid col-span-2 grid-cols-2 gap-3 h-full">
          {property.images?.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setIsLightboxOpen(true)}
              className="relative h-full cursor-pointer overflow-hidden group bg-neutral-100"
            >
              <img
                src={img.url}
                alt={`${property.title} ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Details & Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Specs Bar */}
          <div className="p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-soft grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="border-r border-neutral-100 last:border-0">
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block">Bedrooms</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{property.specs?.bedrooms} Beds</span>
            </div>
            <div className="border-r border-neutral-100 last:border-0">
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block">Bathrooms</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{property.specs?.bathrooms} Baths</span>
            </div>
            <div className="border-r border-neutral-100 last:border-0">
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block">Living Area</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{property.specs?.squareFeet} sqft</span>
            </div>
            <div>
              <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider block">Furnishing</span>
              <span className="text-lg font-extrabold text-slate-900 mt-0.5 block capitalize">{property.specs?.furnishing || 'Furnished'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">About this property</h3>
            <p className="text-neutral-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 border-t border-neutral-200 pt-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">What this place offers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-200/70 text-sm font-medium text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host / Owner Profile Card */}
          <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={property.owner?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                alt={property.owner?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">{property.owner?.name || 'SelfCon Partner'}</h4>
                  {property.owner?.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verified Host
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1 max-w-md">{property.owner?.bio || 'Superhost managing luxury residences.'}</p>
              </div>
            </div>

            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white border border-neutral-300 text-slate-800 text-xs font-bold shadow-2xs hover:bg-neutral-100 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>Contact Host</span>
            </button>
          </div>

          {/* Location & Interactive Map */}
          <div className="space-y-4 border-t border-neutral-200 pt-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Location & Neighborhood</h3>
            <p className="text-xs text-neutral-500">{property.location?.address}, {property.location?.city}, {property.location?.state}</p>
            <div className="h-72 rounded-3xl overflow-hidden border border-neutral-200 shadow-soft">
              <MapContainer
                center={[property.location?.coordinates?.lat || 19.076, property.location?.coordinates?.lng || 72.877]}
                zoom={14}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[property.location?.coordinates?.lat || 19.076, property.location?.coordinates?.lng || 72.877]}>
                  <Popup>
                    <div className="font-bold text-xs p-1">{property.title}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-6 border-t border-neutral-200 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {property.stats?.averageRating || 4.8} ({reviews.length} reviews)
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Write a Review
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r._id} className="p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={r.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={r.user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-bold text-xs text-slate-900">{r.user?.name || 'Verified Guest'}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{r.comment}</p>
                  {r.responseFromOwner && (
                    <div className="mt-2 p-2.5 bg-neutral-50 rounded-xl text-xs text-neutral-500 border-l-2 border-brand-500">
                      <span className="font-bold text-slate-800 block mb-0.5">Response from owner:</span>
                      {r.responseFromOwner}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Mode Booking & Offer Widget */}
        <div>
          <div className="sticky top-28 bg-white rounded-3xl border border-neutral-200/80 shadow-elevated p-6 space-y-6">
            <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-xs font-bold">
              {property.listingModes?.includes('stay') && (
                <button
                  onClick={() => setBookingMode('stay')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    bookingMode === 'stay' ? 'bg-stay-500 text-white shadow-xs' : 'text-neutral-600 hover:text-slate-900'
                  }`}
                >
                  Short Stay
                </button>
              )}
              {property.listingModes?.includes('rent') && (
                <button
                  onClick={() => setBookingMode('rent')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    bookingMode === 'rent' ? 'bg-rent-500 text-white shadow-xs' : 'text-neutral-600 hover:text-slate-900'
                  }`}
                >
                  Long Rent
                </button>
              )}
              {property.listingModes?.includes('buy') && (
                <button
                  onClick={() => setBookingMode('buy')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    bookingMode === 'buy' ? 'bg-buy-500 text-white shadow-xs' : 'text-neutral-600 hover:text-slate-900'
                  }`}
                >
                  Purchase
                </button>
              )}
            </div>

            <div>
              {bookingMode === 'stay' && property.pricing?.nightly > 0 && (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatPrice(property.pricing.nightly)}
                  </span>
                  <span className="text-xs text-neutral-400 font-semibold">/ night</span>
                </div>
              )}
              {bookingMode === 'rent' && property.pricing?.monthly > 0 && (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatPrice(property.pricing.monthly)}
                  </span>
                  <span className="text-xs text-neutral-400 font-semibold">/ month</span>
                </div>
              )}
              {bookingMode === 'buy' && property.pricing?.salePrice > 0 && (
                <div>
                  <span className="text-3xl font-extrabold text-indigo-700">
                    {formatPrice(property.pricing.salePrice)}
                  </span>
                  <span className="block text-xs text-neutral-400 font-medium mt-0.5">
                    Est. ${Math.round(property.pricing.salePrice / (property.specs?.squareFeet || 1000))}/sqft
                  </span>
                </div>
              )}
            </div>

            {bookingSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Booking Confirmed!</span>
                </div>
                <p>Order ID: {bookingSuccess._id}</p>
                <Link to="/dashboard/user" className="text-emerald-900 font-bold underline block pt-1">
                  View in My Bookings →
                </Link>
              </div>
            )}

            {(bookingMode === 'stay' || bookingMode === 'rent') && (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingMode === 'stay' ? (
                  <div className="grid grid-cols-2 gap-2 p-2 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase">Check-In</label>
                      <input
                        type="date"
                        required
                        value={checkInDate}
                        onChange={e => setCheckInDate(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="border-l border-neutral-200 pl-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase">Check-Out</label>
                      <input
                        type="date"
                        required
                        value={checkOutDate}
                        onChange={e => setCheckOutDate(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Move-in Date</label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={e => setCheckInDate(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-neutral-200 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">Lease Duration</label>
                      <select
                        value={leaseMonths}
                        onChange={e => setLeaseMonths(e.target.value)}
                        className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-neutral-200 font-semibold text-slate-800 cursor-pointer"
                      >
                        <option value="3">3 Months Lease</option>
                        <option value="6">6 Months Lease</option>
                        <option value="12">12 Months (1 Year Lease)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-7 h-7 rounded-full bg-white border border-neutral-300 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold">{guestsCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.min(property.specs?.maxGuests || 6, guestsCount + 1))}
                      className="w-7 h-7 rounded-full bg-white border border-neutral-300 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {pricingDetails && (
                  <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
                    {bookingMode === 'stay' ? (
                      <>
                        <div className="flex justify-between text-neutral-600">
                          <span>${pricingDetails.rate} x {pricingDetails.diff} nights</span>
                          <span>${pricingDetails.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Cleaning fee</span>
                          <span>${pricingDetails.cleaningFee}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Platform service fee</span>
                          <span>${pricingDetails.serviceFee}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-neutral-600">
                          <span>Monthly rent</span>
                          <span>${pricingDetails.rate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Security deposit (Refundable)</span>
                          <span>${pricingDetails.securityDeposit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                          <span>Platform lease fee</span>
                          <span>${pricingDetails.serviceFee}</span>
                        </div>
                      </>
                    )}

                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                      <span>Total Due Today</span>
                      <span>${pricingDetails.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    bookingMode === 'stay'
                      ? 'bg-stay-500 hover:bg-stay-600 shadow-orange-500/25'
                      : 'bg-rent-500 hover:bg-rent-600 shadow-emerald-500/25'
                  }`}
                >
                  {bookingLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{bookingMode === 'stay' ? 'Instant Book Property' : 'Apply for Rental Lease'}</span>
                  )}
                </button>
              </form>
            )}

            {bookingMode === 'buy' && (
              <div className="space-y-3">
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-extrabold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Submit Purchase Offer</span>
                </button>

                <button
                  onClick={() => setIsVisitModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule In-Person Visit</span>
                </button>

                {offerSuccess && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>Offer Submitted to Seller!</span>
                    </div>
                    <p>Amount: ${offerSuccess.offerAmount?.toLocaleString()}</p>
                    <Link to="/dashboard/user" className="text-indigo-900 font-bold underline block pt-1">
                      Track in Buyer Dashboard →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">Make an Offer to Purchase</h3>
              <button onClick={() => setIsOfferModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Offer Price ($)</label>
                <input
                  type="number"
                  required
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Financing Type</label>
                <select
                  value={financingType}
                  onChange={e => setFinancingType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="cash">All Cash</option>
                  <option value="conventional_mortgage">Conventional Mortgage</option>
                  <option value="fha">FHA Financing</option>
                  <option value="other">Other / Private Financing</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Note to Seller</label>
                <textarea
                  rows="3"
                  value={offerMessage}
                  onChange={e => setOfferMessage(e.target.value)}
                  placeholder="Include any specific contingencies, inspection preferences, or rapid closing timelines..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={offerLoading}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl"
              >
                {offerLoading ? 'Submitting...' : 'Send Formal Offer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Schedule In-Person Property Tour</h3>
              <button onClick={() => setIsVisitModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <form onSubmit={handleVisitSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Time Slot</label>
                <select
                  value={visitTimeSlot}
                  onChange={e => setVisitTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl"
              >
                Request Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Message Host</h3>
              <button onClick={() => setIsMessageModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea
                rows="4"
                required
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Ask about check-in, parking, high-speed WiFi, lease terms, or surrounding neighborhood..."
                className="w-full p-3 border rounded-xl"
              />
              <button
                type="submit"
                disabled={messageLoading}
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl"
              >
                {messageLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Leave a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)}><X className="w-5 h-5 text-neutral-400" /></button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-current' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows="4"
                required
                value={newReviewComment}
                onChange={e => setNewReviewComment(e.target.value)}
                placeholder="Describe your comfort, cleanliness, accuracy, and host communication..."
                className="w-full p-3 border rounded-xl"
              />
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl"
              >
                {reviewLoading ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;

