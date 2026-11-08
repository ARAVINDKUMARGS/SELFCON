import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, BedDouble, Bath, Square, Scale, Sparkles } from 'lucide-react';
import { propertyAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const { isAuthenticated } = useAuth();
  const { formatPrice, toggleComparison, comparisonList } = useUI();

  useEffect(() => {
    propertyAPI
      .getFeatured()
      .then(res => {
        setProperties(res.data.properties || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      userAPI
        .getFavorites()
        .then(res => {
          const ids = new Set((res.data.favorites || []).map(f => f._id));
          setFavorites(ids);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleToggleFavorite = async (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to save properties to your wishlist.');
      return;
    }

    try {
      const res = await userAPI.toggleFavorite(propertyId);
      setFavorites(prev => {
        const next = new Set(prev);
        if (res.data.isFavorited) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const modeBadge = mode => {
    switch (mode) {
      case 'stay':
        return <span key={mode} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">Stay</span>;
      case 'rent':
        return <span key={mode} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">Rent</span>;
      case 'buy':
        return <span key={mode} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">Buy</span>;
      default:
        return null;
    }
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Curated Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Featured Comfort Living
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Hand-picked short-stay villas, executive rental apartments, and premium properties for sale.
          </p>
        </div>
        <Link
          to="/properties"
          className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          <span>Explore All Properties</span>
          <span>→</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-3xl p-3 border border-neutral-200 animate-pulse space-y-3">
              <div className="h-52 bg-neutral-200 rounded-2xl" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">No featured properties currently available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map(property => {
            const isFav = favorites.has(property._id);
            const isCompared = comparisonList.some(p => p._id === property._id);

            return (
              <div
                key={property._id}
                className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image & Action Overlay */}
                  <div className="relative h-56 overflow-hidden bg-neutral-100">
                    <img
                      src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Mode Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {property.listingModes?.map(mode => modeBadge(mode))}
                    </div>

                    {/* Top Action Buttons (Favorite + Compare) */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleComparison(property);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition-all ${
                          isCompared
                            ? 'bg-brand-600 text-white shadow-md'
                            : 'bg-white/80 text-slate-700 hover:bg-white'
                        }`}
                        title="Compare property specs"
                      >
                        <Scale className="w-4 h-4" />
                      </button>

                      <button
                        onClick={e => handleToggleFavorite(e, property._id)}
                        className={`p-2 rounded-full backdrop-blur-md transition-all ${
                          isFav
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
                        }`}
                        title={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    {/* Superhost / Verified Pill */}
                    {property.isVerified && (
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        Verified Listing
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="capitalize font-semibold text-slate-700">{property.propertyType}</span>
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{property.stats?.averageRating || 4.8}</span>
                        <span className="text-neutral-400 font-normal">({property.stats?.reviewsCount || 0})</span>
                      </div>
                    </div>

                    <Link to={`/properties/${property._id}`}>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                      <span className="truncate">{property.location?.city}, {property.location?.state || property.location?.country}</span>
                    </p>

                    {/* Specs strip */}
                    <div className="flex items-center gap-3 pt-2 text-xs text-neutral-600 border-t border-neutral-100">
                      <div className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{property.specs?.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{property.specs?.bathrooms} Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{property.specs?.squareFeet} sqft</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      {property.listingModes?.includes('stay') && property.pricing?.nightly > 0 && (
                        <div>
                          <span className="text-base font-extrabold text-slate-900">{formatPrice(property.pricing.nightly)}</span>
                          <span className="text-xs text-neutral-400"> / night</span>
                        </div>
                      )}
                      {property.listingModes?.includes('rent') && property.pricing?.monthly > 0 && (
                        <div>
                          <span className="text-base font-extrabold text-slate-900">{formatPrice(property.pricing.monthly)}</span>
                          <span className="text-xs text-neutral-400"> / mo</span>
                        </div>
                      )}
                      {property.listingModes?.includes('buy') && property.pricing?.salePrice > 0 && (
                        <div>
                          <span className="text-base font-extrabold text-indigo-700">{formatPrice(property.pricing.salePrice)}</span>
                          <span className="text-xs text-neutral-400"> Sale</span>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/properties/${property._id}`}
                      className="px-4 py-2 rounded-xl bg-neutral-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white text-xs font-bold transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FeaturedProperties;

