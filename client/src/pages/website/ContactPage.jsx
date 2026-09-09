import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900">Contact Us</h1>
        <p className="text-slate-500 text-sm">Have feedback or partnership queries? We'd love to hear from you.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        {submitted ? (
          <div className="p-6 bg-emerald-50 text-emerald-700 font-bold text-center rounded-2xl">
            Thank you! Your message has been received.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm font-medium">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Your Name</label>
              <input type="text" required placeholder="Rahul Sharma" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Email Address</label>
              <input type="email" required placeholder="rahul@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Message</label>
              <textarea rows={4} required placeholder="Your message here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
