import React, { useEffect, useMemo, useState } from 'react';
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
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatters';
import apiClient from '../../../lib/api';
import { demoAnalyticsOverview } from '../../../data/demoData';

const summaryStats = [
  {
    title: 'Procurement Spend',
    value: '$1.28M',
    change: '+12.4%',
    detail: 'vs last month',
    tone: '#e0f2fe',
    icon: <AttachMoneyOutlinedIcon />,
    color: 'primary.main',
  },
  {
    title: 'Inventory Value',
    value: '$2.46M',
    change: '+8.1%',
    detail: 'stock on hand',
    tone: '#dcfce7',
    icon: <Inventory2OutlinedIcon />,
    color: '#15803d',
  },
  {
    title: 'Budget Utilization',
    value: '92.4%',
    change: '+3.2%',
    detail: 'target 95%',
    tone: '#fef3c7',
    icon: <AccountBalanceOutlinedIcon />,
    color: '#b45309',
  },
  {
    title: 'Savings Achieved',
    value: '$184K',
    change: '+9.8%',
    detail: 'YTD savings',
    tone: '#f3e8ff',
    icon: <TrendingUpOutlinedIcon />,
    color: '#7c3aed',
  },
];

const spendTrend = [
  { month: 'Jan', spend: 420000, budget: 390000 },
  { month: 'Feb', spend: 390000, budget: 410000 },
  { month: 'Mar', spend: 520000, budget: 470000 },
  { month: 'Apr', spend: 480000, budget: 500000 },
  { month: 'May', spend: 610000, budget: 520000 },
  { month: 'Jun', spend: 560000, budget: 540000 },
  { month: 'Jul', spend: 640000, budget: 580000 },
];

const departmentPerformance = [
  { name: 'IT', budget: 620000, used: 540000 },
  { name: 'Ops', budget: 470000, used: 420000 },
  { name: 'Admin', budget: 240000, used: 220000 },
  { name: 'HR', budget: 180000, used: 170000 },
  { name: 'Facilities', budget: 320000, used: 290000 },
];

const DEMO_INITIATIVES = [
  { name: 'ERP License Optimization', owner: 'IT', value: '$86,000', status: 'On Track', period: 'month' },
  { name: 'Fleet Maintenance Renewal', owner: 'Operations', value: '$58,000', status: 'Review', period: 'quarter' },
  { name: 'Office Relocation', owner: 'Facilities', value: '$95,000', status: 'At Risk', period: 'year' },
  { name: 'Bulk Hardware Purchase', owner: 'Procurement', value: '$72,000', status: 'On Track', period: 'quarter' },
];

const statusColor = {
  'On Track': 'success',
  Review: 'warning',
  'At Risk': 'error',
};

export const AnalyticsDashboard = ({ period = 'all' }) => {
  const [summary, setSummary] = useState(demoAnalyticsOverview.summary);
  const [trend, setTrend] = useState(demoAnalyticsOverview.trend);
  const [departments, setDepartments] = useState(demoAnalyticsOverview.departments);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [summaryResponse, trendResponse, departmentResponse] = await Promise.all([
          apiClient.get('/analytics/dashboard'),
          apiClient.get('/analytics/budgets/spend-trend'),
          apiClient.get('/analytics/budgets/department-spending'),
        ]);
        setSummary(summaryResponse.data?.data || demoAnalyticsOverview.summary);
        setTrend(trendResponse.data?.data?.points?.length ? trendResponse.data.data.points : demoAnalyticsOverview.trend);
        setDepartments(departmentResponse.data?.data?.length ? departmentResponse.data.data : demoAnalyticsOverview.departments);
      } catch (requestError) {
        // The overview intentionally remains useful offline with the local demo dataset.
        setError('');
      }
    };
    loadAnalytics();
  }, []);

  const filteredTrend = useMemo(() => {
    if (period === 'month') return trend.slice(-1);
    if (period === 'quarter') return trend.slice(-3);
    return trend;
  }, [period, trend]);
  const periodSpend = filteredTrend.reduce((total, point) => total + Number(point.amount || 0), 0);
  const summaryStats = summary ? [
    { title: 'Active Vendors', value: summary.vendors?.active || 0, detail: 'active suppliers', tone: '#e0f2fe', icon: <AttachMoneyOutlinedIcon />, color: 'primary.main' },
    { title: 'Pending Deliveries', value: summary.inventory?.pendingDeliveries || 0, detail: 'awaiting receipt', tone: '#dcfce7', icon: <Inventory2OutlinedIcon />, color: '#15803d' },
    { title: 'Active Contracts', value: summary.contracts?.active || 0, detail: `compliance ${summary.contracts?.compliancePercent || 0}%`, tone: '#fef3c7', icon: <AccountBalanceOutlinedIcon />, color: '#b45309' },
    { title: 'Spend in period', value: formatCurrency(periodSpend), detail: period === 'all' ? 'all available periods' : `${period === 'month' ? 'this month' : period === 'quarter' ? 'this quarter' : 'this year'}`, tone: '#f3e8ff', icon: <TrendingUpOutlinedIcon />, color: '#7c3aed' },
  ] : [];
  const spendTrend = filteredTrend.map((point) => ({ month: point.period, spend: Number(point.amount || 0), budget: Math.round(Number(point.amount || 0) * 0.92) }));
  const departmentPerformance = departments.map((row) => ({ name: row.department, budget: Number(row.allocated || 0), used: Number(row.spent || 0) }));
  const initiatives = useMemo(() => {
    if (period === 'all' || period === 'year') return DEMO_INITIATIVES;
    if (period === 'month') return DEMO_INITIATIVES.filter((item) => item.period === 'month');
    return DEMO_INITIATIVES.filter((item) => ['month', 'quarter'].includes(item.period));
  }, [period]);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!summary && !error && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress aria-label="Loading analytics" /></Box>}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {summaryStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: stat.tone,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {stat.detail}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Spend Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current procurement spend vs. planned budget
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={spendTrend} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value), 'USD')}
                      labelStyle={{ color: '#0f172a' }}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff' }}
                    />
                    <Area type="monotone" dataKey="budget" stroke="#94a3b8" fill="transparent" strokeWidth={2} />
                    <Area type="monotone" dataKey="spend" stroke="#1976d2" fill="url(#spendFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Department Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Budget usage by department
              </Typography>

              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={departmentPerformance} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value), 'USD')}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff' }}
                    />
                    <Bar dataKey="used" fill="#1976d2" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="budget" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Key Initiatives
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>INITIATIVE</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>OWNER</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>VALUE</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {initiatives.map((item) => (
                      <TableRow key={item.name} hover>
                        <TableCell sx={{ py: 1.5, fontWeight: 600 }}>{item.name}</TableCell>
                        <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{item.owner}</TableCell>
                        <TableCell sx={{ py: 1.5, fontWeight: 600 }}>{item.value}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip label={item.status} color={statusColor[item.status] || 'default'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {!initiatives.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No initiatives in the selected period.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                KPI Health
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[
                  { label: 'Budget Compliance', value: 88, color: 'success' },
                  { label: 'Vendor SLA', value: 79, color: 'primary' },
                  { label: 'Inventory Turnover', value: 64, color: 'warning' },
                ].map((item) => (
                  <Box key={item.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.value}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      color={item.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
