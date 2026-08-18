import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReceiveGoods from './components/ReceiveGoods';
import StockMovement from './components/StockMovement';

export default function DeliveryDetails() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/inventory">Inventory</Link>
        <Typography color="text.primary">Delivery Details</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Delivery Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><Card variant="outlined"><CardContent><ReceiveGoods /></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card variant="outlined"><CardContent><StockMovement /></CardContent></Card></Grid>
      </Grid>
    </Box>
  );
}
