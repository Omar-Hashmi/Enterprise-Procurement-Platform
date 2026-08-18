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
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { getStatusColor, USER_ROLES } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';
import { demoPurchaseOrders } from '../data/demoData';

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const userRole = user?.role?.toLowerCase() || '';
  const canCreatePO = [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_MANAGER, USER_ROLES.PROCUREMENT_OFFICER].includes(userRole);
  const canAccessPO = [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.PROCUREMENT_OFFICER,
  ].includes(userRole);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [successBanner, setSuccessBanner] = useState(location.state?.successMessage || '');

  // Query: Fetch all Purchase Orders
  const {
    data: purchaseOrders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/purchase-orders');
        const records = Array.isArray(response.data) ? response.data : [];
        return records.length ? records : demoPurchaseOrders;
      } catch (err) {
        if (err.response?.status === 403) return [];
        throw err;
      }
    },
    enabled: canAccessPO,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefresh = () => {
    refetch();
  };

  // KPI Calculations
  const totalOrders = purchaseOrders.length;
  const issuedCount = purchaseOrders.filter((po) => po.status === 'Issued').length;
  const acceptedCount = purchaseOrders.filter((po) => po.status === 'Accepted').length;
  const inProgressCount = purchaseOrders.filter((po) => po.status === 'In Progress').length;
  const deliveredCount = purchaseOrders.filter((po) => po.status === 'Delivered').length;
  const completedCount = purchaseOrders.filter((po) => po.status === 'Completed').length;
  const cancelledCount = purchaseOrders.filter((po) => po.status === 'Cancelled').length;

  const totalValue = purchaseOrders
    .filter((po) => po.status !== 'Cancelled')
    .reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (statusFilter !== 'ALL' && po.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const poNumMatch = po.poNumber?.toLowerCase().includes(q);
      const vendorMatch =
        typeof po.vendor === 'object' &&
        po.vendor?.companyName?.toLowerCase().includes(q);
      const prMatch =
        typeof po.purchaseRequest === 'object' &&
        po.purchaseRequest?.title?.toLowerCase().includes(q);
      const termsMatch = po.paymentTerms?.toLowerCase().includes(q);
      return poNumMatch || vendorMatch || prMatch || termsMatch;
    });
  }, [purchaseOrders, statusFilter, searchTerm]);

  // Paginated Slicing
  const displayedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  if (!canAccessPO) {
    return (
      <Box>
        <PageHeader
          title="Purchase Orders Directory"
          subtitle="Commercial procurement contract issuance and fulfillment management"
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          Your current account role (<strong>{userRole || 'Employee'}</strong>) does not have authorization to view Purchase Orders.
          Access is reserved for <strong>Procurement Management, Administration, and Finance</strong>.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading purchase orders..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load purchase orders"
        description={error?.response?.data?.message || 'Unable to retrieve purchase order data.'}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Purchase Orders Directory"
        subtitle="Manage commercial contracts, supplier purchase orders, and delivery fulfillment"
        action={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Refresh Purchase Orders">
              <IconButton
                onClick={handleRefresh}
                disabled={isFetching}
                color="primary"
                sx={{ border: '1px solid #e2e8f0' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {canCreatePO && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/purchase-orders/new')}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                Issue Purchase Order
              </Button>
            )}
          </Box>
        }
      />

      {/* Success Notification Banner */}
      {successBanner && (
        <Alert severity="success" onClose={() => setSuccessBanner('')} sx={{ mb: 3 }}>
          {successBanner}
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Active / In Progress */}
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
                  <ShoppingBagOutlinedIcon />
                </Box>
                <Chip label="Total Volume" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Active Orders
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Issued & Accepted Queue */}
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
                  <HourglassTopOutlinedIcon />
                </Box>
                <Chip label="Processing" size="small" color="warning" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Issued & In Progress
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'warning.main' }}>
                {issuedCount + acceptedCount + inProgressCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed Deliveries */}
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
                <Chip label="Fulfilled" size="small" color="success" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Delivered & Completed
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'success.main' }}>
                {deliveredCount + completedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Spend Commitment ($) */}
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
                  <LocalShippingOutlinedIcon />
                </Box>
                <Chip label="Committed" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Order Spend Commitment
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'primary.main' }}>
                {formatCurrency(totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={8}>
              <TextField
                placeholder="Search by PO Number, Vendor Name, Requisition Title, or Payment Terms..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
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

            {/* Status Filter */}
            <Grid item xs={12} md={4}>
              <TextField
                select
                label="Fulfillment Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
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
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="Issued">Issued</MenuItem>
                <MenuItem value="Accepted">Accepted</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Purchase Orders Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredOrders.length === 0 ? (
            <Box sx={{ py: 6 }}>
              <EmptyState
                title={searchTerm || statusFilter !== 'ALL' ? 'No Matching Purchase Orders' : 'No Purchase Orders Found'}
                description={
                  searchTerm || statusFilter !== 'ALL'
                    ? 'Try adjusting your search criteria or resetting filters.'
                    : 'There are currently no purchase orders issued. Approved requisitions can be converted into purchase orders.'
                }
              />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 950 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>PO NUMBER</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>VENDOR / SUPPLIER</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>REQUISITION</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>TOTAL AMOUNT</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>EXPECTED DELIVERY</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>PAYMENT TERMS</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedOrders.map((po) => {
                      const vendor = typeof po.vendor === 'object' ? po.vendor : null;
                      const pr = typeof po.purchaseRequest === 'object' ? po.purchaseRequest : null;
                      const issuer = typeof po.issuedBy === 'object' ? po.issuedBy : null;

                      return (
                        <TableRow key={po._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          {/* PO Number */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                              {po.poNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Issued: {formatDate(po.issuedAt || po.createdAt)}
                            </Typography>
                          </TableCell>

                          {/* Vendor */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {vendor?.companyName || 'Supplier'}
                            </Typography>
                            {vendor?.vendorCode && (
                              <Typography variant="caption" color="text.secondary">
                                {vendor.vendorCode}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Purchase Request */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {pr?.title || 'Purchase Requisition'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              #{pr?._id?.slice(-6) || 'N/A'}
                            </Typography>
                          </TableCell>

                          {/* Total Amount */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {formatCurrency(po.totalAmount)}
                            </Typography>
                          </TableCell>

                          {/* Expected Delivery */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {formatDate(po.expectedDeliveryDate)}
                            </Typography>
                          </TableCell>

                          {/* Payment Terms */}
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {po.paymentTerms || 'Standard'}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={po.status || 'Issued'}
                              color={getStatusColor(po.status)}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Tooltip title="View Order 360° Profile">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/purchase-orders/${po._id}`)}
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
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_e, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{ borderTop: '1px solid #e2e8f0' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PurchaseOrdersPage;
