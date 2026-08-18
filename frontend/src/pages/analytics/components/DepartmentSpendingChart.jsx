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
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const DEPT_SPEND_VS_BUDGET = [
  { department: 'Engineering', spend: 6800000, budget: 7500000 },
  { department: 'Logistics', spend: 4900000, budget: 5200000 },
  { department: 'R&D', spend: 3800000, budget: 4000000 },
  { department: 'Marketing', spend: 3100000, budget: 3000000 },
  { department: 'Operations', spend: 2700000, budget: 2900000 },
  { department: 'Admin & HR', spend: 1800000, budget: 2000000 },
];

const DEPT_MONTHLY_TRENDS = [
  { month: 'Jan', Engineering: 750000, Logistics: 580000, Marketing: 380000, Rnd: 420000 },
  { month: 'Feb', Engineering: 820000, Logistics: 610000, Marketing: 390000, Rnd: 450000 },
  { month: 'Mar', Engineering: 890000, Logistics: 640000, Marketing: 410000, Rnd: 480000 },
  { month: 'Apr', Engineering: 810000, Logistics: 590000, Marketing: 370000, Rnd: 440000 },
  { month: 'May', Engineering: 950000, Logistics: 670000, Marketing: 430000, Rnd: 510000 },
  { month: 'Jun', Engineering: 920000, Logistics: 650000, Marketing: 420000, Rnd: 490000 },
  { month: 'Jul', Engineering: 980000, Logistics: 710000, Marketing: 460000, Rnd: 530000 },
  { month: 'Aug', Engineering: 940000, Logistics: 690000, Marketing: 440000, Rnd: 500000 },
];

const TOP_DEPARTMENT_TRANSACTIONS = [
  {
    id: 'PO-2026-910',
    department: 'Software Engineering',
    costCenter: 'CC-101',
    category: 'Cloud Infrastructure',
    vendor: 'AWS Cloud Services',
    amount: 2450000,
    status: 'APPROVED',
  },
  {
    id: 'PO-2026-911',
    department: 'Supply Chain & Logistics',
    costCenter: 'CC-102',
    category: 'Freight Shipping',
    vendor: 'Global Freight Express',
    amount: 1820000,
    status: 'PROCESSING',
  },
  {
    id: 'PO-2026-912',
    department: 'Research & Development',
    costCenter: 'CC-103',
    category: 'Testing Equipment',
    vendor: 'Precision Instruments',
    amount: 1250000,
    status: 'APPROVED',
  },
  {
    id: 'PO-2026-913',
    department: 'Marketing & Outreach',
    costCenter: 'CC-104',
    category: 'Digital Ads & Media',
    vendor: 'Global Media Partners',
    amount: 950000,
    status: 'OVER_BUDGET',
  },
];

export const DepartmentSpendingCharts = () => {
  const [selectedDept, setSelectedDept] = useState('ALL');

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
      case 'APPROVED':
        return <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case 'PROCESSING':
        return <Chip label="Processing" color="info" size="small" sx={{ fontWeight: 600 }} />;
      case 'OVER_BUDGET':
        return <Chip label="Exceeds Target" color="error" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ py: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header Section */}
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
              Departmental Spending Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cross-departmental expenditure breakdowns, budget ceiling comparisons, and MoM trend vectors.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              size="small"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              sx={{ minWidth: 160, bgcolor: 'background.paper' }}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              <MenuItem value="ENG">Software Engineering</MenuItem>
              <MenuItem value="LOG">Supply Chain & Logistics</MenuItem>
              <MenuItem value="RND">Research & Development</MenuItem>
              <MenuItem value="MKT">Marketing & Outreach</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} disableElevation>
              Export Report
            </Button>
          </Stack>
        </Box>

        {/* Executive Department KPI Summary */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Top Spending Department
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <BusinessIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  Software Engineering
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {formatCurrency(6800000)} (29.4% of total)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Highest Variance
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'error.50', color: 'error.main' }}>
                    <TrendingUpIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  Marketing & Outreach
                </Typography>
                <Chip label="+3.3% Over Budget" size="small" color="error" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Average Dept Outlay
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'info.50', color: 'info.main' }}>
                    <PaymentsIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {formatCurrency(3850000)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Across 6 Active Business Units
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Total Dept Budget Pool
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <AccountBalanceIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {formatCurrency(24600000)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  93.9% Aggregate Utilization
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Visual Charts Row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Department Spend vs Budget Bar Chart */}
          <Grid item xs={12} lg={7}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Actual Outlay vs. Budget Cap by Department
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evaluating departmental spending limits against realized procurement commitments.
                  </Typography>
                </Box>
                <Tooltip title="Compares cumulative actual spend with approved departmental caps.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ width: '100%', height: 310 }}>
                <ResponsiveContainer>
                  <BarChart data={DEPT_SPEND_VS_BUDGET} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                    <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Bar dataKey="spend" name="Actual Spend" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="budget" name="Approved Budget" fill="#90caf9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Department Spend Monthly Trajectory Line Chart */}
          <Grid item xs={12} lg={5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Department Trajectory Trends
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Month-over-month expenditure growth across top operational divisions.
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 310 }}>
                <ResponsiveContainer>
                  <LineChart data={DEPT_MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                    <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Line type="monotone" dataKey="Engineering" stroke="#1976d2" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Logistics" stroke="#00abc5" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Marketing" stroke="#ff9800" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Rnd" name="R&D" stroke="#2e7d32" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Top Departmental Purchase Transactions Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                High-Value Departmental Transactions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Major purchase orders impacting primary department cost center budgets.
              </Typography>
            </Box>
            <Button size="small" endIcon={<ArrowForwardIcon />}>
              View All Department Orders
            </Button>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cost Center</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Approval Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TOP_DEPARTMENT_TRANSACTIONS.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.costCenter}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                          {row.vendor.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{row.vendor}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell align="center">{getStatusChip(row.status)}</TableCell>
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

export default DepartmentSpendingCharts;