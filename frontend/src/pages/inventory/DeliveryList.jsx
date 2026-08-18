import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DeliveryTable from './components/DeliveryTable';

export default function DeliveryList() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/inventory">Inventory</Link>
        <Typography color="text.primary">Deliveries</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Deliveries</Typography>
      <Card variant="outlined"><CardContent><DeliveryTable /></CardContent></Card>
    </Box>
  );
}
