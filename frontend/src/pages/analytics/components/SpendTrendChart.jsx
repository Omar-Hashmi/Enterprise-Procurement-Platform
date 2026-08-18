import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

const MONTHLY_SPEND_DATA = [
  { period: 'Jan', actualSpend: 2100000, approvedBudget: 2400000, forecast: 2200000 },
  { period: 'Feb', actualSpend: 2350000, approvedBudget: 2400000, forecast: 2300000 },
  { period: 'Mar', actualSpend: 2600000, approvedBudget: 2500000, forecast: 2450000 },
  { period: 'Apr', actualSpend: 2200000, approvedBudget: 2500000, forecast: 2300000 },
  { period: 'May', actualSpend: 2850000, approvedBudget: 2700000, forecast: 2600000 },
  { period: 'Jun', actualSpend: 2700000, approvedBudget: 2700000, forecast: 2650000 },
  { period: 'Jul', actualSpend: 2950000, approvedBudget: 2800000, forecast: 2800000 },
  { period: 'Aug', actualSpend: 2800000, approvedBudget: 2800000, forecast: 2750000 },
  { period: 'Sep', actualSpend: null, approvedBudget: 2900000, forecast: 2850000 },
  { period: 'Oct', actualSpend: null, approvedBudget: 2900000, forecast: 2900000 },
  { period: 'Nov', actualSpend: null, approvedBudget: 3000000, forecast: 2950000 },
  { period: 'Dec', actualSpend: null, approvedBudget: 3100000, forecast: 3000000 },
];

const QUARTERLY_SPEND_DATA = [
  { period: 'Q1', actualSpend: 7050000, approvedBudget: 7300000, forecast: 6950000 },
  { period: 'Q2', actualSpend: 7750000, approvedBudget: 7900000, forecast: 7550000 },
  { period: 'Q3', actualSpend: 5750000, approvedBudget: 8600000, forecast: 8400000 },
  { period: 'Q4', actualSpend: null, approvedBudget: 9000000, forecast: 8850000 },
];

export const SpendTrendChart = () => {
  const [granularity, setGranularity] = useState('monthly');
  const [activeSeries, setActiveSeries] = useState({
    actualSpend: true,
    approvedBudget: true,
    forecast: true,
  });

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = granularity === 'monthly' ? MONTHLY_SPEND_DATA : QUARTERLY_SPEND_DATA;

  const handleGranularityChange = (event, newGranularity) => {
    if (newGranularity !== null) {
      setGranularity(newGranularity);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 180,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Period: {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box
              key={`item-${index}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                my: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ color: entry.color, fontWeight: 600 }}>
                {entry.name}:
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {formatCurrency(entry.value)}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: 'divider',
        boxShadow: 'none',
        mb: 3,
      }}
    >
      {/* Header Controls Bar */}
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShowChartIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              Procurement Spend Trend Analysis
            </Typography>
            <Tooltip title="Historical actual outlay tracked against allocated budgets and predictive financial projections.">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Multi-period time series reflecting fiscal spending velocity and forecast trajectories.
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <ToggleButtonGroup
            value={granularity}
            exclusive
            onChange={handleGranularityChange}
            size="small"
            color="primary"
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="quarterly">Quarterly</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {/* Summary Micro KPIs */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Realized Outlay YTD
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {formatCurrency(20550000)}
              </Typography>
              <Chip label="+6.2% YoY" color="primary" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Approved Fiscal Ceiling
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {formatCurrency(32800000)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                62.6% Consumed
              </Typography>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              EOY Forecast Runway
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
              <Typography variant="h6" fontWeight={700} color="info.main">
                {formatCurrency(31750000)}
              </Typography>
              <Chip
                icon={<TrendingUpIcon sx={{ '&&': { fontSize: 12 } }} />}
                label="-3.2% Variance"
                color="success"
                size="small"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2.5 }} />

      {/* Main Recharts Area Chart */}
      <Box sx={{ width: '100%', height: 340 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1976d2" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ed6c02" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ed6c02" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(val) => `${val / 1000000}M`} tick={{ fontSize: 12 }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="monotone"
              dataKey="actualSpend"
              name="Actual Spend"
              stroke="#1976d2"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorActual)"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="approvedBudget"
              name="Approved Budget"
              stroke="#2e7d32"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorBudget)"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="Forecasted Outlay"
              stroke="#ed6c02"
              strokeWidth={2}
              strokeDasharray="2 2"
              fillOpacity={1}
              fill="url(#colorForecast)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default SpendTrendChart;