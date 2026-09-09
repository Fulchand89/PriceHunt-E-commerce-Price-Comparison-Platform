import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API from '../../services/api';

const AdminFAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const loadFAQs = async () => {
    try {
      const res = await API.get('/faqs');
      setFaqs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const handleAddFAQ = async (e) => {
    e.preventDefault();
    try {
      await API.post('/faqs', { question, answer });
      setQuestion('');
      setAnswer('');
      loadFAQs();
    } catch (err) {
      alert('Failed to add FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete FAQ?')) return;
    try {
      await API.delete(`/faqs/${id}`);
      loadFAQs();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">FAQ Management CMS</h2>
        <p className="text-xs text-slate-400">Manage Q&A accordion items served dynamically from MongoDB.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleAddFAQ} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-white text-sm">Add New FAQ</h3>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Question</label>
            <input type="text" required value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 font-bold block mb-1">Answer</label>
            <textarea rows={4} required value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 font-bold text-white rounded-xl">Save FAQ</button>
        </form>

        <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-3">
          {faqs.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-xs">No FAQs created yet.</div>
          ) : (
            faqs.map((f) => {
              const faqId = f.id || f._id;
              return (
                <div key={faqId} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{f.question}</h4>
                    <p className="text-xs text-slate-400 mt-1">{f.answer}</p>
                  </div>
                  <button onClick={() => handleDelete(faqId)} className="text-slate-500 hover:text-rose-400 p-2 cursor-pointer">
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

export default AdminFAQPage;
