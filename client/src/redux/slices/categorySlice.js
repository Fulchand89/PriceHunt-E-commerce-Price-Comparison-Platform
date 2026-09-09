import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/categories');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

export const fetchBrands = createAsyncThunk('categories/fetchBrands', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/brands');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch brands');
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    brands: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  }
});

export default categorySlice.reducer;
