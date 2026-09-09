import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AppDownloadModal from '../components/AppDownloadModal';
import MobileAppBanner from '../components/MobileAppBanner';
import MobileBottomNav from '../components/MobileBottomNav';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import { fetchStores } from '../redux/slices/storeSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchStores());
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Mobile App Download Ad Banner */}
      <MobileAppBanner onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />

      {/* Main Header / Navbar */}
      <Header onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Modern Footer */}
      <Footer />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />
    </div>
  );
};

export default MainLayout;
