import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import wishlistReducer from './slices/wishlistSlice';
import priceAlertReducer from './slices/priceAlertSlice';
import storeReducer from './slices/storeSlice';
import amazonReducer from './slices/amazonSlice';
import flipkartReducer from './slices/flipkartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    amazon: amazonReducer,
    flipkart: flipkartReducer,
    categories: categoryReducer,
    wishlist: wishlistReducer,
    priceAlerts: priceAlertReducer,
    stores: storeReducer
  }
});

export default store;
