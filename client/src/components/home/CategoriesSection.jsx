import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CategoriesSection = ({ categories = [] }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Select a category to view multi-store price comparisons</p>
        </div>
        <Link to="/categories" className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0">
          <span>View All</span> <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat._id || cat.id}
            to={`/search?category=${cat.slug || cat.name}`}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="h-32 xs:h-36 sm:h-44 w-full overflow-hidden bg-slate-100 relative">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>
            </div>
            <div className="p-3 sm:p-4 absolute bottom-0 inset-x-0 text-white">
              <h3 className="font-extrabold text-xs xs:text-sm sm:text-lg truncate drop-shadow-sm">{cat.name}</h3>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium">{cat.productCount || 0} Products Compare</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;
