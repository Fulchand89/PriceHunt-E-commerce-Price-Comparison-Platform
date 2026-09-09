import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, ChevronRight, ExternalLink } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const TrendingDealsSection = ({ products = [], loading = false }) => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-amber-100 text-amber-600 rounded-xl shrink-0">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Live Amazon Deals & Price Drops</h2>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">Live verified products scraped directly from Amazon India</p>
          </div>
        </div>
        <Link to="/search?q=deals" className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 shrink-0">
          <span>See All Deals</span> <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>

      {loading && products.length === 0 ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 h-80 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
          Live Amazon prices are being synchronized...
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.slice(0, 8).map((prod, index) => {
            const asin = prod.asin;
            const title = prod.title || 'Amazon Product';
            const image = prod.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
            const price = prod.price || 0;
            const originalPrice = prod.originalPrice || null;
            const discount = prod.discount || 0;
            const rating = prod.rating || null;
            const reviewCount = prod.reviewCount || null;
            const productUrl = prod.url || (asin ? `https://www.amazon.in/dp/${asin}` : '#');

            return (
              <div
                key={prod._id ? `${prod._id}-${index}` : asin ? `${asin}-${index}` : `${title}-${index}`}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-amber-500/50 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <div className="relative p-3 sm:p-4 bg-slate-50/80 h-44 sm:h-52 flex items-center justify-center overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="max-h-36 sm:max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                    Amazon
                  </span>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div>
                    {asin && (
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block">
                        ASIN: {asin}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mt-0.5 hover:text-amber-700 transition-colors">
                      <Link to={`/compare/amazon/${asin || encodeURIComponent(title)}`}>
                        {title}
                      </Link>
                    </h3>
                    {rating !== null && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-600">
                        <span>★ {rating}</span>
                        {reviewCount !== null && (
                          <span className="text-slate-400 font-normal">({reviewCount.toLocaleString()})</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-2.5 sm:pt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] sm:text-xs text-slate-400">Current Price:</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">{formatINR(price)}</span>
                    </div>
                    {originalPrice && originalPrice > price && (
                      <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="text-slate-400">M.R.P:</span>
                        <span className="line-through text-slate-400">{formatINR(originalPrice)}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/compare/amazon/${asin || encodeURIComponent(title)}`}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-300 shadow-xs cursor-pointer"
                  >
                    <span>Compare & View Deal</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TrendingDealsSection;
