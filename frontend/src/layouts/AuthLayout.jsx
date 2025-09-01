import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Container, styled, useTheme } from '@mui/material';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const AuthLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    // Redirect to dashboard if user is already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        p: 3,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          py: 8,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 450,
            p: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                height: 64,
                width: 'auto',
                mb: 2,
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                textAlign: 'center',
                mb: 1,
              }}
            >
              Customer Portal
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: 'center' }}
            >
              Welcome back! Please sign in to your account.
            </Typography>
          </Box>
          
          <Outlet />
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {window.location.pathname === '/login' ? (
                <>
                  Don't have an account?{' '}
                  <Typography
                    component="a"
                    href="/register"
                    color="primary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Sign up
                  </Typography>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Typography
                    component="a"
                    href="/login"
                    color="primary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Sign in
                  </Typography>
                </>
              )}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            © {new Date().getFullYear()} Customer Portal. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
