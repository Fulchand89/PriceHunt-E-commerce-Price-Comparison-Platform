'use strict';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

/**
 * Search live Meesho products through backend Meesho API
 */
export const searchMeesho = createAsyncThunk(
  'meesho/searchMeesho',
  async ({ q, minPrice, maxPrice, limit }, { rejectWithValue }) => {
    try {
      const params = { q };
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (limit) params.limit = limit;

      const response = await API.get('/meesho/search', { params });
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Meesho product data is temporarily unavailable.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch a single Meesho product by ID / URL
 */
export const fetchMeeshoProductById = createAsyncThunk(
  'meesho/fetchMeeshoProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/meesho/product/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Meesho product data is temporarily unavailable.';
      return rejectWithValue(message);
    }
  }
);

const meeshoSlice = createSlice({
  name: 'meesho',
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
    clearMeeshoSearch: (state) => {
      state.products = [];
      state.count = 0;
      state.error = null;
      state.loading = false;
    },
    clearCurrentMeeshoProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // searchMeesho
      .addCase(searchMeesho.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMeesho.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || action.payload.data || [];
        state.count = action.payload.count || (action.payload.products ? action.payload.products.length : 0);
        state.cached = Boolean(action.payload.cached);
        state.lastUpdated = action.payload.lastUpdated || null;
        state.error = null;
      })
      .addCase(searchMeesho.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.count = 0;
        state.error = action.payload || 'Meesho product data is temporarily unavailable.';
      })
      // fetchMeeshoProductById
      .addCase(fetchMeeshoProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeeshoProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product || action.payload.data || null;
        state.error = null;
      })
      .addCase(fetchMeeshoProductById.rejected, (state, action) => {
        state.loading = false;
        state.currentProduct = null;
        state.error = action.payload || 'Meesho product data is temporarily unavailable.';
      });
  }
});

export const { clearMeeshoSearch, clearCurrentMeeshoProduct } = meeshoSlice.actions;
export default meeshoSlice.reducer;
