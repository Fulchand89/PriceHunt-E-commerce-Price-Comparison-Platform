import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const savedUser = JSON.parse(localStorage.getItem('pricehunt_user') || 'null');
const savedToken = localStorage.getItem('pricehunt_token') || null;

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/login', credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('pricehunt_token', token);
    localStorage.setItem('pricehunt_user', JSON.stringify(user));
    return { user, token };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/register', formData);
    const { token, user } = response.data.data;
    localStorage.setItem('pricehunt_token', token);
    localStorage.setItem('pricehunt_user', JSON.stringify(user));
    return { user, token };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/auth/profile');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('pricehunt_token');
      localStorage.removeItem('pricehunt_user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload;
        localStorage.setItem('pricehunt_user', JSON.stringify(state.user));
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
