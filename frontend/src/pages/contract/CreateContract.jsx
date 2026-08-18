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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useContract } from '../../hooks/useContract';

const INITIAL_FORM_STATE = {
  title: '',
  vendor: '',
  department: '',
  startDate: '',
  endDate: '',
  autoRenew: false,
  renewalNoticeDays: '',
  value: '',
  currency: 'USD',
  paymentTerms: '',
};

export const CreateContract = () => {
  const navigate = useNavigate();
  const { /* createContract */ } = useContract();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.vendor) newErrors.vendor = 'Vendor is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.value) newErrors.value = 'Contract value is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      navigate('/contracts');
    } catch (err) {
      setApiError(err.message || 'Failed to create contract');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">Dashboard</Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/contracts">Contracts</Link>
          <Typography color="text.primary">Create Contract</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/contracts')} color="inherit" size="small">Back</Button>
            <Typography variant="h5" fontWeight={700} color="text.primary">New Contract</Typography>
          </Box>
        </Box>
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{apiError}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>Contract Information</Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField name="title" label="Contract Title" value={formData.title} onChange={handleChange} error={Boolean(errors.title)} helperText={errors.title} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="vendor" label="Vendor (ID)" value={formData.vendor} onChange={handleChange} error={Boolean(errors.vendor)} helperText={errors.vendor} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="department" label="Department (ID)" value={formData.department} onChange={handleChange} error={Boolean(errors.department)} helperText={errors.department} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={Boolean(errors.startDate)} helperText={errors.startDate} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField name="endDate" label="End Date" type="date" value={formData.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={Boolean(errors.endDate)} helperText={errors.endDate} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField name="value" label="Contract Value" type="number" value={formData.value} onChange={handleChange} error={Boolean(errors.value)} helperText={errors.value} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField select name="currency" label="Currency" value={formData.currency} onChange={handleChange} fullWidth size="small">
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="PKR">PKR</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField name="paymentTerms" label="Payment Terms" value={formData.paymentTerms} onChange={handleChange} fullWidth size="small" />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate('/contracts')} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Contract'}</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateContract;
import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContractForm from './components/ContractForm';

export default function CreateContract() {
  return (
    <Box sx={{ p: { xs:2, sm:3 }, maxWidth: 900, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/contracts">Contracts</Link>
        <Typography color="text.primary">Create</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Create Contract</Typography>
      <Card variant="outlined"><CardContent><ContractForm /></CardContent></Card>
    </Box>
  );
}
