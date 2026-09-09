import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchStores = createAsyncThunk('stores/fetchStores', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/stores');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stores');
  }
});

const storeSlice = createSlice({
  name: 'stores',
  initialState: {
    stores: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStores.fulfilled, (state, action) => {
      state.stores = action.payload;
    });
  }
});

export default storeSlice.reducer;
