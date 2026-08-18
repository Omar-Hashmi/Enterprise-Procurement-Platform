import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import WarehouseTable from './components/WarehouseTable';

export default function WarehouseList() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/inventory">Inventory</Link>
        <Typography color="text.primary">Warehouses</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Warehouses</Typography>
      <Card variant="outlined"><CardContent><WarehouseTable /></CardContent></Card>
    </Box>
  );
}
