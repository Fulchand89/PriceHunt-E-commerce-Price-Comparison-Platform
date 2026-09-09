import React from 'react';

const SupportedStoresSection = ({ stores = [] }) => {
  if (!stores || stores.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
          Supported E-Commerce Stores
        </p>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        {stores.map((s) => (
          <div
            key={s._id || s.id || s.name}
            className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-emerald-400 hover:shadow-md transition-all font-bold text-xs text-slate-800 text-center truncate"
          >
            <span className="truncate">{s.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SupportedStoresSection;
