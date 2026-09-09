import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ArrowRight, Tag, Package, X, Loader2, ChevronDown, Layers } from 'lucide-react';
import API from '../services/api';
import { formatINR } from '../utils/formatters';
import { fetchCategories } from '../redux/slices/categorySlice';

const SearchAutocomplete = ({ 
  className = '', 
  placeholder = 'Search products, brands & categories...',
  showCategorySelect = true,
  initialCategory = '',
  initialQuery = ''
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], suggestions: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Fetch live suggestions on query change
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions({ products: [], categories: [], suggestions: [] });
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await API.get('/amazon/search', { params: { q: query.trim(), limit: 6 } });
        if (res.data?.data) {
          const amazonItems = (res.data.data || []).map((p) => ({
            ...p,
            id: p.asin,
            title: p.title,
            image: p.image,
            lowestPrice: p.price,
            brand: 'Amazon'
          }));
          setSuggestions({
            products: amazonItems,
            categories: [],
            suggestions: []
          });
          setIsOpen(amazonItems.length > 0);
        }
      } catch (err) {
        // Silent catch for live suggestions
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanQ = query.trim();
    if (cleanQ || selectedCategory) {
      const params = new URLSearchParams();
      if (cleanQ) params.set('q', cleanQ);
      if (selectedCategory) params.set('category', selectedCategory);
      navigate(`/search?${params.toString()}`);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-center w-full bg-white rounded-full border border-slate-200/90 shadow-xs hover:border-slate-300 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 transition-all duration-200"
      >
        {/* Category Selector Dropdown */}
        {showCategorySelect && (
          <div className="relative border-r border-slate-200/90 shrink-0 hidden sm:block">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold pl-3.5 pr-7 py-2 h-10 sm:h-11 rounded-l-full outline-none cursor-pointer transition-colors max-w-[130px] lg:max-w-[150px] truncate"
              aria-label="Filter by Category"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c.slug || c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Search Icon */}
        <div className="pl-3 sm:pl-3.5 pointer-events-none text-slate-400 shrink-0">
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="w-full bg-transparent text-slate-900 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 h-10 sm:h-11 outline-none min-w-0 placeholder:text-slate-400 placeholder:font-normal"
        />

        {/* Spinner or Clear Icon */}
        {isLoading ? (
          <div className="pr-2 text-emerald-600 animate-spin shrink-0">
            <Loader2 className="w-4 h-4" />
          </div>
        ) : query.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mr-1 shrink-0"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}

        {/* Search / Find Button */}
        <div className="pr-1.5 shrink-0">
          <button
            type="submit"
            className="h-7 sm:h-8 px-3 sm:px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:bg-right bg-[length:150%_auto] active:scale-95 text-white text-xs font-extrabold rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">Find</span>
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (suggestions.products?.length > 0 || suggestions.categories?.length > 0 || suggestions.suggestions?.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Categories Suggestions */}
          {suggestions.categories?.length > 0 && (
            <div className="px-3 sm:px-4 py-2 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                <Layers className="w-3 h-3 text-emerald-600" /> Suggested Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.categories.map((c) => (
                  <button
                    key={c.id || c.name}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.slug || c.name);
                      navigate(`/search?category=${encodeURIComponent(c.slug || c.name)}`);
                      setIsOpen(false);
                    }}
                    className="text-[11px] sm:text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-full transition-colors flex items-center gap-1"
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Suggestions with Images & Lowest Prices */}
          {suggestions.products?.length > 0 && (
            <div className="py-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 px-3 sm:px-4 py-1.5">
                <Package className="w-3 h-3 text-emerald-600" /> Live Matching Products
              </span>
              {suggestions.products.map((p) => {
                const title = p.title || p.name || 'Product';
                const img = p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100&auto=format&fit=crop&q=80';
                const pId = p.id || p._id;
                return (
                  <Link
                    key={pId}
                    to={`/products/${pId}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 hover:bg-emerald-50/50 transition-colors group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0 flex items-center justify-center group-hover:border-emerald-300 transition-colors">
                      <img 
                        src={img} 
                        alt={title} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 truncate">{title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.lowestPrice ? (
                          <span className="text-[11px] font-extrabold text-emerald-600">
                            From {formatINR(p.lowestPrice)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Compare Stores</span>
                        )}
                        {p.brand && (
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            • {p.brand}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Quick Submit Footer */}
          <div className="px-3 sm:px-4 pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline py-1.5 w-full block cursor-pointer"
            >
              See all live price comparisons for "{query}" &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
