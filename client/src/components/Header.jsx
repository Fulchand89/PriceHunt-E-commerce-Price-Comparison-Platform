import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Heart, Bell, User, LogOut, Shield, ChevronDown, Menu, X,
  Tag, TrendingDown, Layers, ShoppingBag, CheckCircle2, Smartphone, Download,
  Scale, Search, Sparkles, BookOpen, HelpCircle
} from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import { logout } from '../redux/slices/authSlice';

const Header = ({ onOpenDownloadModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { categories } = useSelector((state) => state.categories);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setIsProfileDropdownOpen(false);
    setIsCategoriesOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Track window scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const isCompareActive = location.pathname.startsWith('/compare');

  return (
    <header className={`sticky top-0 z-40 bg-slate-900/98 backdrop-blur-md border-b border-slate-800/90 text-white transition-all duration-300 ${
      isScrolled ? 'shadow-xl shadow-slate-950/40' : 'shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-16 lg:h-20 gap-2 sm:gap-4">

          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-1.5 xs:gap-2.5 group shrink-0">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-base xs:text-lg sm:text-xl shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
              🏷️
            </div>
            <div className="flex flex-col">
              <span className="text-base xs:text-lg sm:text-2xl font-black tracking-tight text-white leading-none">
                Price<span className="text-emerald-400">Hunt</span>
              </span>
              <span className="hidden xs:block text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                Smart Comparison
              </span>
            </div>
          </Link>

          {/* Center: Desktop & Tablet Search Bar */}
          <div className="hidden sm:block flex-1 min-w-[200px] max-w-sm md:max-w-md lg:max-w-xl mx-2">
            <SearchAutocomplete />
          </div>

          {/* Desktop Navigation Links (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold text-slate-300">
            <Link
              to="/"
              className={`hover:text-emerald-400 transition-colors ${location.pathname === '/' ? 'text-emerald-400 font-bold' : ''}`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div 
              className="relative" 
              onMouseEnter={() => setIsCategoriesOpen(true)} 
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 hover:text-emerald-400 transition-colors py-2 cursor-pointer">
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat._id || cat.id || cat.slug}
                      to={`/search?category=${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2 hover:bg-slate-800 hover:text-emerald-400 text-slate-200 text-sm transition-colors"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-emerald-400 rounded-full shrink-0">
                        {cat.productCount || 0}
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-800 mt-2 pt-2 px-4">
                    <Link to="/categories" className="text-xs font-bold text-emerald-400 hover:underline flex items-center justify-between">
                      <span>View All Categories</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Compare Prices Link (Highlighted) */}
            <Link
              to="/compare"
              className={`flex items-center gap-1.5 transition-colors ${
                isCompareActive 
                  ? 'text-emerald-400 font-extrabold' 
                  : 'hover:text-emerald-400 font-bold'
              }`}
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Compare</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                Live
              </span>
            </Link>

            <Link to="/deals" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 font-semibold transition-colors">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Deals</span>
            </Link>

            <Link to="/blog" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 font-semibold transition-colors">
              Guides
            </Link>

            <Link to="/faq" className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 font-semibold transition-colors">
              FAQs
            </Link>
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">

            {/* Mobile Search Toggle Button (< sm:) */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`sm:hidden p-2 rounded-xl transition-colors shrink-0 cursor-pointer ${
                isMobileSearchOpen ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              aria-label="Toggle Search"
            >
              {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Compare Quick Link (Mobile & Tablet) */}
            <Link
              to="/compare"
              className={`p-2 rounded-xl transition-colors shrink-0 relative lg:hidden ${
                isCompareActive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Price Comparison"
              aria-label="Price Comparison"
            >
              <Scale className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
            </Link>

            {/* App Download Button (Tablet & Desktop) */}
            <button
              onClick={onOpenDownloadModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer"
              title="Download Mobile App"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden xl:inline">Get App</span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems?.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Price Alerts Link (>= sm:) */}
            <Link
              to="/alerts"
              className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
              title="Price Alerts"
              aria-label="Price Alerts"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* User Profile / Auth Cluster */}
            {isAuthenticated ? (
              <div className="relative shrink-0" ref={profileRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                  aria-label="User profile menu"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.name || 'Profile'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-emerald-400 shadow-2xs"
                  />
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                        {user?.role} Account
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>User Dashboard</span>
                    </Link>

                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors sm:hidden"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      <span>My Wishlist</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/40 transition-colors border-t border-slate-800 mt-1 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non-authenticated login/signup buttons */
              <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-slate-200 hover:text-white px-2 xs:px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden xs:inline-flex text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-3 sm:px-4 py-1.5 rounded-full shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Collapsible Mobile Search Row (< sm:) */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-900/98 animate-in slide-in-from-top-2 duration-200">
          <SearchAutocomplete />
        </div>
      )}

      {/* Full Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-in Menu Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  🏷️
                </div>
                <div>
                  <span className="font-black text-slate-900 text-base leading-none block">
                    Price<span className="text-emerald-600">Hunt</span>
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mt-0.5">
                    Price Comparison
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Overview if Logged In */}
            {isAuthenticated && (
              <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    {user?.role} Account
                  </span>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <nav className="flex flex-col space-y-1 text-sm font-semibold">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                    location.pathname === '/' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Home</span>
                </Link>

                {/* Compare Highlighted Link */}
                <Link
                  to="/compare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors ${
                    isCompareActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-sm'
                      : 'bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 font-bold'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Scale className={`w-4 h-4 ${isCompareActive ? 'text-white' : 'text-emerald-600'}`} />
                    <span>Price Comparison</span>
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isCompareActive ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    Live
                  </span>
                </Link>

                <Link
                  to="/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 transition-colors"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>All Categories</span>
                </Link>

                <Link
                  to="/deals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-amber-50 text-amber-700 font-bold transition-colors"
                >
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Coupons & Deals</span>
                </Link>

                <Link
                  to="/search?sortBy=highestDiscount"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-emerald-50 text-emerald-700 font-bold transition-colors"
                >
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span>Price Drops</span>
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>My Wishlist</span>
                  </span>
                  {wishlistItems?.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/alerts"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 transition-colors"
                >
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Price Alerts</span>
                </Link>

                <Link
                  to="/blog"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Buying Guides</span>
                </Link>

                <Link
                  to="/faq"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>FAQs & Help</span>
                </Link>

                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-emerald-950/10 text-emerald-700 font-bold border border-emerald-200 mt-2"
                  >
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDownloadModal();
                  }}
                  className="w-full text-left py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/15 border border-emerald-500/25 text-emerald-800 font-bold text-xs flex items-center justify-between hover:bg-emerald-500/20 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Download Mobile App</span>
                  </span>
                  <Download className="w-4 h-4 text-emerald-600" />
                </button>

                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left py-2.5 px-3.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
