'use strict';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

/**
 * Search live Flipkart products through backend Flipkart API
 */
export const searchFlipkart = createAsyncThunk(
  'flipkart/searchFlipkart',
  async ({ q, minPrice, maxPrice, limit }, { rejectWithValue }) => {
    try {
      const params = { q };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (limit) params.limit = limit;

      const response = await API.get('/flipkart/search', { params });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Flipkart product data is temporarily unavailable.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch a single Flipkart product by ID / FSN
 */
export const fetchFlipkartProductById = createAsyncThunk(
  'flipkart/fetchFlipkartProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/flipkart/product/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Flipkart product data is temporarily unavailable.';
      return rejectWithValue(message);
    }
  }
);

const flipkartSlice = createSlice({
  name: 'flipkart',
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
    clearFlipkartSearch: (state) => {
      state.products = [];
      state.count = 0;
      state.error = null;
      state.loading = false;
    },
    clearCurrentFlipkartProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // searchFlipkart
      .addCase(searchFlipkart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFlipkart.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload.data || [];
        state.count = action.payload.count || (action.payload.products ? action.payload.products.length : 0);
        state.cached = Boolean(action.payload.cached);
        state.lastUpdated = action.payload.lastUpdated || null;
        state.error = null;
      })
      .addCase(searchFlipkart.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.count = 0;
        state.error = action.payload || 'Flipkart product data is temporarily unavailable.';
      })
      // fetchFlipkartProductById
      .addCase(fetchFlipkartProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlipkartProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product || action.payload.data || null;
        state.error = null;
      })
      .addCase(fetchFlipkartProductById.rejected, (state, action) => {
        state.loading = false;
        state.currentProduct = null;
        state.error = action.payload || 'Flipkart product data is temporarily unavailable.';
      });
  }
});

export const { clearFlipkartSearch, clearCurrentFlipkartProduct } = flipkartSlice.actions;
export default flipkartSlice.reducer;
