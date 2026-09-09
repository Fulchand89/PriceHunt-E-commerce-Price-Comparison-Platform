import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, ChevronRight } from 'lucide-react';
import { fetchCategories } from '../../redux/slices/categorySlice';

const CategoryPage = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Product Categories</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Browse all e-commerce categories to compare prices across top stores.</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/search?category=${cat.slug}`}
            className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
          >
            <div className="h-36 sm:h-44 w-full overflow-hidden bg-slate-100 relative">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-slate-900/80 text-white font-bold text-[10px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-xs">
                {cat.productCount || 0} Products
              </span>
            </div>

            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{cat.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 pt-2 border-t border-slate-100">
                <span>Compare Prices</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
