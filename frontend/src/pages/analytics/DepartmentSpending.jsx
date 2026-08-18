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
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const DEPARTMENT_COMPARISON_DATA = [
  { department: 'Engineering', q1: 1200000, q2: 1450000, q3: 1300000 },
  { department: 'Operations', q1: 950000, q2: 1100000, q3: 1050000 },
  { department: 'Administration', q1: 400000, q2: 420000, q3: 450000 },
  { department: 'R&D', q1: 800000, q2: 950000, q3: 900000 },
  { department: 'Marketing', q1: 600000, q2: 750000, q3: 700000 },
];

const SPEND_BY_DEPT_PIE = [
  { name: 'Engineering', value: 32, color: '#1976d2' },
  { name: 'Operations', value: 25, color: '#00abc5' },
  { name: 'R&D', value: 21, color: '#2e7d32' },
  { name: 'Marketing', value: 13, color: '#ff9800' },
  { name: 'Administration', value: 9, color: '#9c27b0' },
];

const DEPARTMENT_DETAILS = [
  {
    id: 'DEPT-ENG',
    name: 'Software Engineering & IT',
    head: 'Sarah Jenkins',
    poCount: 142,
    totalSpent: 3950000,
    budgetCap: 4500000,
    topCategory: 'Cloud & Hardware',
  },
  {
    id: 'DEPT-OPS',
    name: 'Supply Chain & Logistics',
    head: 'Michael Chang',
    poCount: 98,
    totalSpent: 3100000,
    budgetCap: 3500000,
    topCategory: 'Freight & Packaging',
  },
  {
    id: 'DEPT-RD',
    name: 'Research & Development',
    head: 'Dr. Aris Thorne',
    poCount: 64,
    totalSpent: 2650000,
    budgetCap: 3000000,
    topCategory: 'Lab Equipment',
  },
  {
    id: 'DEPT-MKT',
    name: 'Marketing & Outreach',
    head: 'Elena Rostova',
    poCount: 45,
    totalSpent: 2050000,
    budgetCap: 2200000,
    topCategory: 'Vendor Agencies',
  },
  {
    id: 'DEPT-ADM',
    name: 'Administration & HR',
    head: 'David Miller',
    poCount: 38,
    totalSpent: 1270000,
    budgetCap: 1500000,
    topCategory: 'Office Supplies',
  },
];

export const DepartmentSpendings = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('ALL');

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCompanySpend = DEPARTMENT_DETAILS.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const totalPOs = DEPARTMENT_DETAILS.reduce((acc, curr) => acc + curr.poCount, 0);

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
              Departmental Spending Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyze capital distribution, purchase order volume, and expenditure velocity across divisions.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              size="small"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              sx={{ minWidth: 150, bgcolor: 'background.paper' }}
            >
              <MenuItem value="ALL">All Quarters (YTD)</MenuItem>
              <MenuItem value="Q1">Q1 2026</MenuItem>
              <MenuItem value="Q2">Q2 2026</MenuItem>
              <MenuItem value="Q3">Q3 2026</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} disableElevation>
              Export
            </Button>
          </Stack>
        </Box>

        {/* Top KPI Metrics */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Active Cost Centers
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <BusinessIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  5 Departments
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Across all operational units
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Total Company Spend
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'info.50', color: 'info.main' }}>
                    <PieChartIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  {formatCurrency(totalCompanySpend)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  YTD Cumulative Settlements
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Total Issued POs
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <ReceiptLongIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {totalPOs} Requisitions
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Avg ~{formatCurrency(totalCompanySpend / totalPOs)} / PO
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Highest Spending Dept
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.50', color: 'warning.main' }}>
                    <TrendingUpIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  Engineering
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  32% of total corporate pool
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Quarterly Spend per Department */}
          <Grid item xs={12} lg={8}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Quarterly Departmental Expenditure
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quarter-over-quarter spend comparison across core organizational functions.
                  </Typography>
                </Box>
                <Tooltip title="Data aggregated from approved and processed invoices per quarter.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={DEPARTMENT_COMPARISON_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="department" />
                    <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                    <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Bar dataKey="q1" name="Q1 Spend" fill="#90caf9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="q2" name="Q2 Spend" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="q3" name="Q3 Spend" fill="#0d47a1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Department Share Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Budget Share Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Percentage share of overall capital consumed by department.
              </Typography>

              <Box sx={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={SPEND_BY_DEPT_PIE}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {SPEND_BY_DEPT_PIE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val) => `${val}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Stack spacing={1}>
                {SPEND_BY_DEPT_PIE.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="caption" fontWeight={500}>
                        {item.name}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" fontWeight={700}>
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Department Breakdown Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Department Cost Center Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Managing department leads, requisition counts, allocated limits, and primary spend drivers.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department Lead</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Issued POs</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Total Spent</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 180 }}>Budget Utilization</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Primary Spend Driver</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DEPARTMENT_DETAILS.map((dept) => {
                  const usagePct = Math.round((dept.totalSpent / dept.budgetCap) * 100);
                  return (
                    <TableRow key={dept.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                      <TableCell>{dept.head}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${dept.poCount} POs`} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(dept.totalSpent)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={usagePct}
                              color={usagePct >= 90 ? 'warning' : 'primary'}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={600}>
                            {usagePct}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {dept.topCategory}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default DepartmentSpendings;