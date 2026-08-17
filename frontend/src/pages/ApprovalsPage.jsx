import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';
import ErrorState from '../components/feedback/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import {
  getStatusColor,
  APPROVAL_ROLES,
  APPROVAL_ROLE_DISPLAY,
  ROLE_ACTIVE_PR_STATUS,
} from '../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

export const ApprovalsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role || '';
  const isApproverRole = APPROVAL_ROLES.includes(userRole);

  const [activeTab, setActiveTab] = useState(0); // 0: Pending My Action, 1: Approval History Logs
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('success');

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [decisionType, setDecisionType] = useState('Approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Query 1: Fetch all historical Approval records
  const {
    data: approvals = [],
    isLoading: isLoadingApprovals,
    isError: isErrorApprovals,
    error: errorApprovals,
    refetch: refetchApprovals,
    isFetching: isFetchingApprovals,
  } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/approvals');
        return Array.isArray(response.data) ? response.data : [];
      } catch (err) {
        if (err.response?.status === 403) return [];
        throw err;
      }
    },
    enabled: isApproverRole,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Query 2: Fetch Purchase Requests to determine active pending items
  const {
    data: purchaseRequests = [],
    isLoading: isLoadingPRs,
    refetch: refetchPRs,
  } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/purchase-requests');
        return Array.isArray(response.data) ? response.data : [];
      } catch {
        return [];
      }
    },
    enabled: isApproverRole,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefresh = () => {
    refetchApprovals();
    refetchPRs();
  };

  // Requisitions that are currently waiting for the authenticated user's role to approve
  const targetRequiredStatus = ROLE_ACTIVE_PR_STATUS[userRole];
  const pendingRequisitionsForUser = useMemo(() => {
    if (!targetRequiredStatus) return [];
    return purchaseRequests.filter((pr) => pr.status === targetRequiredStatus);
  }, [purchaseRequests, targetRequiredStatus]);

  // Approvals processed by the current user
  const approvalsByCurrentUser = useMemo(() => {
    return approvals.filter((app) => {
      const approverId = typeof app.approvedBy === 'object' ? app.approvedBy?._id : app.approvedBy;
      return approverId === user?.userId || app.role === userRole;
    });
  }, [approvals, user?.userId, userRole]);

  const approvedByMeCount = approvalsByCurrentUser.filter((a) => a.decision === 'Approved').length;
  const rejectedByMeCount = approvalsByCurrentUser.filter((a) => a.decision === 'Rejected').length;

  // Filtered List for Tab 0 (Pending Queue)
  const filteredPendingQueue = useMemo(() => {
    return pendingRequisitionsForUser.filter((pr) => {
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const titleMatch = pr.title?.toLowerCase().includes(query);
      const catMatch = pr.category?.toLowerCase().includes(query);
      const requesterMatch =
        typeof pr.requestedBy === 'object' &&
        pr.requestedBy?.fullName?.toLowerCase().includes(query);
      return titleMatch || catMatch || requesterMatch;
    });
  }, [pendingRequisitionsForUser, searchTerm]);

  // Filtered List for Tab 1 (Approval History)
  const filteredApprovalHistory = useMemo(() => {
    return approvals.filter((app) => {
      if (decisionFilter !== 'ALL' && app.decision !== decisionFilter) return false;
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const prTitle = typeof app.purchaseRequest === 'object' ? app.purchaseRequest?.title : '';
      const approverName = typeof app.approvedBy === 'object' ? app.approvedBy?.fullName : '';
      return prTitle?.toLowerCase().includes(query) || approverName?.toLowerCase().includes(query);
    });
  }, [approvals, decisionFilter, searchTerm]);

  // Pagination slicing
  const displayedPending = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPendingQueue.slice(start, start + rowsPerPage);
  }, [filteredPendingQueue, page, rowsPerPage]);

  const displayedHistory = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredApprovalHistory.slice(start, start + rowsPerPage);
  }, [filteredApprovalHistory, page, rowsPerPage]);

  // --- Decision Modal Handlers ---
  const handleOpenDecisionModal = (pr) => {
    setSelectedPR(pr);
    setDecisionType('Approved');
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
    if (!selectedPR) return;

    if (decisionType === 'Rejected' && (!decisionRemarks || decisionRemarks.trim().length < 3)) {
      setDecisionError('Please provide a reason or remarks when rejecting a requisition.');
      return;
    }

    setDecisionError('');
    setIsSubmittingDecision(true);

    try {
      const payload = {
        purchaseRequest: selectedPR._id,
        approvedBy: user.userId,
        role: userRole,
        decision: decisionType,
        remarks: decisionRemarks.trim() || (decisionType === 'Approved' ? 'Approved' : 'Rejected'),
      };

      await apiClient.post('/approvals', payload);

      // Invalidate and refetch all related queries immediately
      await queryClient.invalidateQueries({ queryKey: ['approvals'] });
      await queryClient.refetchQueries({ queryKey: ['approvals'] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
      await queryClient.refetchQueries({ queryKey: ['purchaseRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequest', selectedPR._id] });
      await queryClient.invalidateQueries({ queryKey: ['purchaseRequestApprovals', selectedPR._id] });

      setFeedbackMessage(
        `Purchase request #${selectedPR._id.slice(-6)} has been successfully ${decisionType === 'Approved' ? 'APPROVED' : 'REJECTED'}.`
      );
      setFeedbackSeverity(decisionType === 'Approved' ? 'success' : 'info');
      setDecisionModalOpen(false);
    } catch (err) {
      setDecisionError(err.response?.data?.message || 'Failed to submit approval decision.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  if (!isApproverRole) {
    return (
      <Box>
        <PageHeader
          title="Approvals Management"
          subtitle="Enterprise review and authorization pipeline for purchase requisitions"
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          Your current account role (<strong>{userRole || 'Employee'}</strong>) does not have approval authority.
          The Approvals queue is accessible to designated management roles: <strong>Department Head, Finance Manager, Procurement Manager, and CEO</strong>.
        </Alert>
      </Box>
    );
  }

  if (isLoadingApprovals || isLoadingPRs) {
    return <LoadingState message="Loading approval queue and requisitions..." minHeight={400} />;
  }

  if (isErrorApprovals) {
    return (
      <ErrorState
        title="Failed to load approvals"
        description={errorApprovals?.response?.data?.message || 'Unable to retrieve approval records.'}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Approvals Management"
        subtitle={`Review, evaluate, and authorize procurement requisitions for ${APPROVAL_ROLE_DISPLAY[userRole] || userRole}`}
        action={
          <Tooltip title="Refresh Queue">
            <IconButton
              onClick={handleRefresh}
              disabled={isFetchingApprovals}
              color="primary"
              sx={{ border: '1px solid #e2e8f0' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <Alert severity={feedbackSeverity} onClose={() => setFeedbackMessage('')} sx={{ mb: 3 }}>
          {feedbackMessage}
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Pending Action Required */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: '#fef3c7',
                    color: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PendingActionsOutlinedIcon />
                </Box>
                <Chip label="Action Needed" size="small" color="warning" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Pending My Review
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: pendingRequisitionsForUser.length > 0 ? 'warning.main' : 'text.primary' }}>
                {pendingRequisitionsForUser.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Approved by Me */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: '#dcfce7',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleOutlineIcon />
                </Box>
                <Chip label="Approved" size="small" color="success" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Approved by Me
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'success.main' }}>
                {approvedByMeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Rejected by Me */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: '#fee2e2',
                    color: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CancelOutlinedIcon />
                </Box>
                <Chip label="Rejected" size="small" color="error" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Rejected by Me
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'error.main' }}>
                {rejectedByMeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Overall Approvals in System */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: '#e0f2fe',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AssignmentTurnedInOutlinedIcon />
                </Box>
                <Chip label="Total Audit" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                System Audit Records
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {approvals.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs & Search Card */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5, pt: 1.5 }}>
          <Tabs value={activeTab} onChange={(_e, v) => { setActiveTab(v); setPage(0); }}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Pending My Action</span>
                  {pendingRequisitionsForUser.length > 0 && (
                    <Chip label={pendingRequisitionsForUser.length} size="small" color="warning" sx={{ height: 20, fontSize: '0.6875rem' }} />
                  )}
                </Box>
              }
              sx={{ fontWeight: 600 }}
            />
            <Tab label={`All Approval History Logs (${approvals.length})`} sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={activeTab === 1 ? 8 : 12}>
              <TextField
                placeholder={activeTab === 0 ? 'Search pending requisitions by title, category, requester...' : 'Search approval records...'}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Decision Filter (Tab 1 only) */}
            {activeTab === 1 && (
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Decision Filter"
                  value={decisionFilter}
                  onChange={(e) => { setDecisionFilter(e.target.value); setPage(0); }}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="ALL">All Decisions</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {activeTab === 0 ? (
            /* Tab 0: Pending My Review Queue */
            filteredPendingQueue.length === 0 ? (
              <Box sx={{ py: 6 }}>
                <EmptyState
                  title={searchTerm ? 'No matching requisitions found' : 'All Clear — No Pending Approvals'}
                  description={
                    searchTerm
                      ? 'Try adjusting your search query.'
                      : `You have completed all pending reviews required for ${APPROVAL_ROLE_DISPLAY[userRole] || userRole}.`
                  }
                />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table sx={{ minWidth: 850 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REQUISITION</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REQUESTER</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>QTY & EST. COST</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REQUIRED BY</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>CURRENT STAGE</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>DECISION ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedPending.map((pr) => {
                        const requester = typeof pr.requestedBy === 'object' ? pr.requestedBy : null;
                        return (
                          <TableRow key={pr._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {pr.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                #{pr._id?.slice(-6)} • {pr.category || 'General'}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {requester?.fullName || 'Employee'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {requester?.email || '—'}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {formatCurrency(pr.estimatedCost)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {pr.quantity} Units
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2">
                                {formatDate(pr.requiredDate)}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={pr.status}
                                color={getStatusColor(pr.status)}
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
                              />
                            </TableCell>

                            <TableCell align="right" sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="View Full Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/purchase-requests/${pr._id}`)}
                                    sx={{ border: '1px solid #e2e8f0' }}
                                  >
                                    <VisibilityOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<RateReviewOutlinedIcon />}
                                  onClick={() => handleOpenDecisionModal(pr)}
                                  sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                >
                                  Review & Decide
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 20]}
                  component="div"
                  count={filteredPendingQueue.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_e, p) => setPage(p)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  sx={{ borderTop: '1px solid #e2e8f0' }}
                />
              </>
            )
          ) : (
            /* Tab 1: Approval History Logs */
            filteredApprovalHistory.length === 0 ? (
              <Box sx={{ py: 6 }}>
                <EmptyState
                  title="No Approval Records Found"
                  description="No historical approval decisions match your filter criteria."
                />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table sx={{ minWidth: 850 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REQUISITION</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>STAGE / ROLE</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>DECISION</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REVIEWER</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REMARKS</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>DATE / TIME</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>VIEW</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedHistory.map((app) => {
                        const pr = typeof app.purchaseRequest === 'object' ? app.purchaseRequest : null;
                        const approver = typeof app.approvedBy === 'object' ? app.approvedBy : null;
                        return (
                          <TableRow key={app._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {pr?.title || `PR #${app.purchaseRequest?.toString()?.slice(-6)}`}
                              </Typography>
                              {pr?.estimatedCost && (
                                <Typography variant="caption" color="text.secondary">
                                  Est: {formatCurrency(pr.estimatedCost)}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={APPROVAL_ROLE_DISPLAY[app.role] || app.role}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
                              />
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={app.decision}
                                color={getStatusColor(app.decision)}
                                size="small"
                                sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                              />
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {approver?.fullName || 'Management User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {approver?.email || '—'}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 2, maxWidth: 220 }}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: app.remarks ? 'normal' : 'italic' }} noWrap>
                                {app.remarks || 'No remarks recorded'}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(app.approvedAt || app.createdAt)}
                              </Typography>
                            </TableCell>

                            <TableCell align="right" sx={{ py: 2 }}>
                              <Tooltip title="View Purchase Request">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const prId = typeof app.purchaseRequest === 'object' ? app.purchaseRequest?._id : app.purchaseRequest;
                                    if (prId) navigate(`/purchase-requests/${prId}`);
                                  }}
                                  sx={{ border: '1px solid #e2e8f0' }}
                                >
                                  <VisibilityOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  component="div"
                  count={filteredApprovalHistory.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_e, p) => setPage(p)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  sx={{ borderTop: '1px solid #e2e8f0' }}
                />
              </>
            )
          )}
        </CardContent>
      </Card>

      {/* --- Decision Modal Dialog --- */}
      {selectedPR && (
        <Dialog open={decisionModalOpen} onClose={handleCloseDecisionModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Review Requisition: {selectedPR.title}
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmitDecision} noValidate>
            <DialogContent sx={{ pt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Total Value</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatCurrency(selectedPR.estimatedCost)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Quantity Required</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPR.quantity} Units
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Description</Typography>
                    <Typography variant="body2" color="text.primary">
                      {selectedPR.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {decisionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {decisionError}
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Approval Decision
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
                    ? 'State reasons for rejection (budget constraint, insufficient justification)...'
                    : 'Add optional notes, PO instructions, or budget allocation details...'
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
      )}
    </Box>
  );
};

export default ApprovalsPage;
