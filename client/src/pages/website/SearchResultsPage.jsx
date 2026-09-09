import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  SlidersHorizontal, ArrowUpDown, Tag, Store, CheckCircle, SearchX, 
  Layers, IndianRupee, RefreshCw, X, Sparkles, Filter, ExternalLink,
  ChevronRight
} from 'lucide-react';
import API from '../../services/api';
import { searchProducts } from '../../redux/slices/productSlice';
import { searchAmazon } from '../../redux/slices/amazonSlice';
import { searchFlipkart } from '../../redux/slices/flipkartSlice';
import { fetchCategories, fetchBrands } from '../../redux/slices/categorySlice';
import { fetchStores } from '../../redux/slices/storeSlice';
import { formatINR } from '../../utils/formatters';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const storeParam = searchParams.get('store') || '';
  const sortByParam = searchParams.get('sortBy') || 'lowestPrice';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const discountParam = searchParams.get('discount') || '';

  const { products: amazonProducts, count: totalAmazonCount, loading: amazonLoading, error: amazonError, lastUpdated: amazonLastUpdated } = useSelector((state) => state.amazon);
  const { products: flipkartProducts, loading: flipkartLoading } = useSelector((state) => state.flipkart || { products: [], loading: false });
  const { categories, brands } = useSelector((state) => state.categories);
  const { stores } = useSelector((state) => state.stores);

  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    document.title = query ? `${query} - Products | PriceHunt` : 'Products Catalog | PriceHunt';
  }, [query]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchStores());
  }, [dispatch]);

  useEffect(() => {
    setMinPrice(minPriceParam);
  }, [minPriceParam]);

  useEffect(() => {
    setMaxPrice(maxPriceParam);
  }, [maxPriceParam]);

  useEffect(() => {
    const searchQuery = query || categoryParam || brandParam || '';
    dispatch(searchAmazon({
      q: searchQuery || 'iPhone',
      minPrice: minPriceParam,
      maxPrice: maxPriceParam
    }));
    dispatch(searchFlipkart({
      q: searchQuery || 'iPhone',
      minPrice: minPriceParam,
      maxPrice: maxPriceParam
    }));

    // Fetch catalog products from local DB (admin created)
    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        const params = {};
        if (query) params.q = query;
        if (categoryParam) params.category = categoryParam;
        if (brandParam) params.brand = brandParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;
        const res = await API.get('/products', { params });
        setCatalogProducts(res.data?.data || []);
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, [dispatch, query, categoryParam, brandParam, minPriceParam, maxPriceParam]);


  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPrice !== '') newParams.set('minPrice', minPrice);
    else newParams.delete('minPrice');
    if (maxPrice !== '') newParams.set('maxPrice', maxPrice);
    else newParams.delete('maxPrice');
    setSearchParams(newParams);
  };

  const applyPricePreset = (minVal, maxVal) => {
    const newParams = new URLSearchParams(searchParams);
    if (minVal !== '') {
      newParams.set('minPrice', minVal);
      setMinPrice(minVal);
    } else {
      newParams.delete('minPrice');
      setMinPrice('');
    }
    if (maxVal !== '') {
      newParams.set('maxPrice', maxVal);
      setMaxPrice(maxVal);
    } else {
      newParams.delete('maxPrice');
      setMaxPrice('');
    }
    setSearchParams(newParams);
  };

  const formatFreshness = (dateString) => {
    if (!dateString) return 'Live Results';
    const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffSec < 60) return 'Updated just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Updated ${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `Updated ${diffHours}h ago`;
  };

  const pricePresets = [
    { label: 'Under ₹5,000', min: '0', max: '5000' },
    { label: '₹5k - ₹20k', min: '5000', max: '20000' },
    { label: '₹20k - ₹50k', min: '20000', max: '50000' },
    { label: '₹50k - ₹1 Lakh', min: '50000', max: '100000' },
    { label: 'Above ₹1 Lakh', min: '100000', max: '' },
  ];

  const activeFilterCount = [categoryParam, brandParam, storeParam, minPriceParam, maxPriceParam, discountParam].filter(Boolean).length;

  // Find category display name
  const currentCategoryObj = categories.find(c => c.slug === categoryParam || c.name === categoryParam);
  const currentCategoryName = currentCategoryObj ? currentCategoryObj.name : categoryParam;

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      
      {/* Top Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {query 
                ? `Amazon Results for "${query}"` 
                : currentCategoryName 
                ? `Amazon ${currentCategoryName}` 
                : 'Live Amazon Products'}
            </h1>
            <span className="text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-200 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              {formatFreshness(amazonLastUpdated)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Found <span className="font-bold text-slate-900">{amazonProducts.length}</span> live products directly from Amazon
          </p>
        </div>

        {/* Desktop Sorting Dropdown */}
        <div className="hidden lg:flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase">Sort By:</span>
          <select
            value={sortByParam}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
          >
            <option value="lowestPrice">Price: Low to High</option>
            <option value="highestPrice">Price: High to Low</option>
            <option value="highestDiscount">Highest Savings / Discount</option>
            <option value="recentlyUpdated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* QUICK CATEGORIES SELECTOR CHIPS BAR */}
      <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" /> Categories:
          </span>
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              !categoryParam 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => {
            const isSelected = categoryParam === c.slug || categoryParam === c.name;
            return (
              <button
                key={c._id || c.id}
                onClick={() => updateFilter('category', isSelected ? '' : c.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                <span>{c.name}</span>
                {isSelected && <span className="text-[10px] bg-emerald-700 rounded-full w-4 h-4 inline-flex items-center justify-center">✕</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE APPLIED FILTERS BADGES */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400">Active Filters:</span>
          {categoryParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Category: {currentCategoryName}
              <button onClick={() => updateFilter('category', '')} className="hover:text-rose-600 font-bold ml-1">✕</button>
            </span>
          )}
          {(minPriceParam || maxPriceParam) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Price: {minPriceParam ? formatINR(minPriceParam) : '₹0'} - {maxPriceParam ? formatINR(maxPriceParam) : 'Any'}
              <button 
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('minPrice');
                  newParams.delete('maxPrice');
                  setMinPrice('');
                  setMaxPrice('');
                  setSearchParams(newParams);
                }} 
                className="hover:text-rose-600 font-bold ml-1"
              >
                ✕
              </button>
            </span>
          )}
          {brandParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Brand: {brandParam}
              <button onClick={() => updateFilter('brand', '')} className="hover:text-rose-600 font-bold ml-1">✕</button>
            </span>
          )}
          {discountParam && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
              {discountParam}%+ Discount
              <button onClick={() => updateFilter('discount', '')} className="hover:text-rose-600 font-bold ml-1">✕</button>
            </span>
          )}
          <button
            onClick={() => {
              const newParams = new URLSearchParams();
              if (query) newParams.set('q', query);
              setSearchParams(newParams);
              setMinPrice('');
              setMaxPrice('');
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* AMAZON LIVE API STATUS BAR */}
      <div className="bg-amber-50/50 p-3 sm:p-4 rounded-2xl border border-amber-200/60 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 sm:gap-2">
            <Store className="w-3.5 h-3.5 text-amber-600" /> Amazon Product Data API:
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-amber-700 truncate ml-2">
            {amazonLoading ? 'Querying Amazon live products...' : amazonError ? 'Amazon API unavailable' : 'Real-time Live Amazon Source Active'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${
            amazonError 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${amazonError ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span>Amazon India (amazon.in)</span>
            <span className="text-[10px] opacity-75">
              {amazonLoading ? 'Fetching...' : amazonError ? 'Offline' : `✓ (${amazonProducts.length} Items)`}
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER & SORT ACTION BAR */}
      <div className="lg:hidden sticky top-14 xs:top-16 z-30 flex items-center justify-between bg-white/95 backdrop-blur-md p-2.5 xs:p-3 rounded-2xl border border-slate-200 shadow-sm gap-2">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-900 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 rounded-xl px-2 py-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={sortByParam}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none py-1 truncate"
          >
            <option value="lowestPrice">Price: Low to High</option>
            <option value="highestPrice">Price: High to Low</option>
            <option value="highestDiscount">Highest Discount</option>
            <option value="recentlyUpdated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET DRAWER */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          <div className="relative w-full max-h-[88vh] bg-white rounded-t-3xl shadow-2xl z-10 flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle & Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Filters & Price Range</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="p-4 overflow-y-auto space-y-5 custom-scrollbar flex-1">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Category</label>
                <select
                  value={categoryParam}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter Inputs */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Price Range (₹ Min / Max)
                </label>
                <form 
                  onSubmit={(e) => { 
                    handlePriceApply(e); 
                    setIsMobileFiltersOpen(false); 
                  }} 
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                    />
                    <span className="text-slate-400 text-xs font-bold">-</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-700"
                  >
                    Apply Price Range
                  </button>
                </form>

                {/* Quick Presets */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {pricePresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        applyPricePreset(p.min, p.max);
                        setIsMobileFiltersOpen(false);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg transition-colors border border-slate-200"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Brand</label>
                <select
                  value={brandParam}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b._id || b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Min Discount Filter */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Minimum Discount</label>
                <div className="flex flex-wrap gap-2">
                  {['10', '20', '30', '50'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateFilter('discount', discountParam === d ? '' : d)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                        discountParam === d
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {d}%+ OFF
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Apply CTA */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                View {amazonProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP LAYOUT WITH SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <div className="hidden lg:block lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" /> Filters
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  const newParams = new URLSearchParams();
                  if (query) newParams.set('q', query);
                  setSearchParams(newParams);
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> Category
            </label>
            <select
              value={categoryParam}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range (Min / Max) Filter */}
          <div className="space-y-2.5 border-t border-slate-100 pt-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Price Range (₹)
            </label>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                />
                <span className="text-slate-400 text-xs font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Apply Range
              </button>
            </form>

            {/* Quick Price Range Presets */}
            <div className="pt-2 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Quick Price Presets:
              </span>
              <div className="flex flex-col gap-1">
                {pricePresets.map((p) => {
                  const isActive = minPriceParam === p.min && maxPriceParam === p.max;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPricePreset(p.min, p.max)}
                      className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{p.label}</span>
                      {isActive && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Brand</label>
            <select
              value={brandParam}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b._id || b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Store Filter */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Store</label>
            <select
              value={storeParam}
              onChange={(e) => updateFilter('store', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">All Stores</option>
              {stores.map((s) => (
                <option key={s._id || s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Min Discount Filter */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Minimum Discount</label>
            <div className="flex flex-wrap gap-1.5">
              {['10', '20', '30', '50'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateFilter('discount', discountParam === d ? '' : d)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    discountParam === d
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d}%+ OFF
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        <div className="lg:col-span-3 space-y-4">
          {(amazonLoading && flipkartLoading && catalogLoading) ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200 p-4 flex flex-col justify-between">
                  <div className="w-full h-44 bg-slate-100 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="w-3/4 h-4 bg-slate-100 rounded"></div>
                    <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (catalogProducts.length === 0 && amazonProducts.length === 0 && flipkartProducts.length === 0) ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 space-y-4 shadow-card">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">No products found.</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
                No products matched your search parameters. Try clearing filters or entering a different query.
              </p>
              <button
                onClick={() => {
                  setSearchParams({});
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="bg-emerald-600 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Catalog Products Section if present */}
              {catalogProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Store Catalog Products ({catalogProducts.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {catalogProducts.map((prod, index) => {
                      const pId = prod.id || prod._id;
                      const title = prod.title || prod.name || 'Catalog Product';
                      const image = prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80';
                      const price = prod.price ?? prod.lowestPrice ?? 0;
                      const originalPrice = prod.originalPrice ?? prod.highestPrice ?? null;
                      const brandName = typeof prod.brand === 'object' ? prod.brand?.name : (prod.brand || '');
                      const catName = typeof prod.category === 'object' ? prod.category?.name : (prod.category || '');
                      const discount = originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                      const offersCount = prod.totalOffers || (prod.offers?.length) || 1;

                      return (
                        <div
                          key={`cat-${pId}-${index}`}
                          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-emerald-500/50 transition-all duration-300 flex flex-col overflow-hidden group"
                        >
                          <div className="relative p-3 sm:p-4 bg-slate-50/80 h-44 sm:h-52 flex items-center justify-center overflow-hidden">
                            <img
                              src={image}
                              alt={title}
                              className="max-h-36 sm:max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {discount > 0 && (
                              <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                                {discount}% OFF
                              </span>
                            )}
                            <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                              Verified Catalog
                            </span>
                          </div>

                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-extrabold mb-1">
                                {brandName && <span className="uppercase tracking-wider text-emerald-700">{brandName}</span>}
                                {catName && <span className="text-slate-400 font-semibold">{catName}</span>}
                              </div>
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-emerald-700 transition-colors">
                                <Link to={`/products/${pId}`}>
                                  {title}
                                </Link>
                              </h3>
                            </div>

                            <div className="space-y-1 border-t border-slate-100 pt-2.5 sm:pt-3">
                              <div className="flex items-baseline justify-between">
                                <span className="text-[11px] sm:text-xs text-slate-400">Lowest Price:</span>
                                <span className="text-base sm:text-lg font-black text-slate-900">
                                  {formatINR(price)}
                                </span>
                              </div>
                              {originalPrice && originalPrice > price && (
                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                  <span className="text-slate-400">M.R.P:</span>
                                  <span className="line-through text-slate-400">{formatINR(originalPrice)}</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <Link
                                to={`/products/${pId}`}
                                className="text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Offers ({offersCount})</span>
                              </Link>
                              <Link
                                to={`/compare/product/${pId}`}
                                className="text-center py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Compare</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Flipkart Live Results Grid */}
              {flipkartProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> Flipkart Live Search Results ({flipkartProducts.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {flipkartProducts.map((prod, index) => {
                      const fkId = prod.id || prod.productId || prod.fsn;
                      const title = prod.title || 'Flipkart Product';
                      const image = prod.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80';
                      const price = prod.price;
                      const originalPrice = prod.originalPrice;
                      const discount = prod.discount;
                      const rating = prod.rating;
                      const reviewCount = prod.reviewCount;
                      const availability = prod.availability || 'In Stock';
                      const compareTarget = fkId ? encodeURIComponent(fkId) : encodeURIComponent(title);

                      return (
                        <div
                          key={`fk-${fkId || index}`}
                          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-blue-500/50 transition-all duration-300 flex flex-col overflow-hidden group"
                        >
                          <div className="relative p-3 sm:p-4 bg-slate-50/80 h-44 sm:h-52 flex items-center justify-center overflow-hidden">
                            <img
                              src={image}
                              alt={title}
                              className="max-h-36 sm:max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {discount > 0 && (
                              <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                                {discount}% OFF
                              </span>
                            )}
                            <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                              Flipkart
                            </span>
                          </div>

                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-extrabold mb-1">
                                <span className="uppercase tracking-wider text-blue-700">STORE: FLIPKART</span>
                                <span className="text-emerald-600 font-semibold">{availability}</span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-blue-700 transition-colors">
                                <Link to={`/compare/flipkart/${compareTarget}`}>
                                  {title}
                                </Link>
                              </h3>
                              {rating !== null && (
                                <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-600">
                                  <span>★ {rating}</span>
                                  {reviewCount !== null && (
                                    <span className="text-slate-400 font-normal">({reviewCount.toLocaleString()} ratings)</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 border-t border-slate-100 pt-2.5 sm:pt-3">
                              <div className="flex items-baseline justify-between">
                                <span className="text-[11px] sm:text-xs text-slate-400">Current Price:</span>
                                <span className="text-base sm:text-lg font-black text-slate-900">
                                  {price !== null ? formatINR(price) : 'Live Price'}
                                </span>
                              </div>
                              {originalPrice !== null && originalPrice > price && (
                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                  <span className="text-slate-400">M.R.P:</span>
                                  <span className="line-through text-slate-400">{formatINR(originalPrice)}</span>
                                </div>
                              )}
                            </div>

                            <Link
                              to={`/compare/flipkart/${compareTarget}`}
                              className="w-full text-center py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Compare Prices & Store Offers</span>
                              <ChevronRight className="w-3.5 h-3.5 text-white" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Amazon Live Results Grid */}
              {amazonProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Amazon Live Search Results ({amazonProducts.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                    {amazonProducts.map((prod, index) => {
                      const asin = prod.asin;
                      const title = prod.title || 'Amazon Product';
                      const image = prod.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80';
                      const price = prod.price;
                      const originalPrice = prod.originalPrice;
                      const discount = prod.discount;
                      const rating = prod.rating;
                      const reviewCount = prod.reviewCount;
                      const availability = prod.availability || 'In Stock';

                      return (
                        <div
                          key={prod._id ? `${prod._id}-${index}` : asin ? `${asin}-${index}` : `${title}-${index}`}
                          className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-amber-500/50 transition-all duration-300 flex flex-col overflow-hidden group"
                        >
                          <div className="relative p-3 sm:p-4 bg-slate-50/80 h-44 sm:h-52 flex items-center justify-center overflow-hidden">
                            <img
                              src={image}
                              alt={title}
                              className="max-h-36 sm:max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {discount > 0 && (
                              <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-rose-600 text-white font-extrabold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                                {discount}% OFF
                              </span>
                            )}
                            <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                              Amazon
                            </span>
                          </div>

                          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-extrabold mb-1">
                                <span className="uppercase tracking-wider text-amber-700">ASIN: {asin}</span>
                                <span className="text-emerald-600 font-semibold">{availability}</span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-amber-700 transition-colors">
                                <Link to={`/compare/amazon/${asin || encodeURIComponent(title)}`}>
                                  {title}
                                </Link>
                              </h3>
                              {rating !== null && (
                                <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-600">
                                  <span>★ {rating}</span>
                                  {reviewCount !== null && (
                                    <span className="text-slate-400 font-normal">({reviewCount.toLocaleString()} ratings)</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 border-t border-slate-100 pt-2.5 sm:pt-3">
                              <div className="flex items-baseline justify-between">
                                <span className="text-[11px] sm:text-xs text-slate-400">Current Price:</span>
                                <span className="text-base sm:text-lg font-black text-slate-900">
                                  {price !== null ? formatINR(price) : 'Live Price'}
                                </span>
                              </div>
                              {originalPrice !== null && originalPrice > price && (
                                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                                  <span className="text-slate-400">M.R.P:</span>
                                  <span className="line-through text-slate-400">{formatINR(originalPrice)}</span>
                                </div>
                              )}
                            </div>

                            <Link
                              to={`/compare/amazon/${asin || encodeURIComponent(title)}`}
                              className="w-full text-center py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Compare Prices & Store Offers</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-950" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


      </div>

    </div>
  );
};

export default SearchResultsPage;
