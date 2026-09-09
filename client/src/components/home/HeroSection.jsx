import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SearchAutocomplete from '../SearchAutocomplete';

const PRICE_PRESETS = [
  { label: 'Under ₹5k', min: '0', max: '5000' },
  { label: '₹5k - ₹20k', min: '5000', max: '20000' },
  { label: '₹20k - ₹50k', min: '20000', max: '50000' },
  { label: '₹50k - ₹1 Lakh', min: '50000', max: '100000' },
  { label: 'Above ₹1 Lakh', min: '100000', max: '' }
];

const HeroSection = ({ popularSearchTags = [] }) => {
  const navigate = useNavigate();

  const handlePricePreset = (preset) => {
    const params = new URLSearchParams();
    if (preset.min) params.set('minPrice', preset.min);
    if (preset.max) params.set('maxPrice', preset.max);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-12 xs:py-16 sm:py-20 lg:py-28 px-3 xs:px-4 sm:px-6 lg:px-8">
      
      {/* Background glow graphics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4 sm:space-y-6">
        <span className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold tracking-wide shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Live Multi-Store Price Comparison Engine
        </span>

        <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
          Find the Best Price <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Before You Buy
          </span>
        </h1>

        <p className="text-xs xs:text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed px-2">
          Compare prices across multiple e-commerce websites and find the cheapest place to buy your favorite products.
        </p>

        {/* Large Hero Search Bar with Live Search & Category Selector */}
        <div className="pt-4 max-w-2xl mx-auto w-full space-y-3">
          <SearchAutocomplete 
            className="shadow-2xl text-slate-900" 
            placeholder="Search iPhone 16, MacBook, Sony headphones, shoes..." 
            showCategorySelect={true}
          />

          {/* Quick Price Range Presets */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs pt-1">
            <span className="text-slate-300 font-extrabold text-[11px] sm:text-xs">Price Range:</span>
            {PRICE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePricePreset(p)}
                className="bg-slate-800 hover:bg-emerald-800/60 text-slate-200 hover:text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full border border-slate-700/80 hover:border-emerald-500/60 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Popular Search Tags */}
          {popularSearchTags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-400">
              <span className="font-extrabold text-slate-300 text-[11px] sm:text-xs">Trending:</span>
              {popularSearchTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="bg-slate-850 bg-slate-800/70 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 rounded-full border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
