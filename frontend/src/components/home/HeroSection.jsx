import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useUI } from '../../context/UIContext';

const HeroSection = () => {
  const [activeMode, setActiveMode] = useState('stay'); // 'stay', 'rent', 'buy'
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [aiInput, setAiInput] = useState('');

  const { openAiWithPrompt } = useUI();
  const navigate = useNavigate();

  const handleStandardSearch = e => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeMode) params.append('mode', activeMode);
    if (location) params.append('location', location);
    if (bedrooms) params.append('bedrooms', bedrooms);
    if (maxPrice) params.append('maxPrice', maxPrice);

    navigate(`/properties?${params.toString()}`);
  };

  const handleAiLaunch = e => {
    e.preventDefault();
    if (aiInput.trim()) {
      openAiWithPrompt(aiInput.trim());
    } else {
      openAiWithPrompt('I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.');
    }
  };

  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-brand-100/40 via-amber-50/20 to-transparent -z-10 rounded-b-[4rem] blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Title & Pitch */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-xs text-xs font-semibold text-slate-800 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-neutral-500">Unified Real Estate:</span>
            <span className="text-brand-600 font-bold">Stay • Rent • Buy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Where do you want to feel comfortable today?
          </h1>

          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            One platform. Every property journey. Discover short stays, long-term rentals, and verified properties for sale with conversational Claude AI.
          </p>
        </div>

        {/* Primary Search Container */}
        <div className="mt-10 max-w-4xl mx-auto bg-white rounded-3xl shadow-soft border border-neutral-200/80 p-3 sm:p-5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 mb-4">
            <button
              onClick={() => setActiveMode('stay')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeMode === 'stay'
                  ? 'bg-stay-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-neutral-600 hover:text-slate-900 hover:bg-neutral-100'
              }`}
            >
              Short Stays
            </button>
            <button
              onClick={() => setActiveMode('rent')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeMode === 'rent'
                  ? 'bg-rent-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-neutral-600 hover:text-slate-900 hover:bg-neutral-100'
              }`}
            >
              Long Rentals
            </button>
            <button
              onClick={() => setActiveMode('buy')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeMode === 'buy'
                  ? 'bg-buy-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-neutral-600 hover:text-slate-900 hover:bg-neutral-100'
              }`}
            >
              For Sale
            </button>
          </div>

          {/* Unified Structured Filter Form */}
          <form onSubmit={handleStandardSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Location Input */}
            <div className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200/60 transition-colors">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Destination</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Mumbai, Goa, Dubai, NY..."
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-neutral-400 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Bedrooms selector */}
            <div className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200/60 transition-colors">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Bedrooms</label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <select
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="">Any Bedrooms</option>
                  <option value="1">1+ Bedrooms</option>
                  <option value="2">2+ Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>
            </div>

            {/* Max Budget */}
            <div className="p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl border border-neutral-200/60 transition-colors">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {activeMode === 'stay' ? 'Max Nightly ($)' : activeMode === 'rent' ? 'Max Monthly ($)' : 'Max Budget ($)'}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder={activeMode === 'stay' ? 'e.g. 250' : activeMode === 'rent' ? 'e.g. 2000' : 'e.g. 1500000'}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-neutral-400 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-[58px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Properties</span>
              </button>
            </div>
          </form>

          {/* AI Conversational Discovery Pill in Hero */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <form onSubmit={handleAiLaunch} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full relative">
                <Sparkles className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Or ask SelfCon AI: 'Quiet 2-bedroom in Mumbai for 3 months with gym under $2000'..."
                  className="w-full pl-11 pr-4 py-3 bg-brand-50/50 hover:bg-brand-50/80 focus:bg-white border border-brand-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask SelfCon AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

