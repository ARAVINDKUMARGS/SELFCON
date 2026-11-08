import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, Star, MapPin, Check, Minus, BedDouble, Bath, Square } from 'lucide-react';
import { useUI } from '../context/UIContext';

const PropertyComparisonPage = () => {
  const { comparisonList, toggleComparison, clearComparison, formatPrice } = useUI();

  if (comparisonList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">No Properties Selected for Comparison</h2>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Click the scale icon on any property card or detail page to compare up to 4 homes side-by-side.
        </p>
        <Link
          to="/properties"
          className="inline-block px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs"
        >
          Explore Properties
        </Link>
      </div>
    );
  }

  const allAmenities = [
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Property Comparison</h1>
          <p className="text-sm text-neutral-500 mt-1">Comparing {comparisonList.length} properties side by side</p>
        </div>
        <button
          onClick={clearComparison}
          className="text-xs font-bold text-red-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="p-4 w-48 text-xs font-bold uppercase text-neutral-400">Property</th>
              {comparisonList.map(prop => (
                <th key={prop._id} className="p-4 w-64 align-top">
                  <div className="relative group space-y-2">
                    <button
                      onClick={() => toggleComparison(prop)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={prop.images?.[0]?.url}
                      alt={prop.title}
                      className="w-full h-36 object-cover rounded-2xl"
                    />
                    <Link to={`/properties/${prop._id}`}>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 line-clamp-1">
                        {prop.title}
                      </h3>
                    </Link>
                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{prop.location?.city}</span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs text-slate-700">
            <tr>
              <td className="p-4 font-bold text-neutral-500 uppercase">Modes</td>
              {comparisonList.map(prop => (
                <td key={prop._id} className="p-4 font-bold capitalize">
                  {prop.listingModes?.join(', ')}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-neutral-500 uppercase">Pricing</td>
              {comparisonList.map(prop => (
                <td key={prop._id} className="p-4 font-extrabold text-sm text-slate-900">
                  {prop.pricing?.nightly > 0 && <div>{formatPrice(prop.pricing.nightly)} / nt</div>}
                  {prop.pricing?.monthly > 0 && <div>{formatPrice(prop.pricing.monthly)} / mo</div>}
                  {prop.pricing?.salePrice > 0 && <div className="text-indigo-700">{formatPrice(prop.pricing.salePrice)}</div>}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-neutral-500 uppercase">Specs</td>
              {comparisonList.map(prop => (
                <td key={prop._id} className="p-4 space-y-1">
                  <div>{prop.specs?.bedrooms} Bedrooms</div>
                  <div>{prop.specs?.bathrooms} Bathrooms</div>
                  <div>{prop.specs?.squareFeet} sqft</div>
                  <div className="capitalize">{prop.specs?.furnishing || 'Furnished'}</div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-neutral-500 uppercase">Rating</td>
              {comparisonList.map(prop => (
                <td key={prop._id} className="p-4 font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{prop.stats?.averageRating || 4.8}★</span>
                </td>
              ))}
            </tr>

            {/* Amenities Matrix */}
            {allAmenities.map(amenity => (
              <tr key={amenity}>
                <td className="p-4 font-medium text-neutral-500">{amenity}</td>
                {comparisonList.map(prop => (
                  <td key={prop._id} className="p-4">
                    {prop.amenities?.includes(amenity) ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Minus className="w-5 h-5 text-neutral-300" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertyComparisonPage;

