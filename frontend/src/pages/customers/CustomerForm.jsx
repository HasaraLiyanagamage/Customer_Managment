import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '../../../services/api/customerApi';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import LoadingScreen from '../../components/common/LoadingScreen';

// Form validation schema
const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(
    /^[0-9]{10}$/,
    'Phone number must be 10 digits'
  ),
  business_name: Yup.string().required('Business name is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  postal_code: Yup.string().required('Postal code is required'),
  country: Yup.string().required('Country is required'),
  status: Yup.string().required('Status is required'),
  source: Yup.string().required('Source is required'),
  notes: Yup.string(),
  tags: Yup.array().of(Yup.string()),
  is_active: Yup.boolean(),
});

const CustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Fetch customer data if in edit mode
  const { data: customer, isLoading, isError } = useGetCustomerQuery(id, {
    skip: !isEditMode,
  });

  // Mutations
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();

  // Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      business_name: customer?.business_name || '',
      address: customer?.address || '',
      city: customer?.city || '',
      state: customer?.state || '',
      postal_code: customer?.postal_code || '',
      country: customer?.country || 'United States',
      status: customer?.status || 'lead',
      source: customer?.source || 'website',
      notes: customer?.notes || '',
      tags: customer?.tags || [],
      is_active: customer?.is_active ?? true,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        
        const customerData = {
          ...values,
          // Add any additional processing here
        };

        if (isEditMode) {
          await updateCustomer({ id, ...customerData }).unwrap();
          toast.success('Customer updated successfully');
        } else {
          await createCustomer(customerData).unwrap();
          toast.success('Customer created successfully');
          formik.resetForm();
          setActiveStep(0);
        }
        
        // Navigate back to customers list after a short delay
        setTimeout(() => {
          navigate('/customers');
        }, 1000);
        
      } catch (error) {
        console.error('Error saving customer:', error);
        toast.error(error.data?.message || 'Failed to save customer');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle file drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles.map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      ));
    },
  });

  // Clean up file previews
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // Handle tag input
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formik.values.tags.includes(newTag)) {
        formik.setFieldValue('tags', [...formik.values.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    formik.setFieldValue(
      'tags',
      formik.values.tags.filter(tag => tag !== tagToRemove)
    );
  };

  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Status options
  const statusOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'customer', label: 'Customer' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Source options
  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
  ];

  // Country options (truncated for brevity)
  const countryOptions = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    // Add more countries as needed
  ];

  if (isLoading && isEditMode) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading customer data. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  id="first_name"
                  name="first_name"
                  label="First Name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  id="last_name"
                  name="last_name"
                  label="Last Name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Box>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    label="Status"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText error>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel id="source-label">Source</InputLabel>
                  <Select
                    labelId="source-label"
                    id="source"
                    name="source"
                    value={formik.values.source}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.source && Boolean(formik.errors.source)}
                    label="Source"
                  >
                    {sourceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.source && formik.errors.source && (
                    <FormHelperText error>{formik.errors.source}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.is_active}
                    onChange={formik.handleChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Active Customer"
              />
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tags
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                variant="outlined"
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type and press Enter to add tags"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachFileIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                {formik.values.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <CloudUploadIcon fontSize="large" color="action" />
                  <Typography variant="body2" color="textSecondary">
                    Drag & drop files here, or click to select files
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    (Supports images, PDFs, and documents)
                  </Typography>
                </Box>
              </div>
              
              {files.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Files to upload:
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {files.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap variant="body2">
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {(file.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(files.filter((_, i) => i !== index));
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="business_name"
                    name="business_name"
                    label="Business Name"
                    value={formik.values.business_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.business_name && Boolean(formik.errors.business_name)}
                    helperText={formik.touched.business_name && formik.errors.business_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="address"
                    name="address"
                    label="Address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="city"
                    name="city"
                    label="City"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="state"
                    name="state"
                    label="State/Province"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.state && Boolean(formik.errors.state)}
                    helperText={formik.touched.state && formik.errors.state}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="postal_code"
                    name="postal_code"
                    label="Postal Code"
                    value={formik.values.postal_code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                    helperText={formik.touched.postal_code && formik.errors.postal_code}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="country-label">Country</InputLabel>
                    <Select
                      labelId="country-label"
                      id="country"
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.country && Boolean(formik.errors.country)}
                      label="Country"
                    >
                      {countryOptions.map((country) => (
                        <MenuItem key={country} value={country}>
                          {country}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.country && formik.errors.country && (
                      <FormHelperText error>{formik.errors.country}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Customer Notes"
                multiline
                rows={6}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Add any additional notes about this customer..."
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
            
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/customers')}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting || !formik.dirty}
                startIcon={<SaveIcon />}
              >
                {formik.isSubmitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Customer'
                  : 'Create Customer'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CustomerForm;
