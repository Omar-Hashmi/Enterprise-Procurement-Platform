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
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const MONTHLY_SPEND_TRENDS = [
  { month: 'Jan', spend: 2100000, target: 2400000, volume: 110 },
  { month: 'Feb', spend: 2450000, target: 2400000, volume: 128 },
  { month: 'Mar', spend: 2800000, target: 2500000, volume: 145 },
  { month: 'Apr', spend: 2300000, target: 2500000, volume: 118 },
  { month: 'May', spend: 3100000, target: 2700000, volume: 162 },
  { month: 'Jun', spend: 2950000, target: 2700000, volume: 150 },
  { month: 'Jul', spend: 3400000, target: 2800000, volume: 178 },
  { month: 'Aug', spend: 3200000, target: 2800000, volume: 165 },
];

const LEAD_TIME_METRICS = [
  { month: 'Jan', avgDays: 14.2, targetDays: 10 },
  { month: 'Feb', avgDays: 13.5, targetDays: 10 },
  { month: 'Mar', avgDays: 12.8, targetDays: 10 },
  { month: 'Apr', avgDays: 11.4, targetDays: 10 },
  { month: 'May', avgDays: 10.9, targetDays: 10 },
  { month: 'Jun', avgDays: 9.8, targetDays: 10 },
  { month: 'Jul', avgDays: 9.2, targetDays: 10 },
  { month: 'Aug', avgDays: 8.7, targetDays: 10 },
];

const CATEGORY_TREND_BREAKDOWN = [
  {
    category: 'IT Hardware & Infrastructure',
    ytdSpend: 4200000,
    growth: '+14.2%',
    complianceRate: 96,
    avgCycleDays: 7.2,
  },
  {
    category: 'Raw Materials & Components',
    ytdSpend: 8900000,
    growth: '+8.7%',
    complianceRate: 91,
    avgCycleDays: 11.5,
  },
  {
    category: 'Logistics & Freight Services',
    ytdSpend: 3100000,
    growth: '-2.4%',
    complianceRate: 88,
    avgCycleDays: 5.1,
  },
  {
    category: 'Office Supplies & Utilities',
    ytdSpend: 1150000,
    growth: '+1.1%',
    complianceRate: 98,
    avgCycleDays: 3.4,
  },
  {
    category: 'Professional Services & Legal',
    ytdSpend: 2950000,
    growth: '+19.5%',
    complianceRate: 84,
    avgCycleDays: 14.8,
  },
];

export const ProcurementTrends = () => {
  const [timeRange, setTimeRange] = useState('YTD');

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ py: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
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
              Procurement Trend Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track multi-month procurement velocity, fulfillment cycle times, and compliance metrics.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              size="small"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ minWidth: 140, bgcolor: 'background.paper' }}
            >
              <MenuItem value="6M">Last 6 Months</MenuItem>
              <MenuItem value="YTD">Year to Date (2026)</MenuItem>
              <MenuItem value="1Y">Last 12 Months</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
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
                    Cumulative Spend
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <TrendingUpIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(22300000)}
                </Typography>
                <Chip label="+11.4% vs last period" size="small" color="success" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Avg Fulfillment Cycle
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'info.50', color: 'info.main' }}>
                    <AccessTimeIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  8.7 Days
                </Typography>
                <Chip label="-38% cycle time reduction" size="small" color="primary" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Contract Compliance Rate
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <VerifiedUserIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  92.4%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Target: &gt;90% Preferred Vendors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Total Order Volume
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.50', color: 'warning.main' }}>
                    <ShoppingBagIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  1,056 POs
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Avg ~132 POs / month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Monthly Spend Trajectory Area Chart */}
          <Grid item xs={12} lg={7}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Monthly Procurement Expenditure Trajectory
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Actual procurement spend compared against projected budgetary targets.
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={MONTHLY_SPEND_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                    <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Area type="monotone" dataKey="spend" name="Actual Spend" stroke="#1976d2" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" name="Target Budget" stroke="#ed6c02" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Requisition Lead Time Trend Line Chart */}
          <Grid item xs={12} lg={5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Requisition Lead Time Efficiency
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average days elapsed from initial request creation to final delivery.
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={LEAD_TIME_METRICS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 20]} tickFormatter={(v) => `${v}d`} />
                    <RechartsTooltip formatter={(val) => `${val} Days`} />
                    <Legend />
                    <Line type="monotone" dataKey="avgDays" name="Avg Delivery Days" stroke="#2e7d32" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="targetDays" name="Target SLA (10d)" stroke="#d32f2f" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Category Performance Matrix */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Category Spend & Compliance Matrix
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Procurement breakdown across core commodity classes.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Category Class</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>YTD Spend</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>YoY Growth</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 220 }}>Contract Compliance Rate</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Avg Turnaround Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CATEGORY_TREND_BREAKDOWN.map((row) => (
                  <TableRow key={row.category} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.category}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ytdSpend)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.growth}
                        size="small"
                        color={row.growth.startsWith('+') ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.complianceRate}
                            color={row.complianceRate >= 90 ? 'success' : 'warning'}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                          {row.complianceRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" fontWeight={600}>
                        {row.avgCycleDays} Days
                      </Typography>
                    </TableCell>
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

export default ProcurementTrends;