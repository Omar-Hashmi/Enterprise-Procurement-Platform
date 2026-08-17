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
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import apiClient from '../lib/api';

const PROCUREMENT_CATEGORIES = [
  'IT Equipment',
  'Office Supplies',
  'Software & Cloud Licenses',
  'Hardware & Machinery',
  'Professional Services',
  'Facility & Maintenance',
  'Logistics & Freight',
  'Raw Materials',
  'Other',
];

export const CreatePurchaseRequestPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form field state matching backend validation schema
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    estimatedCost: '',
    requiredDate: '',
    remarks: '',
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Request state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Requisition title is required';
        if (value.trim().length < 2) return 'Title must be at least 2 characters';
        if (value.trim().length > 200) return 'Title cannot exceed 200 characters';
        return '';
      case 'category':
        if (!value.trim()) return 'Category is required';
        return '';
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 2) return 'Description must be at least 2 characters';
        return '';
      case 'quantity':
        if (value === '' || value === null || value === undefined) return 'Quantity is required';
        const numQty = Number(value);
        if (isNaN(numQty) || !Number.isInteger(numQty) || numQty < 1) {
          return 'Quantity must be a whole number of at least 1';
        }
        return '';
      case 'estimatedCost':
        if (value === '' || value === null || value === undefined) return 'Estimated cost is required';
        const numCost = Number(value);
        if (isNaN(numCost) || numCost < 0) {
          return 'Estimated cost must be 0 or greater';
        }
        return '';
      case 'requiredDate':
        if (!value) return 'Required delivery date is required';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === 'remarks') return;
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
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
        [field]: validateField(field, value),
      }));
    }
    if (serverError) setServerError('');
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setServerError('');
    setIsSubmitting(true);

    try {
      // Build sanitized backend payload
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        quantity: Number(formData.quantity),
        estimatedCost: Number(formData.estimatedCost),
        requiredDate: new Date(formData.requiredDate).toISOString(),
        remarks: formData.remarks.trim(),
      };

      const response = await apiClient.post('/purchase-requests', payload);

      if (response.status === 201 || response.status === 200) {
        // Invalidate React Query cache so list refreshes immediately
        await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });

        // Navigate back to list with success state
        navigate('/purchase-requests', {
          state: {
            created: true,
            message: 'Purchase request created successfully.',
          },
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else if (err.request) {
        setServerError('Unable to reach the procurement API server. Please check your network connection.');
      } else {
        setServerError(err.message || 'An unexpected error occurred while creating the purchase request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/purchase-requests')}
          sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}
        >
          Back to Purchase Requests
        </Button>
      </Box>

      <PageHeader
        title="New Purchase Request"
        subtitle="Submit a procurement requisition for departmental review and approval"
      />

      {/* Server Error Alert */}
      {serverError && (
        <Alert severity="error" onClose={() => setServerError('')} sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Section 1: Basic Information */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentOutlinedIcon color="primary" fontSize="small" />
              Requisition Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the core item details and categorization for this requisition.
            </Typography>

            <Grid container spacing={2.5}>
              {/* Title */}
              <Grid item xs={12} md={8}>
                <TextField
                  id="title"
                  name="title"
                  label="Requisition Title"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  value={formData.title}
                  onChange={handleChange('title')}
                  onBlur={handleBlur('title')}
                  error={Boolean(errors.title)}
                  helperText={errors.title || 'e.g. Ergonomic Office Chairs for Engineering'}
                  placeholder="Enter a descriptive title"
                  size="medium"
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={4}>
                <TextField
                  id="category"
                  name="category"
                  select
                  label="Category"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  value={formData.category}
                  onChange={handleChange('category')}
                  onBlur={handleBlur('category')}
                  error={Boolean(errors.category)}
                  helperText={errors.category || 'Select appropriate item category'}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  {PROCUREMENT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  id="description"
                  name="description"
                  label="Description & Specifications"
                  multiline
                  rows={3}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  value={formData.description}
                  onChange={handleChange('description')}
                  onBlur={handleBlur('description')}
                  error={Boolean(errors.description)}
                  helperText={errors.description || 'Provide detailed technical specifications or item requirements'}
                  placeholder="Specify model numbers, brand requirements, dimensions, or technical criteria..."
                  size="medium"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Section 2: Quantities, Cost & Timeline */}
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" fontSize="small" />
              Quantities & Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Specify the required units, estimated budgetary cost, and required delivery date.
            </Typography>

            <Grid container spacing={2.5}>
              {/* Quantity */}
              <Grid item xs={12} sm={4}>
                <TextField
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  value={formData.quantity}
                  onChange={handleChange('quantity')}
                  onBlur={handleBlur('quantity')}
                  error={Boolean(errors.quantity)}
                  helperText={errors.quantity || 'Units required (min. 1)'}
                  placeholder="10"
                  size="medium"
                  inputProps={{ min: 1, step: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NumbersOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Estimated Cost */}
              <Grid item xs={12} sm={4}>
                <TextField
                  id="estimatedCost"
                  name="estimatedCost"
                  label="Total Estimated Cost"
                  type="number"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  value={formData.estimatedCost}
                  onChange={handleChange('estimatedCost')}
                  onBlur={handleBlur('estimatedCost')}
                  error={Boolean(errors.estimatedCost)}
                  helperText={errors.estimatedCost || 'Estimated total in USD ($)'}
                  placeholder="5000"
                  size="medium"
                  inputProps={{ min: 0, step: '0.01' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Required Date */}
              <Grid item xs={12} sm={4}>
                <TextField
                  id="requiredDate"
                  name="requiredDate"
                  label="Required By Date"
                  type="date"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  value={formData.requiredDate}
                  onChange={handleChange('requiredDate')}
                  onBlur={handleBlur('requiredDate')}
                  error={Boolean(errors.requiredDate)}
                  helperText={errors.requiredDate || 'Expected delivery deadline'}
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Remarks */}
              <Grid item xs={12}>
                <TextField
                  id="remarks"
                  name="remarks"
                  label="Additional Remarks / Business Justification (Optional)"
                  multiline
                  rows={2}
                  fullWidth
                  disabled={isSubmitting}
                  value={formData.remarks}
                  onChange={handleChange('remarks')}
                  helperText="Optional business justification or vendor preferences"
                  placeholder="e.g. Budget approved under Q3 IT Refresh Initiative"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotesOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, mt: -2 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* Form Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                color="inherit"
                disabled={isSubmitting}
                onClick={() => navigate('/purchase-requests')}
                sx={{ px: 3, fontWeight: 600, borderRadius: 1.5 }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{
                  px: 4,
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  borderRadius: 1.5,
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1.5 }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Purchase Request'
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreatePurchaseRequestPage;
