import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  Scale,
  Sliders,
  Map as MapIcon,
  Grid,
  X,
  Sparkles,
  BedDouble,
  Bath,
  Square
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { propertyAPI, userAPI } from '../services/api';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

// Fix Leaflet default icon path in bundler safely
try {
  const Leaflet = L?.default || L;
  if (Leaflet?.Icon?.Default) {
    delete Leaflet.Icon.Default.prototype._getIconUrl;
    Leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
} catch (e) {
  // ignore
}

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [favorites, setFavorites] = useState(new Set());
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters State
  const [mode, setMode] = useState(searchParams.get('mode') || '');
  const [location, setLocation] = useState(searchParams.get('location') || searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sort, setSort] = useState('newest');

  const { formatPrice, toggleComparison, comparisonList, openAiWithPrompt } = useUI();
  const { isAuthenticated } = useAuth();

  const amenityOptions = [
    'High-Speed WiFi',
    'Swimming Pool',
    'Gym / Fitness Center',
    'Air Conditioning',
    'Dedicated Workspace',
    'Balcony / Patio',
    'Kitchen',
    'Free Parking',
    'Pet Friendly',
    'Security 24/7'
  ];

  const fetchProperties = () => {
    setLoading(true);
    const params = {};
    if (mode) params.mode = mode;
    if (location) params.location = location;
    if (propertyType) params.propertyType = propertyType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (bedrooms) params.bedrooms = bedrooms;
    if (bathrooms) params.bathrooms = bathrooms;
    if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');
    if (sort) params.sort = sort;

    propertyAPI
      .getProperties(params)
      .then(res => setProperties(res.data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, [mode, propertyType, sort]);

  useEffect(() => {
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

  const handleApplyFilters = e => {
    e.preventDefault();
    fetchProperties();
    setShowFiltersMobile(false);
  };

  const handleResetFilters = () => {
    setMode('');
    setLocation('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setSelectedAmenities([]);
    setSort('newest');
    setSearchParams({});
    propertyAPI.getProperties().then(res => setProperties(res.data.properties || []));
  };

  const toggleAmenity = item => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Mode Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Property Marketplace</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Browse verified short stays, residential rentals, and properties for sale.
          </p>
        </div>

        {/* View Mode & AI Button */}
        <div className="flex items-center gap-3">
          {/* Mode Pill Toggle */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-xs font-bold text-slate-700">
            <button
              onClick={() => setMode('')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                !mode ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMode('stay')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === 'stay' ? 'bg-stay-500 text-white shadow-xs' : 'hover:text-stay-600'
              }`}
            >
              Stays
            </button>
            <button
              onClick={() => setMode('rent')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === 'rent' ? 'bg-rent-500 text-white shadow-xs' : 'hover:text-rent-600'
              }`}
            >
              Rentals
            </button>
            <button
              onClick={() => setMode('buy')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === 'buy' ? 'bg-buy-500 text-white shadow-xs' : 'hover:text-buy-600'
              }`}
            >
              For Sale
            </button>
          </div>

          {/* Grid vs Map Toggle */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
              title="Interactive Map Discovery"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          {/* AI Discovery Launcher */}
          <button
            onClick={() => openAiWithPrompt()}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Discover</span>
          </button>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden p-2 rounded-2xl bg-neutral-100 border border-neutral-200 text-slate-700"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Properties Grid/Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* Filters Sidebar */}
        <aside
          className={`lg:block ${
            showFiltersMobile
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
              : 'hidden'
          } lg:relative lg:p-0 bg-white lg:bg-transparent rounded-3xl`}
        >
          {showFiltersMobile && (
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6 lg:hidden">
              <h3 className="font-extrabold text-lg text-slate-900">Refine Filters</h3>
              <button onClick={() => setShowFiltersMobile(false)}>
                <X className="w-6 h-6 text-neutral-500" />
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                <span>Filters</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-neutral-400 hover:text-brand-600"
              >
                Reset All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-5 text-sm">
              {/* Location Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, Goa, New York"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="">All Property Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="house">House</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Price Range ($)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min Price"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max Price"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={e => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="">Any</option>
                    <option value="1">1+ Bed</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={e => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="">Any</option>
                    <option value="1">1+ Bath</option>
                    <option value="2">2+ Baths</option>
                    <option value="3">3+ Baths</option>
                  </select>
                </div>
              </div>

              {/* Amenities Checklist */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                  Amenities
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {amenityOptions.map(item => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(item)}
                        onChange={() => toggleAmenity(item)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">
                  Sort Results
                </label>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </aside>

        {/* Properties Display (3 cols) */}
        <main className="lg:col-span-3">
          {/* Active Results Summary */}
          <div className="flex items-center justify-between mb-6 text-xs text-neutral-500">
            <span>
              Showing <strong className="text-slate-900">{properties.length}</strong> verified properties
            </span>
            {comparisonList.length > 0 && (
              <Link
                to="/compare"
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare {comparisonList.length} properties</span>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white rounded-3xl p-3 border border-neutral-200 animate-pulse space-y-3">
                  <div className="h-48 bg-neutral-200 rounded-2xl" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No properties match your exact filters</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try widening your price range, clearing amenities, or ask SelfCon AI to suggest smart alternatives.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => {
                const isFav = favorites.has(property._id);
                const isCompared = comparisonList.some(p => p._id === property._id);

                return (
                  <div
                    key={property._id}
                    className="group bg-white rounded-3xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-52 overflow-hidden bg-neutral-100">
                        <img
                          src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Mode Badges */}
                        <div className="absolute top-3 left-3 flex gap-1">
                          {property.listingModes?.map(m => (
                            <span
                              key={m}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                m === 'stay'
                                  ? 'bg-orange-100 text-orange-700'
                                  : m === 'rent'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        {/* Top Action Buttons */}
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
                            title="Compare"
                          >
                            <Scale className="w-3.5 h-3.5" />
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
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="capitalize font-semibold text-slate-700">{property.propertyType}</span>
                          <div className="flex items-center gap-1 text-slate-900 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{property.stats?.averageRating || 4.8}</span>
                          </div>
                        </div>

                        <Link to={`/properties/${property._id}`}>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
                            {property.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                          <span className="truncate">{property.location?.city}, {property.location?.state}</span>
                        </p>

                        {/* Specs */}
                        <div className="flex items-center gap-3 pt-2 text-xs text-neutral-500 border-t border-neutral-100">
                          <span>{property.specs?.bedrooms} Beds</span>
                          <span>•</span>
                          <span>{property.specs?.bathrooms} Baths</span>
                          <span>•</span>
                          <span>{property.specs?.squareFeet} sqft</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing */}
                    <div className="p-4 pt-0">
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          {property.listingModes?.includes('stay') && property.pricing?.nightly > 0 && (
                            <div>
                              <span className="text-sm font-extrabold text-slate-900">{formatPrice(property.pricing.nightly)}</span>
                              <span className="text-[11px] text-neutral-400"> / night</span>
                            </div>
                          )}
                          {property.listingModes?.includes('rent') && property.pricing?.monthly > 0 && (
                            <div>
                              <span className="text-sm font-extrabold text-slate-900">{formatPrice(property.pricing.monthly)}</span>
                              <span className="text-[11px] text-neutral-400"> / mo</span>
                            </div>
                          )}
                          {property.listingModes?.includes('buy') && property.pricing?.salePrice > 0 && (
                            <div>
                              <span className="text-sm font-extrabold text-indigo-700">{formatPrice(property.pricing.salePrice)}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/properties/${property._id}`}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white text-xs font-bold transition-all"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Interactive Map Discovery View */
            <div className="h-[650px] w-full rounded-3xl overflow-hidden border border-neutral-200/80 shadow-soft">
              <MapContainer
                center={[19.0760, 72.8777]} // Default view around Mumbai / India
                zoom={5}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {properties.map(prop => {
                  const lat = prop.location?.coordinates?.lat;
                  const lng = prop.location?.coordinates?.lng;
                  if (!lat || !lng) return null;

                  return (
                    <Marker key={prop._id} position={[lat, lng]}>
                      <Popup>
                        <div className="w-56 p-2 space-y-2">
                          <img
                            src={prop.images?.[0]?.url}
                            alt={prop.title}
                            className="w-full h-28 object-cover rounded-xl"
                          />
                          <div className="font-bold text-xs text-slate-900 line-clamp-1">{prop.title}</div>
                          <div className="text-[11px] text-neutral-500">{prop.location?.city}</div>
                          <div className="font-extrabold text-xs text-brand-700">
                            {prop.pricing?.nightly ? `${formatPrice(prop.pricing.nightly)}/nt` : formatPrice(prop.pricing.monthly || prop.pricing.salePrice)}
                          </div>
                          <Link
                            to={`/properties/${prop._id}`}
                            className="block text-center w-full py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg mt-1"
                          >
                            Explore Property
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PropertiesPage;

