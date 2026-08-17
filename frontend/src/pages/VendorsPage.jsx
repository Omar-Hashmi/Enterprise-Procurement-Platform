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
  Rating,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';
import ErrorState from '../components/feedback/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { getStatusColor, VENDOR_STATUS, USER_ROLES } from '../utils/constants';

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'blacklisted', label: 'Blacklisted' },
];

export const VendorsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const [successMessage, setSuccessMessage] = useState(
    location.state?.created ? location.state?.message || 'Vendor operation completed successfully.' : ''
  );

  // Search, filter & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const userRole = user?.role?.toLowerCase() || '';
  const canManageVendors = [USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.ADMIN].includes(userRole);

  // Query 1: Fetch Vendors List
  const {
    data: vendorsResponse,
    isLoading: isLoadingVendors,
    isError: isErrorVendors,
    error: errorVendors,
    refetch: refetchVendors,
    isFetching: isFetchingVendors,
  } = useQuery({
    queryKey: ['vendors', page, rowsPerPage, statusFilter, categoryFilter, searchTerm],
    queryFn: async () => {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await apiClient.get('/vendors', { params });
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Query 2: Fetch Status Summary (counts by status)
  const {
    data: statusSummaryData,
    refetch: refetchStatusSummary,
  } = useQuery({
    queryKey: ['vendorStatusSummary'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/vendors/status-summary');
        return response.data?.data || {};
      } catch (err) {
        // Fallback gracefully if role is not authorized for /status-summary
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  // Query 3: Fetch Vendor Categories
  const {
    data: categories = [],
  } = useQuery({
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

  const vendorsList = useMemo(() => {
    return Array.isArray(vendorsResponse?.data) ? vendorsResponse.data : [];
  }, [vendorsResponse]);

  const totalVendorsCount = vendorsResponse?.pagination?.total ?? vendorsList.length;

  // KPI counts: prioritize status-summary API, or compute from loaded dataset
  const activeCount =
    statusSummaryData?.active ?? vendorsList.filter((v) => v.status === 'active').length;
  const pendingCount =
    statusSummaryData?.pending ?? vendorsList.filter((v) => v.status === 'pending').length;
  const suspendedCount =
    statusSummaryData?.suspended ?? vendorsList.filter((v) => v.status === 'suspended').length;
  const blacklistedCount =
    statusSummaryData?.blacklisted ?? vendorsList.filter((v) => v.status === 'blacklisted').length;
  const totalCount =
    statusSummaryData
      ? Object.values(statusSummaryData).reduce((a, b) => a + b, 0)
      : totalVendorsCount;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPage(0);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefreshAll = () => {
    refetchVendors();
    refetchStatusSummary();
  };

  const handleViewVendor = (id) => {
    navigate(`/vendors/${id}`);
  };

  if (isLoadingVendors && !vendorsResponse) {
    return <LoadingState message="Loading vendor directory..." minHeight={400} />;
  }

  if (isErrorVendors) {
    return (
      <ErrorState
        title="Failed to load vendor directory"
        description={errorVendors?.response?.data?.message || 'Unable to retrieve vendors from the server.'}
        onRetry={handleRefreshAll}
      />
    );
  }

  const isFiltering = Boolean(searchTerm.trim() || statusFilter !== 'ALL' || categoryFilter !== 'ALL');

  return (
    <Box>
      <PageHeader
        title="Vendor Directory"
        subtitle="Manage supplier records, compliance verification, and performance ratings"
        action={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Refresh Directory">
              <IconButton
                onClick={handleRefreshAll}
                disabled={isFetchingVendors}
                color="primary"
                sx={{ border: '1px solid #e2e8f0' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {canManageVendors && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/vendors/new')}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                New Vendor
              </Button>
            )}
          </Box>
        }
      />

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Status KPI Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Vendors */}
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
                  <StorefrontOutlinedIcon />
                </Box>
                <Chip label="Total" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Suppliers
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Vendors */}
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
                Active Vendors
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'success.main' }}>
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Review */}
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
                  <HourglassEmptyIcon />
                </Box>
                <Chip label="Review" size="small" color="warning" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Pending Review
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'warning.main' }}>
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Suspended / Blacklisted */}
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
                  <BlockOutlinedIcon />
                </Box>
                <Chip label="Restricted" size="small" color="error" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Suspended / Blacklisted
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'error.main' }}>
                {suspendedCount + blacklistedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Search Bar Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={5}>
              <TextField
                placeholder="Search by company name or vendor code (e.g. VEN-000001)..."
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

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Status"
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

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Category"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                size="small"
                fullWidth
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Reset Filters */}
            {isFiltering && (
              <Grid item xs={12} md={1} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button variant="text" size="small" onClick={handleClearFilters} sx={{ color: 'text.secondary' }}>
                  Reset
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Vendors Table Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {vendorsList.length === 0 ? (
            <Box sx={{ py: 6 }}>
              <EmptyState
                title={isFiltering ? 'No matching vendors found' : 'No Vendors Registered'}
                description={
                  isFiltering
                    ? 'Try adjusting your search terms or status/category filters.'
                    : 'Get started by onboarding and registering your first supplier partner.'
                }
                action={
                  isFiltering ? (
                    <Button variant="outlined" size="small" onClick={handleClearFilters}>
                      Clear Active Filters
                    </Button>
                  ) : canManageVendors ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/vendors/new')}
                    >
                      Onboard New Vendor
                    </Button>
                  ) : null
                }
              />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 850 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        VENDOR & CODE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        CATEGORIES
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        PRIMARY CONTACT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        LOCATION & INDUSTRY
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        RATING
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        STATUS
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                        ACTIONS
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendorsList.map((vendor) => {
                      const contact = vendor.companyInfo?.contactPerson;
                      const address = vendor.companyInfo?.address;
                      const categoryNames =
                        Array.isArray(vendor.categories) && vendor.categories.length > 0
                          ? vendor.categories.map((c) => (typeof c === 'object' ? c.name : c)).filter(Boolean)
                          : [];

                      return (
                        <TableRow key={vendor._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          {/* Company Name & Code */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 1.5,
                                  bgcolor: '#e0f2fe',
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                }}
                              >
                                {vendor.companyName?.charAt(0)?.toUpperCase() || 'V'}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                  {vendor.companyName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontWeight: 600 }}>
                                  {vendor.vendorCode || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Categories */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 180 }}>
                              {categoryNames.length > 0 ? (
                                categoryNames.map((name, i) => (
                                  <Chip
                                    key={i}
                                    label={name}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.6875rem', height: 20 }}
                                  />
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  General
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          {/* Primary Contact */}
                          <TableCell sx={{ py: 2 }}>
                            {contact ? (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {contact.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                  <EmailOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {contact.email}
                                  </Typography>
                                </Box>
                                {contact.phone && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                    <PhoneOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {contact.phone}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>

                          {/* Location & Industry */}
                          <TableCell sx={{ py: 2 }}>
                            {address?.city || address?.country ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.primary">
                                  {[address?.city, address?.country].filter(Boolean).join(', ')}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                —
                              </Typography>
                            )}
                            {vendor.companyInfo?.industry && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                {vendor.companyInfo.industry}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Rating */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating
                                value={vendor.averageRating || 0}
                                precision={0.5}
                                size="small"
                                readOnly
                              />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {vendor.averageRating > 0 ? vendor.averageRating.toFixed(1) : '—'}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Pending'}
                              color={getStatusColor(vendor.status)}
                              size="small"
                              sx={{ fontWeight: 600, fontSize: '0.6875rem', textTransform: 'capitalize' }}
                            />
                          </TableCell>

                          {/* Action Button */}
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Tooltip title="View 360° Vendor Profile">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewVendor(vendor._id)}
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

              {/* Table Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50]}
                component="div"
                count={totalVendorsCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ borderTop: '1px solid #e2e8f0' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorsPage;
