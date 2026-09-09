import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import { formatDate } from '../../utils/formatters';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get('/blog');
        setBlogs(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping & Price Guides</h1>
        <p className="text-sm text-slate-500 mt-1">Expert buying guides, price analysis, and deal alerts powered by MongoDB.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-64 border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((b) => (
            <div key={b._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <img src={b.image} alt={b.title} className="h-52 w-full object-cover" />
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {b.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 hover:text-emerald-600 transition-colors">
                    <Link to={`/blog/${b.slug}`}>{b.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{b.excerpt}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(b.createdAt)}</span>
                  <Link to={`/blog/${b.slug}`} className="font-bold text-emerald-600 hover:underline flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
