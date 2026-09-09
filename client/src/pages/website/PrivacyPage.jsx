import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-slate-700 text-sm leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Last updated: September 2026</p>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
        <p>PriceHunt collects minimal personal data required for managing user wishlist items and target price drop notifications (name and email address).</p>
        <h2 className="text-base font-bold text-slate-900">2. Cookies & Analytics</h2>
        <p>We log non-personally identifiable click analytics when users click "Buy Now" to redirect to external store sellers.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
