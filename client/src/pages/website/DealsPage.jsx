import React, { useEffect, useState } from 'react';
import { Tag, Copy, Check, ExternalLink, Sparkles, Search, Filter, ShieldCheck, Clock, Percent, Gift, Building2, Smartphone, Zap } from 'lucide-react';
import API from '../../services/api';

const DealsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, oRes] = await Promise.all([
          API.get('/coupons').catch(() => ({ data: { data: [] } })),
          API.get('/offers').catch(() => ({ data: { data: [] } }))
        ]);

        const fetchedCoupons = cRes?.data?.data || [];
        const fetchedOffers = oRes?.data?.data || [];

        setOffers(fetchedOffers);

        // Enrich API coupons with store styling
        const enriched = fetchedCoupons.map((c, idx) => {
          const storeName = typeof c.store === 'object' ? c.store?.name : (c.store || 'Store');
          let colorInfo = {
            storeColor: 'from-emerald-600 to-teal-600',
            storeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            badgeColor: 'bg-emerald-600 text-white'
          };

          if (/amazon/i.test(storeName)) {
            colorInfo = { storeColor: 'from-amber-500 to-amber-600', storeBg: 'bg-amber-50 border-amber-200 text-amber-900', badgeColor: 'bg-amber-500 text-white' };
          } else if (/flipkart/i.test(storeName)) {
            colorInfo = { storeColor: 'from-blue-600 to-indigo-600', storeBg: 'bg-blue-50 border-blue-200 text-blue-900', badgeColor: 'bg-blue-600 text-white' };
          } else if (/croma/i.test(storeName)) {
            colorInfo = { storeColor: 'from-emerald-600 to-teal-700', storeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900', badgeColor: 'bg-emerald-600 text-white' };
          } else if (/myntra/i.test(storeName)) {
            colorInfo = { storeColor: 'from-pink-500 to-rose-600', storeBg: 'bg-pink-50 border-pink-200 text-pink-900', badgeColor: 'bg-pink-600 text-white' };
          }

          return {
            ...c,
            store: storeName,
            discountValue: c.discount || c.discountValue || 'Special Discount',
            category: c.category || 'all',
            verified: true,
            link: c.affiliateUrl || c.store?.websiteUrl || '#',
            ...colorInfo
          };
        });
        setCoupons(enriched);
      } catch (err) {
        console.error('Coupons fetch error:', err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Filter coupons based on active tab & search query
  const filteredCoupons = coupons.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.title?.toLowerCase().includes(searchLower) ||
      item.code?.toLowerCase().includes(searchLower) ||
      item.store?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      
      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Verified Promo Codes & Store Coupons
          </span>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Exclusive Coupons & <span className="bg-gradient-to-r from-amber-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Bank Offers</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Copy working promo codes, bank cashback offers & promo discounts for Amazon, Flipkart, Croma, Myntra & Reliance Digital.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto pt-4 text-left">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
              <span className="text-lg sm:text-2xl font-black text-emerald-400 block">{coupons.length}+</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Active Coupons</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
              <span className="text-lg sm:text-2xl font-black text-amber-400 block">Up to 20%</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Max Discount</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
              <span className="text-lg sm:text-2xl font-black text-cyan-400 block">100%</span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Verified Daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {[
              { id: 'all', label: 'All Deals', icon: Tag },
              { id: 'bank', label: 'Bank Offers', icon: Building2 },
              { id: 'tech', label: 'Mobiles & Tech', icon: Smartphone },
              { id: 'fashion', label: 'Fashion & Shoes', icon: Gift },
              { id: 'appliances', label: 'Appliances', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Coupon Search Box */}
          <div className="relative flex items-center min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search store, bank or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </section>

      {/* COUPON DEALS GRID */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 h-52 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto p-2">
              <img src="/pricehunt-icon.png" alt="Coupons" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">No Coupons Found</h3>
            <p className="text-xs text-slate-500">Try changing your search keywords or switching category filters.</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCoupons.map((c) => {
              const isCopied = copiedCode === c.code;
              return (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40 relative"
                >
                  
                  {/* Top Colored Header Banner for Store */}
                  <div className={`p-4 bg-gradient-to-r ${c.storeColor || 'from-emerald-600 to-teal-600'} text-white flex items-center justify-between relative`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-1.5 shadow-xs">
                        <img src="/pricehunt-icon.png" alt="Deal" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block leading-tight">{c.store}</span>
                        <span className="text-[10px] text-white/80 font-medium block">Verified Coupon</span>
                      </div>
                    </div>

                    <span className="bg-white text-slate-900 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                      {c.discountValue || 'DEAL'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase">
                          {c.discountType || 'PROMO CODE'}
                        </span>
                        {c.verified && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors">
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    {/* Expiry and Copy Box */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Valid till {c.validUntil || 'Limited Time'}</span>
                        </span>
                      </div>

                      {/* Code Pill + Copy CTA */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl text-slate-900 font-mono font-black text-xs sm:text-sm tracking-wider text-center select-all truncate">
                          {c.code || 'NO CODE NEEDED'}
                        </div>

                        <button
                          onClick={() => handleCopy(c.code)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 active:scale-95 ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                              : 'bg-slate-900 hover:bg-emerald-600 text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 text-white" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {c.link && c.link !== '#' && (
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                        >
                          <span>Redeem at {c.store}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      )}

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};

export default DealsPage;

