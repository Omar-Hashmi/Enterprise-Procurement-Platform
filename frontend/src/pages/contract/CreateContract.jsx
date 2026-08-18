import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

import {
  useNavigate,
  Link as RouterLink,
} from 'react-router-dom';
import apiClient from '../../lib/api';

const INITIAL_FORM_STATE = {
  title: '',
  vendor: '',
  department: '',
  startDate: '',
  endDate: '',
  value: '',
  currency: 'USD',
  paymentTerms: '',
};

export const CreateContract = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    INITIAL_FORM_STATE
  );

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear field error when user starts correcting it
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: '',
      }));
    }

    // Clear API error when user edits the form
    if (apiError) {
      setApiError('');
    }
  };

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validate = () => {
    const newErrors = {};

    const title = formData.title.trim();
    const vendor = formData.vendor.trim();
    const department = formData.department.trim();
    const value = formData.value.trim();

    if (!title) {
      newErrors.title = 'Contract title is required';
    }

    if (!vendor) {
      newErrors.vendor = 'Vendor ID is required';
    }

    if (!department) {
      newErrors.department = 'Department ID is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      newErrors.endDate =
        'End date cannot be before start date';
    }

    if (!value) {
      newErrors.value = 'Contract value is required';
    } else if (Number(value) <= 0) {
      newErrors.value =
        'Contract value must be greater than 0';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // CREATE CONTRACT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setApiError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        vendor: formData.vendor.trim(),
        department: formData.department.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        value: Number(formData.value),
        currency: formData.currency,
        paymentTerms: formData.paymentTerms.trim(),
      };

      await apiClient.post('/contracts', payload);

      // Successful creation
      navigate('/contracts');
    } catch (error) {
      setApiError(
        error?.response?.data?.message || error?.message ||
          'Failed to create contract. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    if (!isLoading) {
      navigate('/contracts');
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to="/contracts"
          >
            Contracts
          </Link>

          <Typography color="text.primary">
            Create Contract
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleCancel}
              color="inherit"
              size="small"
              disabled={isLoading}
            >
              Back
            </Button>

            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
            >
              New Contract
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ==========================================
          API ERROR
      ========================================== */}

      {apiError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {apiError}
        </Alert>
      )}

      {/* ==========================================
          FORM CARD
      ========================================== */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 4,
            },
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* ==========================================
                CONTRACT INFORMATION
            ========================================== */}

            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="primary"
              sx={{ mb: 2 }}
            >
              Contract Information
            </Typography>

            <Grid
              container
              spacing={2.5}
              sx={{ mb: 4 }}
            >
              {/* Contract Title */}

              <Grid item xs={12} sm={6}>
                <TextField
                  name="title"
                  label="Contract Title"
                  value={formData.title}
                  onChange={handleChange}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              {/* Vendor */}

              <Grid item xs={12} sm={6}>
                <TextField
                  name="vendor"
                  label="Vendor ID"
                  value={formData.vendor}
                  onChange={handleChange}
                  error={Boolean(errors.vendor)}
                  helperText={errors.vendor}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              {/* Department */}

              <Grid item xs={12} sm={6}>
                <TextField
                  name="department"
                  label="Department ID"
                  value={formData.department}
                  onChange={handleChange}
                  error={Boolean(errors.department)}
                  helperText={errors.department}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              {/* Start Date */}

              <Grid item xs={12} sm={3}>
                <TextField
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={Boolean(errors.startDate)}
                  helperText={errors.startDate}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              {/* End Date */}

              <Grid item xs={12} sm={3}>
                <TextField
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={Boolean(errors.endDate)}
                  helperText={errors.endDate}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              {/* Contract Value */}

              <Grid item xs={12} sm={4}>
                <TextField
                  name="value"
                  label="Contract Value"
                  type="number"
                  value={formData.value}
                  onChange={handleChange}
                  error={Boolean(errors.value)}
                  helperText={errors.value}
                  fullWidth
                  required
                  size="small"
                  inputProps={{
                    min: 0,
                    step: 'any',
                  }}
                />
              </Grid>

              {/* Currency */}

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  name="currency"
                  label="Currency"
                  value={formData.currency}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="USD">
                    USD
                  </MenuItem>

                  <MenuItem value="EUR">
                    EUR
                  </MenuItem>

                  <MenuItem value="PKR">
                    PKR
                  </MenuItem>
                </TextField>
              </Grid>

              {/* Payment Terms */}

              <Grid item xs={12} sm={4}>
                <TextField
                  name="paymentTerms"
                  label="Payment Terms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* ==========================================
                ACTIONS
            ========================================== */}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={isLoading}
              >
                {isLoading
                  ? 'Saving...'
                  : 'Save Contract'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateContract;
