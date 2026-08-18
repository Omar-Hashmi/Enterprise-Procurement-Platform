import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContractForm from './components/ContractForm';

export default function EditContract() {
  return (
    <Box sx={{ p: { xs:2, sm:3 }, maxWidth: 900, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/contracts">Contracts</Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Edit Contract</Typography>
      <Card variant="outlined"><CardContent><ContractForm isEdit /></CardContent></Card>
    </Box>
  );
}
