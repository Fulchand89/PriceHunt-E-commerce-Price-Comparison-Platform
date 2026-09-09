import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Star, Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const ProductSummary = ({ product, bestDeal, lowestPrice, highestPrice, maxSavings }) => {
  const brandName = typeof product?.brand === 'object' ? product?.brand?.name : (product?.brand || 'Verified Brand');

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col justify-between">
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {brandName}
          </span>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product?.rating || 4.5}</span>
            <span className="text-slate-400 font-medium">({product?.reviewCount || 128})</span>
          </div>
        </div>

        <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {product?.title || product?.name}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
          {product?.description || 'Compare real-time prices, shipping charges, and verified seller discounts across top Indian e-commerce stores.'}
        </p>

        <Link
          to={`/compare/product/${product?.id || product?._id}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-1"
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Compare Live with Amazon Product
        </Link>
      </div>

      {/* HIGHLIGHTED BEST PRICE BADGE */}
      {bestDeal && (
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg relative overflow-hidden border border-emerald-500/40">
          <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 relative z-10">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> BEST OVERALL DEAL
            </span>
            {maxSavings > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[11px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-500/30">
                Save {formatINR(maxSavings)} vs Highest
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between relative z-10 pt-1">
            <div>
              <span className="text-[11px] sm:text-xs text-emerald-200 block">Lowest Total Price:</span>
              <span className="text-2xl xs:text-3xl sm:text-4xl font-black text-white">{formatINR(lowestPrice || bestDeal.totalCost || bestDeal.price)}</span>
            </div>

            <div className="text-right">
              <span className="text-[11px] sm:text-xs text-slate-400 block">At Store:</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-400">{bestDeal.providerName || bestDeal.seller || bestDeal.provider}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSummary;
