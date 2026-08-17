import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLES } from '../utils/constants';

export const CreateVendorPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role?.toLowerCase() || '';
  const canManageVendors = [USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.ADMIN].includes(userRole);

  // Form State
  const [formData, setFormData] = useState({
    // Company Overview
    companyName: '',
    registrationNumber: '',
    industry: '',
    website: '',
    categories: [],

    // Contact Person
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactDesignation: '',

    // Address
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',

    // Tax Information
    taxId: '',
    vatNumber: '',
    taxDocumentUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Vendor Categories for multi-select
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['vendorCategories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/vendors/categories');
        return response.data?.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Client-Side Validation rules matching backend Joi schema
  const validateField = (field, value) => {
    switch (field) {
      case 'companyName':
        if (!value.trim()) return 'Company legal name is required';
        if (value.trim().length < 2) return 'Company name must be at least 2 characters';
        if (value.trim().length > 200) return 'Company name cannot exceed 200 characters';
        return '';
      case 'registrationNumber':
        if (!value.trim()) return 'Business registration number is required';
        return '';
      case 'website':
        if (value.trim() && !/^https?:\/\/.+/i.test(value.trim())) {
          return 'Please enter a valid website URL (e.g., https://example.com)';
        }
        return '';
      case 'contactName':
        if (!value.trim()) return 'Primary contact name is required';
        return '';
      case 'contactEmail':
        if (!value.trim()) return 'Contact email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'contactPhone':
        if (!value.trim()) return 'Contact phone number is required';
        return '';
      case 'street':
        if (!value.trim()) return 'Street address is required';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        return '';
      case 'country':
        if (!value.trim()) return 'Country is required';
        return '';
      case 'taxId':
        if (!value.trim()) return 'Tax identification number (Tax ID) is required';
        return '';
      case 'taxDocumentUrl':
        if (value.trim() && !/^https?:\/\/.+/i.test(value.trim())) {
          return 'Please enter a valid document URL (e.g., https://...)';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'companyName',
      'registrationNumber',
      'contactName',
      'contactEmail',
      'contactPhone',
      'street',
      'city',
      'country',
      'taxId',
    ];
    const optionalUrlFields = ['website', 'taxDocumentUrl'];

    const newErrors = {};

    [...requiredFields, ...optionalUrlFields].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    return newErrors;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

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

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      categories: typeof value === 'string' ? value.split(',') : value,
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
      // Build structured backend payload matching createVendorSchema
      const payload = {
        companyName: formData.companyName.trim(),
        companyInfo: {
          registrationNumber: formData.registrationNumber.trim(),
          website: formData.website.trim() || undefined,
          industry: formData.industry.trim() || undefined,
          address: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            state: formData.state.trim() || undefined,
            country: formData.country.trim(),
            postalCode: formData.postalCode.trim() || undefined,
          },
          contactPerson: {
            name: formData.contactName.trim(),
            email: formData.contactEmail.trim(),
            phone: formData.contactPhone.trim(),
            designation: formData.contactDesignation.trim() || undefined,
          },
        },
        taxInfo: {
          taxId: formData.taxId.trim(),
          vatNumber: formData.vatNumber.trim() || undefined,
          taxDocumentUrl: formData.taxDocumentUrl.trim() || undefined,
        },
        categories: formData.categories.length > 0 ? formData.categories : undefined,
      };

      const response = await apiClient.post('/vendors', payload);

      if (response.status === 201 || response.status === 200) {
        // Invalidate and refetch React Query cache
        await queryClient.invalidateQueries({ queryKey: ['vendors'] });
        await queryClient.refetchQueries({ queryKey: ['vendors'] });
        await queryClient.invalidateQueries({ queryKey: ['vendorStatusSummary'] });

        // Navigate back to vendor directory with success message
        navigate('/vendors', {
          state: {
            created: true,
            message: 'Vendor onboarded successfully with status Pending Review.',
          },
        });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else if (err.request) {
        setServerError('Unable to connect to the procurement server. Please check your network connection.');
      } else {
        setServerError(err.message || 'An unexpected error occurred during vendor onboarding.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Top Back Action */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/vendors')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Vendor Directory
        </Button>
      </Box>

      <PageHeader
        title="Onboard New Vendor"
        subtitle="Register a new supplier profile, company details, contact information, and tax credentials"
      />

      {/* Role Notice if not authorized role */}
      {!canManageVendors && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are currently signed in with role: <strong>{userRole || 'Employee'}</strong>. Vendor registration requires <strong>Procurement Officer</strong> or <strong>Admin</strong> privileges.
        </Alert>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <Alert severity="error" onClose={() => setServerError('')} sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      {/* Onboarding Form Card */}
      <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 4 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Section 1: Company Profile & Identification */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" fontSize="small" />
                Company Overview & Industry
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Legal enterprise name, registration identifiers, and supplier classification
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2.5}>
                {/* Company Legal Name */}
                <Grid item xs={12} sm={8}>
                  <TextField
                    id="companyName"
                    name="companyName"
                    label="Company Legal Name"
                    placeholder="e.g. Apex Global Technologies Ltd"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.companyName}
                    onChange={handleChange('companyName')}
                    onBlur={handleBlur('companyName')}
                    error={Boolean(errors.companyName)}
                    helperText={errors.companyName || 'Registered legal trade name'}
                    size="medium"
                  />
                </Grid>

                {/* Business Registration Number */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    id="registrationNumber"
                    name="registrationNumber"
                    label="Registration Number"
                    placeholder="e.g. REG-883921"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.registrationNumber}
                    onChange={handleChange('registrationNumber')}
                    onBlur={handleBlur('registrationNumber')}
                    error={Boolean(errors.registrationNumber)}
                    helperText={errors.registrationNumber || 'Official incorporation code'}
                    size="medium"
                  />
                </Grid>

                {/* Industry */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="industry"
                    name="industry"
                    label="Industry Sector"
                    placeholder="e.g. Information Technology, Hardware, Facilities"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.industry}
                    onChange={handleChange('industry')}
                    helperText="Primary industry specialization"
                    size="medium"
                  />
                </Grid>

                {/* Website */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="website"
                    name="website"
                    label="Corporate Website URL"
                    placeholder="https://www.example.com"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.website}
                    onChange={handleChange('website')}
                    onBlur={handleBlur('website')}
                    error={Boolean(errors.website)}
                    helperText={errors.website || 'Optional public website'}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanguageIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Vendor Categories Multi-Select */}
                <Grid item xs={12}>
                  <FormControl fullWidth size="medium">
                    <InputLabel id="vendor-categories-label">Vendor Categories</InputLabel>
                    <Select
                      labelId="vendor-categories-label"
                      id="categories"
                      multiple
                      value={formData.categories}
                      onChange={handleCategoryChange}
                      input={<OutlinedInput label="Vendor Categories" />}
                      disabled={isSubmitting || isLoadingCategories}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const cat = categories.find((c) => c._id === value);
                            return <Chip key={value} label={cat ? cat.name : value} size="small" />;
                          })}
                        </Box>
                      )}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Primary Contact Person */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlineIcon color="primary" fontSize="small" />
                Primary Contact Person
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Key liaison responsible for quotation requests and order fulfillment
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2.5}>
                {/* Contact Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="contactName"
                    name="contactName"
                    label="Contact Full Name"
                    placeholder="e.g. Sarah Jenkins"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.contactName}
                    onChange={handleChange('contactName')}
                    onBlur={handleBlur('contactName')}
                    error={Boolean(errors.contactName)}
                    helperText={errors.contactName || 'Full legal name'}
                    size="medium"
                  />
                </Grid>

                {/* Designation */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="contactDesignation"
                    name="contactDesignation"
                    label="Job Title / Designation"
                    placeholder="e.g. Key Account Manager, Sales Director"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.contactDesignation}
                    onChange={handleChange('contactDesignation')}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Contact Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="contactEmail"
                    name="contactEmail"
                    label="Email Address"
                    type="email"
                    placeholder="s.jenkins@company.com"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.contactEmail}
                    onChange={handleChange('contactEmail')}
                    onBlur={handleBlur('contactEmail')}
                    error={Boolean(errors.contactEmail)}
                    helperText={errors.contactEmail || 'Official business correspondence email'}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Contact Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="contactPhone"
                    name="contactPhone"
                    label="Phone Number"
                    placeholder="+1 (555) 019-2834"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.contactPhone}
                    onChange={handleChange('contactPhone')}
                    onBlur={handleBlur('contactPhone')}
                    error={Boolean(errors.contactPhone)}
                    helperText={errors.contactPhone || 'Direct phone or mobile line'}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 3: Physical Address */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnOutlinedIcon color="primary" fontSize="small" />
                Physical Business Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Corporate headquarters or primary operational facility address
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2.5}>
                {/* Street */}
                <Grid item xs={12}>
                  <TextField
                    id="street"
                    name="street"
                    label="Street Address"
                    placeholder="e.g. 100 Enterprise Way, Suite 400"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.street}
                    onChange={handleChange('street')}
                    onBlur={handleBlur('street')}
                    error={Boolean(errors.street)}
                    helperText={errors.street || 'Full building address and street'}
                    size="medium"
                  />
                </Grid>

                {/* City */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="city"
                    name="city"
                    label="City"
                    placeholder="e.g. Chicago"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.city}
                    onChange={handleChange('city')}
                    onBlur={handleBlur('city')}
                    error={Boolean(errors.city)}
                    helperText={errors.city}
                    size="medium"
                  />
                </Grid>

                {/* State / Province */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="state"
                    name="state"
                    label="State / Province"
                    placeholder="e.g. Illinois"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.state}
                    onChange={handleChange('state')}
                    size="medium"
                  />
                </Grid>

                {/* Country */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="country"
                    name="country"
                    label="Country"
                    placeholder="e.g. United States"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.country}
                    onChange={handleChange('country')}
                    onBlur={handleBlur('country')}
                    error={Boolean(errors.country)}
                    helperText={errors.country}
                    size="medium"
                  />
                </Grid>

                {/* Postal Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="postalCode"
                    name="postalCode"
                    label="Postal / ZIP Code"
                    placeholder="e.g. 60601"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.postalCode}
                    onChange={handleChange('postalCode')}
                    size="medium"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Section 4: Tax & Legal Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongOutlinedIcon color="primary" fontSize="small" />
                Tax & Legal Compliance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Taxpayer identification numbers for accounts payable and invoicing
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2.5}>
                {/* Tax ID */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="taxId"
                    name="taxId"
                    label="Tax Identification Number (TIN / Tax ID)"
                    placeholder="e.g. TIN-992-1823"
                    fullWidth
                    required
                    disabled={isSubmitting}
                    value={formData.taxId}
                    onChange={handleChange('taxId')}
                    onBlur={handleBlur('taxId')}
                    error={Boolean(errors.taxId)}
                    helperText={errors.taxId || 'Mandatory for fiscal compliance'}
                    size="medium"
                  />
                </Grid>

                {/* VAT Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="vatNumber"
                    name="vatNumber"
                    label="VAT Registration Number"
                    placeholder="e.g. VAT-US-102938"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.vatNumber}
                    onChange={handleChange('vatNumber')}
                    helperText="Optional VAT registration"
                    size="medium"
                  />
                </Grid>

                {/* Tax Document URL */}
                <Grid item xs={12}>
                  <TextField
                    id="taxDocumentUrl"
                    name="taxDocumentUrl"
                    label="Tax Certificate Document URL"
                    placeholder="https://docs.example.com/tax-cert.pdf"
                    fullWidth
                    disabled={isSubmitting}
                    value={formData.taxDocumentUrl}
                    onChange={handleChange('taxDocumentUrl')}
                    onBlur={handleBlur('taxDocumentUrl')}
                    error={Boolean(errors.taxDocumentUrl)}
                    helperText={errors.taxDocumentUrl || 'Optional link to verified W-9 / Tax Certificate'}
                    size="medium"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Form Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="inherit"
                disabled={isSubmitting}
                onClick={() => navigate('/vendors')}
                sx={{ px: 3, py: 1, color: 'text.secondary', fontWeight: 600 }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ px: 4, py: 1, fontWeight: 700, borderRadius: 1.5 }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Onboarding Vendor...</span>
                  </Box>
                ) : (
                  'Submit Vendor Registration'
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateVendorPage;
