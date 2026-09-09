import React from 'react';
import { Heart, Bell } from 'lucide-react';

const ProductActions = ({ isWishlisted, handleWishlistToggle, setIsAlertModalOpen }) => {
  return (
    <div className="flex flex-col xs:flex-row items-center gap-3 pt-2 w-full">
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`w-full xs:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all border touch-target active:scale-98 cursor-pointer ${
          isWishlisted
            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs hover:border-slate-300'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
      </button>

      <button
        type="button"
        onClick={() => setIsAlertModalOpen(true)}
        className="btn-primary w-full xs:flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold shadow-button hover:shadow-button-hover touch-target active:scale-98 cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        <span>Set Price Alert</span>
      </button>
    </div>
  );
};

export default ProductActions;
