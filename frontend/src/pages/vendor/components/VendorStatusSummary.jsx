import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export const VendorStatusSummary = ({ vendorId, summaryData }) => {
  // Mock fallback data for development/preview
  const data = summaryData || {
    activeContracts: 3,
    totalOrders: 24,
    pendingInvoices: 2,
    outstandingBalance: 125000, // PKR or USD depending on system config
    currency: 'PKR',
    complianceScore: 92,
    riskLevel: 'LOW', // LOW, MEDIUM, HIGH
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency || 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskChip = (level) => {
    switch (level) {
      case 'LOW':
        return <Chip label="Low Risk" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case 'MEDIUM':
        return <Chip label="Medium Risk" color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case 'HIGH':
        return <Chip label="High Risk" color="error" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={level} size="small" />;
    }
  };

  return (
    <Grid container spacing={2.5}>
      {/* Active Contracts Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'primary.50',
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <AssignmentIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Active Contracts
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {data.activeContracts}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Orders Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'info.50',
                color: 'info.main',
                display: 'flex',
              }}
            >
              <ReceiptLongIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Purchase Orders
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {data.totalOrders}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Outstanding Balance Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'warning.50',
                color: 'warning.main',
                display: 'flex',
              }}
            >
              <AccountBalanceWalletIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Outstanding Balance
              </Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {formatCurrency(data.outstandingBalance, data.currency)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Compliance & Risk Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon fontSize="small" color="success" />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Compliance Score
                </Typography>
              </Box>
              {getRiskChip(data.riskLevel)}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" fontWeight={700}>
                {data.complianceScore}%
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={data.complianceScore}
                  color={data.complianceScore > 80 ? 'success' : 'warning'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default VendorStatusSummary;