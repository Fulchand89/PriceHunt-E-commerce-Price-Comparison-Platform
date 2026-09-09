import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import API from '../../services/api';
import { formatDate } from '../../utils/formatters';

const BlogDetailsPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await API.get(`/blog/${slug}`);
        setBlog(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading || !blog) {
    return <div className="max-w-4xl mx-auto py-16 px-4 text-slate-500">Loading Article...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to All Articles
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <span className="text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {blog.category}
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{blog.title}</h1>

        <div className="flex items-center gap-4 text-xs text-slate-400 border-y border-slate-100 py-3">
          <span className="flex items-center gap-1 font-semibold"><User className="w-4 h-4 text-emerald-600" /> {blog.author}</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400" /> {formatDate(blog.createdAt)}</span>
        </div>

        <img src={blog.image} alt={blog.title} className="w-full h-80 object-cover rounded-2xl border border-slate-100" />

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
          <p className="font-semibold text-slate-900 text-lg border-l-4 border-emerald-500 pl-4 py-1 italic bg-emerald-50/50 rounded-r-xl">
            {blog.excerpt}
          </p>
          <div className="whitespace-pre-line">{blog.content}</div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
