import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  DollarSign,
  MapPin,
  BedDouble,
  Wifi,
  Dumbbell,
  Waves
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { aiAPI } from '../../services/api';

const AiSearchModal = () => {
  const { isAiModalOpen, setIsAiModalOpen, aiInitialPrompt, formatPrice } = useUI();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Populate initial prompt if passed
  useEffect(() => {
    if (aiInitialPrompt) {
      setPrompt(aiInitialPrompt);
    }
  }, [aiInitialPrompt]);

  const promptSuggestions = [
    'I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.',
    'Beachfront luxury villa in Goa with private pool and workspace for a weekend getaway under $400/night.',
    'Modern high-rise penthouse for sale in Mumbai or Dubai with skyline views under $3,000,000.',
    'Pet-friendly tech executive apartment in Bangalore with fast fiber internet and balcony under $1,500/month.'
  ];

  const handleSearch = async customPrompt => {
    const textToSearch = customPrompt || prompt;
    if (!textToSearch.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await aiAPI.discover(textToSearch.trim());
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query SelfCon AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClarifyingQuestion = question => {
    const refined = `${prompt} Also: ${question}`;
    setPrompt(refined);
    handleSearch(refined);
  };

  if (!isAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden my-8">
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-brand-500 flex items-center justify-center text-slate-900 shadow-md">
              <Sparkles className="w-6 h-6 text-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">SelfCon AI Property Discovery</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Claude Powered
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Natural-language discovery connected directly to verified MongoDB listings
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-6 bg-neutral-50/70 border-b border-neutral-200">
          <div className="relative">
            <textarea
              rows="3"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Describe your ideal property in natural language... e.g., 'I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.'"
              className="w-full pl-4 pr-32 py-3 bg-white border border-neutral-300 rounded-2xl text-sm text-slate-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-xs resize-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !prompt.trim()}
              className="absolute right-3 bottom-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Discover</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Try:</span>
            {promptSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(s);
                  handleSearch(s);
                }}
                className="text-xs bg-white text-neutral-600 hover:text-brand-600 hover:border-brand-300 border border-neutral-200 px-3 py-1.5 rounded-full transition-all text-left truncate max-w-xs shadow-2xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center text-white shadow-lg animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">SelfCon AI is reasoning...</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Extracting budget, bedroom counts, location, lifestyle nuances, and querying verified MongoDB property collections.
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Parsed Criteria Badges */}
              {result.parsedParameters && (
                <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Extracted Search Criteria</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {result.parsedParameters.mode && (
                      <span className="px-3 py-1 rounded-full font-semibold bg-brand-50 text-brand-700 border border-brand-200 capitalize">
                        Mode: {result.parsedParameters.mode}
                      </span>
                    )}
                    {result.parsedParameters.maxPrice && (
                      <span className="px-3 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Max Budget: ${result.parsedParameters.maxPrice.toLocaleString()}
                      </span>
                    )}
                    {result.parsedParameters.bedrooms && (
                      <span className="px-3 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {result.parsedParameters.bedrooms} Bedrooms
                      </span>
                    )}
                    {result.parsedParameters.location && (
                      <span className="px-3 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Location: {result.parsedParameters.location}
                      </span>
                    )}
                    {(result.parsedParameters.requiredAmenities || []).map((amenity, i) => (
                      <span key={i} className="px-3 py-1 rounded-full font-medium bg-neutral-100 text-slate-700 border border-neutral-200">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversational AI Summary */}
              <div className="p-4 bg-brand-50/70 border border-brand-200/60 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-brand-900">AI Intelligence Overview</h4>
                  <p className="text-sm text-brand-800 mt-1 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Verified Property Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {result.isAlternative ? 'Recommended Database Alternatives' : 'Top Verified Matching Listings'} ({result.properties?.length || 0})
                  </h4>
                  <span className="text-xs text-neutral-400">100% Real Database Source</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(result.properties || []).map(prop => (
                    <div
                      key={prop._id}
                      onClick={() => {
                        setIsAiModalOpen(false);
                        navigate(`/properties/${prop._id}`);
                      }}
                      className="group cursor-pointer bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-brand-300 transition-all duration-200 flex flex-col"
                    >
                      {/* Image Thumbnail & Badges */}
                      <div className="relative h-44 overflow-hidden bg-neutral-100">
                        <img
                          src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Match Score Badge */}
                        {prop.aiMatch && (
                          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-400/30">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{prop.aiMatch.score}% Match</span>
                          </div>
                        )}
                        {/* Listing Mode Badges */}
                        <div className="absolute bottom-3 left-3 flex gap-1.5">
                          {prop.listingModes?.map(m => (
                            <span
                              key={m}
                              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-xs"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                            <span className="capitalize">{prop.propertyType}</span>
                            <span>★ {prop.stats?.averageRating || 4.8}</span>
                          </div>
                          <h5 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                            {prop.title}
                          </h5>
                          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{prop.location?.city}, {prop.location?.state}</span>
                          </p>

                          {/* AI Match Explanation */}
                          {prop.aiMatch?.reason && (
                            <div className="mt-2.5 p-2 bg-neutral-50 rounded-xl border border-neutral-200/60 text-xs text-neutral-600 flex items-start gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{prop.aiMatch.reason}</span>
                            </div>
                          )}
                        </div>

                        {/* Specs & Pricing */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                            <span>{prop.specs?.bedrooms} Beds</span>
                            <span>•</span>
                            <span>{prop.specs?.bathrooms} Baths</span>
                          </div>
                          <div className="text-right">
                            {prop.listingModes?.includes('stay') && prop.pricing?.nightly > 0 && (
                              <div className="text-xs font-bold text-slate-900">
                                {formatPrice(prop.pricing.nightly)} <span className="font-normal text-neutral-400">/ night</span>
                              </div>
                            )}
                            {prop.listingModes?.includes('rent') && prop.pricing?.monthly > 0 && (
                              <div className="text-xs font-bold text-slate-900">
                                {formatPrice(prop.pricing.monthly)} <span className="font-normal text-neutral-400">/ month</span>
                              </div>
                            )}
                            {prop.listingModes?.includes('buy') && prop.pricing?.salePrice > 0 && (
                              <div className="text-xs font-bold text-indigo-700">
                                {formatPrice(prop.pricing.salePrice)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clarifying Questions */}
              {result.clarifyingQuestions && result.clarifyingQuestions.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Suggested Refinements</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.clarifyingQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectClarifyingQuestion(q)}
                        className="text-xs bg-white text-amber-900 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Ask SelfCon AI Anything</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Try queries like "Quiet 2-bedroom in Mumbai near the beach under $2,000/month" or "Goa pool villa for vacation stay".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiSearchModal;

