import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  Link,
  Alert,
  Divider,
  MenuItem,
  Grid,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';

const DEPARTMENTS = [
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'Procurement', label: 'Procurement' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'HR', label: 'Human Resources (HR)' },
];

export const RegisterPage = () => {
  const navigate = useNavigate();

  // Form input state matching backend contract
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Request feedback states
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value, allData = formData) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Work email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[\d\s+\-()]{7,20}$/.test(value.trim())) {
          return 'Please enter a valid phone number';
        }
        return '';
      case 'department':
        if (!value) return 'Please select your department';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== allData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value, updated),
        ...(field === 'password' && touched.confirmPassword
          ? { confirmPassword: validateField('confirmPassword', updated.confirmPassword, updated) }
          : {}),
      }));
    }
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field], formData),
      ...(field === 'password' && touched.confirmPassword
        ? { confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData) }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setServerError('');
    setIsLoading(true);

    try {
      // Send ONLY backend contract fields (no confirmPassword, no client-injected role)
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        password: formData.password,
      };

      const response = await apiClient.post('/auth/register', payload);

      if (response.status === 200 || response.status === 201) {
        // Successful registration -> forward to login with success state
        navigate('/login', {
          state: {
            registered: true,
            message: 'Account registered successfully! Please sign in with your email and password.',
          },
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else if (err.request) {
        setServerError('Unable to connect to the procurement server. Please check your network.');
      } else {
        setServerError(err.message || 'An unexpected error occurred during registration. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 0 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          }}
        >
          {/* Platform Branding */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                bgcolor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                color: 'primary.main',
              }}
            >
              <BusinessCenterIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Register for the Enterprise Procurement Platform
            </Typography>
          </Box>

          {/* Server Error Alert */}
          {serverError && (
            <Alert severity="error" onClose={() => setServerError('')} sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              {serverError}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  id="fullName"
                  name="fullName"
                  label="Full Name"
                  fullWidth
                  required
                  autoComplete="name"
                  disabled={isLoading}
                  value={formData.fullName}
                  onChange={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
                  placeholder="e.g. Jane Doe"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <TextField
                  id="email"
                  name="email"
                  label="Work Email"
                  type="email"
                  fullWidth
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  placeholder="name@company.com"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  required
                  autoComplete="tel"
                  disabled={isLoading}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  placeholder="+1 (555) 000-0000"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12}>
                <TextField
                  id="department"
                  name="department"
                  select
                  label="Department"
                  fullWidth
                  required
                  disabled={isLoading}
                  value={formData.department}
                  onChange={handleChange('department')}
                  onBlur={handleBlur('department')}
                  error={Boolean(errors.department)}
                  helperText={errors.department}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  placeholder="Min. 6 characters"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          disabled={isLoading}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  placeholder="Re-enter password"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          disabled={isLoading}
                          sx={{ color: 'text.secondary' }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.25,
                fontWeight: 600,
                fontSize: '0.9375rem',
                borderRadius: 1.5,
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign in Link */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/login')}
                  underline="hover"
                  color="primary.main"
                  sx={{ fontWeight: 600, cursor: 'pointer', verticalAlign: 'baseline' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Footer Info */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Enterprise Procurement Platform • Multi-Role Access Control
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
