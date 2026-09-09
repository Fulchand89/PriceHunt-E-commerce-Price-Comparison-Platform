import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import API from '../../services/api';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await API.get('/faqs');
        setFaqs(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFAQs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Everything you need to know about PriceHunt price comparisons, delivery fee calculations, and alerts.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={faq._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-base hover:bg-slate-50 transition-colors"
              >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="p-5 pt-0 text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQPage;
