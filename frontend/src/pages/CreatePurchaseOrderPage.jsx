import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/Loading';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const PAYMENT_TERMS_OPTIONS = [
  'Net 30 Days',
  'Net 60 Days',
  'Net 90 Days',
  'Immediate Upon Delivery',
  '100% Advance Payment',
  '50% Advance, 50% Upon Fulfillment',
  'Custom Contract Terms',
];

export const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role?.toLowerCase() || '';
  const canCreatePO = [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_MANAGER, USER_ROLES.PROCUREMENT_OFFICER].includes(userRole);

  const [formData, setFormData] = useState({
    purchaseRequest: '',
    vendor: '',
    quotation: '',
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    totalAmount: '',
    expectedDeliveryDate: '',
    paymentTerms: 'Net 30 Days',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query 1: Fetch Approved Purchase Requests
  const { data: purchaseRequests = [], isLoading: isLoadingPRs } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/purchase-requests');
        return Array.isArray(response.data) ? response.data : [];
      } catch {
        return [];
      }
    },
    enabled: canCreatePO,
    staleTime: 0,
  });

  // Query 2: Fetch Active Vendors
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/vendors');
        return Array.isArray(response.data?.data) ? response.data.data : [];
      } catch {
        return [];
      }
    },
    enabled: canCreatePO,
    staleTime: 0,
  });

  // Filter only Approved Purchase Requests
  const approvedPRs = purchaseRequests.filter((pr) => pr.status === 'Approved');

  // Filter only Active Vendors
  const activeVendors = vendors.filter(
    (v) => (v.status?.toLowerCase() === 'active') && !v.isBlacklisted
  );

  const handleFieldChange = (field) => (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };

      // Auto-populate estimated cost when PR selected if total amount is empty
      if (field === 'purchaseRequest') {
        const selectedPR = approvedPRs.find((pr) => pr._id === val);
        if (selectedPR && !prev.totalAmount) {
          updated.totalAmount = selectedPR.estimatedCost || '';
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.purchaseRequest) errs.purchaseRequest = 'Approved purchase request is required';
    if (!formData.vendor) errs.vendor = 'Active supplier vendor is required';
    if (!formData.quotation?.trim()) errs.quotation = 'Quotation reference identifier is required';
    if (!formData.poNumber?.trim()) errs.poNumber = 'Purchase order number is required';

    const amt = Number(formData.totalAmount);
    if (!formData.totalAmount || isNaN(amt) || amt <= 0) {
      errs.totalAmount = 'Total amount must be a positive number';
    }

    if (!formData.expectedDeliveryDate) {
      errs.expectedDeliveryDate = 'Expected delivery date is required';
    } else {
      const deliveryDate = new Date(formData.expectedDeliveryDate);
      if (isNaN(deliveryDate.getTime())) {
        errs.expectedDeliveryDate = 'Invalid delivery date format';
      }
    }

    if (!formData.paymentTerms?.trim()) {
      errs.paymentTerms = 'Payment terms specification is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setServerError('');
    setIsSubmitting(true);

    try {
      const payload = {
        purchaseRequest: formData.purchaseRequest,
        vendor: formData.vendor,
        quotation: formData.quotation.trim(),
        poNumber: formData.poNumber.trim(),
        totalAmount: Number(formData.totalAmount),
        expectedDeliveryDate: new Date(formData.expectedDeliveryDate).toISOString(),
        paymentTerms: formData.paymentTerms.trim(),
        remarks: formData.remarks?.trim() || undefined,
      };

      const response = await apiClient.post('/purchase-orders', payload);

      // Invalidate and synchronize caches
      await queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      await queryClient.refetchQueries({ queryKey: ['purchaseOrders'] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });

      navigate('/purchase-orders', {
        state: {
          successMessage: `Purchase Order "${payload.poNumber}" issued successfully to vendor.`,
        },
      });
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to issue purchase order. Please check your inputs and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreatePO) {
    return (
      <Box>
        <PageHeader title="Issue Purchase Order" subtitle="Commercial contract issuance" />
        <Alert severity="error" sx={{ mt: 2 }}>
          Access restricted. Only <strong>Procurement Managers and Administrators</strong> are authorized to issue commercial purchase orders.
        </Alert>
      </Box>
    );
  }

  if (isLoadingPRs || isLoadingVendors) {
    return <LoadingState message="Loading approved requisitions and vendors..." minHeight={400} />;
  }

  return (
    <Box>
      {/* Top Back Navigation */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/purchase-orders')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Purchase Orders Directory
        </Button>
      </Box>

      <PageHeader
        title="Issue Purchase Order"
        subtitle="Generate and dispatch an official procurement contract to an approved supplier"
      />

      {serverError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {serverError}
        </Alert>
      )}

      {approvedPRs.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>No Approved Requisitions Available:</strong> Purchase orders can only be issued for Purchase Requests that have completed the full 4-tier approval workflow (Status: "Approved").
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Left Column: Requisition & Supplier Linkage */}
          <Grid item xs={12} md={7}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionOutlinedIcon color="primary" fontSize="small" />
                  1. Procurement Linkage & Supplier
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Select the finalized requisition and approved vendor partner.
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  {/* Purchase Request Selection */}
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Approved Purchase Requisition"
                      fullWidth
                      required
                      value={formData.purchaseRequest}
                      onChange={handleFieldChange('purchaseRequest')}
                      error={Boolean(errors.purchaseRequest)}
                      helperText={errors.purchaseRequest || 'Only requisitions with completed executive approvals are eligible'}
                      disabled={approvedPRs.length === 0}
                    >
                      {approvedPRs.map((pr) => (
                        <MenuItem key={pr._id} value={pr._id}>
                          #{pr._id.slice(-6)} — {pr.title} ({formatCurrency(pr.estimatedCost)})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Vendor Selection */}
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Target Vendor / Supplier"
                      fullWidth
                      required
                      value={formData.vendor}
                      onChange={handleFieldChange('vendor')}
                      error={Boolean(errors.vendor)}
                      helperText={errors.vendor || 'Must be an active, verified supplier'}
                    >
                      {activeVendors.map((v) => (
                        <MenuItem key={v._id} value={v._id}>
                          {v.companyName} {v.vendorCode ? `(${v.vendorCode})` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Quotation Reference */}
                  <Grid item xs={12}>
                    <TextField
                      label="Quotation Reference ID"
                      placeholder="e.g. 660f1b2c3d4e5f6a7b8c9d0e"
                      fullWidth
                      required
                      value={formData.quotation}
                      onChange={handleFieldChange('quotation')}
                      error={Boolean(errors.quotation)}
                      helperText={errors.quotation || 'Valid approved quotation ID from the supplier evaluation'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financials & Delivery Specs */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptLongOutlinedIcon color="primary" fontSize="small" />
                  2. Commercial Value & Fulfillment Terms
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2.5}>
                  {/* PO Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Purchase Order Number"
                      fullWidth
                      required
                      value={formData.poNumber}
                      onChange={handleFieldChange('poNumber')}
                      error={Boolean(errors.poNumber)}
                      helperText={errors.poNumber || 'Unique contract identifier'}
                    />
                  </Grid>

                  {/* Total Amount */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Total Contract Amount"
                      type="number"
                      fullWidth
                      required
                      value={formData.totalAmount}
                      onChange={handleFieldChange('totalAmount')}
                      error={Boolean(errors.totalAmount)}
                      helperText={errors.totalAmount}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>

                  {/* Expected Delivery Date */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Expected Delivery Date"
                      type="date"
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      value={formData.expectedDeliveryDate}
                      onChange={handleFieldChange('expectedDeliveryDate')}
                      error={Boolean(errors.expectedDeliveryDate)}
                      helperText={errors.expectedDeliveryDate}
                    />
                  </Grid>

                  {/* Payment Terms */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Payment Terms"
                      fullWidth
                      required
                      value={formData.paymentTerms}
                      onChange={handleFieldChange('paymentTerms')}
                      error={Boolean(errors.paymentTerms)}
                      helperText={errors.paymentTerms}
                    >
                      {PAYMENT_TERMS_OPTIONS.map((term) => (
                        <MenuItem key={term} value={term}>
                          {term}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Remarks */}
                  <Grid item xs={12}>
                    <TextField
                      label="Order Remarks / Special Delivery Instructions"
                      placeholder="Specify shipping dock details, packaging requirements, billing instructions..."
                      fullWidth
                      multiline
                      rows={3}
                      value={formData.remarks}
                      onChange={handleFieldChange('remarks')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Issuance Summary & Submit */}
          <Grid item xs={12} md={5}>
            <Card sx={{ mb: 3, bgcolor: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Issuance Summary
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Issuer
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.fullName || user?.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Issuer Role
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {userRole}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Order Value
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formData.totalAmount ? formatCurrency(Number(formData.totalAmount)) : '$0.00'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Initial Status
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      Issued
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isSubmitting || approvedPRs.length === 0}
                  startIcon={<ShoppingBagOutlinedIcon />}
                  sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm & Issue Purchase Order'}
                </Button>

                <Button
                  variant="text"
                  color="inherit"
                  fullWidth
                  onClick={() => navigate('/purchase-orders')}
                  disabled={isSubmitting}
                  sx={{ mt: 1.5 }}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CreatePurchaseOrderPage;
