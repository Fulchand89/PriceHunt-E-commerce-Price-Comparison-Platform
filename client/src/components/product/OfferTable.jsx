import React from 'react';
import { CheckCircle2, ArrowUpRight, ExternalLink } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const OfferTable = ({ offers = [], handleBuyNowClick }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Live Price Comparison Across Stores</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Price = Product Price + Shipping. Sorted by lowest price in real-time.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full w-fit">
          {offers.length} {offers.length === 1 ? 'Store Offer' : 'Stores Available'}
        </span>
      </div>

      {/* MOBILE STORE COMPARISON CARDS (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {offers.map((offer, idx) => {
          const isLowest = offer.isLowest;
          const isOurStore = offer.isOurStore || offer.provider === 'my_store';
          const storeName = offer.providerName || offer.seller || offer.provider || 'Store';
          const buyUrl = offer.affiliateUrl || offer.productUrl;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                isOurStore
                  ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                  : isLowest
                  ? 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs border ${
                    isOurStore ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    {offer.providerLogo ? (
                      <img src={offer.providerLogo} alt={storeName} className="max-h-full object-contain" />
                    ) : (
                      <span className="text-xs font-black">{isOurStore ? '★' : storeName[0]}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-xs uppercase block">
                        {storeName}
                      </span>
                      {isOurStore && (
                        <span className="bg-slate-900 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          MERA STORE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {offer.availability !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {isLowest && (
                  <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                    LOWEST PRICE
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5 mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Cost</span>
                  <span className="text-lg font-black text-emerald-600">
                    {formatINR(offer.totalCost || (offer.price + (offer.shippingCost || 0)))}
                  </span>
                </div>
                <div className="text-right">
                  {offer.shippingCost === 0 ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      FREE Delivery
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">+ {formatINR(offer.shippingCost)} Shipping</span>
                  )}
                  {offer.discount > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 ml-1.5">{offer.discount}% OFF</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBuyNowClick(buyUrl)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-target active:scale-98 ${
                  isOurStore
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25'
                    : isLowest
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>{isOurStore ? 'Buy Direct (Our Store)' : `Visit Store (${storeName})`}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (hidden sm:block) */}
      <div className="hidden sm:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500 bg-slate-50">
              <th className="py-3.5 px-4 rounded-l-xl">Store / Provider</th>
              <th className="py-3.5 px-4">Item Price</th>
              <th className="py-3.5 px-4">Shipping</th>
              <th className="py-3.5 px-4">Total Cost</th>
              <th className="py-3.5 px-4">Discount</th>
              <th className="py-3.5 px-4">Availability</th>
              <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {offers.map((offer, idx) => {
              const isLowest = offer.isLowest;
              const isOurStore = offer.isOurStore || offer.provider === 'my_store';
              const storeName = offer.providerName || offer.seller || offer.provider || 'Store';
              const buyUrl = offer.affiliateUrl || offer.productUrl;

              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isOurStore
                      ? 'bg-emerald-50/60 font-bold border-l-4 border-l-emerald-600'
                      : isLowest
                      ? 'bg-amber-50/40 font-bold border-l-4 border-l-amber-500'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs border ${
                        isOurStore ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}>
                        {offer.providerLogo ? (
                          <img src={offer.providerLogo} alt={storeName} className="max-h-full object-contain" />
                        ) : (
                          <span className="text-xs font-black">{isOurStore ? '★' : storeName[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 uppercase">{storeName}</span>
                          {isOurStore && (
                            <span className="bg-slate-900 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              MERA STORE
                            </span>
                          )}
                          {isLowest && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              LOWEST PRICE
                            </span>
                          )}
                        </div>
                        {offer.savings > 0 && (
                          <span className="text-[10px] text-emerald-600 font-semibold block">Saves {formatINR(offer.savings)}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {formatINR(offer.price)}
                  </td>

                  <td className="py-4 px-4">
                    {offer.shippingCost === 0 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        FREE
                      </span>
                    ) : (
                      <span>{formatINR(offer.shippingCost)}</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`text-sm font-black ${isLowest ? 'text-emerald-600 text-base' : 'text-slate-900'}`}>
                      {formatINR(offer.totalCost || offer.price)}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    {offer.discount > 0 ? (
                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        {offer.discount}% OFF
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {offer.availability !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleBuyNowClick(buyUrl)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs ${
                        isOurStore
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                          : isLowest
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>{isOurStore ? 'Buy Direct' : 'Visit Store'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfferTable;
