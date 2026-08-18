import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const INITIAL_FORM = {
  // General Info
  companyName: '',
  legalName: '',
  vendorType: 'SUPPLIER', // SUPPLIER, SERVICE_PROVIDER, LOGISTICS, CONTRACTOR
  category: 'IT Hardware',
  website: '',
  status: 'ACTIVE',

  // Primary Contact
  contactPerson: '',
  email: '',
  phone: '',
  alternatePhone: '',
  address: '',
  city: '',
  country: 'Pakistan',

  // Financial & Payment
  paymentTerms: 'NET_30', // NET_15, NET_30, NET_60, ADVANCE
  currency: 'PKR',
  creditLimit: 0,
  taxId: '',
  salesTaxNo: '',

  // Compliance
  isTaxExempt: false,
  isActive: true,
  notes: '',
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const VendorForm = ({ initialValues, onSubmit, onCancel, isSubmitting = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.email.trim()) newErrors.email = 'Primary email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="vendor form tabs">
            <Tab icon={<BusinessIcon />} iconPosition="start" label="General Info" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Contact Details" />
            <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Financial & Terms" />
            <Tab icon={<AssignmentTurnedInIcon />} iconPosition="start" label="Tax & Notes" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* TAB 1: General Info */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.companyName)}
                  helperText={errors.companyName}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="legalName"
                  label="Legal Business Name"
                  value={formData.legalName}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  name="vendorType"
                  label="Vendor Type"
                  value={formData.vendorType}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="SUPPLIER">Supplier</MenuItem>
                  <MenuItem value="SERVICE_PROVIDER">Service Provider</MenuItem>
                  <MenuItem value="LOGISTICS">Logistics</MenuItem>
                  <MenuItem value="CONTRACTOR">Contractor</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="category"
                  label="Primary Category"
                  value={formData.category}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="website"
                  label="Website URL"
                  value={formData.website}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="https://example.com"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 2: Contact Details */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="contactPerson"
                  label="Primary Contact Person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Primary Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="alternatePhone"
                  label="Alternate Phone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Office Address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 3: Financial & Terms */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="paymentTerms"
                  label="Payment Terms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="ADVANCE">Advance Payment</MenuItem>
                  <MenuItem value="NET_15">Net 15 Days</MenuItem>
                  <MenuItem value="NET_30">Net 30 Days</MenuItem>
                  <MenuItem value="NET_60">Net 60 Days</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  name="currency"
                  label="Preferred Currency"
                  value={formData.currency}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem>
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  name="creditLimit"
                  label="Credit Limit Amount"
                  value={formData.creditLimit}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 4: Tax & Notes */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="taxId"
                  label="National Tax Number (NTN)"
                  value={formData.taxId}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="salesTaxNo"
                  label="Sales Tax Registration No (STRN)"
                  value={formData.salesTaxNo}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isTaxExempt}
                      onChange={handleChange}
                      name="isTaxExempt"
                      color="primary"
                    />
                  }
                  label="Tax Exempt Vendor"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange}
                      name="isActive"
                      color="success"
                    />
                  }
                  label="Active Status"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Internal Vendor Notes"
                  value={formData.notes}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder="Additional context, SLA agreements, or compliance notes..."
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            {onCancel && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Vendor'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default VendorForm;