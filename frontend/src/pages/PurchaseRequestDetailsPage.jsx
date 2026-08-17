import React from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import ErrorState from '../components/feedback/ErrorState';
import EmptyState from '../components/feedback/EmptyState';
import apiClient from '../lib/api';
import { getStatusColor, PURCHASE_REQUEST_STATUS } from '../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

export const PurchaseRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Query 1: Purchase Request Details
  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['purchaseRequest', id],
    queryFn: async () => {
      const response = await apiClient.get(`/purchase-requests/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });

  // Query 2: Status tracking endpoint
  const {
    data: statusData,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['purchaseRequestStatus', id],
    queryFn: async () => {
      const response = await apiClient.get(`/purchase-requests/${id}/status`);
      return response.data?.status;
    },
    enabled: Boolean(id),
  });

  const handleRefresh = () => {
    refetch();
    refetchStatus();
  };

  if (isLoading) {
    return <LoadingState message="Loading purchase request details..." minHeight={400} />;
  }

  if (isError) {
    const statusCode = error?.response?.status;
    let title = 'Failed to load purchase request';
    let description = error?.response?.data?.message || 'Unable to retrieve details from the server.';

    if (statusCode === 404) {
      title = 'Purchase Request Not Found';
      description = 'The requested purchase requisition does not exist or may have been deleted.';
    } else if (statusCode === 403) {
      title = 'Access Denied';
      description = 'You are not authorized to view this purchase request.';
    }

    return <ErrorState title={title} description={description} onRetry={handleRefresh} />;
  }

  if (!request) {
    return <EmptyState title="Purchase Request Not Found" description="No requisition data available." />;
  }

  const requester = typeof request.requestedBy === 'object' ? request.requestedBy : null;
  const requesterName = requester?.fullName || 'System User';
  const requesterEmail = requester?.email || 'N/A';
  const requesterRole = (requester?.role || 'Employee').toUpperCase();

  const isRejected = request.status === 'Rejected';
  const isCancelled = request.status === 'Cancelled';
  const isApproved = [
    'Approved',
    'Department Approved',
    'Finance Approved',
    'Procurement Approved',
    'CEO Approved',
  ].includes(request.status);

  // Workflow steps based on standard procurement lifecycle
  const getActiveStep = () => {
    if (isApproved || request.status === 'Approved') return 3;
    if (request.status === 'Procurement Approved' || request.status === 'CEO Approved') return 2;
    if (request.status === 'Department Approved' || request.status === 'Finance Approved') return 1;
    if (isRejected || isCancelled) return 1;
    return 0; // Pending
  };

  const workflowSteps = [
    { label: 'Requisition Submitted', description: `Created on ${formatDateTime(request.createdAt)}` },
    {
      label: 'Department & Manager Review',
      description: isRejected ? 'Rejected during review' : isCancelled ? 'Requisition Cancelled' : 'Evaluated by Department Head',
    },
    { label: 'Finance & Procurement Approval', description: 'Budget validation and procurement verification' },
    { label: 'Approved for Purchase Order', description: 'Requisition finalized and ready for PO issuance' },
  ];

  const estimatedUnitCost =
    request.quantity && request.estimatedCost && request.quantity > 0
      ? request.estimatedCost / request.quantity
      : 0;

  return (
    <Box>
      {/* Top Breadcrumb / Back Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/purchase-requests')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Purchase Requests
        </Button>

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
      </Box>

      {/* Main Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {request.title}
                </Typography>
                <Chip
                  label={request.status || 'Pending'}
                  color={getStatusColor(request.status)}
                  sx={{ fontWeight: 700, fontSize: '0.8125rem' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Requisition ID: <strong>#{request._id}</strong> • Category:{' '}
                <strong>{request.category || 'General'}</strong>
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Total Estimated Value
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatCurrency(request.estimatedCost)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Requisition Information & Financials */}
        <Grid item xs={12} md={8}>
          {/* Specifications Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentOutlinedIcon color="primary" fontSize="small" />
                Requisition Specifications
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Description / Purpose
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, mb: 3, whiteSpace: 'pre-line', color: 'text.primary' }}>
                {request.description}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Quantity Required
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                      {request.quantity} Units
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Est. Unit Price
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                      {formatCurrency(estimatedUnitCost)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Required By Deadline
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: 'text.primary' }}>
                      {formatDate(request.requiredDate)}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, color: 'text.primary' }}>
                      {request.category || 'General'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {request.remarks && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Remarks & Business Justification
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mt: 0.5, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.primary">
                      {request.remarks}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Attachments Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileOutlinedIcon color="primary" fontSize="small" />
                Attachments & Supporting Documents
              </Typography>
              <Divider sx={{ my: 2 }} />

              {request.attachments && request.attachments.length > 0 ? (
                <List disablePadding>
                  {request.attachments.map((file, idx) => (
                    <ListItem key={idx} sx={{ bgcolor: '#f8fafc', borderRadius: 2, mb: 1, border: '1px solid #e2e8f0' }}>
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>
                        <AttachFileOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Document ${idx + 1}`}
                        secondary={file}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attachments were attached to this requisition.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Requester & Status Pipeline */}
        <Grid item xs={12} md={4}>
          {/* Requester Information Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlineIcon color="primary" fontSize="small" />
                Requester Information
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: '#e0f2fe',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                  }}
                >
                  {requesterName.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {requesterName}
                  </Typography>
                  <Chip label={requesterRole} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.6875rem' }} />
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Email Address
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 1.5 }}>
                {requesterEmail}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                Submission Date
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                {formatDateTime(request.createdAt)}
              </Typography>
            </CardContent>
          </Card>

          {/* Workflow & Status Tracking Card */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeOutlinedIcon color="primary" fontSize="small" />
                Approval Status Pipeline
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Stepper activeStep={getActiveStep()} orientation="vertical">
                {workflowSteps.map((step, index) => (
                  <Step key={step.label} completed={getActiveStep() > index || (getActiveStep() === index && isApproved)}>
                    <StepLabel
                      error={isRejected && index === 1}
                      optional={<Typography variant="caption">{step.description}</Typography>}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {statusData?.remarks && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Status Remarks
                  </Typography>
                  <Paper sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5, mt: 0.5, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.primary">
                      {statusData.remarks}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PurchaseRequestDetailsPage;
