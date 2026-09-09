import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/watchlist');
    // Server returns { success, data: { watchlist: [...], count } }
    return response.data.data?.watchlist || response.data.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch wishlist');
  }
});

export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', async (productId, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/watchlist', { productId });
    dispatch(fetchWishlist());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to wishlist');
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (productId, { dispatch, rejectWithValue }) => {
  try {
    await API.delete(`/watchlist/${productId}`);
    dispatch(fetchWishlist());
    return productId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default wishlistSlice.reducer;
