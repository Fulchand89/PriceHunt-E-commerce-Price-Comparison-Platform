import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await API.get('/products', { params });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
  }
});

export const searchProducts = createAsyncThunk('products/searchProducts', async (searchParams, { rejectWithValue }) => {
  try {
    const response = await API.get('/search', { params: searchParams });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

export const fetchProductDetails = createAsyncThunk('products/fetchProductDetails', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/products/${id}`);
    // Server returns { success, data: { product: { ...product, listings } } }
    return response.data.data?.product || response.data.data || response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product details');
  }
});

export const fetchPriceComparison = createAsyncThunk('products/fetchPriceComparison', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/products/${id}/compare`);
    // Server returns the full comparison object directly (success, product, analytics, offers...)
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch price comparison');
  }
});

export const fetchPriceHistory = createAsyncThunk('products/fetchPriceHistory', async ({ id, range }, { rejectWithValue }) => {
  try {
    const response = await API.get(`/products/${id}/price-history`, { params: { range } });
    // Server returns { success, range, stats, dataPoints, byProvider }
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch price history');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    searchResults: [],
    totalSearchResults: 0,
    searchPages: 1,
    currentProduct: null,
    comparison: null,
    priceHistory: { data: [], stats: {}, range: '30d' },
    storeStatuses: [],
    scrapedAt: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.comparison = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Server returns { success, data: [...], pagination: { total, ... } }
        state.items = action.payload.data || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // searchProducts
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Server returns: { success, query, results, total, page, limit, totalPages, providers }
        state.searchResults = action.payload.results || action.payload.data || [];
        state.totalSearchResults = action.payload.total || 0;
        state.searchPages = action.payload.totalPages || action.payload.pages || 1;
        state.storeStatuses = action.payload.storeStatuses || [];
        state.scrapedAt = action.payload.scrapedAt || null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchProductDetails
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      // fetchPriceComparison
      .addCase(fetchPriceComparison.fulfilled, (state, action) => {
        state.comparison = action.payload;
      })
      // fetchPriceHistory
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.priceHistory = {
          data: action.payload.data,
          stats: action.payload.stats,
          range: action.payload.range
        };
      });
  }
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
