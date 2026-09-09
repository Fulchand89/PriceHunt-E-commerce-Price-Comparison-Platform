import React from 'react';

const ProductSpecifications = ({ specifications = [] }) => {
  const specsList = Array.isArray(specifications)
    ? specifications
    : Object.entries(specifications || {}).map(([key, value]) => ({ key, value }));

  if (!specsList.length) return null;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card p-4 sm:p-8 space-y-5 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3 sm:pb-4">
        Technical Specifications
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
        {specsList.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-2.5 px-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 gap-3">
            <span className="font-bold text-slate-500 truncate">{item.key || item[0]}:</span>
            <span className="font-semibold text-slate-900 text-right truncate">{item.value || item[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSpecifications;
