import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      name: 'Sarah Jenkins',
      role: 'Tenant & Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      text: 'The Claude AI assistant understood my exact need for quiet fiber-equipped spaces with a home office. It found a verified Bangalore apartment in seconds without endless filters.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Superhost & Villa Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      text: 'Switching a single listing between short-stay vacations and long-term rental according to tourist season doubled our operational occupancy rate. The calendar management is flawless.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Real Estate Investor & Buyer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      text: 'Submitting binding purchase offers, scheduling physical inspections, and tracking closing contingencies through the Buyer Dashboard eliminated traditional broker friction.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Trusted Community</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Loved by Guests, Tenants & Owners
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Real experiences from verified members of the SelfCon platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-neutral-800/80 border border-neutral-700/60 rounded-3xl p-8 flex flex-col justify-between hover:border-neutral-500 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-neutral-700">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border border-neutral-600"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">{rev.name}</h4>
                  <span className="text-xs text-neutral-400">{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

