import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Stack,
  Chip,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// NOTE: still mock data — swap these for the real `useAnalytics()` payload
// (reports.spendTrend, reports.departmentSpending, reports.budgetUtilization)
// the same way the live Overview/Budget tabs already do, whenever this page
// is wired up for real.
const SPEND_TREND_DATA = [
  { month: 'Jan', procurementSpend: 420000, inventoryValuation: 310000 },
  { month: 'Feb', procurementSpend: 380000, inventoryValuation: 340000 },
  { month: 'Mar', procurementSpend: 510000, inventoryValuation: 390000 },
  { month: 'Apr', procurementSpend: 460000, inventoryValuation: 370000 },
  { month: 'May', procurementSpend: 590000, inventoryValuation: 420000 },
  { month: 'Jun', procurementSpend: 620000, inventoryValuation: 450000 },
];

const CUMULATIVE_TRAJECTORY_DATA = [
  { month: 'Q1', actual: 60 },
  { month: 'Q2', actual: 80 },
  { month: 'Q3', actual: 95 },
  { month: 'Q4', actual: 108 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Electronics & IT', value: 42, colorKey: 'primary' },
  { name: 'Logistics & Freight', value: 28, colorKey: 'info' },
  { name: 'Office Supplies', value: 18, colorKey: 'warning' },
  { name: 'Furniture', value: 12, colorKey: 'success' },
];

const BUDGET_KPI_CARDS = [
  { title: 'Overall Utilization', value: '92.4%', sub: 'Target 95%', colorKey: 'primary' },
  { title: 'Optimized Units', value: '12 Units', sub: 'Baseline', colorKey: 'success' },
  { title: 'Over-Utilized', value: '2 Units', sub: 'Overflow', colorKey: 'error' },
  { title: 'Efficiency Index', value: '0.96', sub: 'Value ratio', colorKey: 'info' },
];

const PROJECT_LEDGER = [
  { id: 'PRJ-01', name: 'Cloud Migration', owner: 'Engineering', spent: '2.1M', status: 'On Track' },
  { id: 'PRJ-02', name: 'Logistics Hub', owner: 'Operations', spent: '1.7M', status: 'At Risk' },
  { id: 'PRJ-03', name: 'ERP Upgrade', owner: 'IT Dept', spent: '1.2M', status: 'On Track' },
  { id: 'PRJ-04', name: 'Q3 Marketing', owner: 'Marketing', spent: '980K', status: 'Over Budget' },
];

const STATUS_COLOR = { 'On Track': 'success', 'At Risk': 'warning', 'Over Budget': 'error' };

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('YTD');
  const theme = useTheme();

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);

  // Resolve chart colors from the active theme instead of hardcoded hex,
  // so this renders correctly in both light and dark mode and matches the
  // rest of the app's palette rather than fighting it.
  const paletteColor = (key) => theme.palette[key]?.main ?? theme.palette.primary.main;

  return (
    // Plain in-page content — no nested full-viewport wrapper, no fake
    // "phone frame". This is rendered inside the app's existing page shell
    // (sidebar/header/scroll container already provided by the layout), so
    // it should behave like normal page content, not impose its own
    // viewport-height card, background, or scrollbar.
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Procurement Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time spend, stock turnover, and budget metrics.
        </Typography>
        <Box sx={{ mt: 1.5, maxWidth: 260 }}>
          <TextField
            select
            fullWidth
            size="small"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="1M">Last 30 Days</MenuItem>
            <MenuItem value="6M">Last 6 Months</MenuItem>
            <MenuItem value="YTD">Year to Date (2026)</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Section 1: Procurement Spend Trend Analysis */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Procurement Spend Trend Analysis
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Area Chart Card */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Monthly Spend vs. Valuation
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Procurement expenditure vs. asset valuation.
            </Typography>
            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPEND_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={11} />
                  <YAxis stroke={theme.palette.text.secondary} fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
                  />
                  <Area
                    type="monotone"
                    dataKey="procurementSpend"
                    name="Procurement Spend"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Spend by Category Pie Chart */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Spend by Category
            </Typography>
            <Box sx={{ width: '100%', height: 160, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY_DISTRIBUTION} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                    {CATEGORY_DISTRIBUTION.map((entry) => (
                      <Cell key={entry.name} fill={paletteColor(entry.colorKey)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `${val}%`}
                    contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              {CATEGORY_DISTRIBUTION.map((cat) => (
                <Grid item xs={6} key={cat.name}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: paletteColor(cat.colorKey), flexShrink: 0 }} />
                    <Typography variant="caption" noWrap fontWeight={500}>
                      {cat.name}: <b>{cat.value}%</b>
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Section 2: Budget Utilization */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Budget Utilization Analytics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Capital allocation absorption efficiency.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<FileDownloadIcon />} disableElevation>
              Export
            </Button>
          </Stack>
        </Box>

        {/* KPI Grid */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {BUDGET_KPI_CARDS.map((kpi) => (
            <Grid item xs={6} md={3} key={kpi.title}>
              <Card variant="outlined" sx={{ borderRadius: 1.5, borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" noWrap>
                    {kpi.title}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color={`${kpi.colorKey}.main`}>
                    {kpi.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {kpi.sub}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Cumulative Trajectory Bar Chart */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: 'divider', mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight={700}>
              Cumulative Trajectory (%)
            </Typography>
            <InfoOutlinedIcon sx={{ fontSize: 14 }} color="action" />
          </Stack>
          <Box sx={{ width: '100%', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CUMULATIVE_TRAJECTORY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={11} />
                <YAxis stroke={theme.palette.text.secondary} fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val) => `${val}%`}
                  contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
                />
                <Bar dataKey="actual" name="Actual" fill={theme.palette.primary.main} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        <Divider sx={{ mb: 2 }} />

        {/* Project Ledger Table */}
        <Typography variant="overline" fontWeight={700} color="text.secondary" display="block" sx={{ mb: 1 }}>
          Project Utilization Ledger
        </Typography>

        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Spent</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PROJECT_LEDGER.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} display="block">
                      {row.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.id} • {row.owner}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {row.spent}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={row.status} size="small" color={STATUS_COLOR[row.status] || 'default'} sx={{ fontWeight: 600 }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Analytics;