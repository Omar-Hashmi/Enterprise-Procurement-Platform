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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/common/PageHeader';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';
import ErrorState from '../components/feedback/ErrorState';
import apiClient from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLES } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';

const ENTITY_OPTIONS = [
  { value: 'ALL', label: 'All Entities' },
  { value: 'PurchaseRequest', label: 'Purchase Request' },
  { value: 'Approval', label: 'Approval' },
  { value: 'PurchaseOrder', label: 'Purchase Order' },
  { value: 'User', label: 'User' },
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Quotation', label: 'Quotation' },
];

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'All Actions' },
  { value: 'login_success', label: 'Login Success' },
  { value: 'login_failure', label: 'Login Failure' },
  { value: 'password_changed', label: 'Password Changed' },
  { value: 'password_reset_requested', label: 'Password Reset Requested' },
  { value: 'password_reset_success', label: 'Password Reset Success' },
  { value: 'approval_created', label: 'Approval Created' },
  { value: 'approval_decision', label: 'Approval Decision' },
  { value: 'purchase_request_created', label: 'Purchase Request Created' },
  { value: 'purchase_request_updated', label: 'Purchase Request Updated' },
  { value: 'purchase_request_cancelled', label: 'Purchase Request Cancelled' },
  { value: 'purchase_request_deleted', label: 'Purchase Request Deleted' },
  { value: 'purchase_order_created', label: 'Purchase Order Created' },
  { value: 'purchase_order_updated', label: 'Purchase Order Updated' },
  { value: 'purchase_order_status_changed', label: 'PO Status Changed' },
  { value: 'purchase_order_cancelled', label: 'Purchase Order Cancelled' },
];

const getActionColor = (action) => {
  const a = action?.toLowerCase() || '';
  if (a.includes('success') || a.includes('approved') || a.includes('created')) return 'success';
  if (a.includes('failure') || a.includes('rejected') || a.includes('cancelled') || a.includes('deleted')) return 'error';
  if (a.includes('updated') || a.includes('changed') || a.includes('decision')) return 'warning';
  if (a.includes('reset') || a.includes('login') || a.includes('password')) return 'info';
  return 'default';
};

const getEntityColor = (entity) => {
  switch (entity) {
    case 'PurchaseRequest':
      return 'primary';
    case 'Approval':
      return 'info';
    case 'PurchaseOrder':
      return 'warning';
    case 'Vendor':
      return 'success';
    case 'User':
      return 'secondary';
    default:
      return 'default';
  }
};

export const AuditLogsPage = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.toLowerCase() === USER_ROLES.ADMIN;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Selected Log Details Dialog State
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Query: Fetch Audit Logs
  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['auditLogs', selectedEntity, selectedAction, startDate, endDate],
    queryFn: async () => {
      const params = {};
      if (selectedEntity !== 'ALL') params.entity = selectedEntity;
      if (selectedAction !== 'ALL') params.action = selectedAction;
      if (startDate) params.start = new Date(startDate).toISOString();
      if (endDate) params.end = new Date(endDate).toISOString();
      params.limit = 200;

      const response = await apiClient.get('/audit-logs', { params });
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEntity('ALL');
    setSelectedAction('ALL');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
  };

  // KPIs
  const totalLogs = logs.length;
  const authEventsCount = logs.filter((l) => l.action?.includes('login') || l.action?.includes('password')).length;
  const reqAndApprovalEvents = logs.filter((l) => l.action?.includes('purchase_request') || l.action?.includes('approval')).length;
  const poEventsCount = logs.filter((l) => l.action?.includes('purchase_order') || l.action?.includes('vendor')).length;

  // Filtered in-memory search
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const actionMatch = log.action?.toLowerCase().includes(q);
      const entityMatch = log.entity?.toLowerCase().includes(q);
      const idMatch = log.entityId?.toString().toLowerCase().includes(q);
      const roleMatch = log.performedByRole?.toLowerCase().includes(q);
      const ipMatch = log.ipAddress?.toLowerCase().includes(q);
      const detailsMatch = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;
      return actionMatch || entityMatch || idMatch || roleMatch || ipMatch || detailsMatch;
    });
  }, [logs, searchTerm]);

  // Paginated Slicing
  const displayedLogs = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  if (!isAdmin) {
    return (
      <Box>
        <PageHeader
          title="Audit Logs"
          subtitle="System security audit trails and enterprise activity compliance"
        />
        <Alert severity="error" icon={<SecurityOutlinedIcon />} sx={{ mt: 2 }}>
          <strong>Access Denied:</strong> Audit logs contain sensitive compliance trails and are strictly restricted to <strong>System Administrators</strong>.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading compliance audit trails..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load audit logs"
        description={error?.response?.data?.message || 'Unable to retrieve audit records.'}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle="Comprehensive immutable audit trails of user operations, approvals, and system mutations"
        action={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Tooltip title="Reset Filters">
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<RestartAltIcon fontSize="small" />}
                onClick={handleResetFilters}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                Reset
              </Button>
            </Tooltip>

            <Tooltip title="Refresh Audit Trail">
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
        }
      />

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Total Audit Events */}
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
                  <HistoryOutlinedIcon />
                </Box>
                <Chip label="Total Records" size="small" variant="outlined" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Audit Events
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {totalLogs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Security & Authentication Events */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockPersonOutlinedIcon />
                </Box>
                <Chip label="Auth / Security" size="small" color="secondary" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Security & Authentication
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: '#7c3aed' }}>
                {authEventsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Requisitions & Approvals */}
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
                  <AssignmentTurnedInOutlinedIcon />
                </Box>
                <Chip label="Workflow" size="small" color="success" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Requisitions & Approvals
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'success.main' }}>
                {reqAndApprovalEvents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Purchase Orders & Vendors */}
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
                  <ShoppingBagOutlinedIcon />
                </Box>
                <Chip label="Orders" size="small" color="warning" sx={{ fontSize: '0.75rem', height: 22 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Purchase Orders & Vendors
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5, color: 'warning.main' }}>
                {poEventsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Multi-Criteria Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search action, entity ID, role, IP address, details..."
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

            {/* Entity Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                label="Target Entity"
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setPage(0);
                }}
                size="small"
                fullWidth
              >
                {ENTITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Action Filter */}
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                label="Audit Action"
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(0);
                }}
                size="small"
                fullWidth
              >
                {ACTION_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6} md={1.75}>
              <TextField
                label="From Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6} md={1.75}>
              <TextField
                label="To Date"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Log Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredLogs.length === 0 ? (
            <Box sx={{ py: 6 }}>
              <EmptyState
                title="No Audit Records Found"
                description="No log records matched your query filters. Try resetting the filters."
              />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: 950 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>TIMESTAMP</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>ACTION</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>ENTITY</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>ENTITY ID / REF</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>PERFORMED BY / ROLE</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>IP ADDRESS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>DETAILS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedLogs.map((log) => (
                      <TableRow key={log._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {/* Timestamp */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDateTime(log.timestamp)}
                          </Typography>
                        </TableCell>

                        {/* Action */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Chip
                            label={log.action}
                            color={getActionColor(log.action)}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                          />
                        </TableCell>

                        {/* Entity */}
                        <TableCell sx={{ py: 1.75 }}>
                          {log.entity ? (
                            <Chip
                              label={log.entity}
                              color={getEntityColor(log.entity)}
                              variant="outlined"
                              size="small"
                              sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>

                        {/* Entity ID */}
                        <TableCell sx={{ py: 1.75 }}>
                          {log.entityId ? (
                            <Tooltip title={String(log.entityId)}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.secondary' }}>
                                #{String(log.entityId).slice(-6)}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>

                        {/* Performed By & Role */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {log.performedByRole && (
                              <Chip
                                label={log.performedByRole}
                                size="small"
                                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'capitalize' }}
                              />
                            )}
                            {log.performedBy && (
                              <Tooltip title={`User ID: ${log.performedBy}`}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                  ({String(log.performedBy).slice(-4)})
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>

                        {/* IP Address */}
                        <TableCell sx={{ py: 1.75 }}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            {log.ipAddress || 'Internal / Server'}
                          </Typography>
                        </TableCell>

                        {/* Details View Action */}
                        <TableCell align="right" sx={{ py: 1.75 }}>
                          <Tooltip title="View Full Audit Record">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetails(log)}
                              sx={{ border: '1px solid #e2e8f0' }}
                            >
                              <VisibilityOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 15, 25, 50]}
                component="div"
                count={filteredLogs.length}
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

      {/* --- Audit Record Details Modal Dialog (Phase 8C) --- */}
      {selectedLog && (
        <Dialog open={detailsDialogOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityOutlinedIcon color="primary" fontSize="small" />
            Audit Record Details
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Timestamp</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDateTime(selectedLog.timestamp)}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Action</Typography>
                <Box sx={{ mt: 0.25 }}>
                  <Chip label={selectedLog.action} color={getActionColor(selectedLog.action)} size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Target Entity</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLog.entity || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Entity Identifier</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedLog.entityId ? String(selectedLog.entityId) : 'N/A'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Performed By</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedLog.performedBy ? String(selectedLog.performedBy) : 'System Worker'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Role Context</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedLog.performedByRole || 'System'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">IP Address</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{selectedLog.ipAddress || 'Internal Process'}</Typography>
              </Grid>

              {selectedLog.details && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Structured Audit Payload
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      maxHeight: 250,
                      overflowY: 'auto',
                    }}
                  >
                    <pre style={{ margin: 0 }}>{JSON.stringify(selectedLog.details, null, 2)}</pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDetails} variant="contained" color="primary">
              Close Record
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AuditLogsPage;
