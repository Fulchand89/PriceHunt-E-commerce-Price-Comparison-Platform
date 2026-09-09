import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, TrendingDown, Sparkles, 
  Store, ShoppingCart, Info, ExternalLink, RefreshCw, ShieldCheck,
  ChevronDown, Search, ArrowRight, Award, Zap
} from 'lucide-react';
import API from '../../services/api';
import { formatINR } from '../../utils/formatters';

const ComparisonPage = () => {
  const { productId, asin: paramAsin, flipkartId: paramFlipkartId, type: routeType, id: routeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine comparison identifier
  const asin = paramAsin || searchParams.get('asin');
  const fkId = paramFlipkartId || searchParams.get('flipkartId');
  const targetId = productId || routeId || searchParams.get('productId');
  const isAmazonType = routeType === 'amazon' || Boolean(asin && !targetId && !fkId);
  const isFlipkartType = routeType === 'flipkart' || Boolean(fkId && !targetId) || (window.location.pathname.includes('/compare/flipkart'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Catalog products for "Mera Data" selector
  const [catalogList, setCatalogList] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 1. Fetch catalog products on mount to populate selector
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const res = await API.get('/comparison/catalog');
        if (res.data?.products) {
          setCatalogList(res.data.products);
          // If no product or asin or fkId is specified in url, auto-select first catalog product
          if (!targetId && !asin && !fkId && !isFlipkartType && res.data.products.length > 0) {
            const firstId = res.data.products[0].id || res.data.products[0]._id;
            navigate(`/compare/product/${firstId}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to load comparison catalog:', err);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // 2. Load comparison data
  const loadComparison = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let res;
      if (isFlipkartType && (fkId || targetId || routeId)) {
        const idToFetch = fkId || targetId || routeId;
        res = await API.get(`/comparison/flipkart/${encodeURIComponent(idToFetch)}`);
      } else if (isAmazonType && asin) {
        res = await API.get(`/comparison/amazon/${encodeURIComponent(asin)}`);
      } else if (targetId) {
        res = await API.get(`/comparison/product/${encodeURIComponent(targetId)}`);
      } else if (asin) {
        res = await API.get(`/comparison/amazon/${encodeURIComponent(asin)}`);
      } else {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Comparison load error:', err);
      setError(err.response?.data?.message || 'Failed to load product comparison.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (targetId || asin) {
      loadComparison();
    }
  }, [targetId, asin, routeType]);

  const handleSelectCatalogProduct = (p) => {
    setIsDropdownOpen(false);
    setSelectorSearch('');
    const pId = p.id || p._id;
    navigate(`/compare/product/${pId}`);
  };

  const filteredCatalog = catalogList.filter(p => {
    const title = (p.title || p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const q = selectorSearch.toLowerCase();
    return title.includes(q) || brand.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* Top Breadcrumb & Live Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadComparison(true)}
            disabled={refreshing || loading || (!targetId && !asin)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300/80 transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Real-Time Live Scraped Pricing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{refreshing ? 'Updating Live Feed...' : 'Refresh Live Prices'}</span>
          </button>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Mera Data vs Live Market
          </span>
        </div>
      </div>

      {/* Hero Header & Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Real-Time Multi-Channel Price Comparison
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Mera Store Data &amp; Live Market Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
          Compare your store's official direct catalog pricing side-by-side with real-time scraped pricing from Amazon India &amp; top online retailers.
        </p>
      </div>

      {/* "MERA DATA" CATALOG PRODUCT SELECTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-slate-700/60 relative z-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> Select "Mera Data" Catalog Product
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Choose an item from your store to compare live
            </h3>
          </div>

          {/* Searchable Dropdown */}
          <div className="relative w-full md:w-96">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950/80 hover:bg-slate-950 border border-slate-700 text-left px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all focus:outline-none focus:border-emerald-500"
            >
              <span className="truncate pr-2">
                {data?.myProduct?.title 
                  ? `Selected: ${data.myProduct.title}` 
                  : (catalogList.length > 0 ? 'Click to select product...' : 'Loading catalog...')}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-white max-h-72 flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={selectorSearch}
                    onChange={(e) => setSelectorSearch(e.target.value)}
                    placeholder="Search your store products..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto space-y-1 pr-1 custom-scrollbar max-h-56">
                  {filteredCatalog.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      No matching store products found.
                    </div>
                  ) : (
                    filteredCatalog.map((p) => {
                      const pId = p.id || p._id;
                      const isSelected = targetId === pId;
                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => handleSelectCatalogProduct(p)}
                          className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors ${
                            isSelected 
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' 
                              : 'hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=80'}
                            alt={p.title}
                            className="w-8 h-8 object-contain bg-slate-900 rounded-lg p-0.5 shrink-0 border border-slate-800"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{p.title}</p>
                            <p className="text-[10px] text-slate-400">
                              Store Price: <span className="text-emerald-400 font-bold">{formatINR(p.price || 0)}</span>
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Product Chips */}
        {catalogList.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Picks:</span>
            {catalogList.slice(0, 5).map((p) => {
              const pId = p.id || p._id;
              const isSelected = targetId === pId;
              return (
                <button
                  key={`chip-${pId}`}
                  onClick={() => handleSelectCatalogProduct(p)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span>{p.title?.split(' ').slice(0, 3).join(' ')}</span>
                  <span className="text-[10px] opacity-80">{formatINR(p.price || 0)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-card animate-pulse space-y-8">
          <div className="h-8 bg-slate-100 rounded w-1/3 mx-auto"></div>
          <div className="h-24 bg-amber-50/50 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-slate-100 rounded-3xl"></div>
            <div className="h-96 bg-slate-100 rounded-3xl"></div>
          </div>
        </div>
      ) : error || !data ? (
        /* Error or Empty Selection State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-card space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔍
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {error || 'Select a Product to Start Comparison'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose any product from the catalog dropdown above to see how your store's price compares with live market prices.
          </p>
          {catalogList.length > 0 && (
            <button
              onClick={() => handleSelectCatalogProduct(catalogList[0])}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <span>Compare Sample Product ({catalogList[0].title?.split(' ').slice(0, 3).join(' ')})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* COMPARISON CONTENT */
        (() => {
          const { matched, myProduct, amazonProduct, flipkartProduct, comparison, message, allLiveOffers } = data;

          const myPrice = myProduct?.price ?? myProduct?.lowestPrice ?? 0;
          const amazonPrice = amazonProduct?.price ?? 0;
          const flipkartPrice = flipkartProduct?.price ?? 0;
          const priceDiff = comparison?.priceDifference ?? 0;
          const cheaperStore = comparison?.cheaperStore ?? null;

          const myImage = myProduct?.image || myProduct?.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
          const amazonImage = amazonProduct?.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';
          const flipkartImage = flipkartProduct?.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';

          const myTitle = myProduct?.title || myProduct?.name || 'Mera Store Product';
          const amazonTitle = amazonProduct?.title || 'Amazon Live Product';
          const flipkartTitle = flipkartProduct?.title || 'Flipkart Live Product';

          return (
            <div className="space-y-6 sm:space-y-8">
              
              {/* DYNAMIC PRICE DIFFERENCE BANNER */}
              {matched && comparison ? (
                <div className={`p-5 sm:p-7 rounded-3xl border shadow-xl transition-all ${
                  cheaperStore === 'my_store'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500 shadow-emerald-600/20'
                    : cheaperStore === 'flipkart'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-500 shadow-blue-600/20'
                    : cheaperStore === 'amazon'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 border-amber-400 shadow-amber-500/20'
                    : 'bg-slate-900 text-white border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        {cheaperStore === 'my_store' 
                          ? 'MERA STORE IS CHEAPER' 
                          : cheaperStore === 'flipkart'
                          ? 'FLIPKART IS CHEAPER'
                          : cheaperStore === 'amazon' 
                          ? 'AMAZON IS CHEAPER' 
                          : 'PRICES ARE IDENTICAL'}
                      </div>
                      <h2 className="text-xl sm:text-3xl font-black tracking-tight">
                        {cheaperStore === 'my_store' ? (
                          <>Customers save <span className="underline decoration-wavy underline-offset-4 font-extrabold">{formatINR(priceDiff)}</span> at Our Direct Store!</>
                        ) : cheaperStore === 'flipkart' ? (
                          <>Flipkart is cheaper by <span className="font-extrabold">{formatINR(priceDiff)}</span></>
                        ) : cheaperStore === 'amazon' ? (
                          <>Amazon is cheaper by <span className="font-extrabold">{formatINR(priceDiff)}</span></>
                        ) : (
                          <>All stores offer competitive pricing!</>
                        )}
                      </h2>
                      <p className="text-xs opacity-90">
                        Calculated directly by comparing your database catalog price with real-time scraped Amazon and Flipkart pricing.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl border border-white/20 shrink-0 text-center min-w-[140px]">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-80">Max Savings</span>
                      <span className="text-2xl sm:text-4xl font-black">{formatINR(priceDiff)}</span>
                      {comparison.percentageSavings > 0 && (
                        <span className="text-[10px] font-bold block opacity-90 mt-0.5">
                          ({comparison.percentageSavings}% savings)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* NO LIVE MATCH BANNER */
                <div className="bg-amber-50 border border-amber-200 p-4 sm:p-6 rounded-3xl text-center space-y-2 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                    ℹ️
                  </div>
                  <h3 className="font-extrabold text-amber-900 text-base sm:text-lg">
                    Live Market Comparison Notice
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 font-medium max-w-lg mx-auto leading-relaxed">
                    {message || (isAmazonType 
                      ? 'Comparison unavailable. No matching live product was found in your store catalog.' 
                      : 'Live market comparison unavailable. No matching product was found. Try updating the product title or ID.')}
                  </p>
                </div>
              )}

              {/* MULTI-STORE PRODUCT CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-6 relative">
                
                {/* 1. MERA STORE (OUR DIRECT STORE) CARD */}
                <div className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-card ${
                  myProduct ? 'border-slate-200/90 hover:border-emerald-500/50' : 'border-dashed border-slate-300 opacity-85'
                }`}>
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span className="font-extrabold text-sm tracking-wide">MERA STORE</span>
                    </div>
                    {myProduct && (
                      <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Official Catalog
                      </span>
                    )}
                  </div>

                  {myProduct ? (
                    <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Image */}
                        <div className="w-full h-48 sm:h-52 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 overflow-hidden">
                          <img
                            src={myImage}
                            alt={myTitle}
                            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Title & Brand */}
                        <div>
                          {myProduct.brand && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                              Brand: {typeof myProduct.brand === 'object' ? myProduct.brand.name : myProduct.brand}
                            </span>
                          )}
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2 mt-0.5">
                            {myTitle}
                          </h3>
                        </div>

                        {/* Price Block */}
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                          <span className="text-xs text-emerald-800 font-bold block">Our Store Price:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                              {formatINR(myPrice)}
                            </span>
                            {myProduct.originalPrice && myProduct.originalPrice > myPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatINR(myProduct.originalPrice)}
                              </span>
                            )}
                            {myProduct.discount > 0 && (
                              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                {myProduct.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specs / Stock */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Availability:</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {myProduct.availability || 'In Stock'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Delivery:</span>
                            <span className="font-bold text-slate-800">FREE Express Delivery</span>
                          </div>
                          {myProduct.category && (
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500 font-medium">Category:</span>
                              <span className="font-bold text-slate-800">
                                {typeof myProduct.category === 'object' ? myProduct.category.name : myProduct.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <Link
                          to={`/products/${myProduct.id || myProduct._id}`}
                          className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                        >
                          <ShoppingCart className="w-4 h-4" /> View Store Listing
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3 my-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
                        🛍️
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">No Store Product Matched</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        This live market product does not currently match any product added to your store database.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. FLIPKART CARD */}
                <div className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-card ${
                  flipkartProduct ? 'border-slate-200/90 hover:border-blue-500/50' : 'border-dashed border-slate-300 opacity-85'
                }`}>
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-white" />
                      <span className="font-extrabold text-sm tracking-wide">FLIPKART</span>
                    </div>
                    {flipkartProduct && (
                      <span className="bg-white text-blue-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Live Scraped Feed
                      </span>
                    )}
                  </div>

                  {flipkartProduct ? (
                    <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Image */}
                        <div className="w-full h-48 sm:h-52 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 overflow-hidden">
                          <img
                            src={flipkartImage}
                            alt={flipkartTitle}
                            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Title & Ratings */}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                            Source: Flipkart.com Live Scraper
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2 mt-0.5">
                            {flipkartTitle}
                          </h3>
                          {flipkartProduct.rating && (
                            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-blue-600">
                              <span>★ {flipkartProduct.rating}</span>
                              {flipkartProduct.reviewCount && (
                                <span className="text-slate-400 font-normal">
                                  ({flipkartProduct.reviewCount.toLocaleString()} ratings)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price Block */}
                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-1">
                          <span className="text-xs text-slate-500 font-semibold block">Flipkart Live Price:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                              {formatINR(flipkartPrice)}
                            </span>
                            {flipkartProduct.originalPrice && flipkartProduct.originalPrice > flipkartPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatINR(flipkartProduct.originalPrice)}
                              </span>
                            )}
                            {flipkartProduct.discount > 0 && (
                              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                {flipkartProduct.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specs / Stock */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Availability:</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {flipkartProduct.availability || 'In Stock'}
                            </span>
                          </div>
                          {(flipkartProduct.id || flipkartProduct.productId) && (
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500 font-medium">FSN / PID:</span>
                              <span className="font-mono font-bold text-blue-700">{flipkartProduct.id || flipkartProduct.productId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-default">
                          <ShieldCheck className="w-4 h-4" /> Live Verified Flipkart Price
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3 my-auto">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
                        📦
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">No Live Flipkart Product Matched</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        No matching live Flipkart product was found for this catalog item.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. LIVE MARKET (AMAZON INDIA) CARD */}
                <div className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-card ${
                  amazonProduct ? 'border-slate-200/90 hover:border-amber-500/50' : 'border-dashed border-slate-300 opacity-85'
                }`}>
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-slate-950" />
                      <span className="font-extrabold text-sm tracking-wide">AMAZON INDIA</span>
                    </div>
                    {amazonProduct && (
                      <span className="bg-slate-950 text-amber-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Live Scraped Feed
                      </span>
                    )}
                  </div>

                  {amazonProduct ? (
                    <div className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Image */}
                        <div className="w-full h-48 sm:h-52 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 overflow-hidden">
                          <img
                            src={amazonImage}
                            alt={amazonTitle}
                            className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Title & Ratings */}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                            Source: Amazon.in Live Scraper
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2 mt-0.5">
                            {amazonTitle}
                          </h3>
                          {amazonProduct.rating && (
                            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-amber-600">
                              <span>★ {amazonProduct.rating}</span>
                              {amazonProduct.reviewCount && (
                                <span className="text-slate-400 font-normal">
                                  ({amazonProduct.reviewCount.toLocaleString()} ratings)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price Block */}
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1">
                          <span className="text-xs text-slate-500 font-semibold block">Amazon Live Price:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                              {formatINR(amazonPrice)}
                            </span>
                            {amazonProduct.originalPrice && amazonProduct.originalPrice > amazonPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatINR(amazonProduct.originalPrice)}
                              </span>
                            )}
                            {amazonProduct.discount > 0 && (
                              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                {amazonProduct.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Specs / Stock */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Availability:</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {amazonProduct.availability || 'In Stock'}
                            </span>
                          </div>
                          {amazonProduct.asin && (
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-slate-500 font-medium">ASIN:</span>
                              <span className="font-mono font-bold text-amber-700">{amazonProduct.asin}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-default">
                          <ShieldCheck className="w-4 h-4" /> Live Verified Amazon Price
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3 my-auto">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                        📦
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">No Live Amazon Product Matched</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        No matching live Amazon India product was found for this catalog item.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* ALL OFFERS MULTI-STORE COMPARISON TABLE */}
              {allLiveOffers && allLiveOffers.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Multi-Store Comparison Breakdown
                      </h3>
                      <p className="text-xs text-slate-500">
                        Comprehensive price comparison between Our Direct Store and all scraped retail channels.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                      {allLiveOffers.length} Store Channels
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Store Channel</th>
                          <th className="py-3 px-4">Item Details</th>
                          <th className="py-3 px-4">Price (₹)</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                        {allLiveOffers.map((offer, idx) => {
                          const isOurStore = offer.isOurStore;
                          const isLowest = offer.isLowest;

                          return (
                            <tr 
                              key={offer.id || idx}
                              className={`transition-colors ${
                                isOurStore 
                                  ? 'bg-emerald-50/40 font-semibold' 
                                  : isLowest 
                                  ? 'bg-amber-50/30' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${isOurStore ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                  <span className="font-extrabold text-slate-900">{offer.store}</span>
                                  {isOurStore && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                      Our Store
                                    </span>
                                  )}
                                  {isLowest && (
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                                      Lowest Price
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                <span className="line-clamp-1 text-slate-800 font-medium">{offer.title}</span>
                              </td>

                              <td className="py-3 px-4 font-black text-slate-900 text-sm">
                                {formatINR(offer.price)}
                                {offer.originalPrice && offer.originalPrice > offer.price && (
                                  <span className="line-through text-slate-400 text-xs ml-1.5 font-normal">
                                    {formatINR(offer.originalPrice)}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  {offer.availability || 'In Stock'}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right">
                                {isOurStore ? (
                                  <Link
                                    to={`/products/${myProduct?.id || myProduct?._id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                                  >
                                    <span>Buy Direct</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Live Feed</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          );
        })()
      )}

    </div>
  );
};

export default ComparisonPage;
