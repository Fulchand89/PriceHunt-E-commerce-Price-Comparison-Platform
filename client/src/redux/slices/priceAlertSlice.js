import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

export const fetchPriceAlerts = createAsyncThunk('priceAlerts/fetchPriceAlerts', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/price-alerts');
    // Server returns paginated: { success, data: [...], pagination }
    return response.data.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch price alerts');
  }
});

export const createPriceAlert = createAsyncThunk('priceAlerts/createPriceAlert', async ({ productId, targetPrice }, { dispatch, rejectWithValue }) => {
  try {
    const response = await API.post('/price-alerts', { productId, targetPrice });
    dispatch(fetchPriceAlerts());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create price alert');
  }
});

export const deletePriceAlert = createAsyncThunk('priceAlerts/deletePriceAlert', async (alertId, { dispatch, rejectWithValue }) => {
  try {
    await API.delete(`/price-alerts/${alertId}`);
    dispatch(fetchPriceAlerts());
    return alertId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete alert');
  }
});

const priceAlertSlice = createSlice({
  name: 'priceAlerts',
  initialState: {
    alerts: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriceAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPriceAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alerts = action.payload;
      })
      .addCase(fetchPriceAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default priceAlertSlice.reducer;
