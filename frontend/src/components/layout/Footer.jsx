import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, ShieldCheck, CreditCard, Lock, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-20 text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">SELFCON</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
              Self-Comfort (SelfCon) is a unified real estate marketplace connecting short-term stays, long-term rentals, property buying, and selling in one platform, powered by Claude AI.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Listings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-600" />
                <span>JWT Auth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Razorpay / Stripe</span>
              </div>
            </div>
          </div>

          {/* Short Stays */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">Short Stays</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?mode=stay&city=Goa" className="hover:text-slate-900 transition-colors">Goa Beachfront Villas</Link></li>
              <li><Link to="/properties?mode=stay&city=Mumbai" className="hover:text-slate-900 transition-colors">Mumbai Sea-View Suites</Link></li>
              <li><Link to="/properties?mode=stay&city=Dubai" className="hover:text-slate-900 transition-colors">Dubai Marina Luxury</Link></li>
              <li><Link to="/properties?mode=stay&propertyType=villa" className="hover:text-slate-900 transition-colors">Private Pool Retreats</Link></li>
              <li><Link to="/properties?mode=stay" className="hover:text-slate-900 transition-colors">Weekend Getaways</Link></li>
            </ul>
          </div>

          {/* Long Rentals */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">Long Rentals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?mode=rent&city=Bangalore" className="hover:text-slate-900 transition-colors">Bangalore Tech Hubs</Link></li>
              <li><Link to="/properties?mode=rent&city=New%20York" className="hover:text-slate-900 transition-colors">New York Urban Lofts</Link></li>
              <li><Link to="/properties?mode=rent&propertyType=penthouse" className="hover:text-slate-900 transition-colors">Luxury Penthouses</Link></li>
              <li><Link to="/properties?mode=rent" className="hover:text-slate-900 transition-colors">Furnished Apartments</Link></li>
              <li><Link to="/properties?mode=rent" className="hover:text-slate-900 transition-colors">Corporate Leases</Link></li>
            </ul>
          </div>

          {/* Buying & Selling */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-4">Buy & Sell</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties?mode=buy" className="hover:text-slate-900 transition-colors">Properties for Sale</Link></li>
              <li><Link to="/properties/create" className="hover:text-slate-900 transition-colors">List Your Property</Link></li>
              <li><Link to="/compare" className="hover:text-slate-900 transition-colors">Property Comparison</Link></li>
              <li><Link to="/dashboard/owner" className="hover:text-slate-900 transition-colors">Host & Seller Center</Link></li>
              <li><Link to="/ai-discovery" className="hover:text-slate-900 transition-colors flex items-center gap-1 text-brand-600 font-semibold"><Sparkles className="w-3.5 h-3.5" /> SelfCon AI Search</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} SELFCON Technologies, Inc. All rights reserved. Real Estate Redefined.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-neutral-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-600 cursor-pointer">Trust & Security</span>
            <span className="hover:text-neutral-600 cursor-pointer">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

