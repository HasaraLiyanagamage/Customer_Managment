import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCustomersQuery } from '../services/api/customerApi';
import { useGetUsersQuery } from '../services/api/userApi';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../theme';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Fetch data
  const { data: customersData, isLoading: isLoadingCustomers } = useGetCustomersQuery({
    page: 1,
    limit: 5,
    sort: 'createdAt:desc',
  });
  
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({
    page: 1,
    limit: 5,
    sort: 'createdAt:desc',
  }, {
    skip: user?.role !== 'admin', // Only fetch users if admin
  });

  const stats = [
    {
      title: 'Total Customers',
      value: customersData?.total || 0,
      icon: <PeopleIcon sx={{ fontSize: 26 }} />,
      color: 'primary.main',
      path: '/customers',
    },
    {
      title: 'Active Users',
      value: usersData?.total || 0,
      icon: <PersonIcon sx={{ fontSize: 26 }} />,
      color: 'success.main',
      path: '/users',
    },
    {
      title: 'Total Businesses',
      value: customersData?.total || 0, // This would be a separate count in a real app
      icon: <BusinessIcon sx={{ fontSize: 26 }} />,
      color: 'warning.main',
      path: '/customers',
    },
    {
      title: 'Invoices This Month',
      value: '0', // This would be a separate count in a real app
      icon: <ReceiptIcon sx={{ fontSize: 26 }} />,
      color: 'error.main',
      path: '/invoices',
    },
  ];

  const customerColumns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.first_name} {params.row.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    { 
      field: 'business_name', 
      headerName: 'Business', 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => navigate(`/customers/${params.row.id}`)}
          endIcon={<ArrowForwardIcon />}
        >
          View
        </Button>
      ),
    },
  ];

  const userColumns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.first_name} {params.row.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" textTransform="capitalize">
          {params.row.role?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => navigate(`/users/${params.row.id}/edit`)}
          endIcon={<ArrowForwardIcon />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.first_name || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => navigate(stat.path)}
              style={{ cursor: 'pointer' }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Customers */}
        <Grid item xs={12} md={user?.role === 'admin' ? 6 : 12}>
          <Card>
            <CardHeader
              title="Recent Customers"
              action={
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/customers/new')}
                >
                  Add Customer
                </Button>
              }
            />
            <Divider />
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={customersData?.customers || []}
                columns={customerColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                loading={isLoadingCustomers}
                disableSelectionOnClick
                onRowClick={(params) => navigate(`/customers/${params.row.id}`)}
                sx={{
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(colors.primary[400], 0.08),
                    },
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Recent Users (Admin only) */}
        {user?.role === 'admin' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Recent Users"
                action={
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/users/new')}
                  >
                    Add User
                  </Button>
                }
              />
              <Divider />
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={usersData?.users || []}
                  columns={userColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  loading={isLoadingUsers}
                  disableSelectionOnClick
                  onRowClick={(params) => navigate(`/users/${params.row.id}/edit`)}
                  sx={{
                    '& .MuiDataGrid-row': {
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: alpha(colors.primary[400], 0.08),
                      },
                    },
                    '& .MuiDataGrid-cell:focus': {
                      outline: 'none',
                    },
                  }}
                />
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
