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
  IconButton,
  Tooltip,
} from '@mui/material';
import PieChartIcon from '@mui/icons-material/PieChart';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const UTILIZATION_BY_DEPT_RADAR = [
  { department: 'IT & Cloud', allocated: 100, utilized: 92 },
  { department: 'Logistics', allocated: 100, utilized: 88 },
  { department: 'R&D', allocated: 100, utilized: 102 },
  { department: 'Marketing', allocated: 100, utilized: 97 },
  { department: 'HR & Admin', allocated: 100, utilized: 84 },
  { department: 'Operations', allocated: 100, utilized: 91 },
];

const CUMULATIVE_UTILIZATION_PACING = [
  { month: 'Jan', targetPacing: 12.5, actualPacing: 11.2 },
  { month: 'Feb', targetPacing: 25.0, actualPacing: 24.1 },
  { month: 'Mar', targetPacing: 37.5, actualPacing: 39.0 },
  { month: 'Apr', targetPacing: 50.0, actualPacing: 51.2 },
  { month: 'May', targetPacing: 62.5, actualPacing: 67.8 },
  { month: 'Jun', targetPacing: 75.0, actualPacing: 81.5 },
  { month: 'Jul', targetPacing: 87.5, actualPacing: 92.4 },
  { month: 'Aug', targetPacing: 100.0, actualPacing: 98.2 },
];

const PROJECT_UTILIZATION_BREAKDOWN = [
  {
    id: 'PRJ-2026-01',
    projectName: 'Cloud Infrastructure Migration',
    owner: 'Engineering Dept',
    totalBudget: 6000000,
    utilizedSpend: 5520000,
    encumbered: 300000,
    pacingStatus: 'OPTIMAL',
  },
  {
    id: 'PRJ-2026-02',
    projectName: 'Global Logistics Hub Integration',
    owner: 'Operations Dept',
    totalBudget: 4500000,
    utilizedSpend: 3960000,
    encumbered: 400000,
    pacingStatus: 'OPTIMAL',
  },
  {
    id: 'PRJ-2026-03',
    projectName: 'Enterprise ERP System Upgrade',
    owner: 'IT Governance',
    totalBudget: 8000000,
    utilizedSpend: 8160000,
    encumbered: 200000,
    pacingStatus: 'EXCEEDED',
  },
  {
    id: 'PRJ-2026-04',
    projectName: 'Q3 Brand Campaign & Digital Outreach',
    owner: 'Marketing Team',
    totalBudget: 3200000,
    utilizedSpend: 3104000,
    encumbered: 50000,
    pacingStatus: 'WARNING',
  },
  {
    id: 'PRJ-2026-05',
    projectName: 'Workplace Hardware Refresh',
    owner: 'Admin Services',
    totalBudget: 2500000,
    utilizedSpend: 2100000,
    encumbered: 150000,
    pacingStatus: 'UNDER_PACED',
  },
];

export const BudgetUtilization = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('YTD');

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPacingChip = (status) => {
    switch (status) {
      case 'OPTIMAL':
        return <Chip label="On Schedule" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case 'WARNING':
        return <Chip label="Near Limit" color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case 'EXCEEDED':
        return <Chip label="Over Target" color="error" size="small" sx={{ fontWeight: 600 }} />;
      case 'UNDER_PACED':
        return <Chip label="Under Utilized" color="info" size="small" sx={{ fontWeight: 600 }} />;
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
              Budget Utilization Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track capital allocation absorption efficiency and project-level burn profiles.
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
              <MenuItem value="Q1">Q1 2026</MenuItem>
              <MenuItem value="Q2">Q2 2026</MenuItem>
              <MenuItem value="Q3">Q3 2026</MenuItem>
              <MenuItem value="YTD">Year to Date (2026)</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} disableElevation>
              Export Metrics
            </Button>
          </Stack>
        </Box>

        {/* Top Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Overall Utilization Rate
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <SpeedIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  92.4%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Target Pacing: 90.0%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Optimally Utilized Units
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <CheckCircleOutlineIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  12 Cost Centers
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Operating within +/- 5% baseline
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Over-Utilized Units
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'error.50', color: 'error.main' }}>
                    <WarningAmberIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  2 Cost Centers
                </Typography>
                <Chip label="Requires Reallocation" size="small" color="error" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Capital Efficiency Index
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'info.50', color: 'info.main' }}>
                    <PieChartIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="info.main">
                  0.96 / 1.00
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  High allocation-to-value ratio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Visual Charts Row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Cumulative Utilization Pacing */}
          <Grid item xs={12} lg={7}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Cumulative Utilization Trajectory (%)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Actual spend pacing trajectory against projected target milestones.
                  </Typography>
                </Box>
                <Tooltip title="Compares cumulative actual expenditure percentage to ideal linear burn rate.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <ComposedChart data={CUMULATIVE_UTILIZATION_PACING} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 110]} />
                    <RechartsTooltip formatter={(val) => `${val}%`} />
                    <Legend />
                    <Bar dataKey="actualPacing" name="Actual Utilization %" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="targetPacing" name="Target Milestone %" stroke="#ed6c02" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Departmental Radar Efficiency */}
          <Grid item xs={12} lg={5}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Department Utilization Profile
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Comparative absorption performance normalized against 100% capacity.
                </Typography>
              </Box>

              <Box sx={{ width: '100%', height: 290 }}>
                <ResponsiveContainer>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={UTILIZATION_BY_DEPT_RADAR}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="department" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 110]} />
                    <Radar name="Target Capacity" dataKey="allocated" stroke="#90caf9" fill="#90caf9" fillOpacity={0.3} />
                    <Radar name="Realized Utilization" dataKey="utilized" stroke="#1976d2" fill="#1976d2" fillOpacity={0.5} />
                    <RechartsTooltip formatter={(val) => `${val}%`} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Project Utilization Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Major Strategic Project Utilization Ledger
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time expenditure absorption and encumbrance tracking for key capital projects.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Project ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Project Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Total Budget</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Utilized Spend</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 180 }}>Absorption %</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Pacing Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PROJECT_UTILIZATION_BREAKDOWN.map((row) => {
                  const combined = row.utilizedSpend + row.encumbered;
                  const pct = Math.round((combined / row.totalBudget) * 100);

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.projectName}</TableCell>
                      <TableCell>{row.owner}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalBudget)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(row.utilizedSpend)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(pct, 100)}
                              color={pct > 100 ? 'error' : pct >= 95 ? 'warning' : 'primary'}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography variant="caption" fontWeight={600}>
                            {pct}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{getPacingChip(row.pacingStatus)}</TableCell>
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

export default BudgetUtilization;