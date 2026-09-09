import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, QrCode, CheckCircle2, ShieldCheck, Sparkles, Apple, Play, FileDown } from 'lucide-react';

const AppDownloadModal = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState('install');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // 1. Trigger PWA Native installation if prompt is available
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    // 2. Trigger direct APK file download on phone
    handleDirectApkDownload();
  };

  const handleDirectApkDownload = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/pricehunt-app.apk');
    element.setAttribute('download', 'PriceHunt-v2.0.0.apk');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl relative text-white space-y-0">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 pt-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/40">
            <Smartphone className="w-9 h-9 text-white animate-bounce" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold tracking-wide border border-white/20 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Official Mobile Experience
          </span>

          <h3 className="text-2xl font-black text-white tracking-tight">
            Download PriceHunt App
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
            Get instant price drop alerts, barcode scanner & 1-tap store comparisons on your mobile phone!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* Quick Install / Download Buttons for Mobile */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-center">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span>Direct Mobile Installation</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified App
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Native App Install */}
              <button
                onClick={handleInstallClick}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalled ? 'App Installed ✓' : 'Install App on Phone'}</span>
              </button>

              {/* Button 2: Direct APK File Download */}
              <button
                onClick={handleDirectApkDownload}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all hover:scale-[1.02]"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>Download APK File</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Tap "Install App on Phone" or "Download APK File" to get PriceHunt directly on your Android or iPhone!
            </p>
          </div>

          {/* Store Badges & QR Code Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('install')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'install' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                App Stores
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'qr' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scan QR Code
              </button>
            </div>

            {activeTab === 'install' ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Google Play Store Badge */}
                <button
                  onClick={handleInstallClick}
                  className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex items-center gap-3 transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">GET IT ON</span>
                    <span className="text-xs font-bold text-white block">Google Play</span>
                  </div>
                </button>

                {/* Apple App Store Badge */}
                <button
                  onClick={handleInstallClick}
                  className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex items-center gap-3 transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Apple className="w-5 h-5 fill-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Download on the</span>
                    <span className="text-xs font-bold text-white block">App Store</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-md">
                  {/* Generated QR Code for mobile scanning */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://pricehunt.app"
                    alt="Scan to install PriceHunt app"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Scan this QR code with your mobile camera to open & install PriceHunt immediately!
                </p>
              </div>
            )}
          </div>

          {/* App Features List */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Real-Time Price Drop Alerts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Barcode & Voice Search</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>8+ Store Comparisons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Offline Wishlist & Deals</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AppDownloadModal;
