import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading } from '../features/auth/authSlice';
import LoadingScreen from './common/LoadingScreen';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate('/login', { 
        state: { from: location },
        replace: true 
      });
    } else if (!isLoading && isAuthenticated && requiredRoles.length > 0) {
      // Check if user has required role
      const hasRequiredRole = requiredRoles.some(role => user?.role?.name === role);
      
      if (!hasRequiredRole) {
        // Redirect to dashboard or unauthorized page if user doesn't have required role
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location, requiredRoles, user]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  // Check if user has required role (if any)
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => user?.role?.name === role);
    
    if (!hasRequiredRole) {
      return null; // or an unauthorized message
    }
  }

  return children;
};

export default ProtectedRoute;
