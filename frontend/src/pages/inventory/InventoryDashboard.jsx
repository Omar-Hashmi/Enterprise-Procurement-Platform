import React, { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link, Typography, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeliveryStatusSummary from './components/DeliveryStatusSummary';
import PendingDeliveries from './components/PendingDeliveries';
import apiClient from '../../lib/api';
import { demoDeliveries } from '../../data/demoData';

export default function InventoryDashboard() {
  const [deliveries, setDeliveries] = useState(demoDeliveries);

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        const response = await apiClient.get('/inventory');
        const records = response.data?.data || [];
        setDeliveries(records.length ? records : demoDeliveries);
      } catch {
        setDeliveries(demoDeliveries);
      }
    };
    loadDeliveries();
  }, []);

  const pendingCount = deliveries.filter((delivery) =>
    ['pending', 'scheduled', 'in transit'].includes(String(delivery.deliveryStatus || delivery.status || '').toLowerCase())
  ).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard">Dashboard</Link>
        <Typography color="text.primary">Inventory</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Inventory Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined"><CardContent><DeliveryStatusSummary total={deliveries.length} pending={pendingCount} /></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <PendingDeliveries deliveries={deliveries} />
        </Grid>
      </Grid>
    </Box>
  );
}
