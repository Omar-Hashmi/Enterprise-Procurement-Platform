import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Rating,
  LinearProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';

const VENDOR_PERFORMANCE_DATA = [
  {
    id: 'VND-001',
    name: 'AWS Cloud Services',
    category: 'Cloud Infrastructure',
    totalSpend: 14200000,
    onTimeDelivery: 99.8,
    qualityRating: 4.9,
    defectRate: 0.02,
    slaCompliance: 99.9,
    status: 'PREFERRED',
  },
  {
    id: 'VND-002',
    name: 'Global Freight Express',
    category: 'Logistics & Freight',
    totalSpend: 8900000,
    onTimeDelivery: 94.2,
    qualityRating: 4.5,
    defectRate: 0.8,
    slaCompliance: 95.1,
    status: 'ACTIVE',
  },
  {
    id: 'VND-003',
    name: 'Precision Instruments Ltd.',
    category: 'R&D Equipment',
    totalSpend: 5600000,
    onTimeDelivery: 91.5,
    qualityRating: 4.7,
    defectRate: 0.3,
    slaCompliance: 93.8,
    status: 'ACTIVE',
  },
  {
    id: 'VND-004',
    name: 'Global Media Partners',
    category: 'Marketing & Digital Ads',
    totalSpend: 4200000,
    onTimeDelivery: 88.0,
    qualityRating: 3.8,
    defectRate: 2.1,
    slaCompliance: 86.4,
    status: 'UNDER_REVIEW',
  },
  {
    id: 'VND-005',
    name: 'Industrial Tech Solutions',
    category: 'Hardware & Maintenance',
    totalSpend: 3100000,
    onTimeDelivery: 96.5,
    qualityRating: 4.6,
    defectRate: 0.5,
    slaCompliance: 97.2,
    status: 'PREFERRED',
  },
];

export const VendorPerformance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      case 'PREFERRED':
        return (
          <Chip
            icon={<VerifiedIcon sx={{ '&&': { fontSize: 14 } }} />}
            label="Preferred Partner"
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'ACTIVE':
        return <Chip label="Active" color="info" size="small" sx={{ fontWeight: 600 }} />;
      case 'UNDER_REVIEW':
        return (
          <Chip
            icon={<WarningAmberIcon sx={{ '&&': { fontSize: 14 } }} />}
            label="Under Review"
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredVendors = VENDOR_PERFORMANCE_DATA.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || vendor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider', boxShadow: 'none', mb: 3 }}>
      {/* Header & Controls */}
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalShippingIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              Vendor Performance & SLA Scorecard
            </Typography>
            <Tooltip title="Evaluates vendor compliance against SLA commitments, fulfillment accuracy, and delivery timelines.">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Comparative vendor performance metrics and quality compliance tracking.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            placeholder="Search vendor..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'background.paper', minWidth: 200 }}
          />

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150, bgcolor: 'background.paper' }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="PREFERRED">Preferred</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
          </TextField>
        </Stack>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Average SLA Compliance Rate
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
              94.5%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              On-Time Delivery Target
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
              93.9%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Average Defect / Dispute Rate
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mt: 0.5 }}>
              0.74%
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Vendor Matrix Table */}
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Vendor & Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total YTD Spend</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>On-Time Delivery</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SLA Compliance</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quality Score</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.85rem' }}>
                      {vendor.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {vendor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vendor.category} • {vendor.id}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(vendor.totalSpend)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ minWidth: 100 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontWeight={600}>
                        {vendor.onTimeDelivery}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={vendor.onTimeDelivery}
                      color={vendor.onTimeDelivery >= 95 ? 'success' : vendor.onTimeDelivery >= 90 ? 'info' : 'warning'}
                      sx={{ height: 5, borderRadius: 2, mt: 0.5 }}
                    />
                  </Box>
                </TableCell>

                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: 16,
                        color: vendor.slaCompliance >= 95 ? 'success.main' : 'warning.main',
                      }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {vendor.slaCompliance}%
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Rating
                      value={vendor.qualityRating}
                      precision={0.1}
                      readOnly
                      size="small"
                      emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
                    />
                    <Typography variant="caption" fontWeight={700}>
                      {vendor.qualityRating}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell align="center">{getStatusChip(vendor.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default VendorPerformance;