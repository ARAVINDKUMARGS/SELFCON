import React from 'react';
import { Sparkles, Compass, ShieldCheck, Zap } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Unified Journey: Stay, Rent, or Buy',
      description: 'Switch effortlessly between short-term stays, long-term residential leases, and direct property purchases within one unified ecosystem.',
      icon: <Compass className="w-6 h-6 text-brand-600" />,
      color: 'bg-brand-50 border-brand-200'
    },
    {
      step: '02',
      title: 'Conversational Claude AI Discovery',
      description: 'Express what you need naturally—from quiet remote work suites to pet-friendly seaside villas. Claude extracts constraints and maps them to real MongoDB listings.',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      color: 'bg-amber-50 border-amber-200'
    },
    {
      step: '03',
      title: 'Instant Booking & Verified Offers',
      description: 'Zero conflicting dates with server-enforced availability calendars. Secure instant booking with Razorpay / Stripe or submit binding purchase offers directly.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Frictionless Platform</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          How SelfCon Redefines Real Estate
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Architected for modern guests, tenants, property buyers, and hosts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-3xl font-extrabold text-neutral-200">{item.step}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;

