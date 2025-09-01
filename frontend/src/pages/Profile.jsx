import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../services/api/authApi';
import { useGetProfileQuery } from '../services/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Avatar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const Profile = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { data: userData, isLoading, isError } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Profile form validation schema
  const profileValidationSchema = Yup.object({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  });

  // Password form validation schema
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Profile form
  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const updatedUser = await updateProfile(values).unwrap();
        dispatch(setCredentials({ user: updatedUser }));
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error(error.data?.message || 'Failed to update profile');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Password form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }).unwrap();
        
        toast.success('Password changed successfully');
        resetForm();
      } catch (error) {
        toast.error(error.data?.message || 'Failed to change password');
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error">Error loading profile. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                src={userData?.avatar}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {userData?.first_name?.charAt(0)}
                {userData?.last_name?.charAt(0)}
              </Avatar>
              <Typography variant="h6" align="center">
                {userData?.first_name} {userData?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {userData?.role?.name}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Button
                fullWidth
                variant={activeTab === 'profile' ? 'contained' : 'text'}
                onClick={() => setActiveTab('profile')}
                startIcon={<PersonIcon />}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                Profile Information
              </Button>
              <Button
                fullWidth
                variant={activeTab === 'password' ? 'contained' : 'text'}
                onClick={() => setActiveTab('password')}
                startIcon={<LockIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {activeTab === 'profile' ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Profile Information</Typography>
                <Button
                  variant="contained"
                  onClick={profileFormik.submitForm}
                  disabled={!profileFormik.dirty || isUpdating}
                  startIcon={<SaveIcon />}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <form onSubmit={profileFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="first_name"
                      name="first_name"
                      label="First Name"
                      value={profileFormik.values.first_name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.first_name &&
                        Boolean(profileFormik.errors.first_name)
                      }
                      helperText={
                        profileFormik.touched.first_name &&
                        profileFormik.errors.first_name
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="last_name"
                      name="last_name"
                      label="Last Name"
                      value={profileFormik.values.last_name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.last_name &&
                        Boolean(profileFormik.errors.last_name)
                      }
                      helperText={
                        profileFormik.touched.last_name &&
                        profileFormik.errors.last_name
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={profileFormik.values.email}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.email &&
                        Boolean(profileFormik.errors.email)
                      }
                      helperText={
                        profileFormik.touched.email && profileFormik.errors.email
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      value={profileFormik.values.phone}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={
                        profileFormik.touched.phone &&
                        Boolean(profileFormik.errors.phone)
                      }
                      helperText={
                        profileFormik.touched.phone && profileFormik.errors.phone
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </form>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Box mb={3}>
                <Typography variant="h6">Change Password</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ensure your account is using a long, random password to stay secure.
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <form onSubmit={passwordFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={
                        passwordFormik.touched.currentPassword &&
                        Boolean(passwordFormik.errors.currentPassword)
                      }
                    >
                      <InputLabel htmlFor="current-password">
                        Current Password
                      </InputLabel>
                      <OutlinedInput
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordFormik.values.currentPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Current Password"
                      />
                      {passwordFormik.touched.currentPassword &&
                        passwordFormik.errors.currentPassword && (
                          <FormHelperText>
                            {passwordFormik.errors.currentPassword}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={
                        passwordFormik.touched.newPassword &&
                        Boolean(passwordFormik.errors.newPassword)
                      }
                    >
                      <InputLabel htmlFor="new-password">New Password</InputLabel>
                      <OutlinedInput
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordFormik.values.newPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowNewPassword}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="New Password"
                      />
                      {passwordFormik.touched.newPassword &&
                        passwordFormik.errors.newPassword && (
                          <FormHelperText>
                            {passwordFormik.errors.newPassword}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      error={
                        passwordFormik.touched.confirmPassword &&
                        Boolean(passwordFormik.errors.confirmPassword)
                      }
                    >
                      <InputLabel htmlFor="confirm-password">
                        Confirm New Password
                      </InputLabel>
                      <OutlinedInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordFormik.values.confirmPassword}
                        onChange={passwordFormik.handleChange}
                        onBlur={passwordFormik.handleBlur}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Confirm New Password"
                      />
                      {passwordFormik.touched.confirmPassword &&
                        passwordFormik.errors.confirmPassword && (
                          <FormHelperText>
                            {passwordFormik.errors.confirmPassword}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={!passwordFormik.dirty || isChangingPassword}
                      startIcon={<SaveIcon />}
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
