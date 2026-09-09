import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API from '../../services/api';

const AdminBlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Buying Guides');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const loadBlogs = async () => {
    try {
      const res = await API.get('/blog');
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleAddBlog = async (e) => {
    e.preventDefault();
    try {
      await API.post('/blog', { title, category, excerpt, content });
      setTitle('');
      setExcerpt('');
      setContent('');
      loadBlogs();
    } catch (err) {
      alert('Failed to publish blog');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete blog post?')) return;
    try {
      await API.delete(`/blog/${id}`);
      loadBlogs();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Blog & Articles CMS</h2>
        <p className="text-xs text-slate-400">Manage shopping buying guides and price trend articles stored in MongoDB.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAddBlog} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Publish New Article</h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Excerpt</label>
            <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Content</label>
            <textarea rows={5} required value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 font-bold text-white rounded-xl">Publish Article</button>
        </form>

        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-3">
          {blogs.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-xs">No blog articles published yet.</div>
          ) : (
            blogs.map((b) => {
              const blogId = b.id || b._id;
              return (
                <div key={blogId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{b.title}</h4>
                    <span className="text-[10px] text-slate-400">{b.category || 'Buying Guides'}</span>
                  </div>
                  <button onClick={() => handleDelete(blogId)} className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPage;
