import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../../services/api';

const PopularDestinations = () => {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    propertyAPI
      .getDestinations()
      .then(res => setDestinations(res.data.destinations || []))
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 bg-white border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Prime Locations</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Explore Popular Destinations
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Discover comfort across metropolitan capitals, beach retreats, and international tech hubs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((dest, idx) => (
            <Link
              key={idx}
              to={`/properties?city=${dest.city}`}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-4"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              <div className="relative z-10 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  {dest.state || dest.country}
                </span>
                <h3 className="font-extrabold text-lg text-white leading-tight mt-0.5">
                  {dest.city}
                </h3>
                <span className="text-[11px] text-neutral-300 mt-1 block">
                  {dest.propertyCount || 1} verified listings
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;

