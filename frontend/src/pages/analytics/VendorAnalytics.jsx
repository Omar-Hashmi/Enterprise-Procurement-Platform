import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Rating,
  Alert,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  Cell,
} from 'recharts';

const VENDOR_PERFORMANCE_SCORES = [
  { vendor: 'Apex Logistics', onTime: 96, quality: 98, spend: 4500000 },
  { vendor: 'Global Tech Distribution', onTime: 92, quality: 94, spend: 3800000 },
  { vendor: 'BioChem Labs Corp', onTime: 88, quality: 99, spend: 2900000 },
  { vendor: 'FastPack Packaging', onTime: 94, quality: 89, spend: 1800000 },
  { vendor: 'Nexus Office Solutions', onTime: 99, quality: 96, spend: 1200000 },
];

const RISK_MATRIX_DATA = [
  { name: 'Apex Logistics', riskScore: 12, qualityScore: 98, spend: 450 },
  { name: 'Global Tech', riskScore: 24, qualityScore: 94, spend: 380 },
  { name: 'BioChem Labs', riskScore: 18, qualityScore: 99, spend: 290 },
  { name: 'FastPack', riskScore: 35, qualityScore: 89, spend: 180 },
  { name: 'Nexus Office', riskScore: 8, qualityScore: 96, spend: 120 },
];

const VENDOR_DETAILS_TABLE = [
  {
    id: 'VEN-001',
    name: 'Apex Logistics Solutions',
    category: 'Freight & Express',
    rating: 4.8,
    onTimeDelivery: 96.4,
    defectRate: 0.8,
    totalSpent: 4500000,
    riskLevel: 'Low',
  },
  {
    id: 'VEN-002',
    name: 'Global Tech Distribution',
    category: 'IT Hardware',
    rating: 4.5,
    onTimeDelivery: 92.1,
    defectRate: 1.4,
    totalSpent: 3800000,
    riskLevel: 'Low',
  },
  {
    id: 'VEN-003',
    name: 'BioChem Labs Corp',
    category: 'Lab Supplies',
    rating: 4.6,
    onTimeDelivery: 88.5,
    defectRate: 0.2,
    totalSpent: 2900000,
    riskLevel: 'Medium',
  },
  {
    id: 'VEN-004',
    name: 'FastPack Packaging Inc',
    category: 'Packaging Materials',
    rating: 3.9,
    onTimeDelivery: 94.0,
    defectRate: 3.8,
    totalSpent: 1800000,
    riskLevel: 'Medium',
  },
  {
    id: 'VEN-005',
    name: 'Nexus Office Solutions',
    category: 'Office Supplies',
    rating: 4.9,
    onTimeDelivery: 99.2,
    defectRate: 0.5,
    totalSpent: 1200000,
    riskLevel: 'Low',
  },
];

export const VendorAnalytics = ({ period = 'all' }) => {
  const [vendorCategory, setVendorCategory] = useState('ALL');

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getRiskChipColor = (risk) => {
    switch ((risk || '').toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const categoryMatches = (vendorName, category) => {
    if (vendorCategory === 'ALL') return true;
    const name = String(vendorName || '');
    if (category === 'LOGISTICS') return /Apex|FastPack/i.test(name);
    if (category === 'IT') return /Global Tech|Nexus Office/i.test(name);
    if (category === 'LAB') return /BioChem/i.test(name);
    return false;
  };

  // Filtered dataset wrappers: every chart and the scorecard share the same category filter.
  const performanceData = useMemo(() => {
    return Array.isArray(VENDOR_PERFORMANCE_SCORES) ? VENDOR_PERFORMANCE_SCORES.filter((row) => categoryMatches(row.vendor, vendorCategory)) : [];
  }, [vendorCategory]);

  const riskData = useMemo(() => {
    return Array.isArray(RISK_MATRIX_DATA) ? RISK_MATRIX_DATA.filter((row) => categoryMatches(row.name, vendorCategory)) : [];
  }, [vendorCategory]);

  const tableData = useMemo(() => {
    return Array.isArray(VENDOR_DETAILS_TABLE) ? VENDOR_DETAILS_TABLE.filter((row) => categoryMatches(row.name, vendorCategory)) : [];
  }, [vendorCategory]);

  const periodLabel = period === 'month' ? 'this month' : period === 'quarter' ? 'this quarter' : period === 'year' ? 'this year' : 'year to date';

  return (
    <Box sx={{ py: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justify: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Vendor & Supplier Performance Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Evaluate vendor SLAs, fulfillment compliance rates, quality scores, and spending density.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              size="small"
              value={vendorCategory}
              onChange={(e) => setVendorCategory(e.target.value)}
              sx={{ minWidth: 160, bgcolor: 'background.paper' }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="IT">IT Hardware</MenuItem>
              <MenuItem value="LOGISTICS">Freight & Express</MenuItem>
              <MenuItem value="LAB">Lab Supplies</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} onClick={() => setVendorCategory('ALL')} sx={{ bgcolor: 'background.paper' }}>
              Reset
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} disableElevation>
              Export
            </Button>
          </Stack>
        </Box>

        {/* Top KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Active Contracting Vendors
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <StorefrontIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  48 Suppliers
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  35 Tier-1 Preferred Partners
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Average On-Time Delivery
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <LocalShippingIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  94.1%
                </Typography>
                <Chip label="+2.3% SLA improvement" size="small" color="success" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Quality Compliance Pass Rate
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'info.50', color: 'info.main' }}>
                    <AssignmentTurnedInIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  98.2%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Avg Defect Rate &lt; 1.3%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Vendors At SLA Risk
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.50', color: 'warning.main' }}>
                    <WarningAmberIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  3 Vendors
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Under compliance review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* SLA Performance Dual Bar Chart */}
          <Grid item xs={12} lg={7}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Top Suppliers: On-Time Delivery vs. Quality Acceptance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Percentage benchmark for {periodLabel}, filtered by the selected supplier category.
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="vendor" />
                      <YAxis domain={[70, 100]} tickFormatter={(v) => `${v}%`} />
                      <RechartsTooltip formatter={(val) => `${val}%`} />
                      <Legend />
                      <Bar dataKey="onTime" name="On-Time Delivery %" fill="#1976d2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="quality" name="Quality Rating %" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Alert severity="info" variant="outlined">
                      No vendor performance metric data available.
                    </Alert>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Supplier Risk Matrix Scatter Plot */}
          <Grid item xs={12} lg={5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Vendor Exposure & Risk Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Scatter correlation comparing Risk Score vs Quality Acceptance vs Total Spend (Bubble Size).
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                {riskData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="riskScore" name="Risk Score" unit=" pt" domain={[0, 40]} />
                      <YAxis type="number" dataKey="qualityScore" name="Quality" unit="%" domain={[80, 100]} />
                      <ZAxis type="number" dataKey="spend" range={[100, 500]} name="Spend (K)" />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Suppliers" data={riskData} fill="#00abc5">
                        {riskData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.riskScore > 30 ? '#d32f2f' : entry.riskScore > 15 ? '#ed6c02' : '#2e7d32'}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Alert severity="info" variant="outlined">
                      No risk distribution metrics available.
                    </Alert>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Supplier Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Vendor Scorecard & Contract Metrics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Operational KPIs across key active suppliers.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Vendor Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Overall Rating</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>On-Time Delivery</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Defect Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>YTD Spend</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Risk Profile</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                            {row.name ? row.name.charAt(0) : 'V'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {row.name || 'Unnamed Vendor'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.category || 'N/A'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Rating value={row.rating || 0} precision={0.1} size="small" readOnly />
                          <Typography variant="caption" fontWeight={600}>
                            ({row.rating || 0})
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={row.onTimeDelivery >= 90 ? 'success.main' : 'warning.main'}
                        >
                          {row.onTimeDelivery ?? 0}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={row.defectRate > 2.0 ? 'error.main' : 'text.primary'}
                        >
                          {row.defectRate ?? 0}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(row.totalSpent)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.riskLevel || 'Unknown'}
                          size="small"
                          color={getRiskChipColor(row.riskLevel)}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No vendor records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default VendorAnalytics;
