'use strict';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

/**
 * Search live Amazon products through the backend Amazon API
 */
export const searchAmazon = createAsyncThunk(
  'amazon/searchAmazon',
  async ({ q, minPrice, maxPrice, limit }, { rejectWithValue }) => {
    try {
      const params = { q };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (limit) params.limit = limit;

      const response = await API.get('/amazon/search', { params });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Amazon product data is temporarily unavailable.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch a single Amazon product by ASIN
 */
export const fetchAmazonProductByAsin = createAsyncThunk(
  'amazon/fetchAmazonProductByAsin',
  async (asin, { rejectWithValue }) => {
    try {
      const response = await API.get(`/amazon/product/${encodeURIComponent(asin)}`);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Amazon product data is temporarily unavailable.';
      return rejectWithValue(message);
    }
  }
);

const amazonSlice = createSlice({
  name: 'amazon',
  initialState: {
    products: [],
    count: 0,
    currentProduct: null,
    loading: false,
    error: null,
    lastUpdated: null,
    cached: false
  },
  reducers: {
    clearAmazonSearch: (state) => {
      state.products = [];
      state.count = 0;
      state.error = null;
      state.loading = false;
    },
    clearCurrentAmazonProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // searchAmazon
      .addCase(searchAmazon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAmazon.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload.data || [];
        state.count = action.payload.count || (action.payload.products ? action.payload.products.length : 0);
        state.cached = Boolean(action.payload.cached);
        state.lastUpdated = action.payload.lastUpdated || null;
        state.error = null;
      })
      .addCase(searchAmazon.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.count = 0;
        state.error = action.payload || 'Amazon product data is temporarily unavailable.';
      })
      // fetchAmazonProductByAsin
      .addCase(fetchAmazonProductByAsin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmazonProductByAsin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product || action.payload.data || null;
        state.error = null;
      })
      .addCase(fetchAmazonProductByAsin.rejected, (state, action) => {
        state.loading = false;
        state.currentProduct = null;
        state.error = action.payload || 'Amazon product data is temporarily unavailable.';
      });
  }
});

export const { clearAmazonSearch, clearCurrentAmazonProduct } = amazonSlice.actions;
export default amazonSlice.reducer;
