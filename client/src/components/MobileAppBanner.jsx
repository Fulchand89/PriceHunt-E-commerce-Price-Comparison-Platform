import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Star, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const MobileAppBanner = ({ onOpenDownloadModal }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const screenMobile = window.innerWidth < 768;
      setIsMobile(userAgentMobile || screenMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if user previously dismissed banner in this session
    const dismissed = sessionStorage.getItem('pricehunt_app_banner_dismissed');
    if (dismissed === 'true') {
      setIsBannerVisible(false);
    }

    // PWA Install Event Handler
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
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setIsBannerVisible(false);
    sessionStorage.setItem('pricehunt_app_banner_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsBannerVisible(false);
      }
      setDeferredPrompt(null);
      return;
    }

    // If modal opener is passed, open it, otherwise trigger direct download
    if (onOpenDownloadModal) {
      onOpenDownloadModal();
    } else {
      const element = document.createElement('a');
      element.setAttribute('href', '/pricehunt-app.apk');
      element.setAttribute('download', 'PriceHunt-v2.0.0.apk');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Only render on mobile devices
  if (!isMobile || !isBannerVisible || isInstalled) return null;

  return (
    <div className="relative z-30 bg-slate-900 text-white border-b border-emerald-500/30 shadow-md px-3 py-2 flex items-center justify-between gap-2.5 animate-in slide-in-from-top duration-300">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Close app banner"
      >
        <X className="w-4 h-4" />
      </button>

      {/* App Icon */}
      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 border border-emerald-500/30 p-1">
        <img src="/pricehunt-icon.png" alt="PriceHunt" className="w-full h-full object-contain" />
      </div>

      {/* App Title & Info */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-xs sm:text-sm text-white truncate">PriceHunt App</span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
            Free
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold ml-0.5 text-slate-200">4.9</span>
          </div>
          <span className="text-slate-500 text-[10px]">•</span>
          <span className="text-[10px] text-slate-300 truncate">1-Tap Price Comparisons</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0"
      >
        <Download className="w-3.5 h-3.5 text-slate-950" />
        <span>INSTALL</span>
      </button>
    </div>
  );
};

export default MobileAppBanner;
