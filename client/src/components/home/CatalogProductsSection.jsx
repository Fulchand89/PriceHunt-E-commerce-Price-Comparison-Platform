import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const CatalogProductsSection = ({ products = [], loading = false }) => {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Verified Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
              Top curated items with live price tracking & verified seller availability
            </p>
          </div>
        </div>
        <Link
          to="/search"
          className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
        >
          <span>Explore Catalog</span> <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-5 h-80 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
          No catalog products added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((prod, index) => {
            const pId = prod.id || prod._id;
            const title = prod.title || prod.name || 'Catalog Product';
            const img = prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80';
            const price = prod.price ?? prod.lowestPrice ?? 0;
            const originalPrice = prod.originalPrice ?? prod.highestPrice ?? null;
            const brand = typeof prod.brand === 'object' ? prod.brand?.name : (prod.brand || '');
            const category = typeof prod.category === 'object' ? prod.category?.name : (prod.category || '');
            const discount = originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
            const offersCount = prod.totalOffers || (prod.offers?.length) || 1;

            return (
              <div
                key={pId ? `${pId}-${index}` : index}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-emerald-500/50 transition-all duration-300 flex flex-col overflow-hidden group relative"
              >
                {/* Image Box */}
                <div className="relative p-4 bg-slate-50/80 h-48 sm:h-52 flex items-center justify-center overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    className="max-h-40 sm:max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Catalog
                  </span>
                </div>

                {/* Info Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700">
                      {brand && <span className="uppercase tracking-wider">{brand}</span>}
                      {category && <span className="text-slate-400 font-normal line-clamp-1">{category}</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      <Link to={`/products/${pId}`}>
                        {title}
                      </Link>
                    </h3>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400">Store Price:</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">{formatINR(price)}</span>
                    </div>
                    {originalPrice && originalPrice > price && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">M.R.P:</span>
                        <span className="line-through text-slate-400">{formatINR(originalPrice)}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/products/${pId}`}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Compare Stores ({offersCount})</span>
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

export default CatalogProductsSection;
