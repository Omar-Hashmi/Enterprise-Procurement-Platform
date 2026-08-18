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
import { useBudget } from '../../hooks/useBudget';

const INITIAL_FORM_STATE = {
  department: '',
  project: '',
  fiscalYear: new Date().getFullYear(),
  period: 'monthly',
  allocatedAmount: '',
  purchaseLimit: '',
  warningThresholdPercent: '',
};

export const CreateBudget = () => {
  const navigate = useNavigate();
  const { createBudget, isLoading, error: apiError } = useBudget();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.fiscalYear) newErrors.fiscalYear = 'Fiscal year is required';
    if (!formData.allocatedAmount) newErrors.allocatedAmount = 'Allocated amount is required';
    if (!formData.purchaseLimit) newErrors.purchaseLimit = 'Purchase limit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (createBudget) {
        await createBudget(formData);
      } else {
        // fallback: call API directly
        await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      navigate('/budgets');
    } catch (err) {
      // hook's error state will surface if available
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1000, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
            Dashboard
          </Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/budgets">
            Budgets
          </Link>
          <Typography color="text.primary">Create Budget</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/budgets')} color="inherit" size="small">
              Back
            </Button>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Create Budget Allocation
            </Typography>
          </Box>
        </Box>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{apiError}</Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>
              Budget Details
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField name="department" label="Department (ID)" value={formData.department} onChange={handleChange} error={Boolean(errors.department)} helperText={errors.department} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="project" label="Project (optional)" value={formData.project} onChange={handleChange} fullWidth size="small" />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField name="fiscalYear" label="Fiscal Year" type="number" value={formData.fiscalYear} onChange={handleChange} error={Boolean(errors.fiscalYear)} helperText={errors.fiscalYear} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField select name="period" label="Period" value={formData.period} onChange={handleChange} fullWidth size="small">
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4} />

              <Grid item xs={12} sm={6}>
                <TextField name="allocatedAmount" label="Allocated Amount" type="number" value={formData.allocatedAmount} onChange={handleChange} error={Boolean(errors.allocatedAmount)} helperText={errors.allocatedAmount} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="purchaseLimit" label="Purchase Limit" type="number" value={formData.purchaseLimit} onChange={handleChange} error={Boolean(errors.purchaseLimit)} helperText={errors.purchaseLimit} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="warningThresholdPercent" label="Warning Threshold (%)" type="number" value={formData.warningThresholdPercent} onChange={handleChange} fullWidth size="small" />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate('/budgets')} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Budget'}</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateBudget;
