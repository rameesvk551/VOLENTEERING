import React from 'react';
import { Button } from '@/design-system';

/* ========================================
   HERO SECTION
   Immersive hero with search functionality
   ======================================== */

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-primary-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-10 flex min-h-[600px] items-center py-16 md:py-20">
        <div className="w-full max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-white">
              Over 50,000+ hosts worldwide
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Travel the world.
            <br />
            <span className="text-primary-300">Make a difference.</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-300 md:text-xl">
            Connect with amazing hosts, volunteer your skills, and experience authentic 
            travel while making meaningful contributions to communities worldwide.
          </p>

          {/* Search Box */}
          <SearchBox />

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <TrustBadge icon="🌍" text="180+ Countries" />
            <TrustBadge icon="⭐" text="4.9 Rating" />
            <TrustBadge icon="🤝" text="1M+ Connections" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-2">
          <div className="h-3 w-1.5 rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
};

/* Search Box Component */
const SearchBox: React.FC = () => {
  return (
    <div className="max-w-3xl rounded-2xl bg-white p-5 shadow-2xl shadow-black/20">
      <form 
        className="flex flex-col gap-4 lg:flex-row lg:items-end" 
        action="/explore" 
        method="get"
      >
        {/* Destination */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Where
          </label>
          <input
            type="text"
            name="destination"
            placeholder="Search destinations"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            autoComplete="off"
          />
        </div>

        {/* Type */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Type
          </label>
          <select
            name="type"
            className="h-12 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            defaultValue=""
          >
            <option value="">All opportunities</option>
            <option value="farming">Farming & Gardening</option>
            <option value="teaching">Teaching</option>
            <option value="hospitality">Hospitality</option>
            <option value="construction">Construction</option>
            <option value="animal">Animal Care</option>
            <option value="art">Art & Culture</option>
          </select>
        </div>

        {/* Duration */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Duration
          </label>
          <select
            name="duration"
            className="h-12 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            defaultValue=""
          >
            <option value="">Any duration</option>
            <option value="short">1-2 weeks</option>
            <option value="medium">2-4 weeks</option>
            <option value="long">1-3 months</option>
            <option value="extended">3+ months</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="lg:flex-shrink-0">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/40 lg:w-auto"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

/* Trust Badge */
const TrustBadge: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-white">
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default HeroSection;
