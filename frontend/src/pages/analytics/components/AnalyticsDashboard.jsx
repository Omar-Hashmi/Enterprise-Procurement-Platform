import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import KPIcards from './KPIcards';
import SpendTrendChart from './SpendTrendChart';
import BudgetUtilization from './BudgetUtilization';
import VendorPerformance from './VendorPerformance';

export const AnalyticsDashboard = ({ reports, loading, error }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <KPIcards />
        </Grid>

        <Grid item xs={12} lg={8}>
          <SpendTrendChart />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              Budget Utilization
            </Typography>
            <BudgetUtilization />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <VendorPerformance />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
