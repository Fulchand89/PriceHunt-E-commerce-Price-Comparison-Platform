import React from 'react';
import { ShieldCheck, Zap, Award } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">About PriceHunt</h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          India's leading smart price comparison platform helping shoppers save time & money every single day.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
        <p>
          At PriceHunt, we believe no shopper should ever overpay. By aggregating real-time prices across major online retailers like Amazon, Flipkart, Croma, Reliance Digital, Myntra, Ajio, Tata CLiQ, and Meesho, we provide total price transparency.
        </p>
        <p>
          Unlike conventional engines that conceal hidden delivery fees, PriceHunt computes <strong>Final Price = Product Price + Delivery Charges</strong> to dynamically highlight the true cheapest seller.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
