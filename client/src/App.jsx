import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import HomePage from './pages/website/HomePage';
import SearchResultsPage from './pages/website/SearchResultsPage';
import ProductDetailsPage from './pages/website/ProductDetailsPage';
import ComparisonPage from './pages/website/ComparisonPage';
import CategoryPage from './pages/website/CategoryPage';
import WishlistPage from './pages/website/WishlistPage';
import PriceAlertsPage from './pages/website/PriceAlertsPage';
import UserDashboardPage from './pages/website/UserDashboardPage';
import LoginPage from './pages/website/LoginPage';
import RegisterPage from './pages/website/RegisterPage';
import BlogPage from './pages/website/BlogPage';
import BlogDetailsPage from './pages/website/BlogDetailsPage';
import FAQPage from './pages/website/FAQPage';
import DealsPage from './pages/website/DealsPage';
import AboutPage from './pages/website/AboutPage';
import ContactPage from './pages/website/ContactPage';
import PrivacyPage from './pages/website/PrivacyPage';
import TermsPage from './pages/website/TermsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminPricesPage from './pages/admin/AdminPricesPage';
import AdminProductMatchingPage from './pages/admin/AdminProductMatchingPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPriceAlertsPage from './pages/admin/AdminPriceAlertsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminFAQPage from './pages/admin/AdminFAQPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* User Storefront Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="products" element={<SearchResultsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="compare" element={<ComparisonPage />} />
        <Route path="compare/amazon/:asin" element={<ComparisonPage />} />
        <Route path="compare/flipkart/:id" element={<ComparisonPage />} />
        <Route path="compare/product/:id" element={<ComparisonPage />} />
        <Route path="compare/:productId" element={<ComparisonPage />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="alerts" element={<PriceAlertsPage />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogDetailsPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="brands" element={<AdminBrandsPage />} />
        <Route path="stores" element={<AdminStoresPage />} />
        <Route path="sellers" element={<AdminSellersPage />} />
        <Route path="prices" element={<AdminPricesPage />} />
        <Route path="offers" element={<AdminOffersPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="faqs" element={<AdminFAQPage />} />
        <Route path="product-matching" element={<AdminProductMatchingPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="price-alerts" element={<AdminPriceAlertsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
