import React from 'react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-slate-700 text-sm leading-relaxed">
      <h1 className="text-3xl font-black text-slate-900">Terms of Service</h1>
      <p className="text-xs text-slate-400">Last updated: September 2026</p>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-slate-900">1. Acceptable Use</h2>
        <p>PriceHunt is a price comparison discovery platform. All product purchases are concluded directly on third-party merchant sites.</p>
        <h2 className="text-base font-bold text-slate-900">2. Affiliate Disclosure</h2>
        <p>PriceHunt may receive affiliate commissions from partner stores when users purchase via outbound referral links.</p>
      </div>
    </div>
  );
};

export default TermsPage;
