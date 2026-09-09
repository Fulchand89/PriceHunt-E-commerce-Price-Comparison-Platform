import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductDetails, fetchPriceComparison, fetchPriceHistory } from '../../redux/slices/productSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { createPriceAlert } from '../../redux/slices/priceAlertSlice';
import { formatINR } from '../../utils/formatters';

import ProductGallery from '../../components/product/ProductGallery';
import ProductSummary from '../../components/product/ProductSummary';
import OfferTable from '../../components/product/OfferTable';
import PriceHistoryChart from '../../components/product/PriceHistoryChart';
import ProductSpecifications from '../../components/product/ProductSpecifications';
import ProductActions from '../../components/product/ProductActions';
import PriceAlertModal from '../../components/product/PriceAlertModal';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentProduct, comparison, priceHistory, loading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState('');
  const [historyRange, setHistoryRange] = useState('30d');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertSuccessMsg, setAlertSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    dispatch(fetchPriceComparison(id));
    dispatch(fetchPriceHistory({ id, range: historyRange }));
  }, [dispatch, id, historyRange]);

  useEffect(() => {
    if (currentProduct?.images?.length > 0) {
      setSelectedImage(currentProduct.images[0]);
    } else if (currentProduct?.image) {
      setSelectedImage(currentProduct.image);
    }
  }, [currentProduct]);

  const isWishlisted = wishlistItems?.some((item) => item.product?._id === id || item._id === id || item.product === id);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      alert('Please login to manage your wishlist.');
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist(id));
    } else {
      dispatch(addToWishlist(id));
    }
  };

  const handleCreateAlertSubmit = (e) => {
    e.preventDefault();
    if (!targetPrice) return;
    dispatch(createPriceAlert({ productId: id, targetPrice: Number(targetPrice) }));
    setAlertSuccessMsg(`Price alert created for ${formatINR(targetPrice)}!`);
    setTimeout(() => {
      setIsAlertModalOpen(false);
      setAlertSuccessMsg('');
    }, 2000);
  };

  const handleBuyNowClick = () => {
    if (id) {
      window.location.href = `/compare/product/${id}`;
    }
  };

  if (loading || !currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 animate-pulse space-y-6 shadow-card">
          <div className="h-64 sm:h-96 bg-slate-100 rounded-2xl w-full"></div>
          <div className="h-6 sm:h-8 bg-slate-100 rounded w-2/3"></div>
          <div className="h-16 sm:h-20 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const offers = comparison?.offers || [];
  const bestDeal = comparison?.bestDeal || null;
  const lowestPrice = comparison?.analytics?.lowestPrice || currentProduct?.lowestPrice || 0;
  const highestPrice = comparison?.analytics?.highestPrice || currentProduct?.highestPrice || 0;
  const maxSavings = comparison?.analytics?.maxSavings || 0;
  const categoryName = typeof currentProduct.category === 'object' ? currentProduct.category?.name : (currentProduct.category || 'Products');
  const categorySlug = typeof currentProduct.category === 'object' ? currentProduct.category?.slug : 'all';

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      
      {/* Responsive Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar whitespace-nowrap">
        <a href="/" className="hover:text-emerald-600 transition-colors">Home</a>
        <span>/</span>
        <a href={`/search?category=${categorySlug}`} className="hover:text-emerald-600 transition-colors">{categoryName}</a>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[200px] xs:max-w-xs">{currentProduct?.title || currentProduct?.name}</span>
      </nav>

      {/* TOP SECTION: GALLERY & SUMMARY */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-card p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* Gallery */}
        <div className="lg:col-span-5">
          <ProductGallery
            product={currentProduct}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        </div>

        {/* Overview & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <ProductSummary
            product={currentProduct}
            bestDeal={bestDeal}
            lowestPrice={lowestPrice}
            highestPrice={highestPrice}
            maxSavings={maxSavings}
          />

          <ProductActions
            isWishlisted={isWishlisted}
            handleWishlistToggle={handleWishlistToggle}
            setIsAlertModalOpen={setIsAlertModalOpen}
          />
        </div>

      </div>

      {/* LIVE OFFERS & STORE COMPARISON TABLE */}
      <OfferTable
        offers={offers}
        handleBuyNowClick={handleBuyNowClick}
      />

      {/* PRICE HISTORY CHART */}
      <PriceHistoryChart
        priceHistory={priceHistory}
        historyRange={historyRange}
        setHistoryRange={setHistoryRange}
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
      />

      {/* SPECIFICATIONS */}
      <ProductSpecifications
        specifications={currentProduct.specifications}
      />

      {/* PRICE ALERT MODAL */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        lowestPrice={lowestPrice}
        targetPrice={targetPrice}
        setTargetPrice={setTargetPrice}
        handleCreateAlertSubmit={handleCreateAlertSubmit}
        alertSuccessMsg={alertSuccessMsg}
      />

    </div>
  );
};

export default ProductDetailsPage;
