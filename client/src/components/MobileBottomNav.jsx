import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Search, Grid, Heart, Smartphone } from 'lucide-react';

const MobileBottomNav = ({ onOpenDownloadModal }) => {
  const location = useLocation();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Categories', path: '/categories', icon: Grid },
    {
      label: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
      badge: wishlistItems?.length > 0 ? wishlistItems.length : null
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
      <div className="grid grid-cols-5 h-14 items-center max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th Tab: App Download CTA */}
        <button
          type="button"
          onClick={onOpenDownloadModal}
          className="flex flex-col items-center justify-center py-1 text-emerald-600 hover:text-emerald-700 transition-transform active:scale-95"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 mt-0.5">Get App</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
