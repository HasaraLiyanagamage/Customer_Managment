import { Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Box, CircularProgress } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Customers from './pages/customers/List';
import CustomerDetails from './pages/customers/Details';
import CustomerForm from './pages/customers/Form';
import Users from './pages/users/List';
import UserForm from './pages/users/Form';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Utils
import { authApi } from './services/api';
import { setCredentials } from './features/auth/authSlice';
import { useLazyGetProfileQuery } from './services/api/authApi';

// Styles
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [getProfile] = useLazyGetProfileQuery();

  // Check for token in localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set the auth token for axios
          authApi.setAuthToken(token);
          
          // Fetch user profile
          const { data } = await getProfile().unwrap();
          
          // Set user in Redux store
          dispatch(setCredentials({ user: data, token }));
          
          // Redirect to intended page or dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        } catch (error) {
          console.error('Failed to authenticate:', error);
          localStorage.removeItem('token');
          authApi.setAuthToken(null);
          navigate('/login');
        }
      }
    };

    initializeAuth();
  }, [dispatch, navigate, location, getProfile]);

  // Loading component
  const Loading = () => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Suspense fallback={<Loading />}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Customer routes */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          
          {/* User management routes (admin only) */}
          {user?.role === 'admin' && (
            <>
              <Route path="/users" element={<Users />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id/edit" element={<UserForm />} />
            </>
          )}
          
          {/* Profile */}
          <Route path="/profile" element={<Profile />} />
          
          {/* 404 - Keep this as the last route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
