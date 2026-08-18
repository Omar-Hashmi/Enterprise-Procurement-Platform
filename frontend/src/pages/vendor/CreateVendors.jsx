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
import { useVendor } from '../../hooks/useVendor';

const VENDOR_CATEGORIES = [
  'IT & Hardware',
  'Software & SaaS',
  'Office Supplies',
  'Logistics & Freight',
  'Consulting & Professional Services',
  'Facilities & Maintenance',
];

const INITIAL_FORM_STATE = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  category: '',
  taxId: '',
  address: '',
  paymentTerms: 'NET30',
  notes: '',
};

export const CreateVendor = () => {
  const navigate = useNavigate();
  const { createVendor, isLoading, error: apiError } = useVendor();

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Vendor name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.category) newErrors.category = 'Category selection is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createVendor(formData);
      navigate('/vendors');
    } catch (err) {
      // Error is handled via useVendor state/API response
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      {/* Breadcrumbs & Navigation Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">
            Dashboard
          </Link>
          <Link component={RouterLink} underline="hover" color="inherit" to="/vendors">
            Vendors
          </Link>
          <Typography color="text.primary">Create Vendor</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vendors')}
              color="inherit"
              size="small"
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Register New Vendor
            </Typography>
          </Box>
        </Box>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {apiError}
        </Alert>
      )}

      {/* Main Form Card */}
      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Primary Details Section */}
            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>
              General Information
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Vendor / Company Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="category"
                  label="Vendor Category"
                  value={formData.category}
                  onChange={handleChange}
                  error={Boolean(errors.category)}
                  helperText={errors.category}
                  fullWidth
                  required
                  size="small"
                >
                  {VENDOR_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="contactPerson"
                  label="Primary Contact Person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  error={Boolean(errors.contactPerson)}
                  helperText={errors.contactPerson}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  name="taxId"
                  label="Tax Registration Number / NTN"
                  value={formData.taxId}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* Address & Terms Section */}
            <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>
              Financial & Location Details
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="paymentTerms"
                  label="Standard Payment Terms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="IMMEDIATE">Immediate / Due on Receipt</MenuItem>
                  <MenuItem value="NET15">Net 15 Days</MenuItem>
                  <MenuItem value="NET30">Net 30 Days</MenuItem>
                  <MenuItem value="NET60">Net 60 Days</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Business Address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Internal Notes & Remarks"
                  value={formData.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/vendors')}
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
                {isLoading ? 'Saving Vendor...' : 'Save Vendor'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateVendor;