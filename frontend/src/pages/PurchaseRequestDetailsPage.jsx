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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
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
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/Loading';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import {
  getStatusColor,
  APPROVAL_ROLES,
  APPROVAL_ROLE_DISPLAY,
  ROLE_ACTIVE_PR_STATUS,
} from '../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

const WORKFLOW_STAGES = [
  {
    role: 'department',
    label: '1. Department Review',
    requiredStatus: 'Pending',
    description: 'Initial operational and department head justification',
  },
  {
    role: 'finance_manager',
    label: '2. Finance Manager',
    requiredStatus: 'Department Approved',
    description: 'Fiscal budget verification and capital expenditure validation',
  },
  {
    role: 'procurement_manager',
    label: '3. Procurement Manager',
    requiredStatus: 'Finance Approved',
    description: 'Commercial supplier sourcing and contract compliance check',
  },
  {
    role: 'ceo',
    label: '4. Executive CEO Approval',
    requiredStatus: 'Procurement Approved',
    description: 'Executive sign-off and authorization for Purchase Order issuance',
  },
];

export const PurchaseRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role || '';
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('success');

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('Approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Query 1: Purchase Request Details
  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch: refetchRequest,
    isFetching,
  } = useQuery({
    queryKey: ['purchaseRequest', id],
    queryFn: async () => {
      const response = await apiClient.get(`/purchase-requests/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
    staleTime: 0,
    refetchOnMount: 'always',
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
    staleTime: 0,
  });

  // Query 3: Real Historical Approvals for this Requisition
  const {
    data: historicalApprovals = [],
    refetch: refetchApprovals,
  } = useQuery({
    queryKey: ['purchaseRequestApprovals', id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/approvals/purchase-request/${id}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(id) && APPROVAL_ROLES.includes(userRole),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefresh = () => {
    refetchRequest();
    refetchStatus();
    if (APPROVAL_ROLES.includes(userRole)) {
      refetchApprovals();
    }
  };

  // Check if current user is authorized to approve this requisition at its current stage
  const canApproveNow =
    request &&
    APPROVAL_ROLES.includes(userRole) &&
    ROLE_ACTIVE_PR_STATUS[userRole] === request.status &&
    request.status !== 'Approved' &&
    request.status !== 'Rejected' &&
    request.status !== 'Cancelled';

  // --- Decision Modal Handlers ---
  const handleOpenDecisionModal = (initialDecision = 'Approved') => {
    setDecisionType(initialDecision);
    setDecisionRemarks('');
    setDecisionError('');
    setDecisionModalOpen(true);
  };

  const handleCloseDecisionModal = () => {
    if (isSubmittingDecision) return;
    setDecisionModalOpen(false);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!request) return;

    if (decisionType === 'Rejected' && (!decisionRemarks || decisionRemarks.trim().length < 3)) {
      setDecisionError('Please provide a reason or remarks when rejecting a requisition.');
      return;
    }

    setDecisionError('');
    setIsSubmittingDecision(true);

    try {
      const payload = {
        purchaseRequest: request._id,
        approvedBy: user.userId,
        role: userRole,
        decision: decisionType,
        remarks: decisionRemarks.trim() || (decisionType === 'Approved' ? 'Approved' : 'Rejected'),
      };

      await apiClient.post('/approvals', payload);

      // Invalidate and refetch all related queries immediately
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequest', id] });
      await queryClient.refetchQueries({ queryKey: ['purchaseRequest', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequestApprovals', id] });
      await queryClient.refetchQueries({ queryKey: ['purchaseRequestApprovals', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequestStatus', id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });

      setFeedbackMessage(
        `Requisition has been successfully ${decisionType === 'Approved' ? 'APPROVED' : 'REJECTED'}.`
      );
      setFeedbackSeverity(decisionType === 'Approved' ? 'success' : 'info');
      setDecisionModalOpen(false);
    } catch (err) {
      setDecisionError(err.response?.data?.message || 'Failed to submit approval decision.');
    } finally {
      setIsSubmittingDecision(false);
    }
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
  const isFinalApproved = request.status === 'Approved';

  const estimatedUnitCost =
    request.quantity && request.estimatedCost && request.quantity > 0
      ? request.estimatedCost / request.quantity
      : 0;

  // Determine stage progression
  let hasEncounteredRejection = isRejected;

  return (
    <Box>
      {/* Top Breadcrumb & Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate('/purchase-requests')}
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          Back to Purchase Requests
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

          {/* Conditional Live Approval Decision Action Buttons */}
          {canApproveNow && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => handleOpenDecisionModal('Rejected')}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                Reject Requisition
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => handleOpenDecisionModal('Approved')}
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              >
                Approve Requisition
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Global Feedback Alert */}
      {feedbackMessage && (
        <Alert severity={feedbackSeverity} onClose={() => setFeedbackMessage('')} sx={{ mb: 3 }}>
          {feedbackMessage}
        </Alert>
      )}

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
        <Grid item xs={12} md={7}>
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

        {/* Right Column: Requester & Sequential 4-Stage Approval Timeline */}
        <Grid item xs={12} md={5}>
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

          {/* 4-Stage Sequential Approval Timeline (Phase 5C) */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeOutlinedIcon color="primary" fontSize="small" />
                Sequential Approval Timeline
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Stepper orientation="vertical">
                {WORKFLOW_STAGES.map((stage, idx) => {
                  const stageApproval = historicalApprovals.find((app) => app.role === stage.role);
                  const isStageApproved = stageApproval?.decision === 'Approved';
                  const isStageRejected = stageApproval?.decision === 'Rejected';
                  const isCurrentActive = request.status === stage.requiredStatus && !isStageApproved && !isStageRejected && !hasEncounteredRejection;

                  const approverName = typeof stageApproval?.approvedBy === 'object' ? stageApproval.approvedBy?.fullName : 'Designated Approver';

                  return (
                    <Step key={stage.role} active={isCurrentActive} completed={isStageApproved}>
                      <StepLabel
                        error={isStageRejected}
                        icon={
                          isStageApproved ? (
                            <CheckCircleOutlineIcon color="success" fontSize="small" />
                          ) : isStageRejected ? (
                            <CancelOutlinedIcon color="error" fontSize="small" />
                          ) : isCurrentActive ? (
                            <HourglassTopOutlinedIcon color="warning" fontSize="small" />
                          ) : undefined
                        }
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {stage.label}
                          </Typography>
                          {isStageApproved && (
                            <Chip label="Approved" size="small" color="success" sx={{ height: 18, fontSize: '0.625rem' }} />
                          )}
                          {isStageRejected && (
                            <Chip label="Rejected" size="small" color="error" sx={{ height: 18, fontSize: '0.625rem' }} />
                          )}
                          {isCurrentActive && (
                            <Chip label="Awaiting Action" size="small" color="warning" sx={{ height: 18, fontSize: '0.625rem' }} />
                          )}
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {stage.description}
                        </Typography>

                        {stageApproval && (
                          <Paper sx={{ p: 1.5, bgcolor: isStageRejected ? '#fef2f2' : '#f8fafc', borderRadius: 1.5, mb: 1, border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                              Reviewed By: {approverName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Date: {formatDateTime(stageApproval.approvedAt || stageApproval.createdAt)}
                            </Typography>
                            {stageApproval.remarks && (
                              <Typography variant="caption" color="text.primary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                Remarks: "{stageApproval.remarks}"
                              </Typography>
                            )}
                          </Paper>
                        )}

                        {isCurrentActive && canApproveNow && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<RateReviewOutlinedIcon />}
                            onClick={() => handleOpenDecisionModal('Approved')}
                            sx={{ mt: 1, fontWeight: 600, fontSize: '0.75rem' }}
                          >
                            Review & Approve / Reject
                          </Button>
                        )}
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>

              {/* Status Remarks */}
              {statusData?.remarks && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                    Latest Workflow Remarks
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

      {/* --- Live Approval Decision Modal Dialog (Phase 5B) --- */}
      <Dialog open={decisionModalOpen} onClose={handleCloseDecisionModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {decisionType === 'Approved' ? 'Approve Purchase Requisition' : 'Reject Purchase Requisition'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmitDecision} noValidate>
          <DialogContent sx={{ pt: 1 }}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {request.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                Estimated Value: <strong>{formatCurrency(request.estimatedCost)}</strong> • Qty: <strong>{request.quantity}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Approver Role: <strong>{APPROVAL_ROLE_DISPLAY[userRole] || userRole}</strong>
              </Typography>
            </Paper>

            {decisionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {decisionError}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Decision Action
            </Typography>
            <RadioGroup
              row
              value={decisionType}
              onChange={(e) => setDecisionType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel
                value="Approved"
                control={<Radio color="success" />}
                label={<Typography sx={{ fontWeight: 600, color: 'success.main' }}>Approve Requisition</Typography>}
              />
              <FormControlLabel
                value="Rejected"
                control={<Radio color="error" />}
                label={<Typography sx={{ fontWeight: 600, color: 'error.main' }}>Reject Requisition</Typography>}
              />
            </RadioGroup>

            <TextField
              label={decisionType === 'Rejected' ? 'Rejection Reason (Required)' : 'Approval Remarks / Conditions (Optional)'}
              placeholder={
                decisionType === 'Rejected'
                  ? 'State reasons for rejecting this requisition (budget constraint, insufficient specs)...'
                  : 'Add optional notes, budget instructions, or PO specifications...'
              }
              fullWidth
              multiline
              rows={3}
              required={decisionType === 'Rejected'}
              value={decisionRemarks}
              onChange={(e) => setDecisionRemarks(e.target.value)}
              disabled={isSubmittingDecision}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDecisionModal} disabled={isSubmittingDecision} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color={decisionType === 'Approved' ? 'success' : 'error'}
              disabled={isSubmittingDecision}
            >
              {isSubmittingDecision ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `Confirm ${decisionType}`
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PurchaseRequestDetailsPage;
