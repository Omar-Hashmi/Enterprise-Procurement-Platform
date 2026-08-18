import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeliveryStatusSummary from './components/DeliveryStatusSummary';
import PendingDeliveries from './components/PendingDeliveries';

export default function InventoryDashboard() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">Dashboard</Link>
        <Typography color="text.primary">Inventory</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Inventory Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined"><CardContent><DeliveryStatusSummary /></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <PendingDeliveries />
        </Grid>
      </Grid>
    </Box>
  );
}
