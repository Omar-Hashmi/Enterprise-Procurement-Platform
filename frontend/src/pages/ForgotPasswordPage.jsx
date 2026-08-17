import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Link,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Request & feedback states
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'Work Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setError(validateEmail(val));
    }
    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    const emailErr = validateEmail(email);
    setError(emailErr);

    if (emailErr) {
      return;
    }

    setServerError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/request-password-reset', {
        email: email.trim(),
      });

      const data = response.data;
      if (data) {
        setSuccessMessage(
          'Password reset instructions have been generated. If an active account matches this email, reset instructions will be sent.'
        );
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else if (err.request) {
        setServerError('Unable to connect to the procurement server. Please check your network.');
      } else {
        setServerError(err.message || 'An unexpected error occurred. Please try again.');
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
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 320 }}>
              Enter your registered work email and we will provide instructions to reset your account password.
            </Typography>
          </Box>

          {/* Success Alert */}
          {successMessage && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
              onClose={() => setSuccessMessage('')}
              sx={{ mb: 2.5, fontSize: '0.8125rem' }}
            >
              {successMessage}
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
            <TextField
              id="email"
              name="email"
              label="Work Email"
              type="email"
              fullWidth
              required
              autoComplete="email"
              disabled={isLoading}
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              error={Boolean(error)}
              helperText={error}
              placeholder="name@company.com"
              size="medium"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
                  Sending Request...
                </>
              ) : (
                'Request Password Reset'
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
              ProcureFlow Security • Identity Verification
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
