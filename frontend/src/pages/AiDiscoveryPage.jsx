import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Sliders,
  CheckCircle2,
  MapPin,
  BedDouble,
  DollarSign,
  HelpCircle,
  Compass,
  ArrowRight
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { useUI } from '../context/UIContext';

const AiDiscoveryPage = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am SelfCon AI, powered by Claude. Describe your ideal short stay, rental home, or property to purchase. I search our real database and provide tailored match explanations.',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const { formatPrice } = useUI();

  const promptSuggestions = [
    'I need a quiet 2-bedroom apartment for three months with high-speed internet and a gym nearby, under $2,000 per month.',
    'Beachfront luxury villa in Goa with private pool and workspace for a weekend getaway under $400/night.',
    'Modern high-rise penthouse for sale in Mumbai or Dubai with skyline views under $3,000,000.',
    'Furnished Indiranagar suite in Bangalore with dedicated workspace for remote tech work.'
  ];

  const handleSend = async customText => {
    const query = customText || prompt;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await aiAPI.discover(query.trim());
      const data = res.data.data;
      setCurrentResult(data);

      const aiMsg = {
        sender: 'ai',
        text: data.summary,
        data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I ran into an issue searching our listings. Please try rephrasing your prompt.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Claude AI Discovery Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Conversational Property Discovery
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Tell us what you need in plain English. No rigid filters required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Stream (Col 1-2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/80 shadow-soft p-6 flex flex-col justify-between h-[650px]">
          {/* Messages Scroll Area */}
          <div className="overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-sm ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-lg leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white font-medium rounded-tr-none'
                      : 'bg-neutral-50 border border-neutral-200/70 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* If message carries parsed result */}
                  {m.data?.parsedParameters && (
                    <div className="mt-3 pt-3 border-t border-neutral-200/60 flex flex-wrap gap-1.5 text-xs">
                      {m.data.parsedParameters.mode && (
                        <span className="px-2 py-0.5 rounded-md bg-white border font-bold capitalize">
                          {m.data.parsedParameters.mode}
                        </span>
                      )}
                      {m.data.parsedParameters.maxPrice && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          Max ${m.data.parsedParameters.maxPrice.toLocaleString()}
                        </span>
                      )}
                      {m.data.parsedParameters.bedrooms && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                          {m.data.parsedParameters.bedrooms} Beds
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-neutral-400 text-xs italic">
                <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 animate-spin">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>SelfCon AI is parsing query and querying MongoDB collections...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts & Input */}
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Type your property requirements..."
                className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Live Matched Listings (Col 3) */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft p-6 flex flex-col justify-between h-[650px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Matching Listings ({currentResult?.properties?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-brand-600">Verified DB</span>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            {!currentResult ? (
              <div className="py-20 text-center space-y-2 text-neutral-400">
                <Compass className="w-10 h-10 mx-auto text-neutral-300" />
                <p className="text-xs">Results will appear here when you send a prompt.</p>
              </div>
            ) : (
              currentResult.properties?.map(prop => (
                <Link
                  key={prop._id}
                  to={`/properties/${prop._id}`}
                  className="group block p-3 rounded-2xl border border-neutral-200/80 hover:border-brand-300 hover:shadow-md transition-all bg-neutral-50/50"
                >
                  <div className="relative h-28 rounded-xl overflow-hidden mb-2">
                    <img
                      src={prop.images?.[0]?.url}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {prop.aiMatch && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 font-extrabold text-[10px] shadow-xs">
                        {prop.aiMatch.score}% Match
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-brand-600">
                    {prop.title}
                  </h4>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{prop.location?.city}</div>
                  {prop.aiMatch?.reason && (
                    <p className="text-[10px] text-neutral-600 mt-1 line-clamp-2 italic bg-white p-1.5 rounded-lg border">
                      "{prop.aiMatch.reason}"
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>
                      {prop.pricing?.nightly > 0
                        ? `${formatPrice(prop.pricing.nightly)}/nt`
                        : formatPrice(prop.pricing.monthly || prop.pricing.salePrice)}
                    </span>
                    <span className="text-brand-600 text-[11px]">View Listing →</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDiscoveryPage;

