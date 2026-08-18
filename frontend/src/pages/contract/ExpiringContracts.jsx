import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContractTable from './components/ContractTable';

export default function ExpiringContracts() {
  return (
    <Box sx={{ p: { xs:2, sm:3 }, maxWidth: 1100, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/contracts">Contracts</Link>
        <Typography color="text.primary">Expiring</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Expiring Contracts</Typography>
      <Card variant="outlined"><CardContent><ContractTable /></CardContent></Card>
    </Box>
  );
}
