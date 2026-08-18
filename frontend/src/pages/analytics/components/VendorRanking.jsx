import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const VendorRanking = ({ vendors = [] }) => {
  // Support either an array directly or an object containing rankings
  const vendorList = Array.isArray(vendors)
    ? vendors
    : vendors?.vendors || vendors?.rankings || [];

  if (!vendorList || vendorList.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Vendor Performance
        </Typography>

        <Typography variant="body2" color="text.secondary">
          No vendor ranking data is available for the selected period.
        </Typography>
      </Paper>
    );
  }

  // Normalize different possible backend field names
  const normalizedVendors = vendorList.map((vendor, index) => ({
    rank: vendor.rank ?? vendor.ranking ?? index + 1,
    name:
      vendor.name ||
      vendor.vendorName ||
      vendor.vendor_name ||
      vendor.companyName ||
      'Unknown Vendor',
    score:
      Number(
        vendor.score ??
          vendor.performanceScore ??
          vendor.performance_score ??
          vendor.rating ??
          0
      ),
    spend: Number(
      vendor.spend ??
        vendor.totalSpend ??
        vendor.total_spend ??
        vendor.amount ??
        0
    ),
    orders: Number(
      vendor.orders ??
        vendor.totalOrders ??
        vendor.total_orders ??
        0
    ),
    status: vendor.status || 'Active',
  }));

  const maxScore = Math.max(
    ...normalizedVendors.map((vendor) => vendor.score),
    100
  );

  const formatCurrency = (value) => {
    if (!Number.isFinite(value)) return '$0';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Vendor Performance Ranking
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Vendors ranked by overall performance score.
          </Typography>
        </Box>

        <Chip
          icon={<TrendingUpIcon />}
          label={`${normalizedVendors.length} Vendors`}
          variant="outlined"
          color="primary"
        />
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                Performance Score
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Spend</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Orders</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {normalizedVendors.map((vendor, index) => (
              <TableRow
                key={`${vendor.name}-${index}`}
                hover
              >
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {index < 3 ? (
                      <StarIcon
                        fontSize="small"
                        color={
                          index === 0
                            ? 'warning'
                            : index === 1
                              ? 'action'
                              : 'secondary'
                        }
                      />
                    ) : null}

                    <Typography fontWeight={600}>
                      #{vendor.rank}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography fontWeight={600}>
                    {vendor.name}
                  </Typography>
                </TableCell>

                <TableCell sx={{ minWidth: 180 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          100,
                          Math.max(
                            0,
                            (vendor.score / maxScore) * 100
                          )
                        )}
                        color={getScoreColor(vendor.score)}
                        sx={{
                          height: 7,
                          borderRadius: 5,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ minWidth: 40 }}
                    >
                      {vendor.score.toFixed(0)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  {formatCurrency(vendor.spend)}
                </TableCell>

                <TableCell>
                  {vendor.orders.toLocaleString()}
                </TableCell>

                <TableCell>
                  <Chip
                    label={vendor.status}
                    size="small"
                    color={
                      vendor.status?.toLowerCase() === 'active'
                        ? 'success'
                        : 'default'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VendorRanking;