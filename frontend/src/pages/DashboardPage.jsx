import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
  LinearProgress,
} from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { getStatusColor, PURCHASE_REQUEST_STATUS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { demoApprovals, demoPurchaseOrders, demoPurchaseRequests } from '../data/demoData';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role ? String(user.role).toLowerCase() : 'employee';

  // Role permissions
  const canAccessPurchaseRequests = [
    'employee',
    'department',
    'department_manager',
    'finance_manager',
    'finance_officer',
    'procurement_manager',
    'procurement_officer',
    'ceo',
    'admin',
  ].includes(userRole);

  const canAccessApprovals = [
    'department',
    'department_manager',
    'finance_manager',
    'procurement_manager',
    'ceo',
    'admin',
  ].includes(userRole);

  const canAccessPurchaseOrders = [
    'admin',
    'procurement_manager',
    'procurement_officer',
    'finance_manager',
    'ceo',
  ].includes(userRole);

  // 1. Fetch Purchase Requests
  const {
    data: purchaseRequests = [],
    isLoading: isLoadingPRs,
    isError: isErrorPRs,
    error: errorPRs,
    refetch: refetchPRs,
  } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      const response = await apiClient.get('/purchase-requests');
      const records = Array.isArray(response.data) ? response.data : [];
      return records.length ? records : demoPurchaseRequests;
    },
    enabled: canAccessPurchaseRequests,
  });

  // 2. Fetch Approvals (for approvers)
  const {
    data: approvals = [],
    isLoading: isLoadingApprovals,
    isError: isErrorApprovals,
    refetch: refetchApprovals,
  } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const response = await apiClient.get('/approvals');
      const records = Array.isArray(response.data) ? response.data : [];
      return records.length ? records : demoApprovals;
    },
    enabled: canAccessApprovals,
  });

  // 3. Fetch Purchase Orders (for PO managers/finance)
  const {
    data: purchaseOrders = [],
    isLoading: isLoadingPOs,
    isError: isErrorPOs,
    refetch: refetchPOs,
  } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const response = await apiClient.get('/purchase-orders');
      const records = Array.isArray(response.data) ? response.data : [];
      return records.length ? records : demoPurchaseOrders;
    },
    enabled: canAccessPurchaseOrders,
  });

  const handleRefresh = () => {
    if (canAccessPurchaseRequests) refetchPRs();
    if (canAccessApprovals) refetchApprovals();
    if (canAccessPurchaseOrders) refetchPOs();
  };

  const isLoading = (canAccessPurchaseRequests && isLoadingPRs) ||
                    (canAccessApprovals && isLoadingApprovals) ||
                    (canAccessPurchaseOrders && isLoadingPOs);

  const isError = (canAccessPurchaseRequests && isErrorPRs) ||
                  (canAccessApprovals && isErrorApprovals) ||
                  (canAccessPurchaseOrders && isErrorPOs);

  if (isLoading) {
    return <LoadingState message="Loading procurement dashboard..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load dashboard data"
        description={errorPRs?.response?.data?.message || 'Could not connect to the procurement API service.'}
        onRetry={handleRefresh}
      />
    );
  }

  // Derive real statistics from real backend data
  const totalRequests = purchaseRequests.length;
  const pendingRequests = purchaseRequests.filter((r) => r.status === 'Pending').length;
  const approvedRequests = purchaseRequests.filter((r) =>
    ['Approved', 'Department Approved', 'Finance Approved', 'Procurement Approved', 'CEO Approved'].includes(r.status)
  ).length;
  const rejectedRequests = purchaseRequests.filter((r) => r.status === 'Rejected').length;
  const totalEstimatedCost = purchaseRequests.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

  const pendingApprovalsCount = approvals.filter((a) => a.decision === 'Pending').length;
  const totalPOsCount = purchaseOrders.length;

  // Recent 5 Purchase Requests
  const recentRequests = [...purchaseRequests]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <Box>
      <PageHeader
        title="Procurement Dashboard"
        subtitle="Real-time visibility into purchase requisitions, approval pipelines, and procurement workflows"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh} color="primary" sx={{ border: '1px solid #e2e8f0' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Purchase Requests */}
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
                  <AssignmentOutlinedIcon />
                </Box>
                <Chip label="All Time" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Purchase Requests
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {totalRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Requests */}
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
                    color: '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PendingActionsOutlinedIcon />
                </Box>
                <Chip
                  label={totalRequests > 0 ? `${Math.round((pendingRequests / totalRequests) * 100)}%` : '0%'}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 22 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Pending Review
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: '#b45309' }}>
                {pendingRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Approved Requests */}
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
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircleOutlinedIcon />
                </Box>
                <Chip
                  label={totalRequests > 0 ? `${Math.round((approvedRequests / totalRequests) * 100)}%` : '0%'}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 22 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Approved Requisitions
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: '#15803d' }}>
                {approvedRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Estimated Pipeline Spend */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: '#f1f5f9',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoneyOutlinedIcon />
                </Box>
                <Chip label="Est. Total" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Requisition Pipeline
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {formatCurrency(totalEstimatedCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Role-Specific Secondary Banner (Approvers & PO Managers) */}
      {(canAccessApprovals || canAccessPurchaseOrders) && (
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {canAccessApprovals && (
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      Approver Queue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: pendingApprovalsCount > 0 ? 'warning.main' : 'text.primary', mt: 0.5 }}>
                      {pendingApprovalsCount} Approvals Pending
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requires review and decision from your management role
                    </Typography>
                  </Box>
                  <PendingActionsOutlinedIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
                </CardContent>
              </Card>
            </Grid>
          )}

          {canAccessPurchaseOrders && (
            <Grid item xs={12} sm={canAccessApprovals ? 6 : 12}>
              <Card sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      Purchase Orders
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                      {totalPOsCount} Active Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issued purchase orders in execution
                    </Typography>
                  </Box>
                  <ShoppingCartOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Main Content Area: Recent Requisitions Table & Status Breakdown */}
      <Grid container spacing={3}>
        {/* Left: Recent Requisitions Table */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Recent Purchase Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest procurement requisitions submitted across departments
                  </Typography>
                </Box>
              </Box>

              {recentRequests.length === 0 ? (
                <EmptyState
                  title="No Purchase Requests Found"
                  description="There are currently no purchase requests registered in the procurement database."
                />
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>TITLE / CATEGORY</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>QTY</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>EST. COST</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REQUIRED DATE</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentRequests.map((req) => (
                        <TableRow key={req._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {req.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {req.category || 'General'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>{req.quantity}</TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.875rem', fontWeight: 600 }}>
                            {formatCurrency(req.estimatedCost)}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
                            {formatDate(req.requiredDate)}
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={req.status || 'Pending'}
                              color={getStatusColor(req.status)}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Pipeline Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Pipeline Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Requisition status distribution breakdown
              </Typography>

              {totalRequests === 0 ? (
                <EmptyState
                  title="No Data"
                  description="Pipeline metrics will appear once requisitions are created."
                />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Pending */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Pending Review
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pendingRequests} ({totalRequests > 0 ? Math.round((pendingRequests / totalRequests) * 100) : 0}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={totalRequests > 0 ? (pendingRequests / totalRequests) * 100 : 0}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Approved */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Approved Requisitions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {approvedRequests} ({totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Rejected */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Rejected
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rejectedRequests} ({totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0}
                      color="error"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
