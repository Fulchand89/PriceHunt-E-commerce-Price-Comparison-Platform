import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Trash2, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { formatINR } from '../../utils/formatters';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Sign in to view your Wishlist</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Save your favorite products, track live lowest store prices, and buy when the price drops.
        </p>
        <Link
          to="/login"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg"
        >
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Saved Wishlist</h1>
        <p className="text-sm text-slate-500 mt-1">Keep track of live prices across all major e-commerce stores.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Your Wishlist is Empty</h3>
          <p className="text-slate-500 text-sm">Explore trending deals and save items to compare anytime.</p>
          <Link to="/search" className="inline-block bg-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-full">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const prod = item.product || {};
            const comp = prod.priceComparison || {};
            const title = prod.title || prod.name || 'Saved Product';
            const img = prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=150&auto=format&fit=crop&q=80';
            const brandName = prod.brand?.name || (typeof prod.brand === 'string' ? prod.brand : 'Brand');
            const lowestPrice = comp.lowestPrice || prod.lowestPrice || 0;

            return (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                <div className="flex gap-4">
                  <img
                    src={img}
                    alt={title}
                    className="w-20 h-20 object-contain bg-slate-50 rounded-xl p-2 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-600">{brandName}</span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                      <Link to={`/products/${prod._id}`}>{title}</Link>
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">Live Lowest Price:</span>
                    <span className="text-base font-black text-emerald-600">{formatINR(lowestPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Cheapest Store:</span>
                    <span className="font-semibold text-slate-700">{comp.cheapestStore?.store?.name || 'Top Store'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/products/${prod._id}`}
                    className="flex-1 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    Compare Prices
                  </Link>
                  <button
                    onClick={() => dispatch(removeFromWishlist(prod._id))}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
