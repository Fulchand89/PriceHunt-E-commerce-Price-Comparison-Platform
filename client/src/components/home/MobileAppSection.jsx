import React from 'react';
import { Smartphone, Download, QrCode, Search, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

const MobileAppSection = ({ featuredLiveProduct, onOpenDownloadModal }) => {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden max-w-7xl mx-auto shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Official Mobile App
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Download <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">PriceHunt App</span> on Your Phone
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Compare prices on the go! Set instant price drop notifications, scan product barcodes, and find cheaper deals across Amazon, Flipkart, Croma & Myntra straight from your smartphone.
          </p>

          {/* Feature Bullet Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Instant Price Drop Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>1-Tap Amazon & Flipkart Comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Offline Saved Wishlist & Deals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Works on Android & iPhone (iOS)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={onOpenDownloadModal}
              className="btn-primary py-3.5 px-6 rounded-2xl text-sm font-extrabold cursor-pointer"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Install Mobile App</span>
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200 shadow-sm hover:text-white cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>

        {/* Graphic Phone Mockup — Hyper-realistic Smartphone Frame */}
        <div className="lg:col-span-5 flex justify-center items-center py-4">
          <div className="relative group">
            
            {/* Outer ambient glow backlight */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 via-teal-500/20 to-cyan-500/30 rounded-[55px] blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Smartphone Frame */}
            <div className="relative w-[280px] xs:w-[300px] sm:w-[320px] bg-slate-950 p-3 sm:p-3.5 rounded-[46px] border-[6px] border-slate-700/80 shadow-2xl shadow-emerald-950/80 transition-all duration-500 group-hover:scale-[1.02]">
              
              {/* Side hardware buttons */}
              <div className="absolute -left-[9px] top-24 w-[3px] h-10 bg-slate-700 rounded-l-md"></div>
              <div className="absolute -left-[9px] top-38 w-[3px] h-12 bg-slate-700 rounded-l-md"></div>
              <div className="absolute -right-[9px] top-28 w-[3px] h-16 bg-slate-700 rounded-r-md"></div>

              {/* Inner Bezel Screen Display */}
              <div className="bg-slate-900 rounded-[36px] overflow-hidden border border-slate-800 text-left relative flex flex-col justify-between shadow-inner">
                
                {/* Smartphone Top Notch / Dynamic Island */}
                <div className="pt-2.5 pb-1 px-5 flex items-center justify-between bg-slate-950 text-[10px] text-slate-400 font-semibold border-b border-slate-800/80">
                  <span>9:41</span>
                  <div className="w-16 h-4 bg-black rounded-full flex items-center justify-center gap-1 border border-slate-800 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
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
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                      🏷️
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
                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          ⚡ LIVE DEAL ALERT
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

            {/* Floating Deals Popover Badge with live product */}
            {featuredLiveProduct && (
              <div className="absolute -bottom-3 -left-6 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 p-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs text-white z-20 animate-bounce duration-1000 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  🔔
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">Instant Alert</span>
                  <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[170px] block">
                    {featuredLiveProduct.title}
                  </span>
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
