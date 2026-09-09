import React from 'react';

const ValuePropositionSection = () => {
  return (
    <section className="bg-emerald-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12 relative z-10">
        <h2 className="text-3xl font-extrabold">How PriceHunt Saves You Money</h2>
        <p className="text-emerald-200 text-sm">We take the guesswork out of online shopping with transparent price tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl">
            1
          </div>
          <h3 className="text-lg font-bold">Includes Delivery Charges</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            We calculate Final Price = Product Price + Delivery Charges so there are no surprise fees at checkout.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-xl">
            2
          </div>
          <h3 className="text-lg font-bold">Auto Cheapest Store Badge</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our engine automatically flags the absolute cheapest seller with a green BEST PRICE highlight.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold text-xl">
            3
          </div>
          <h3 className="text-lg font-bold">Price Drop Alerts</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Set your target price and get instant notifications when prices reach your desired threshold.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;
