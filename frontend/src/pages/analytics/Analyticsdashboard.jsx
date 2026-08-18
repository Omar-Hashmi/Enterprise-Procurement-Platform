import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';

// Analytics overview component
import {
  AnalyticsDashboard as OverviewPanel,
} from './components/AnalyticsDashboard';

// BudgetAnalytics is located directly inside the analytics folder
import { BudgetAnalytics } from './BudgetAnalytics';

// Simple TabPanel helper component
function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Accessibility properties for tabs
function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

export const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExport = () => {
    window.alert(
      'Export functionality will be connected to the analytics API.'
    );
  };

  const handleFilters = () => {
    window.alert(
      'Analytics filters will be available here.'
    );
  };

  return (
    <Box
      sx={{
        py: 3,
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">

        {/* ================================
            PAGE HEADER
        ================================= */}
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
          {/* Page title */}
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
            >
              Analytics & Intelligence
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Comprehensive insights into inventory operations,
              budget utilization, and vendor metrics.
            </Typography>
          </Box>

          {/* Header actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              size="small"
              sx={{
                bgcolor: 'background.paper',
              }}
              onClick={handleFilters}
            >
              Filters
            </Button>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              size="small"
              disableElevation
              onClick={handleExport}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* ================================
            NAVIGATION TABS
        ================================= */}
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: 'divider',
            bgcolor: 'background.paper',
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
            <Tab
              label="Executive Overview"
              {...a11yProps(0)}
            />

            <Tab
              label="Budget & Spend"
              {...a11yProps(1)}
            />

            <Tab
              label="Vendor Performance"
              {...a11yProps(2)}
            />
          </Tabs>
        </Paper>

        {/* ================================
            EXECUTIVE OVERVIEW
        ================================= */}
        <CustomTabPanel
          value={activeTab}
          index={0}
        >
          <OverviewPanel />
        </CustomTabPanel>

        {/* ================================
            BUDGET & SPEND
        ================================= */}
        <CustomTabPanel
          value={activeTab}
          index={1}
        >
          <BudgetAnalytics />
        </CustomTabPanel>

        {/* ================================
            VENDOR PERFORMANCE
        ================================= */}
        <CustomTabPanel
          value={activeTab}
          index={2}
        >
          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 3,
                sm: 6,
              },
              borderRadius: 2,
              textAlign: 'center',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={700}
            >
              Vendor Performance Analytics
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                maxWidth: 650,
                mx: 'auto',
              }}
            >
              Vendor performance analytics will display supplier
              rankings, lead times, defect rates, spending,
              and SLA compliance.
            </Typography>

            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              onClick={() => setActiveTab(0)}
            >
              Return to Overview
            </Button>
          </Paper>
        </CustomTabPanel>

      </Container>
    </Box>
  );
};

export default AnalyticsDashboard;