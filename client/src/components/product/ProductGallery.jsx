import React from 'react';

const ProductGallery = ({ product, selectedImage, setSelectedImage }) => {
  const images = product?.images?.length ? product.images : [product?.image].filter(Boolean);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="h-64 xs:h-72 sm:h-80 lg:h-96 bg-slate-50/80 rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden group">
        <img
          src={selectedImage || images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
          alt={product?.title || product?.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 custom-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 p-1 bg-white shrink-0 transition-all shadow-2xs ${
                selectedImage === img ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
