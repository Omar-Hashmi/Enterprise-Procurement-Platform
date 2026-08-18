import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  // Profile data fetching state
  const [profileData, setProfileData] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [profileFetchError, setProfileFetchError] = useState('');

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Change password validation & request states
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  const fetchUserProfile = async () => {
    setIsFetchingProfile(true);
    setProfileFetchError('');

    try {
      // First verify profile token
      const profileRes = await apiClient.get('/auth/profile');
      const authUser = profileRes.data?.user || storeUser;

      if (authUser?.userId) {
        // Fetch full user details from /api/users/:id
        const userDetailRes = await apiClient.get(`/users/${authUser.userId}`);
        const fullUser = userDetailRes.data;
        setProfileData(fullUser);
        setUser(fullUser);
      } else {
        setProfileData(authUser);
      }
    } catch (err) {
      if (storeUser) {
        // Fallback to local store user if endpoint fails
        setProfileData(storeUser);
      } else {
        setProfileFetchError(err.response?.data?.message || err.message || 'Unable to load profile data');
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Validation logic for Change Password
  const validatePasswordField = (name, value, allValues = passwordForm) => {
    switch (name) {
      case 'currentPassword':
        if (!value) return 'Current password is required';
        return '';
      case 'newPassword':
        if (!value) return 'New password is required';
        if (value.length < 6) return 'New password must be at least 6 characters';
        if (value === allValues.currentPassword) return 'New password must be different from current password';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your new password';
        if (value !== allValues.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach((field) => {
      const err = validatePasswordField(field, passwordForm[field], passwordForm);
      if (err) newErrors[field] = err;
    });
    return newErrors;
  };

  const handlePasswordChange = (field) => (e) => {
    const val = e.target.value;
    const updated = { ...passwordForm, [field]: val };
    setPasswordForm(updated);

    if (passwordTouched[field]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: validatePasswordField(field, val, updated),
        ...(field === 'newPassword' && passwordTouched.confirmPassword
          ? { confirmPassword: validatePasswordField('confirmPassword', updated.confirmPassword, updated) }
          : {}),
      }));
    }
    if (changePasswordError) setChangePasswordError('');
    if (changePasswordSuccess) setChangePasswordSuccess('');
  };

  const handlePasswordBlur = (field) => () => {
    setPasswordTouched((prev) => ({ ...prev, [field]: true }));
    setPasswordErrors((prev) => ({
      ...prev,
      [field]: validatePasswordField(field, passwordForm[field], passwordForm),
      ...(field === 'newPassword' && passwordTouched.confirmPassword
        ? { confirmPassword: validatePasswordField('confirmPassword', passwordForm.confirmPassword, passwordForm) }
        : {}),
    }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    const errors = validatePasswordForm();
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setChangePasswordError('');
    setChangePasswordSuccess('');
    setIsSubmittingPassword(true);

    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data && response.data.message) {
        setChangePasswordSuccess(response.data.message || 'Password changed successfully');
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordTouched({});
        setPasswordErrors({});
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setChangePasswordError(err.response.data.message);
      } else {
        setChangePasswordError(err.message || 'An unexpected error occurred while updating your password.');
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const id = profileData?._id || profileData?.id || profileData?.userId || storeUser?._id || storeUser?.id || storeUser?.userId;
    if (!id) { setDeleteAccountError('Your account identifier could not be found. Please contact an administrator.'); return; }
    setIsDeletingAccount(true); setDeleteAccountError('');
    try {
      await apiClient.delete(`/users/${id}`);
      clearAuth();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteAccountError(err.response?.data?.message || 'Unable to delete your account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  if (isFetchingProfile) {
    return <LoadingState message="Loading user profile..." minHeight={350} />;
  }

  if (profileFetchError && !profileData) {
    return <ErrorState title="Failed to load profile" description={profileFetchError} onRetry={fetchUserProfile} />;
  }

  const displayName = profileData?.fullName || profileData?.name || 'User Profile';
  const roleDisplay = (profileData?.role || storeUser?.role || 'Employee').toUpperCase();
  const departmentDisplay = profileData?.department || 'Operations';
  const emailDisplay = profileData?.email || 'Not Specified';
  const phoneDisplay = profileData?.phone || 'Not Specified';
  const statusDisplay = profileData?.isActive !== false ? 'Active' : 'Inactive';
  const createdAtFormatted = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <Box>
      <PageHeader
        title="User Profile & Security"
        subtitle="Manage your personal information, roles, and security credentials"
      />

      <Grid container spacing={3}>
        {/* Left Column: Profile Information */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Profile Avatar & Top Header */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'primary.main',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    mb: 1.5,
                    boxShadow: '0 4px 6px -1px rgb(2 132 199 / 0.2)',
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  {displayName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 0.5 }}>
                  <Chip label={roleDisplay} color="primary" size="small" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                  <Chip
                    label={statusDisplay}
                    color={profileData?.isActive !== false ? 'success' : 'default'}
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {/* Profile Details List */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Account Information
              </Typography>

              <List disablePadding>
                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                    <EmailOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Work Email"
                    secondary={emailDisplay}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.primary' }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                    <BusinessOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={departmentDisplay}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.primary' }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                    <PhoneOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contact Phone"
                    secondary={phoneDisplay}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.primary' }}
                  />
                </ListItem>

                <ListItem disableGutters sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                    <CalendarTodayOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={createdAtFormatted}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body2', fontWeight: 500, color: 'text.primary' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Change Password & Security */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <SecurityOutlinedIcon color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Security & Password
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your account password. Passwords must be at least 6 characters long and different from your existing password.
              </Typography>

              {/* Success Alert */}
              {changePasswordSuccess && (
                <Alert
                  severity="success"
                  icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                  onClose={() => setChangePasswordSuccess('')}
                  sx={{ mb: 2.5, fontSize: '0.8125rem' }}
                >
                  {changePasswordSuccess}
                </Alert>
              )}

              {/* Server Error Alert */}
              {changePasswordError && (
                <Alert severity="error" onClose={() => setChangePasswordError('')} sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
                  {changePasswordError}
                </Alert>
              )}

              {/* Change Password Form */}
              <Box component="form" onSubmit={handleChangePasswordSubmit} noValidate>
                {/* Current Password */}
                <TextField
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  autoComplete="current-password"
                  disabled={isSubmittingPassword}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange('currentPassword')}
                  onBlur={handlePasswordBlur('currentPassword')}
                  error={Boolean(passwordErrors.currentPassword)}
                  helperText={passwordErrors.currentPassword}
                  placeholder="Enter your current password"
                  size="medium"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          disabled={isSubmittingPassword}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1.5 }}
                />

                {/* New Password */}
                <TextField
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={isSubmittingPassword}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange('newPassword')}
                  onBlur={handlePasswordBlur('newPassword')}
                  error={Boolean(passwordErrors.newPassword)}
                  helperText={passwordErrors.newPassword}
                  placeholder="Min. 6 characters"
                  size="medium"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          disabled={isSubmittingPassword}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 1.5 }}
                />

                {/* Confirm New Password */}
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={isSubmittingPassword}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange('confirmPassword')}
                  onBlur={handlePasswordBlur('confirmPassword')}
                  error={Boolean(passwordErrors.confirmPassword)}
                  helperText={passwordErrors.confirmPassword}
                  placeholder="Re-enter your new password"
                  size="medium"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          disabled={isSubmittingPassword}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2.5 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmittingPassword}
                  sx={{
                    py: 1.25,
                    px: 3,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    borderRadius: 1.5,
                  }}
                >
                  {isSubmittingPassword ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </Box>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'error.main', borderRadius: 2, bgcolor: 'error.main', color: 'error.contrastText', opacity: 0.95 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Delete account</Typography>
                <Typography variant="body2" sx={{ mb: 1.5, color: 'inherit' }}>Deactivate your account and sign out from this device. This action needs confirmation.</Typography>
                <Button variant="outlined" color="inherit" size="small" onClick={() => setDeleteDialogOpen(true)} sx={{ borderColor: 'currentColor' }}>Delete my account</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={deleteDialogOpen} onClose={() => !isDeletingAccount && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will deactivate your account and immediately sign you out. You may need an administrator to reactivate it later.</DialogContentText>
          {deleteAccountError && <Alert severity="error" sx={{ mt: 2 }}>{deleteAccountError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeletingAccount}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={isDeletingAccount}>{isDeletingAccount ? 'Deleting…' : 'Delete account'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
