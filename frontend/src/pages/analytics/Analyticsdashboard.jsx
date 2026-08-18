import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import PageHeader from '../../components/common/PageHeader';

import { AnalyticsDashboard as OverviewPanel } from './components/AnalyticsDashboard';
import { BudgetAnalytics } from './BudgetAnalytics';
import { VendorAnalytics } from './VendorAnalytics';

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

export const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Toggle the filters panel
  const handleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  // Export analytics data as CSV
  const handleExport = () => {
    const report = [
      ['Analytics & Intelligence Report'],
      [],
      ['Metric', 'Value'],
      ['Procurement Spend', '$1.28M'],
      ['Inventory Value', '$2.46M'],
      ['Budget Utilization', '92.4%'],
      ['Savings Achieved', '$184K'],
      [],
      ['Key Initiatives'],
      ['Initiative', 'Owner', 'Value', 'Status'],
      ['ERP License Optimization', 'IT', '$86,000', 'On Track'],
      ['Fleet Maintenance Renewal', 'Operations', '$58,000', 'Review'],
      ['Office Relocation', 'Facilities', '$95,000', 'At Risk'],
      ['Bulk Hardware Purchase', 'Procurement', '$72,000', 'On Track'],
    ];

    const csv = report
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? '');
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `analytics-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const periodLabel = {
    all: 'All Data',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Page Header */}
      <PageHeader
        title="Analytics & Intelligence"
        subtitle="Comprehensive insights into spend, budget utilization, supplier performance, and operational efficiency."
        action={
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              size="small"
              onClick={handleFilters}
              disableElevation
            >
              Filters
            </Button>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              size="small"
              onClick={handleExport}
              disableElevation
            >
              Export Report
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      {showFilters && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mr: 1,
              }}
            >
              Filter by period:
            </Typography>

            <Button
              variant={selectedPeriod === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedPeriod('all')}
              disableElevation
            >
              All
            </Button>

            <Button
              variant={selectedPeriod === 'month' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedPeriod('month')}
              disableElevation
            >
              This Month
            </Button>

            <Button
              variant={selectedPeriod === 'quarter' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedPeriod('quarter')}
              disableElevation
            >
              This Quarter
            </Button>

            <Button
              variant={selectedPeriod === 'year' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedPeriod('year')}
              disableElevation
            >
              This Year
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 1.5,
            }}
          >
            Selected period: {periodLabel[selectedPeriod]}
          </Typography>
        </Paper>
      )}

      {/* Analytics Tabs */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              minHeight: 60,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            },
          }}
        >
          <Tab label="Executive Overview" {...a11yProps(0)} />

          <Tab label="Budget & Spend" {...a11yProps(1)} />

          <Tab label="Vendor Performance" {...a11yProps(2)} />
        </Tabs>
      </Paper>

      {/* Executive Overview */}
      <CustomTabPanel value={activeTab} index={0}>
        <OverviewPanel period={selectedPeriod} />
      </CustomTabPanel>

      {/* Budget & Spend */}
      <CustomTabPanel value={activeTab} index={1}>
        <BudgetAnalytics range={selectedPeriod} />
      </CustomTabPanel>

      {/* Vendor Performance */}
      <CustomTabPanel value={activeTab} index={2}>
        <VendorAnalytics period={selectedPeriod} />
      </CustomTabPanel>
    </Box>
  );
};

export default AnalyticsDashboard;
