import { createSlice } from '@reduxjs/toolkit';
import { setAuthToken } from '../../services/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      // Set auth token for axios
      setAuthToken(token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Remove auth header
      setAuthToken(null);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle auth API responses
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || 'An error occurred';
          
          // Logout on 401 Unauthorized
          if (action.payload?.status === 401) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            setAuthToken(null);
          }
        }
      );
  },
});

export const { setCredentials, logout, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Thunks
export const initializeAuth = () => (dispatch) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    setAuthToken(token);
    dispatch(setLoading(true));
    
    // You can dispatch an action here to fetch user profile
    // dispatch(fetchUserProfile())
    //   .unwrap()
    //   .then((user) => {
    //     dispatch(setCredentials({ user, token }));
    //   })
    //   .catch(() => {
    //     dispatch(logout());
    //   });
  } else {
    dispatch(logout());
  }
};
