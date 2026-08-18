import React, { useState } from 'react';
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const SLA_COMPLIANCE_DATA = [
  { vendor: 'TechSupply Co.', leadTimeSLA: 98, qualitySLA: 99, pricingSLA: 100 },
  { vendor: 'Global Logistics', leadTimeSLA: 85, qualitySLA: 92, pricingSLA: 95 },
  { vendor: 'Apex Office Ltd.', leadTimeSLA: 92, qualitySLA: 96, pricingSLA: 88 },
  { vendor: 'NexGen Hardware', leadTimeSLA: 76, qualitySLA: 89, pricingSLA: 92 },
  { vendor: 'Prime Packagings', leadTimeSLA: 95, qualitySLA: 97, pricingSLA: 99 },
];

const CONTRACTS_LIST = [
  {
    id: 'CTR-2024-001',
    vendor: 'TechSupply Co.',
    category: 'IT Hardware',
    value: 12000000,
    expirationDate: '2026-11-15',
    slaScore: 99,
    status: 'ACTIVE',
    riskLevel: 'LOW',
  },
  {
    id: 'CTR-2025-014',
    vendor: 'Global Logistics',
    category: 'Freight Services',
    value: 8500000,
    expirationDate: '2026-09-30',
    slaScore: 90,
    status: 'EXPIRING_SOON',
    riskLevel: 'MEDIUM',
  },
  {
    id: 'CTR-2023-089',
    vendor: 'NexGen Hardware',
    category: 'Networking',
    value: 5000000,
    expirationDate: '2026-08-28',
    slaScore: 85,
    status: 'NON_COMPLIANT',
    riskLevel: 'HIGH',
  },
  {
    id: 'CTR-2025-042',
    vendor: 'Apex Office Ltd.',
    category: 'Stationery',
    value: 2400000,
    expirationDate: '2027-03-10',
    slaScore: 92,
    status: 'ACTIVE',
    riskLevel: 'LOW',
  },
];

export const ContractCompliance = () => {
  const [vendorFilter, setVendorFilter] = useState('ALL');

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Chip label="Compliant" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case 'EXPIRING_SOON':
        return <Chip label="Renewal Due" color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case 'NON_COMPLIANT':
        return <Chip label="SLA Breach" color="error" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getRiskChip = (risk) => {
    switch (risk) {
      case 'LOW':
        return <Chip label="Low Risk" variant="outlined" color="success" size="small" />;
      case 'MEDIUM':
        return <Chip label="Medium Risk" variant="outlined" color="warning" size="small" />;
      case 'HIGH':
        return <Chip label="High Risk" variant="outlined" color="error" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Contract Compliance & SLA Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor vendor obligations, pricing guarantees, service benchmarks, and renewal schedules.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              size="small"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              sx={{ minWidth: 160, bgcolor: 'background.paper' }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="IT">IT Hardware</MenuItem>
              <MenuItem value="FREIGHT">Freight Services</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} disableElevation>
              Export Report
            </Button>
          </Stack>
        </Box>

        {/* Top Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Active Contracts
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <DescriptionIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  24 Active
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Total Value: {formatCurrency(48000000)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Avg SLA Compliance
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <VerifiedUserIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  94.2%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Target Benchmark: &gt;90%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Expiring in 60 Days
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.50', color: 'warning.main' }}>
                    <EventRepeatIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="warning.dark">
                  3 Contracts
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Requires renewal review
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    SLA Breaches (YTD)
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'error.50', color: 'error.main' }}>
                    <WarningAmberIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  2 Vendors
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Penalty clauses applicable
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* SLA Performance Chart */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Vendor Service Level Agreement (SLA) Breakdown
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Evaluating Key Vendors on Delivery Lead Time, Quality Inspection Rate, and Price Consistency.
              </Typography>
            </Box>
            <Tooltip title="SLA benchmarks are calculated based on executed purchase orders vs contract terms.">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={SLA_COMPLIANCE_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="vendor" />
                <YAxis domain={[50, 100]} unit="%" />
                <RechartsTooltip formatter={(val) => `${val}%`} />
                <Legend />
                <Bar dataKey="leadTimeSLA" name="Lead Time Adherence" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qualitySLA" name="Quality Acceptance Rate" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pricingSLA" name="Price Guarantee Compliance" fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Contract Inventory Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Contract Registry & Renewal Tracker
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Overview of binding vendor agreements, risk ratings, and compliance metrics.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Contract ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vendor Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Contract Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 160 }}>SLA Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expiration Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Risk Level</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Compliance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CONTRACTS_LIST.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.vendor}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align="right">{formatCurrency(row.value)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.slaScore}
                            color={row.slaScore >= 92 ? 'success' : row.slaScore >= 88 ? 'warning' : 'error'}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                          {row.slaScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.expirationDate}</TableCell>
                    <TableCell>{getRiskChip(row.riskLevel)}</TableCell>
                    <TableCell align="right">{getStatusChip(row.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default ContractCompliance;