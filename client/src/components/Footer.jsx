import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2 } from 'lucide-react';

const Footer = () => {
  const { categories } = useSelector((state) => state.categories);
  const { stores } = useSelector((state) => state.stores);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                🏷️
              </div>
              <span className="text-2xl font-black text-white">
                Price<span className="text-emerald-400">Hunt</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              PriceHunt tracks live prices directly across Amazon India with real-time scraper precision to help you buy at the absolute best deal with verified price drops and instant alerts.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-semibold text-slate-400">Supported Store:</span>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-400">
                Amazon India (amazon.in)
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/search" className="hover:text-emerald-400 transition-colors">Compare Products</Link></li>
              <li><Link to="/categories" className="hover:text-emerald-400 transition-colors">All Categories</Link></li>
              <li><Link to="/wishlist" className="hover:text-emerald-400 transition-colors">My Wishlist</Link></li>
              <li><Link to="/alerts" className="hover:text-emerald-400 transition-colors">Price Alerts</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {categories?.length > 0 ? (
                categories.slice(0, 5).map((cat) => (
                  <li key={cat._id || cat.id}>
                    <Link to={`/search?category=${cat.slug}`} className="hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/search?category=mobiles" className="hover:text-emerald-400 transition-colors">Mobiles & Tablets</Link></li>
                  <li><Link to="/search?category=laptops" className="hover:text-emerald-400 transition-colors">Laptops & Computers</Link></li>
                  <li><Link to="/search?category=electronics" className="hover:text-emerald-400 transition-colors">Headphones & Audio</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 4: Trust & Guarantee */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Why PriceHunt?</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Real-time price & delivery charge calculation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Historical price charts up to 1 year</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant price-drop notifications</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} PriceHunt – Smart E-Commerce Price Comparison Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <span className="text-slate-600">Affiliate Disclosure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
