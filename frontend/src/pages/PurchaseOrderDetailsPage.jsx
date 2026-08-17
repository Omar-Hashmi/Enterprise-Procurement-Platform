import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import ErrorState from '../components/feedback/ErrorState';
import EmptyState from '../components/feedback/EmptyState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { getStatusColor, USER_ROLES } from '../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

// Linear fulfillment sequence matching backend PurchaseOrderService
const FULFILLMENT_STAGES = [
  { key: 'Issued', label: '1. Order Issued', timestampField: 'issuedAt' },
  { key: 'Accepted', label: '2. Accepted by Supplier', timestampField: 'acceptedAt' },
  { key: 'In Progress', label: '3. Manufacturing & Fulfillment', timestampField: 'inProgressAt' },
  { key: 'Delivered', label: '4. Goods Delivered to Facility', timestampField: 'deliveredAt' },
  { key: 'Completed', label: '5. Contract Completed & Settled', timestampField: 'completedAt' },
];

const VALID_PO_TRANSITIONS = {
  Issued: ['Accepted', 'Cancelled'],
  Accepted: ['In Progress', 'Cancelled'],
  'In Progress': ['Delivered', 'Cancelled'],
  Delivered: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

const PAYMENT_TERMS_OPTIONS = [
  'Net 30 Days',
  'Net 60 Days',
  'Net 90 Days',
  'Immediate Upon Delivery',
  '100% Advance Payment',
  '50% Advance, 50% Upon Fulfillment',
  'Custom Contract Terms',
];

export const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role?.toLowerCase() || '';
  const canManagePO = [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_MANAGER, USER_ROLES.PROCUREMENT_OFFICER].includes(userRole);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('success');

  // Dialog State: Status Progression
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [statusError, setStatusError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dialog State: Edit PO Details
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    expectedDeliveryDate: '',
    paymentTerms: '',
    remarks: '',
  });
  const [editError, setEditError] = useState('');
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);

  // Dialog State: Cancel PO Confirmation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Query: Purchase Order Details
  const {
    data: po,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: async () => {
      const response = await apiClient.get(`/purchase-orders/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefresh = () => {
    refetch();
  };

  // --- Status Progression Handlers ---
  const handleOpenStatusDialog = () => {
    if (!po) return;
    const allowed = VALID_PO_TRANSITIONS[po.status] || [];
    setSelectedNextStatus(allowed[0] || '');
    setStatusError('');
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    if (isUpdatingStatus) return;
    setStatusDialogOpen(false);
  };

  const handleSubmitStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedNextStatus) return;

    setStatusError('');
    setIsUpdatingStatus(true);

    try {
      await apiClient.put(`/purchase-orders/${id}`, {
        status: selectedNextStatus,
      });

      await queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] });
      await queryClient.refetchQueries({ queryKey: ['purchaseOrder', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });

      setFeedbackMessage(`Purchase Order status updated to "${selectedNextStatus}".`);
      setFeedbackSeverity('success');
      setStatusDialogOpen(false);
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- Edit Details Handlers ---
  const handleOpenEditDialog = () => {
    if (!po) return;
    setEditForm({
      expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.slice(0, 10) : '',
      paymentTerms: po.paymentTerms || '',
      remarks: po.remarks || '',
    });
    setEditError('');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (isUpdatingDetails) return;
    setEditDialogOpen(false);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsUpdatingDetails(true);

    try {
      const payload = {
        expectedDeliveryDate: editForm.expectedDeliveryDate
          ? new Date(editForm.expectedDeliveryDate).toISOString()
          : undefined,
        paymentTerms: editForm.paymentTerms.trim(),
        remarks: editForm.remarks.trim() || undefined,
      };

      await apiClient.put(`/purchase-orders/${id}`, payload);

      await queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] });
      await queryClient.refetchQueries({ queryKey: ['purchaseOrder', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });

      setFeedbackMessage('Purchase Order details updated successfully.');
      setFeedbackSeverity('success');
      setEditDialogOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update PO details.');
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  // --- Cancel Order Handlers ---
  const handleOpenCancelDialog = () => {
    setCancelError('');
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    if (isCancelling) return;
    setCancelDialogOpen(false);
  };

  const handleConfirmCancel = async () => {
    setCancelError('');
    setIsCancelling(true);

    try {
      await apiClient.patch(`/purchase-orders/${id}/cancel`);

      await queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] });
      await queryClient.refetchQueries({ queryKey: ['purchaseOrder', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });

      setFeedbackMessage('Purchase Order has been cancelled.');
      setFeedbackSeverity('info');
      setCancelDialogOpen(false);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel purchase order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading purchase order 360° details..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load purchase order"
        description={error?.response?.data?.message || 'Unable to retrieve order details.'}
        onRetry={handleRefresh}
      />
    );
  }

  if (!po) {
    return <EmptyState title="Purchase Order Not Found" description="The requested order does not exist." />;
  }

  const vendor = typeof po.vendor === 'object' ? po.vendor : null;
  const pr = typeof po.purchaseRequest === 'object' ? po.purchaseRequest : null;
  const issuer = typeof po.issuedBy === 'object' ? po.issuedBy : null;

  const isCancelled = po.status === 'Cancelled';
  const isCompleted = po.status === 'Completed';
  const allowedTransitions = VALID_PO_TRANSITIONS[po.status] || [];
  const canTransition = canManagePO && allowedTransitions.length > 0 && !isCancelled && !isCompleted;

  // Determine current active step in fulfillment stepper
  const currentStepIndex = FULFILLMENT_STAGES.findIndex((s) => s.key === po.status);

  return (
    <Box>
      {/* Top Navigation & Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/purchase-orders')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Purchase Orders Directory
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh Details">
            <IconButton
              onClick={handleRefresh}
              disabled={isFetching}
              color="primary"
              sx={{ border: '1px solid #e2e8f0' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {canManagePO && !isCancelled && !isCompleted && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={handleOpenCancelDialog}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                Cancel Order
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditOutlinedIcon />}
                onClick={handleOpenEditDialog}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                Edit Terms
              </Button>

              {canTransition && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SwapHorizIcon />}
                  onClick={handleOpenStatusDialog}
                  sx={{ fontWeight: 700, borderRadius: 1.5 }}
                >
                  Progress Status
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <Alert severity={feedbackSeverity} onClose={() => setFeedbackMessage('')} sx={{ mb: 3 }}>
          {feedbackMessage}
        </Alert>
      )}

      {/* Cancellation Warning Banner */}
      {isCancelled && (
        <Alert severity="error" icon={<WarningAmberOutlinedIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Order Cancelled
          </Typography>
          <Typography variant="body2">
            This commercial purchase order was cancelled on {formatDateTime(po.cancelledAt || po.updatedAt)}. Fulfillment has been terminated.
          </Typography>
        </Alert>
      )}

      {/* Hero 360° Order Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: '#e0f2fe',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                }}
              >
                <ShoppingBagOutlinedIcon fontSize="large" />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: 'monospace' }}>
                    {po.poNumber}
                  </Typography>
                  <Chip
                    label={po.status}
                    color={getStatusColor(po.status)}
                    sx={{ fontWeight: 700, fontSize: '0.8125rem' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Supplier: <strong>{vendor?.companyName || 'Vendor'}</strong> • Issued:{' '}
                  <strong>{formatDate(po.issuedAt || po.createdAt)}</strong>
                </Typography>
              </Box>
            </Box>

            {/* Total Order Spend KPI */}
            <Box
              sx={{
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                p: 2,
                textAlign: { xs: 'left', md: 'right' },
                minWidth: 200,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                Total Contract Amount
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                {formatCurrency(po.totalAmount)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Multi-Section Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Commercial Specifications & Supplier Details */}
        <Grid item xs={12} md={7}>
          {/* Commercial Specifications */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongOutlinedIcon color="primary" fontSize="small" />
                Commercial Terms & Requisition Linkage
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Linked Purchase Requisition
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {pr?.title || 'Requisition'}
                    </Typography>
                    {pr?._id && (
                      <Button
                        size="small"
                        onClick={() => navigate(`/purchase-requests/${pr._id}`)}
                        sx={{ p: 0, mt: 0.5, textTransform: 'none', fontWeight: 600 }}
                      >
                        View Requisition #{pr._id.slice(-6)}
                      </Button>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Expected Delivery Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                      {formatDate(po.expectedDeliveryDate)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Settlement Terms
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {po.paymentTerms || 'Standard'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Quotation Identifier
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace' }}>
                      {po.quotation ? String(po.quotation) : 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>

                {po.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      Delivery Notes & Instructions
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mt: 0.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="body2" color="text.primary">
                        {po.remarks}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Supplier Profile Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon color="primary" fontSize="small" />
                Contracted Vendor Profile
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Company Legal Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25 }}>
                    {vendor?.companyName || 'Vendor'}
                  </Typography>
                  {vendor?.vendorCode && (
                    <Typography variant="caption" color="text.secondary">
                      Code: {vendor.vendorCode}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Primary Liaison Contact
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
                    {vendor?.companyInfo?.contactPerson?.name || 'Contact Person'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {vendor?.companyInfo?.contactPerson?.email || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {vendor?.companyInfo?.contactPerson?.phone || ''}
                  </Typography>
                </Grid>

                {vendor?._id && (
                  <Grid item xs={12}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/vendors/${vendor._id}`)}
                      sx={{ fontWeight: 600, textTransform: 'none' }}
                    >
                      Open Full Vendor 360° Profile
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Fulfillment Stepper & Audit Trail */}
        <Grid item xs={12} md={5}>
          {/* Fulfillment Stepper */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingOutlinedIcon color="primary" fontSize="small" />
                Order Fulfillment Lifecycle
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Stepper orientation="vertical">
                {FULFILLMENT_STAGES.map((stage, index) => {
                  const timestamp = po[stage.timestampField];
                  const isCompletedStep = Boolean(timestamp);
                  const isCurrentActiveStep = po.status === stage.key && !isCancelled;

                  return (
                    <Step key={stage.key} active={isCurrentActiveStep} completed={isCompletedStep && !isCancelled}>
                      <StepLabel
                        icon={
                          isCancelled && isCurrentActiveStep ? (
                            <CancelOutlinedIcon color="error" fontSize="small" />
                          ) : isCompletedStep ? (
                            <CheckCircleOutlineIcon color="success" fontSize="small" />
                          ) : isCurrentActiveStep ? (
                            <HourglassTopOutlinedIcon color="warning" fontSize="small" />
                          ) : undefined
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {stage.label}
                          </Typography>
                          {isCurrentActiveStep && (
                            <Chip
                              label={isCancelled ? 'Cancelled' : 'Active'}
                              size="small"
                              color={isCancelled ? 'error' : 'warning'}
                              sx={{ height: 18, fontSize: '0.625rem' }}
                            />
                          )}
                        </Box>
                      </StepLabel>
                      <StepContent>
                        {timestamp ? (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Timestamp: {formatDateTime(timestamp)}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Pending milestone fulfillment
                          </Typography>
                        )}
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </CardContent>
          </Card>

          {/* Issuance Audit Trail */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Issuance Audit Trail
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Issued By
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {issuer?.fullName || 'Procurement Management'}
                  </Typography>
                  {issuer?.email && (
                    <Typography variant="caption" color="text.secondary">
                      {issuer.email}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDateTime(po.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDateTime(po.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- Dialog 1: Status Progression --- */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Progress Fulfillment Status</DialogTitle>
        <Box component="form" onSubmit={handleSubmitStatusUpdate} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Current Status: <strong>{po.status}</strong>. Select the next valid fulfillment state:
            </Typography>

            {statusError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {statusError}
              </Alert>
            )}

            <TextField
              select
              label="Next Status"
              fullWidth
              value={selectedNextStatus}
              onChange={(e) => setSelectedNextStatus(e.target.value)}
              disabled={isUpdatingStatus}
            >
              {allowedTransitions.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseStatusDialog} disabled={isUpdatingStatus} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isUpdatingStatus}>
              {isUpdatingStatus ? <CircularProgress size={20} color="inherit" /> : 'Confirm Status'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* --- Dialog 2: Edit Order Details --- */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Purchase Order Details</DialogTitle>
        <Box component="form" onSubmit={handleSubmitEdit} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            {editError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Expected Delivery Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={editForm.expectedDeliveryDate}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Payment Terms"
                  fullWidth
                  value={editForm.paymentTerms}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                  size="small"
                >
                  {PAYMENT_TERMS_OPTIONS.map((term) => (
                    <MenuItem key={term} value={term}>
                      {term}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Order Remarks / Instructions"
                  fullWidth
                  multiline
                  rows={3}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseEditDialog} disabled={isUpdatingDetails} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isUpdatingDetails}>
              {isUpdatingDetails ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* --- Dialog 3: Cancel Order Confirmation --- */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>Cancel Purchase Order</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelError}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to cancel purchase order <strong>{po.poNumber}</strong>? This will terminate the supplier contract fulfillment and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseCancelDialog} disabled={isCancelling} color="inherit">
            No, Keep Order
          </Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error" disabled={isCancelling}>
            {isCancelling ? <CircularProgress size={20} color="inherit" /> : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrderDetailsPage;
