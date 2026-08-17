import React, { useState, useMemo } from 'react';
import {
  Box,
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
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';
import ErrorState from '../components/feedback/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { getStatusColor, PURCHASE_REQUEST_STATUS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending Review' },
  { value: 'Department Approved', label: 'Department Approved' },
  { value: 'Finance Approved', label: 'Finance Approved' },
  { value: 'Procurement Approved', label: 'Procurement Approved' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const PurchaseRequestsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Success alert state from navigation
  const [successMessage, setSuccessMessage] = useState(
    location.state?.created ? location.state?.message || 'Purchase request created successfully.' : ''
  );

  // Search, filter & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all purchase requests using React Query
  const {
    data: purchaseRequests = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: async () => {
      const response = await apiClient.get('/purchase-requests');
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  // Safe client-side search and filtering over the complete backend dataset
  const filteredRequests = useMemo(() => {
    return purchaseRequests.filter((request) => {
      // Status filter
      if (statusFilter !== 'ALL' && request.status !== statusFilter) {
        return false;
      }

      // Search term filter across title, category, description, requester name
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = request.title?.toLowerCase().includes(query);
        const categoryMatch = request.category?.toLowerCase().includes(query);
        const descMatch = request.description?.toLowerCase().includes(query);
        const requesterMatch =
          typeof request.requestedBy === 'object' &&
          request.requestedBy?.fullName?.toLowerCase().includes(query);

        return titleMatch || categoryMatch || descMatch || requesterMatch;
      }

      return true;
    });
  }, [purchaseRequests, searchTerm, statusFilter]);

  // Paginated subset
  const paginatedRequests = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, page, rowsPerPage]);

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleViewDetails = (id) => {
    navigate(`/purchase-requests/${id}`);
  };

  if (isLoading) {
    return <LoadingState message="Loading purchase requests..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load purchase requests"
        description={error?.response?.data?.message || 'Unable to retrieve purchase requests from the server.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Purchase Requests"
        subtitle="Create, track, and manage departmental procurement requisitions"
        action={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Refresh Requests">
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                color="primary"
                sx={{ border: '1px solid #e2e8f0' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Create Purchase Request Action (Phase 3C will implement creation page) */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/purchase-requests/new')}
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            >
              New Request
            </Button>
          </Box>
        }
      />

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Filter and Search Bar Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={7}>
              <TextField
                placeholder="Search by title, category, description, or requester..."
                value={searchTerm}
                onChange={handleSearchChange}
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

            {/* Status Filter Dropdown */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Status Filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
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
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Summary Count Badge */}
            <Grid item xs={12} sm={6} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Showing <strong style={{ color: '#0f172a' }}>{filteredRequests.length}</strong> of{' '}
                {purchaseRequests.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card>
        {filteredRequests.length === 0 ? (
          <Box sx={{ py: 6, px: 3 }}>
            <EmptyState
              title={searchTerm || statusFilter !== 'ALL' ? 'No matching requests found' : 'No Purchase Requests'}
              description={
                searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search keywords or filter criteria.'
                  : 'No procurement purchase requests have been submitted yet.'
              }
            />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table size="medium">
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 200 }}>
                      REQUISITION
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 140 }}>
                      REQUESTER
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 80 }}>
                      QTY
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 120 }}>
                      EST. COST
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 130 }}>
                      REQUIRED DATE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 150 }}>
                      STATUS
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', minWidth: 80 }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRequests.map((req) => {
                    const requesterName =
                      typeof req.requestedBy === 'object' && req.requestedBy?.fullName
                        ? req.requestedBy.fullName
                        : 'System User';
                    const requesterEmail =
                      typeof req.requestedBy === 'object' && req.requestedBy?.email
                        ? req.requestedBy.email
                        : '';

                    return (
                      <TableRow key={req._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {/* Title & Category */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {req.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">
                              {req.category || 'General'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              • #{req._id?.slice(-6)?.toUpperCase()}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Requester */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {requesterName}
                          </Typography>
                          {requesterEmail && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {requesterEmail}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Quantity */}
                        <TableCell sx={{ py: 1.75, fontSize: '0.875rem' }}>{req.quantity}</TableCell>

                        {/* Estimated Cost */}
                        <TableCell sx={{ py: 1.75, fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                          {formatCurrency(req.estimatedCost)}
                        </TableCell>

                        {/* Required Date */}
                        <TableCell sx={{ py: 1.75, fontSize: '0.8125rem', color: 'text.secondary' }}>
                          {formatDate(req.requiredDate)}
                        </TableCell>

                        {/* Status Chip */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Chip
                            label={req.status || 'Pending'}
                            color={getStatusColor(req.status)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right" sx={{ py: 1.75 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(req._id)}
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

            {/* Pagination Controls */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ borderTop: '1px solid #e2e8f0' }}
            />
          </>
        )}
      </Card>
    </Box>
  );
};

export default PurchaseRequestsPage;
