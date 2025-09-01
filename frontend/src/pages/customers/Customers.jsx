import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCustomersQuery } from '../../services/api/customerApi';
import { useDebounce } from 'use-debounce';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { format } from 'date-fns';
import { tokens } from '../../theme';
import LoadingScreen from '../../components/common/LoadingScreen';

// Table header cells
const headCells = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Name',
  },
  {
    id: 'email',
    numeric: false,
    disablePadding: false,
    label: 'Email',
  },
  {
    id: 'phone',
    numeric: false,
    disablePadding: false,
    label: 'Phone',
  },
  {
    id: 'business_name',
    numeric: false,
    disablePadding: false,
    label: 'Business',
  },
  {
    id: 'created_at',
    numeric: false,
    disablePadding: false,
    label: 'Created',
  },
  {
    id: 'actions',
    numeric: false,
    disablePadding: false,
    label: 'Actions',
  },
];

// Function to create data for the table
function createData(id, name, email, phone, business_name, created_at) {
  return {
    id,
    name,
    email,
    phone,
    business_name,
    created_at,
  };
}

// Table header component
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== 'actions' ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const Customers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for sorting
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  // State for action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Fetch customers
  const { data, isLoading, isError, error } = useGetCustomersQuery({
    page: page + 1,
    limit: rowsPerPage,
    sort: `${orderBy}:${order}`,
    search: debouncedSearchTerm,
  });

  // Handle sort request
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle action menu open
  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  // Handle action menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  // Handle view customer
  const handleViewCustomer = () => {
    if (selectedCustomer) {
      navigate(`/customers/${selectedCustomer.id}`);
      handleMenuClose();
    }
  };

  // Handle edit customer
  const handleEditCustomer = () => {
    if (selectedCustomer) {
      navigate(`/customers/${selectedCustomer.id}/edit`);
      handleMenuClose();
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = () => {
    // Implement delete functionality
    console.log('Delete customer:', selectedCustomer?.id);
    handleMenuClose();
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearchTerm]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading customers: {error?.data?.message || 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  const customers = data?.customers || [];
  const total = data?.total || 0;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your customer records and view customer details
        </Typography>
      </Box>

      <Card>
        <CardHeader
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Customer List</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/customers/new')}
              >
                Add Customer
              </Button>
            </Box>
          }
        />
        <Divider />
        
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? alpha(theme.palette.primary.main, 0.05)
                : alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          />
          
          <Box flexGrow={1} />
          
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={customers.length}
            />
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={customer.id}
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(colors.primary[400], 0.08),
                        },
                      }}
                    >
                      <TableCell component="th" scope="row" padding="none">
                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              mr: 2,
                              bgcolor: colors.primary[500],
                            }}
                          >
                            {customer.first_name?.charAt(0)}
                            {customer.last_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {customer.first_name} {customer.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.company_name || 'No company'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.business_name || '-'}</TableCell>
                      <TableCell>
                        {customer.created_at
                          ? format(new Date(customer.created_at), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, customer);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleViewCustomer}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditCustomer}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteCustomer} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Customers;
