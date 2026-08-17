import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../lib/api';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read token from URL search parameter '?token=...'
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Request feedback states
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const validateField = (name, value, allValues = { token, newPassword, confirmPassword }) => {
    switch (name) {
      case 'token':
        if (!value.trim()) return 'Reset token is required';
        return '';
      case 'newPassword':
        if (!value) return 'New password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your new password';
        if (value !== allValues.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const values = { token, newPassword, confirmPassword };
    ['token', 'newPassword', 'confirmPassword'].forEach((field) => {
      const err = validateField(field, values[field], values);
      if (err) newErrors[field] = err;
    });
    return newErrors;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    if (touched.newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: validateField('newPassword', val, { token, newPassword: val, confirmPassword }),
        ...(touched.confirmPassword
          ? { confirmPassword: validateField('confirmPassword', confirmPassword, { token, newPassword: val, confirmPassword }) }
          : {}),
      }));
    }
    if (serverError) setServerError('');
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', val, { token, newPassword, confirmPassword: val }),
      }));
    }
    if (serverError) setServerError('');
  };

  const handleTokenChange = (e) => {
    const val = e.target.value;
    setToken(val);
    if (touched.token) {
      setErrors((prev) => ({
        ...prev,
        token: validateField('token', val),
      }));
    }
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const values = { token, newPassword, confirmPassword };
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, values[field], values),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ token: true, newPassword: true, confirmPassword: true });
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setServerError('');
    setIsLoading(true);

    try {
      // Send exact backend payload: { token, newPassword }
      const response = await apiClient.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });

      if (response.status === 200) {
        // Password reset successful -> navigate to /login with success feedback
        navigate('/login', {
          state: {
            registered: true,
            message: 'Password has been reset successfully. Please sign in with your new password.',
          },
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else if (err.request) {
        setServerError('Unable to connect to the procurement server. Please check your network.');
      } else {
        setServerError(err.message || 'An unexpected error occurred during password reset. Please try again.');
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
      <Container maxWidth="xs" sx={{ px: { xs: 1, sm: 0 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          }}
        >
          {/* Header & Icon */}
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
              <LockResetOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Create a new secure password for your account
            </Typography>
          </Box>

          {/* Missing Token Warning if not present in URL */}
          {!tokenFromUrl && (
            <Alert severity="info" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              Please enter the reset token received with your password reset request.
            </Alert>
          )}

          {/* Server Error Alert */}
          {serverError && (
            <Alert severity="error" onClose={() => setServerError('')} sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              {serverError}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Token field (only shown if token is not provided via URL query) */}
            {!tokenFromUrl && (
              <TextField
                id="token"
                name="token"
                label="Reset Token"
                fullWidth
                required
                disabled={isLoading}
                value={token}
                onChange={handleTokenChange}
                onBlur={handleBlur('token')}
                error={Boolean(errors.token)}
                helperText={errors.token}
                placeholder="Paste your reset token"
                size="medium"
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />
            )}

            {/* New Password */}
            <TextField
              id="newPassword"
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              autoComplete="new-password"
              disabled={isLoading}
              value={newPassword}
              onChange={handlePasswordChange}
              onBlur={handleBlur('newPassword')}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword}
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
              disabled={isLoading}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handleBlur('confirmPassword')}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              placeholder="Re-enter new password"
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
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.25,
                fontWeight: 600,
                fontSize: '0.9375rem',
                borderRadius: 1.5,
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                  Resetting Password...
                </>
              ) : (
                'Set New Password'
              )}
            </Button>

            {/* Back to Login Link */}
            <Box sx={{ textAlign: 'center', mt: 2.5 }}>
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
                underline="hover"
                color="primary.main"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Back to Sign in
              </Link>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              ProcureFlow Security • Password Reset Policy
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
