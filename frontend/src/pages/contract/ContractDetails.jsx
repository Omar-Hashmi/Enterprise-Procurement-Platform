import React from 'react';
import { Box, Breadcrumbs, Link, Typography, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ContractAttachments from './components/ContractAttachments';
import ComplianceDocuments from './components/ComplianceDocuments';
import VerifyCompliance from './components/VerifyCompliance';
import RenewContract from './components/RenewContract';
import TerminateContract from './components/TerminateContract';

export default function ContractDetails() {
  return (
    <Box sx={{ p: { xs:2, sm:3 }, maxWidth: 1200, margin: '0 auto' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/contracts">Contracts</Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Contract Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><Card variant="outlined"><CardContent><ContractAttachments /></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card variant="outlined"><CardContent><ComplianceDocuments /><VerifyCompliance /></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><RenewContract /></Grid>
        <Grid item xs={12} md={6}><TerminateContract /></Grid>
      </Grid>
    </Box>
  );
}
