import React, { useEffect, useState } from 'react';
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
  MenuItem,
  TextField,
  Button,
  Menu,
} from '@mui/material';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';

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

/* =========================================================
   SAMPLE / FALLBACK DATA
   ========================================================= */

const QUARTERLY_DATA = [
  {
    quarter: 'Q1 2026',
    allocated: 1500000,
    spent: 1420000,
  },
  {
    quarter: 'Q2 2026',
    allocated: 1800000,
    spent: 1750000,
  },
  {
    quarter: 'Q3 2026',
    allocated: 2000000,
    spent: 1680000,
  },
  {
    quarter: 'Q4 2026 (Est)',
    allocated: 2200000,
    spent: 0,
  },
];

const DEPARTMENT_BUDGETS = [
  {
    department: 'IT & Software Engineering',
    allocated: 2500000,
    spent: 2150000,
    pending: 150000,
  },
  {
    department: 'Operations & Logistics',
    allocated: 1800000,
    spent: 1620000,
    pending: 90000,
  },
  {
    department: 'Administration & Office',
    allocated: 800000,
    spent: 830000,
    pending: 20000,
  },
  {
    department: 'Research & Prototyping',
    allocated: 1400000,
    spent: 980000,
    pending: 110000,
  },
];

const SPEND_PIE_DATA = [
  {
    name: 'IT Infrastructure',
    value: 35,
    color: '#1976d2',
  },
  {
    name: 'Hardware & Devices',
    value: 25,
    color: '#00abc5',
  },
  {
    name: 'Logistics Services',
    value: 20,
    color: '#2e7d32',
  },
  {
    name: 'Office Amenities',
    value: 12,
    color: '#ff9800',
  },
  {
    name: 'Uncategorized',
    value: 8,
    color: '#9e9e9e',
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

export const BudgetAnalytics = ({
  reports,
  loading = false,
  error = null,
  fetchReports,
  fiscalYear: propFiscalYear,
  range: propRange,
  onExport,
}) => {
  const [fiscalYear, setFiscalYear] = useState(
    propFiscalYear || '2026'
  );

  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);

  /* -------------------------------------------------------
     Keep local fiscal year synchronized with parent
     ------------------------------------------------------- */

  useEffect(() => {
    if (propFiscalYear) {
      setFiscalYear(propFiscalYear);
    }
  }, [propFiscalYear]);

  /* -------------------------------------------------------
     Menu handlers
     ------------------------------------------------------- */

  const openFilters = (event) => {
    setFiltersAnchor(event.currentTarget);
  };

  const closeFilters = () => {
    setFiltersAnchor(null);
  };

  const openExport = (event) => {
    setExportAnchor(event.currentTarget);
  };

  const closeExport = () => {
    setExportAnchor(null);
  };

  /* -------------------------------------------------------
     Export
     ------------------------------------------------------- */

  const handleExport = async (format = 'json') => {
    try {
      if (onExport) {
        await onExport(format);
        closeExport();
        return;
      }

      const data = reports || {
        fiscalYear,
        departments: DEPARTMENT_BUDGETS,
        quarterly: QUARTERLY_DATA,
      };

      if (format === 'json') {
        const blob = new Blob(
          [JSON.stringify(data, null, 2)],
          {
            type: 'application/json',
          }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-analytics-${fiscalYear}.json`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
      }

      if (format === 'csv') {
        const rows = DEPARTMENT_BUDGETS;

        const headers = [
          'Department',
          'Allocated',
          'Spent',
          'Pending',
          'Utilization',
        ];

        const csvRows = rows.map((row) => {
          const utilization =
            row.allocated > 0
              ? Math.round(
                  ((row.spent + row.pending) /
                    row.allocated) *
                    100
                )
              : 0;

          return [
            `"${row.department}"`,
            row.allocated,
            row.spent,
            row.pending,
            utilization,
          ].join(',');
        });

        const csv = [
          headers.join(','),
          ...csvRows,
        ].join('\n');

        const blob = new Blob(
          [csv],
          {
            type: 'text/csv;charset=utf-8;',
          }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `budget-analytics-${fiscalYear}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
      }
    } catch (exportError) {
      console.error('Budget analytics export failed:', exportError);

      window.alert(
        `Export failed: ${
          exportError?.message || 'Unknown error'
        }`
      );
    } finally {
      closeExport();
    }
  };

  /* -------------------------------------------------------
     Formatting
     ------------------------------------------------------- */

  const currency = 'PKR';

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  /* -------------------------------------------------------
     Budget calculations
     ------------------------------------------------------- */

  const totalAllocated = DEPARTMENT_BUDGETS.reduce(
    (total, department) =>
      total + Number(department.allocated || 0),
    0
  );

  const totalSpent = DEPARTMENT_BUDGETS.reduce(
    (total, department) =>
      total + Number(department.spent || 0),
    0
  );

  const totalPending = DEPARTMENT_BUDGETS.reduce(
    (total, department) =>
      total + Number(department.pending || 0),
    0
  );

  const committedAmount = totalSpent + totalPending;

  const remainingBudget =
    totalAllocated - committedAmount;

  const utilizationPercent =
    totalAllocated > 0
      ? Math.round(
          (committedAmount / totalAllocated) * 100
        )
      : 0;

  const remainingPercent = Math.max(
    0,
    100 - utilizationPercent
  );

  /* -------------------------------------------------------
     Loading state
     ------------------------------------------------------- */

  if (loading && !reports) {
    return (
      <Box
        sx={{
          py: 6,
          bgcolor: 'background.default',
          minHeight: '50vh',
        }}
      >
        <Container maxWidth="xl">
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Loading budget analytics...
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Please wait while financial data is loaded.
            </Typography>

            <LinearProgress sx={{ mt: 3 }} />
          </Paper>
        </Container>
      </Box>
    );
  }

  /* -------------------------------------------------------
     Error state
     ------------------------------------------------------- */

  if (error && !reports) {
    return (
      <Box
        sx={{
          py: 6,
          bgcolor: 'background.default',
          minHeight: '50vh',
        }}
      >
        <Container maxWidth="xl">
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              borderRadius: 2,
              textAlign: 'center',
              borderColor: 'error.main',
            }}
          >
            <Typography
              variant="h6"
              color="error"
              fontWeight={600}
            >
              Unable to load budget analytics
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {typeof error === 'string'
                ? error
                : error?.message ||
                  'An unexpected error occurred.'}
            </Typography>

            {fetchReports && (
              <Button
                variant="contained"
                sx={{ mt: 3 }}
                onClick={() =>
                  fetchReports({
                    fiscalYear,
                    range: propRange || '6M',
                  })
                }
              >
                Try Again
              </Button>
            )}
          </Paper>
        </Container>
      </Box>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <Box
      sx={{
        py: 3,
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">

        {/* =================================================
            HEADER
           ================================================= */}

        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
            >
              Budget Analytics & Financial Tracking
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Monitor capital expenditure, departmental
              allocations, and variance projections.
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1.5}
            sx={{
              width: {
                xs: '100%',
                sm: 'auto',
              },
            }}
          >
            {/* Fiscal Year */}

            <TextField
              select
              size="small"
              label="Fiscal Year"
              value={fiscalYear}
              onChange={async (event) => {
                const value = event.target.value;

                setFiscalYear(value);

                if (fetchReports) {
                  try {
                    await fetchReports({
                      fiscalYear: value,
                      range: propRange || '6M',
                    });
                  } catch (fetchError) {
                    console.error(
                      'Failed to fetch budget reports:',
                      fetchError
                    );
                  }
                }
              }}
              sx={{
                minWidth: 140,
                bgcolor: 'background.paper',
              }}
            >
              <MenuItem value="2026">
                FY 2026
              </MenuItem>

              <MenuItem value="2025">
                FY 2025
              </MenuItem>

              <MenuItem value="2024">
                FY 2024
              </MenuItem>
            </TextField>

            {/* Filters */}

            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              sx={{
                bgcolor: 'background.paper',
              }}
              onClick={openFilters}
            >
              Filters
            </Button>

            <Menu
              anchorEl={filtersAnchor}
              open={Boolean(filtersAnchor)}
              onClose={closeFilters}
            >
              <MenuItem
                onClick={async () => {
                  if (fetchReports) {
                    await fetchReports({
                      fiscalYear,
                      range: '1M',
                    });
                  }

                  closeFilters();
                }}
              >
                Last 30 Days
              </MenuItem>

              <MenuItem
                onClick={async () => {
                  if (fetchReports) {
                    await fetchReports({
                      fiscalYear,
                      range: '6M',
                    });
                  }

                  closeFilters();
                }}
              >
                Last 6 Months
              </MenuItem>

              <MenuItem
                onClick={async () => {
                  if (fetchReports) {
                    await fetchReports({
                      fiscalYear,
                      range: '1Y',
                    });
                  }

                  closeFilters();
                }}
              >
                Last 12 Months
              </MenuItem>
            </Menu>

            {/* Export */}

            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              disableElevation
              onClick={openExport}
            >
              Export
            </Button>

            <Menu
              anchorEl={exportAnchor}
              open={Boolean(exportAnchor)}
              onClose={closeExport}
            >
              <MenuItem
                onClick={() =>
                  handleExport('json')
                }
              >
                Export JSON
              </MenuItem>

              <MenuItem
                onClick={() =>
                  handleExport('csv')
                }
              >
                Export CSV
              </MenuItem>
            </Menu>
          </Stack>
        </Box>

        {/* =================================================
            SUMMARY CARDS
           ================================================= */}

        <Grid
          container
          spacing={2.5}
          sx={{ mb: 3 }}
        >

          {/* Total Allocated */}

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Total Allocated Budget
                  </Typography>

                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                    }}
                  >
                    <AccountBalanceIcon fontSize="small" />
                  </Box>
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={700}
                >
                  {formatCurrency(
                    totalAllocated
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: 'block',
                  }}
                >
                  FY {fiscalYear} Approved Baseline
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Settled Spend */}

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Settled Spend
                  </Typography>

                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'info.50',
                      color: 'info.main',
                    }}
                  >
                    <AccountBalanceWalletIcon fontSize="small" />
                  </Box>
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="info.main"
                >
                  {formatCurrency(totalSpent)}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ mt: 1 }}
                >
                  <TrendingUpIcon
                    fontSize="small"
                    color="info"
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {totalAllocated > 0
                      ? Math.round(
                          (totalSpent /
                            totalAllocated) *
                            100
                        )
                      : 0}
                    % of total pool
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Encumbered */}

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Encumbered / Committed
                  </Typography>

                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'warning.50',
                      color: 'warning.main',
                    }}
                  >
                    <TrendingUpIcon fontSize="small" />
                  </Box>
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="warning.dark"
                >
                  {formatCurrency(totalPending)}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: 'block',
                  }}
                >
                  Locked in open POs
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Remaining */}

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: 'divider',
                boxShadow: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Unallocated Balance
                  </Typography>

                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'success.50',
                      color: 'success.main',
                    }}
                  >
                    <PriceCheckIcon fontSize="small" />
                  </Box>
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={
                    remainingBudget < 0
                      ? 'error.main'
                      : 'success.main'
                  }
                >
                  {formatCurrency(
                    remainingBudget
                  )}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ mt: 1 }}
                >
                  <TrendingDownIcon
                    fontSize="small"
                    color={
                      remainingBudget < 0
                        ? 'error'
                        : 'success'
                    }
                  />

                  <Typography
                    variant="caption"
                    color={
                      remainingBudget < 0
                        ? 'error.main'
                        : 'success.main'
                    }
                    fontWeight={600}
                  >
                    {remainingPercent}% remaining
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* =================================================
            CHARTS
           ================================================= */}

        <Grid
          container
          spacing={2.5}
          sx={{ mb: 3 }}
        >

          {/* Quarterly Chart */}

          <Grid
            item
            xs={12}
            lg={8}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                Quarterly Allocation vs. Execution
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: 'block',
                }}
              >
                Comparison between budgeted quarterly
                capital and executed settlements.
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  height: 300,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={QUARTERLY_DATA}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis dataKey="quarter" />

                    <YAxis
                      tickFormatter={(value) =>
                        `${value / 1000000}M`
                      }
                    />

                    <RechartsTooltip
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="allocated"
                      name="Allocated Budget"
                      fill="#90caf9"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="spent"
                      name="Actual Spend"
                      fill="#1976d2"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Pie Chart */}

          <Grid
            item
            xs={12}
            lg={4}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
              >
                Capital Expense Breakdown
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mb: 1,
                  display: 'block',
                }}
              >
                Distribution of current spend by
                asset class.
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  height: 220,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={SPEND_PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {SPEND_PIE_DATA.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        )
                      )}
                    </Pie>

                    <RechartsTooltip
                      formatter={(value) =>
                        `${value}%`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Stack spacing={1}>
                {SPEND_PIE_DATA.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'space-between',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor:
                            item.color,
                        }}
                      />

                      <Typography
                        variant="caption"
                        fontWeight={500}
                      >
                        {item.name}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="caption"
                      fontWeight={700}
                    >
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* =================================================
            DEPARTMENT TABLE
           ================================================= */}

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
            >
              Departmental Allocation & Variance
              Breakdown
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Detailed tracking of budget allowances,
              settled amounts, and encumbered funds by
              operational division.
            </Typography>
          </Box>

          <TableContainer>
            <Table
              size="small"
              sx={{ minWidth: 700 }}
            >
              <TableHead
                sx={{
                  bgcolor: 'action.hover',
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700 }}
                  >
                    Department
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700 }}
                  >
                    Allocated
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700 }}
                  >
                    Settled Spend
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700 }}
                  >
                    Encumbered (POs)
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: 180,
                    }}
                  >
                    Utilization
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700 }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {DEPARTMENT_BUDGETS.map(
                  (row) => {
                    const usedTotal =
                      row.spent +
                      row.pending;

                    const rawPercentage =
                      row.allocated > 0
                        ? Math.round(
                            (usedTotal /
                              row.allocated) *
                              100
                          )
                        : 0;

                    const pct = Math.min(
                      Math.max(
                        rawPercentage,
                        0
                      ),
                      100
                    );

                    const isOver =
                      usedTotal >
                      row.allocated;

                    const isNear =
                      pct >= 85 &&
                      !isOver;

                    return (
                      <TableRow
                        key={row.department}
                        hover
                      >
                        <TableCell
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {row.department}
                        </TableCell>

                        <TableCell align="right">
                          {formatCurrency(
                            row.allocated
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatCurrency(
                            row.spent
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {formatCurrency(
                            row.pending
                          )}
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems:
                                'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                flexGrow: 1,
                              }}
                            >
                              <LinearProgress
                                variant="determinate"
                                value={pct}
                                color={
                                  isOver
                                    ? 'error'
                                    : isNear
                                    ? 'warning'
                                    : 'primary'
                                }
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                }}
                              />
                            </Box>

                            <Typography
                              variant="caption"
                              fontWeight={600}
                            >
                              {rawPercentage}%
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          {isOver ? (
                            <Chip
                              label="Over Budget"
                              color="error"
                              size="small"
                              sx={{
                                fontWeight: 600,
                              }}
                            />
                          ) : isNear ? (
                            <Chip
                              label="Near Limit"
                              color="warning"
                              size="small"
                              sx={{
                                fontWeight: 600,
                              }}
                            />
                          ) : (
                            <Chip
                              label="On Track"
                              color="success"
                              size="small"
                              sx={{
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* =================================================
            FOOTER STATUS
           ================================================= */}

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Budget utilization: {utilizationPercent}%
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

/*
 * IMPORTANT:
 * This named export matches:
 *
 * import { BudgetAnalytics } from './BudgetAnalytics';
 *
 * The default export also matches:
 *
 * import BudgetAnalytics from './BudgetAnalytics';
 */
export default BudgetAnalytics;