import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
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
import { useInventory } from '../../hooks/useInventory';

const INITIAL_FORM_STATE = {
  purchaseOrder: '',
  warehouse: '',
  expectedDeliveryDate: '',
  notes: '',
};

export const CreateInventory = () => {
  const navigate = useNavigate();
  const { handleAddItem } = useInventory();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.purchaseOrder) newErrors.purchaseOrder = 'Purchase order is required';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required';
    if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Prefer hook/repository if available, otherwise call API
      if (handleAddItem) {
        // Add a lightweight delivery record via API to keep data consistent with backend
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseOrder: formData.purchaseOrder,
            warehouse: formData.warehouse,
            expectedDeliveryDate: formData.expectedDeliveryDate,
            notes: formData.notes,
          }),
        });
        // locally update sample inventory list if desired
        handleAddItem({
          sku: formData.purchaseOrder,
          name: 'Delivery - ' + formData.purchaseOrder,
          category: 'Received',
          quantity: 0,
          minStockThreshold: 0,
          unitPrice: 0,
          location: formData.warehouse,
        });
      } else {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseOrder: formData.purchaseOrder,
            warehouse: formData.warehouse,
            expectedDeliveryDate: formData.expectedDeliveryDate,
            notes: formData.notes,
          }),
        });
      }
      navigate('/inventory');
    } catch (err) {
      setApiError(err.message || 'Failed to create inventory record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1000, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">Dashboard</Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/inventory">Inventory</Link>
          <Typography color="text.primary">Create Delivery Record</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/inventory')} color="inherit" size="small">Back</Button>
            <Typography variant="h5" fontWeight={700} color="text.primary">New Delivery Record</Typography>
          </Box>
        </Box>
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{apiError}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>Delivery Details</Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField name="purchaseOrder" label="Purchase Order ID" value={formData.purchaseOrder} onChange={handleChange} error={Boolean(errors.purchaseOrder)} helperText={errors.purchaseOrder} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="warehouse" label="Warehouse" value={formData.warehouse} onChange={handleChange} error={Boolean(errors.warehouse)} helperText={errors.warehouse} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField name="expectedDeliveryDate" label="Expected Delivery Date" type="date" value={formData.expectedDeliveryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} error={Boolean(errors.expectedDeliveryDate)} helperText={errors.expectedDeliveryDate} fullWidth required size="small" />
              </Grid>

              <Grid item xs={12}>
                <TextField name="notes" label="Notes" value={formData.notes} onChange={handleChange} fullWidth multiline rows={3} size="small" />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate('/inventory')} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Record'}</Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateInventory;
