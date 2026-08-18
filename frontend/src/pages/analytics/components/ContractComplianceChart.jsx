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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GavelIcon from '@mui/icons-material/Gavel';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
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

const SLA_COMPLIANCE_BY_CATEGORY = [
  { category: 'IT Hardware', compliant: 96, nonCompliant: 4 },
  { category: 'Logistics', compliant: 88, nonCompliant: 12 },
  { category: 'Raw Materials', compliant: 94, nonCompliant: 6 },
  { category: 'Services', compliant: 91, nonCompliant: 9 },
  { category: 'Office Supplies', compliant: 98, nonCompliant: 2 },
];

const COMPLIANCE_STATUS_PIE = [
  { name: 'Fully Compliant', value: 72, color: '#2e7d32' },
  { name: 'Minor Breaches', value: 18, color: '#ed6c02' },
  { name: 'Critical Violations', value: 6, color: '#d32f2f' },
  { name: 'Under Audit', value: 4, color: '#0288d1' },
];

const ACTIVE_CONTRACT_AUDIT_LEDGER = [
  {
    contractId: 'CTR-2026-901',
    vendorName: 'TechSupply Co.',
    category: 'IT Hardware',
    slaScore: 98.4,
    priceAdherence: '100%',
    expiryDate: '2026-12-31',
    auditStatus: 'COMPLIANT',
  },
  {
    contractId: 'CTR-2026-902',
    vendorName: 'Global Logistics Ltd',
    category: 'Freight Services',
    slaScore: 84.2,
    priceAdherence: '92%',
    expiryDate: '2026-10-15',
    auditStatus: 'MINOR_BREACH',
  },
  {
    contractId: 'CTR-2026-903',
    vendorName: 'NexGen Cloud Solutions',
    category: 'SaaS & Hosting',
    slaScore: 99.1,
    priceAdherence: '100%',
    expiryDate: '2027-03-31',
    auditStatus: 'COMPLIANT',
  },
  {
    contractId: 'CTR-2026-904',
    vendorName: 'Apex Raw Components',
    category: 'Manufacturing',
    slaScore: 76.5,
    priceAdherence: '85%',
    expiryDate: '2026-09-01',
    auditStatus: 'CRITICAL_BREACH',
  },
  {
    contractId: 'CTR-2026-905',
    vendorName: 'Prime Logistics',
    category: 'Packaging',
    slaScore: 92.0,
    priceAdherence: '98%',
    expiryDate: '2026-11-20',
    auditStatus: 'AUDIT_PENDING',
  },
];

export const ContractComplianceChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');

  const getAuditChip = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return <Chip label="Compliant" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case 'MINOR_BREACH':
        return <Chip label="Minor SLA Breach" color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case 'CRITICAL_BREACH':
        return <Chip label="Critical Violation" color="error" size="small" sx={{ fontWeight: 600 }} />;
      case 'AUDIT_PENDING':
        return <Chip label="Audit Pending" color="info" size="small" sx={{ fontWeight: 600 }} />;
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
              Contract & SLA Compliance Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track vendor adherence to agreed terms, rate card limits, and delivery SLA benchmarks.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              select
              size="small"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              sx={{ minWidth: 150, bgcolor: 'background.paper' }}
            >
              <MenuItem value="30D">Last 30 Days</MenuItem>
              <MenuItem value="Q3">Q3 2026</MenuItem>
              <MenuItem value="YTD">Year to Date (2026)</MenuItem>
            </TextField>
            <Button variant="outlined" size="small" startIcon={<FilterListIcon />} sx={{ bgcolor: 'background.paper' }}>
              Filters
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} disableElevation>
              Export Audit
            </Button>
          </Stack>
        </Box>

        {/* Executive Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Overall SLA Compliance Rate
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.50', color: 'success.main' }}>
                    <VerifiedUserIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  93.8%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Target: 90.0% Minimum Benchmark
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Rate Card Price Adherence
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }}>
                    <AssignmentTurnedInIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  96.5%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  3.5% Invoice Rate Discrepancies
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Active SLA Breaches
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'error.50', color: 'error.main' }}>
                    <WarningAmberIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  3 Active
                </Typography>
                <Chip label="Requires Immediate Review" size="small" color="error" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Penalty Rebates Recovered
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.50', color: 'warning.main' }}>
                    <GavelIcon fontSize="small" />
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700} color="warning.dark">
                  PKR 650,000
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Enforced via SLA Breach Clauses
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Visual Charts Row */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* SLA Compliance by Commodity Category */}
          <Grid item xs={12} lg={8}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    SLA Compliance Rate by Commodity Category (%)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Evaluating fulfilled order accuracy, lead times, and quality certifications.
                  </Typography>
                </Box>
                <Tooltip title="Measures orders delivered within agreed timeframe and without quality hold flags.">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={SLA_COMPLIANCE_BY_CATEGORY} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="category" type="category" width={110} />
                    <RechartsTooltip formatter={(val) => `${val}%`} />
                    <Legend />
                    <Bar dataKey="compliant" name="Compliant Orders %" stackId="a" fill="#2e7d32" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="nonCompliant" name="Non-Compliant %" stackId="a" fill="#d32f2f" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Contract Status Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Contract Compliance Breakdown
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Distribution of active vendor contracts by compliance audit classification.
              </Typography>

              <Box sx={{ width: '100%', height: 210 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={COMPLIANCE_STATUS_PIE}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {COMPLIANCE_STATUS_PIE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val) => `${val}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Stack spacing={0.75}>
                {COMPLIANCE_STATUS_PIE.map((item) => (
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

        {/* Vendor Contract Audit Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Active Contract Compliance Audit Matrix
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time contract performance scoring, rate adherence, and expiration tracking.
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small" sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Contract Ref</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vendor Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 180 }}>SLA Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Rate Adherence</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Expiration Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Audit Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ACTIVE_CONTRACT_AUDIT_LEDGER.map((row) => (
                  <TableRow key={row.contractId} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.contractId}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{row.vendorName}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.slaScore}
                            color={row.slaScore >= 90 ? 'success' : row.slaScore >= 80 ? 'warning' : 'error'}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption" fontWeight={600}>
                          {row.slaScore}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {row.priceAdherence}
                    </TableCell>
                    <TableCell>{row.expiryDate}</TableCell>
                    <TableCell align="center">{getAuditChip(row.auditStatus)}</TableCell>
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

export default ContractComplianceChart;