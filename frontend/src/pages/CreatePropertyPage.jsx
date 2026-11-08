import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Check, AlertCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { propertyAPI, uploadAPI } from '../services/api';

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingModes, setListingModes] = useState(['stay']); // 'stay', 'rent', 'buy'
  const [propertyType, setPropertyType] = useState('apartment');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [lat, setLat] = useState('19.0760');
  const [lng, setLng] = useState('72.8777');

  // Specs
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [squareFeet, setSquareFeet] = useState(1200);
  const [maxGuests, setMaxGuests] = useState(4);
  const [furnishing, setFurnishing] = useState('furnished');

  // Pricing
  const [nightly, setNightly] = useState('');
  const [monthly, setMonthly] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [cleaningFee, setCleaningFee] = useState(50);
  const [securityDeposit, setSecurityDeposit] = useState(200);

  // Amenities
  const availableAmenities = [
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
  const [selectedAmenities, setSelectedAmenities] = useState([
    'High-Speed WiFi',
    'Air Conditioning',
    'Kitchen'
  ]);

  // Images (URLs)
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      isPrimary: true
    }
  ]);

  const toggleMode = mode => {
    setListingModes(prev => {
      if (prev.includes(mode)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(m => m !== mode);
      }
      return [...prev, mode];
    });
  };

  const toggleAmenity = item => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleAddImageUrl = e => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setImages(prev => [...prev, { url: imageUrl.trim(), isPrimary: prev.length === 0 }]);
      setImageUrl('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (listingModes.length === 0) {
      setError('Please select at least one listing mode (Stay, Rent, or Buy).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        listingModes,
        propertyType,
        location: {
          address,
          city,
          state,
          country,
          coordinates: { lat: parseFloat(lat) || 19.076, lng: parseFloat(lng) || 72.877 }
        },
        specs: {
          bedrooms: parseInt(bedrooms, 10),
          bathrooms: parseInt(bathrooms, 10),
          squareFeet: parseInt(squareFeet, 10),
          maxGuests: parseInt(maxGuests, 10),
          furnishing
        },
        pricing: {
          nightly: parseFloat(nightly) || 0,
          monthly: parseFloat(monthly) || 0,
          salePrice: parseFloat(salePrice) || 0,
          cleaningFee: parseFloat(cleaningFee) || 0,
          securityDeposit: parseFloat(securityDeposit) || 0,
          currency: 'USD'
        },
        amenities: selectedAmenities,
        images
      };

      await propertyAPI.createProperty(payload);
      alert('Property published successfully!');
      navigate('/dashboard/owner');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Property Listing</h1>
        <p className="text-xs text-neutral-500 mt-1 mb-6">
          Publish your residence for short-term stays, long rentals, or sale.
        </p>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Listing Modes Toggle */}
          <div>
            <label className="block font-bold text-neutral-600 uppercase mb-2">
              Listing Modes (Select all that apply)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'stay', label: 'Short-Term Stay (Nightly)', color: 'border-orange-500 bg-orange-50 text-orange-800' },
                { id: 'rent', label: 'Long-Term Rental (Monthly)', color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                { id: 'buy', label: 'For Sale (Purchase)', color: 'border-indigo-500 bg-indigo-50 text-indigo-800' }
              ].map(m => {
                const active = listingModes.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMode(m.id)}
                    className={`p-3.5 rounded-2xl border-2 text-center font-bold transition-all ${
                      active ? m.color : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Basic Information</h3>
            <div>
              <label className="block font-bold text-neutral-600 uppercase mb-1">Property Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Skyline Haven High-Rise Penthouse"
                className="w-full px-3 py-2.5 border rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-600 uppercase mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl font-semibold cursor-pointer"
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="penthouse">Penthouse</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-neutral-600 uppercase mb-1">Description</label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Highlight views, high-speed WiFi, proximity to attractions or business hubs, amenities..."
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 14 Cliffside Road"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Mumbai, Goa, Bangalore"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">State / Region</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Bathrooms</label>
                <input
                  type="number"
                  min="1"
                  value={bathrooms}
                  onChange={e => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Square Feet</label>
                <input
                  type="number"
                  min="100"
                  value={squareFeet}
                  onChange={e => setSquareFeet(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-neutral-600 uppercase mb-1">Max Guests</label>
                <input
                  type="number"
                  min="1"
                  value={maxGuests}
                  onChange={e => setMaxGuests(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Pricing Setup ($)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {listingModes.includes('stay') && (
                <div>
                  <label className="block font-bold text-orange-700 uppercase mb-1">Nightly Rate ($)</label>
                  <input
                    type="number"
                    value={nightly}
                    onChange={e => setNightly(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              )}
              {listingModes.includes('rent') && (
                <div>
                  <label className="block font-bold text-emerald-700 uppercase mb-1">Monthly Rent ($)</label>
                  <input
                    type="number"
                    value={monthly}
                    onChange={e => setMonthly(e.target.value)}
                    placeholder="e.g. 2200"
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              )}
              {listingModes.includes('buy') && (
                <div>
                  <label className="block font-bold text-indigo-700 uppercase mb-1">Asking Sale Price ($)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    placeholder="e.g. 850000"
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map(item => {
                const checked = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      checked
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {checked ? `✓ ${item}` : `+ ${item}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Gallery URLs */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Photos</h3>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Paste high-res image URL (e.g. Unsplash or Cloudinary)..."
                className="flex-1 px-3 py-2 border rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-neutral-100 font-bold rounded-xl hover:bg-neutral-200"
              >
                Add Photo
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative h-28 rounded-xl overflow-hidden border">
                  <img src={img.url} alt="Listing upload" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing Property...' : 'Publish Listing to SelfCon Marketplace'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePropertyPage;

