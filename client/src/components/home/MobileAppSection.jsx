import React from 'react';
import { Smartphone, Download, QrCode, Search, ShieldCheck, Bell, Zap, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const MobileAppSection = ({ featuredLiveProduct, onOpenDownloadModal }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 text-white max-w-7xl mx-auto shadow-2xl">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Left Column: Heading, Value Props & Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Mobile App • Free Download</span>
          </div>

          {/* Section Heading */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Download <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">PriceHunt App</span> on Your Phone
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Compare prices on the go! Set instant price drop notifications, scan product barcodes in retail stores, and find cheaper deals across Amazon, Flipkart, Croma & Myntra straight from your smartphone.
            </p>
          </div>

          {/* Feature Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant Price Drop Alerts</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Push alerts the second your tracked items hit all-time low prices.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">1-Tap Live Comparison</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Instant price check across Amazon, Flipkart, Croma & Myntra.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">100% Verified Deals</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Live-scraped prices with direct store checkout and zero fake discounts.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Android & iOS Ready</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Install smoothly via native PWA or direct APK file download.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={onOpenDownloadModal}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
              <span>Install Mobile App</span>
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all duration-200 shadow-sm hover:text-white cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Social Proof & Trust Credentials */}
          <div className="flex flex-wrap items-center gap-5 pt-3 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-200">4.8/5 Rating</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-semibold">50,000+ Active Shoppers</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span className="font-semibold">100% Free & No Ads</span>
            </div>
          </div>

        </div>

        {/* Right Column: Hyper-realistic Smartphone Frame */}
        <div className="lg:col-span-5 flex justify-center items-center py-4">
          <div className="relative group">
            
            {/* Outer ambient glow backlight */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-cyan-500/25 rounded-[55px] blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Top-right subtle badge (Fixed & Steady) */}
            <div className="absolute -top-3 -right-3 sm:-right-6 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 py-1.5 px-3 rounded-xl shadow-xl flex items-center gap-2 text-[11px] text-slate-200 z-20 hidden sm:flex">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">Live Deals Sync</span>
              <span className="text-emerald-400 font-semibold">• Active</span>
            </div>

            {/* Smartphone Chassis */}
            <div className="relative w-[280px] xs:w-[300px] sm:w-[320px] bg-slate-950 p-3 sm:p-3.5 rounded-[46px] border-[5px] border-slate-700/90 shadow-2xl shadow-black/80 transition-all duration-300">
              
              {/* Side hardware buttons */}
              <div className="absolute -left-[8px] top-24 w-[3px] h-10 bg-slate-700 rounded-l-md"></div>
              <div className="absolute -left-[8px] top-38 w-[3px] h-12 bg-slate-700 rounded-l-md"></div>
              <div className="absolute -right-[8px] top-28 w-[3px] h-16 bg-slate-700 rounded-r-md"></div>

              {/* Inner Bezel Screen Display */}
              <div className="bg-slate-900 rounded-[36px] overflow-hidden border border-slate-800 text-left relative flex flex-col justify-between shadow-inner">
                
                {/* Smartphone Dynamic Island / Status Bar */}
                <div className="pt-2.5 pb-1 px-5 flex items-center justify-between bg-slate-950 text-[10px] text-slate-400 font-semibold border-b border-slate-800/80">
                  <span>9:41</span>
                  <div className="w-16 h-4 bg-black rounded-full flex items-center justify-center gap-1 border border-slate-800 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px]">5G</span>
                    <div className="w-4 h-2 border border-slate-400 rounded-xs p-[1px]">
                      <div className="w-full h-full bg-emerald-400 rounded-2xs"></div>
                    </div>
                  </div>
                </div>

                {/* Smartphone App Header */}
                <div className="p-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-slate-950 flex items-center justify-center p-0.5 shadow-sm border border-emerald-500/30">
                      <img src="/pricehunt-icon.png" alt="PriceHunt" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-white block leading-none">PriceHunt</span>
                      <span className="text-[9px] text-emerald-400 font-bold block leading-none mt-0.5">Live App v2.0</span>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                    CONNECTED
                  </span>
                </div>

                {/* Smartphone App Content Area */}
                <div className="p-3.5 space-y-3 bg-slate-950/60">
                  
                  {/* Search Bar inside app */}
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-400 text-xs">
                    <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-slate-400 truncate">Search products, stores...</span>
                  </div>

                  {/* Featured Live Price Comparison Card inside phone */}
                  {featuredLiveProduct ? (
                    <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800/90 space-y-2.5 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> LIVE DEAL ALERT
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">Live Amazon</span>
                      </div>

                      <div className="flex gap-2.5 items-center">
                        <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center shadow-xs">
                          <img
                            src={featuredLiveProduct.image || (featuredLiveProduct.images && featuredLiveProduct.images[0]) || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200&auto=format&fit=crop&q=80'}
                            alt={featuredLiveProduct.title}
                            className="max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{featuredLiveProduct.title}</h4>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-extrabold text-emerald-400">
                              {formatINR(featuredLiveProduct.price || featuredLiveProduct.lowestPrice || 0)}
                            </span>
                            {(featuredLiveProduct.originalPrice || featuredLiveProduct.highestPrice) > (featuredLiveProduct.price || featuredLiveProduct.lowestPrice) && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatINR(featuredLiveProduct.originalPrice || featuredLiveProduct.highestPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amazon Live Price Badge inside phone */}
                      <div className="bg-emerald-950/60 border border-emerald-500/40 p-2 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-300">
                          Amazon.in Live Price
                        </span>
                        <span className="font-black text-emerald-400 shrink-0">
                          {formatINR(featuredLiveProduct.price || featuredLiveProduct.lowestPrice || 0)} ✓
                        </span>
                      </div>

                      {(featuredLiveProduct.originalPrice || featuredLiveProduct.highestPrice) > (featuredLiveProduct.price || featuredLiveProduct.lowestPrice) && (
                        <div className="bg-emerald-500/10 rounded-lg p-1.5 border border-emerald-500/20 text-center">
                          <span className="text-[10px] font-bold text-emerald-300">
                            🎉 Save {formatINR((featuredLiveProduct.originalPrice || featuredLiveProduct.highestPrice) - (featuredLiveProduct.price || featuredLiveProduct.lowestPrice))} ({featuredLiveProduct.discount || Math.round((((featuredLiveProduct.originalPrice || featuredLiveProduct.highestPrice) - (featuredLiveProduct.price || featuredLiveProduct.lowestPrice)) / (featuredLiveProduct.originalPrice || featuredLiveProduct.highestPrice)) * 100)}% OFF)!
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 animate-pulse h-36"></div>
                  )}

                  {/* Feature Pill inside phone */}
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Live Scraped</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>

                </div>

                {/* Smartphone App Bottom Action Bar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800">
                  <button
                    onClick={onOpenDownloadModal}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                    <span>Install PriceHunt App</span>
                  </button>
                </div>

              </div>
            </div>

            {/* FIXED & STEADY Push Notification Alert Badge (No bouncing/movement) */}
            {featuredLiveProduct && (
              <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 p-3 rounded-2xl shadow-2xl shadow-black/80 flex items-center gap-3 text-xs text-white z-20 max-w-[270px] transition-all hover:border-emerald-400/80 hidden sm:flex">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <Bell className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Instant Alert
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Just now</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-100 truncate block mt-0.5">
                    {featuredLiveProduct.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-black text-emerald-400">
                      {formatINR(featuredLiveProduct.price || featuredLiveProduct.lowestPrice || 0)}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      Lowest Price
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};

export default MobileAppSection;
