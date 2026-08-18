import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SavingsIcon from '@mui/icons-material/Savings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const KPI_DATA = [
  {
    id: 'total-spend',
    title: 'Total Spend YTD',
    value: 23100000,
    isCurrency: true,
    change: '+8.4%',
    isPositive: false, // Spending higher is flagged for attention
    trendText: 'vs last year',
    icon: <AccountBalanceWalletIcon />,
    color: 'primary',
    info: 'Total procurement spend incurred across all departments year-to-date.',
  },
  {
    id: 'active-pos',
    title: 'Active Purchase Orders',
    value: 142,
    isCurrency: false,
    change: '+12',
    isPositive: true,
    trendText: 'this month',
    icon: <ShoppingBagIcon />,
    color: 'info',
    info: 'POs currently in pending approval, processing, or fulfillment state.',
  },
  {
    id: 'avg-cycle-time',
    title: 'Avg. PO Cycle Time',
    value: '3.2 Days',
    isRawText: true,
    change: '-18.5%',
    isPositive: true, // Lower cycle time is positive
    trendText: 'vs Q1 benchmark',
    icon: <AccessTimeIcon />,
    color: 'warning',
    info: 'Average lead time from initial requisition creation to final vendor dispatch.',
  },
  {
    id: 'cost-savings',
    title: 'Realized Cost Savings',
    value: 2850000,
    isCurrency: true,
    change: '+14.2%',
    isPositive: true,
    trendText: 'vs target',
    icon: <SavingsIcon />,
    color: 'success',
    info: 'Negotiated price reductions and strategic sourcing savings captured.',
  },
  {
    id: 'budget-utilization',
    title: 'Budget Utilization',
    value: '93.9%',
    isRawText: true,
    progress: 93.9,
    change: '+2.1%',
    isPositive: true,
    trendText: 'of overall cap',
    icon: <AssessmentIcon />,
    color: 'secondary',
    info: 'Percentage of total approved organizational budget consumed.',
  },
  {
    id: 'vendor-compliance',
    title: 'Vendor SLA Compliance',
    value: '96.8%',
    isRawText: true,
    progress: 96.8,
    change: '+1.4%',
    isPositive: true,
    trendText: 'on-time delivery rate',
    icon: <VerifiedUserIcon />,
    color: 'success',
    info: 'On-time delivery and quality contract compliance performance score across top suppliers.',
  },
];

export const KpiCards = ({ data = KPI_DATA }) => {
  const currency = 'PKR';

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2.5}>
        {data.map((kpi) => {
          const displayValue = kpi.isRawText
            ? kpi.value
            : kpi.isCurrency
            ? formatCurrency(kpi.value)
            : kpi.value.toLocaleString();

          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={kpi.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: 'divider',
                  boxShadow: 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[2],
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Icon & Title Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: `${kpi.color}.50`,
                        color: `${kpi.color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {kpi.icon}
                    </Box>

                    {kpi.info && (
                      <Tooltip title={kpi.info} arrow placement="top">
                        <InfoOutlinedIcon
                          sx={{ fontSize: 18, color: 'text.disabled', cursor: 'pointer' }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Header Text */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}
                  >
                    {kpi.title}
                  </Typography>

                  {/* KPI Main Value */}
                  <Typography variant="h6" fontWeight={700} sx={{ my: 0.5, color: 'text.primary' }}>
                    {displayValue}
                  </Typography>

                  {/* Optional Linear Progress Bar */}
                  {kpi.progress !== undefined && (
                    <Box sx={{ width: '100%', my: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={kpi.progress}
                        color={kpi.progress > 90 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* Trend & Context Chip */}
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      icon={
                        kpi.isPositive ? (
                          <TrendingUpIcon sx={{ '&&': { fontSize: 14 } }} />
                        ) : (
                          <TrendingDownIcon sx={{ '&&': { fontSize: 14 } }} />
                        )
                      }
                      label={kpi.change}
                      color={kpi.isPositive ? 'success' : 'error'}
                      variant="light"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        px: 0.25,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {kpi.trendText}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default KpiCards;