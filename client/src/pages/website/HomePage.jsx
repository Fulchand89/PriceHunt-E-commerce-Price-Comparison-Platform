import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchAmazon } from '../../redux/slices/amazonSlice';
import { fetchCategories, fetchBrands } from '../../redux/slices/categorySlice';
import { fetchStores } from '../../redux/slices/storeSlice';
import API from '../../services/api';
import AppDownloadModal from '../../components/AppDownloadModal';
import {
  HeroSection,
  SupportedStoresSection,
  CategoriesSection,
  CatalogProductsSection,
  TrendingDealsSection,
  ValuePropositionSection,
  MobileAppSection
} from '../../components/home';

const HomePage = () => {
  const dispatch = useDispatch();

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const { products: amazonProducts, loading: amazonLoading } = useSelector((state) => state.amazon);
  const { categories } = useSelector((state) => state.categories);
  const { stores } = useSelector((state) => state.stores);

  useEffect(() => {
    // Fetch live Amazon products dynamically for the homepage
    dispatch(searchAmazon({ q: 'iPhone', limit: 12 }));
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchStores());

    // Fetch database catalog products created/managed by admin
    const loadCatalogProducts = async () => {
      try {
        setCatalogLoading(true);
        const res = await API.get('/products?limit=8');
        setCatalogProducts(res.data.data || []);
      } catch (err) {
        console.error('Failed to load catalog products for homepage:', err);
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalogProducts();
  }, [dispatch]);

  const categoriesList = categories || [];
  const displayProducts = amazonProducts || [];
  
  // Find a product with verified live price to showcase in live mockup
  const featuredLiveProduct = displayProducts.find(p => (p.price || 0) > 0) || displayProducts[0] || catalogProducts[0] || null;

  const popularSearchTags = categoriesList.length > 0 
    ? categoriesList.slice(0, 6).map(c => c.name) 
    : ['iPhone 16', 'MacBook', 'Samsung Galaxy', 'Sony Headphones', 'Smart TV'];

  const liveStoreList = stores || [];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with Live Amazon Search & Presets */}
      <HeroSection popularSearchTags={popularSearchTags} />

      {/* Supported Store Section */}
      <SupportedStoresSection stores={liveStoreList} />

      {/* Featured Categories Section */}
      <CategoriesSection categories={categoriesList} />

      {/* Admin Catalog Products Section */}
      <CatalogProductsSection products={catalogProducts} loading={catalogLoading} />

      {/* Live Amazon Deals & Price Drops */}
      <TrendingDealsSection products={displayProducts} loading={amazonLoading} />

      {/* Value Proposition Section */}
      <ValuePropositionSection />

      {/* Mobile App Download Promo Section */}
      <MobileAppSection
        featuredLiveProduct={featuredLiveProduct}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;

